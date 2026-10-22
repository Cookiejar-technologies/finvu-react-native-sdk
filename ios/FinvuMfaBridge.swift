import ExpoModulesCore
import FinvuSDK

/// Bridges the native MFA step objects to JS. Native steps carry functions, which cannot
/// cross the bridge, so each live step is kept here under a stepId and JS refers to it by
/// that id. Every call resolves (never rejects); failures are a 'complete' step with
/// resultStatus 'failed'. Steps are cleared on a new login and on logout.
final class FinvuMfaBridge {
    private let lock = NSLock()
    private var steps: [String: MfaStep] = [:]

    func clear() {
        lock.lock(); steps.removeAll(); lock.unlock()
    }

    func login(_ params: [String: Any], promise: Promise) {
        clear()
        let loginParams = LoginParams(
            mobileNumber: params["mobileNumber"] as? String,
            username: params["username"] as? String,
            consentHandle: params["consentHandle"] as? String,
            handleId: params["handleId"] as? String,
            clientContext: params["clientContext"] as? [String: Any],
            supportedFactors: SupportedFactors(
                firstFactor: params["firstFactor"] as? [String] ?? [],
                secondFactor: params["secondFactor"] as? [String] ?? []
            ),
            useEncConsent: params["useEncConsent"] as? Bool ?? true,
            finalizeSession: params["finalizeSession"] as? Bool,
            selectFactorChoice: params["selectFactorChoice"] as? Bool ?? false
        )
        run(promise) { await FinvuManager.shared.mfaClient.login(loginParams) }
    }

    func submit(stepId: String, value: String, promise: Promise) {
        withStep(stepId, as: MfaInputStep.self, promise) { await $0.submit(value) }
    }

    func resend(stepId: String, promise: Promise) {
        withStep(stepId, as: MfaInputStep.self, promise) { step in
            guard let resend = step.resend else { return nil }
            return await resend()
        }
    }

    func forgotPin(stepId: String, promise: Promise) {
        withStep(stepId, as: MfaInputStep.self, promise) { step in
            guard let forgotPin = step.forgotPin else { return nil }
            return await forgotPin()
        }
    }

    func selectFactor(stepId: String, factor: String, promise: Promise) {
        withStep(stepId, as: MfaSelectFactorStep.self, promise) { await $0.selectFactor(factor) }
    }

    func awaitCompletion(stepId: String, promise: Promise) {
        withStep(stepId, as: MfaSilentStep.self, promise) { await $0.completion.value }
    }

    func retry(stepId: String, promise: Promise) {
        withStep(stepId, as: MfaCompleteStep.self, promise) { step in
            guard let retry = step.retry else { return nil }
            return await retry()
        }
    }

    func submitAccounts(stepId: String, accounts: [[String: Any]], promise: Promise) {
        let answers = accounts.map {
            RecoveryAccountAnswer(fipId: $0["fipId"] as? String ?? "", last4: $0["last4"] as? String ?? "",
                                  fiType: $0["fiType"] as? String, accType: $0["accType"] as? String)
        }
        withStep(stepId, as: MfaInputStep.self, promise) { await $0.submit(accounts: answers) }
    }

    func cancel(stepId: String, promise: Promise) {
        withStep(stepId, as: MfaInputStep.self, promise) { step in
            guard let cancel = step.cancel else { return nil }
            return await cancel()
        }
    }

    func switchMethod(stepId: String, method: String, promise: Promise) {
        withStep(stepId, as: MfaInputStep.self, promise) { step in
            guard let switchMethod = step.switchMethod else { return nil }
            return await switchMethod(method)
        }
    }

    func selectEmail(stepId: String, emailHash: String, promise: Promise) {
        withStep(stepId, as: MfaInputStep.self, promise) { step in
            guard let selectEmail = step.selectEmail else { return nil }
            return await selectEmail(emailHash)
        }
    }

    // MARK: - Helpers

    /// Runs `block` on the step with `stepId`; a nil result means the action is not available on it.
    private func withStep<T>(_ stepId: String, as type: T.Type, _ promise: Promise,
                             _ block: @escaping (T) async -> MfaStep?) {
        lock.lock()
        let step = steps[stepId] as? T
        lock.unlock()
        guard let step = step else {
            promise.resolve(failed(code: "mfaStepNotFound", message: "MFA step not found or no longer valid"))
            return
        }
        run(promise) { await block(step) }
    }

    private func run(_ promise: Promise, _ block: @escaping () async -> MfaStep?) {
        Task {
            if let step = await block() {
                promise.resolve(toDictionary(step))
            } else {
                promise.resolve(failed(code: "actionNotAvailable", message: "This action is not available on the step"))
            }
        }
    }

    private func toDictionary(_ step: MfaStep) -> [String: Any] {
        let stepId = UUID().uuidString
        lock.lock(); steps[stepId] = step; lock.unlock()

        var dict: [String: Any] = [
            "stepId": stepId,
            "action": step.action,
            "hasResend": false,
            "hasForgotPin": false,
            "hasRetry": false,
            "hasCancel": false,
            "hasSwitchMethod": false,
            "hasSelectEmail": false
        ]
        switch step {
        case let input as MfaInputStep:
            dict["factor"] = input.factor
            dict["requirement"] = input.requirement
            if let purpose = input.purpose { dict["purpose"] = purpose }
            if let spec = input.inputSpec { dict["pinLength"] = spec.pinLength }
            if let error = input.validationError {
                var errorDict: [String: Any] = ["code": error.code, "message": error.message]
                if let attempts = error.attemptsRemaining { errorDict["attemptsRemaining"] = attempts }
                if let support = error.support {
                    var supportDict: [String: Any] = [:]
                    if let email = support.email { supportDict["email"] = email }
                    if let phone = support.phone { supportDict["phone"] = phone }
                    if let message = support.message { supportDict["message"] = message }
                    errorDict["support"] = supportDict
                }
                dict["validationError"] = errorDict
            }
            if let info = input.resendInfo {
                var infoDict: [String: Any] = [:]
                if let after = info.resendAfterSeconds { infoDict["resendAfterSeconds"] = after }
                if let remaining = info.resendsRemaining { infoDict["resendsRemaining"] = remaining }
                dict["resendInfo"] = infoDict
            }
            dict["hasResend"] = input.resend != nil
            dict["hasForgotPin"] = input.forgotPin != nil
            if let recovery = input.recovery { dict["recovery"] = recoveryDictionary(recovery) }
            dict["hasCancel"] = input.cancel != nil
            dict["hasSwitchMethod"] = input.switchMethod != nil
            dict["hasSelectEmail"] = input.selectEmail != nil
        case let silent as MfaSilentStep:
            dict["factor"] = silent.factor
        case let select as MfaSelectFactorStep:
            dict["availableFactors"] = select.availableFactors
        case let complete as MfaCompleteStep:
            dict["resultStatus"] = complete.result.status
            if let session = complete.result.session {
                var sessionDict: [String: Any] = [:]
                if let userId = session.userId { sessionDict["userId"] = userId }
                if let sessionId = session.sessionId { sessionDict["sessionId"] = sessionId }
                if let csid = session.csid { sessionDict["csid"] = csid }
                dict["session"] = sessionDict
            }
            if let error = complete.result.error {
                dict["error"] = ["code": error.code, "message": error.message]
            }
            dict["hasRetry"] = complete.retry != nil
        default:
            return failed(code: "unexpectedStep", message: "Unexpected MFA step")
        }
        return dict
    }

    private func recoveryDictionary(_ recovery: RecoveryInfo) -> [String: Any] {
        var dict: [String: Any] = ["availableMethods": recovery.availableMethods]
        if let method = recovery.method { dict["method"] = method }
        if let accounts = recovery.accounts {
            dict["accounts"] = accounts.map { account -> [String: Any] in
                var entry: [String: Any] = ["fipId": account.fipId]
                if let fiType = account.fiType { entry["fiType"] = fiType }
                if let accType = account.accType { entry["accType"] = accType }
                return entry
            }
        }
        if let minAccounts = recovery.minAccountsRequired { dict["minAccountsRequired"] = minAccounts }
        if let emails = recovery.emails {
            dict["emails"] = emails.map {
                ["emailHash": $0.emailHash, "maskedEmail": $0.maskedEmail, "primary": $0.primary, "selected": $0.selected] as [String: Any]
            }
        }
        if let expiresAt = recovery.expiresAt { dict["expiresAt"] = expiresAt }
        return dict
    }

    /// A failed 'complete' step built on this side (not stored: it has no retry).
    private func failed(code: String, message: String) -> [String: Any] {
        [
            "stepId": UUID().uuidString,
            "action": "complete",
            "resultStatus": "failed",
            "error": ["code": code, "message": message],
            "hasResend": false,
            "hasForgotPin": false,
            "hasRetry": false
        ]
    }
}
