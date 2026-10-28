import FinvuModule from './FinvuModule';
const RECOVERY_METHODS = ['questionLinkedAccount', 'questionPan', 'emailOtp', 'emailLink'];
function failedStep(code, message) {
    return {
        action: 'complete',
        result: {
            status: 'failed',
            error: {
                code: code || 'mfaFailed',
                message: message || 'Authentication failed',
            },
        },
    };
}
function withoutUndefined(value) {
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));
}
/** Calls the native module and turns its plain step data into an MfaStep. Never rejects. */
async function call(nativeCall) {
    try {
        return toStep(await nativeCall());
    }
    catch (error) {
        return failedStep(error?.code, error?.message);
    }
}
// The current login's newUser / hasLinkedAccounts, read from the steps as they arrive
let loginInfo = {};
function toStep(step) {
    const stepId = step.stepId;
    if (step.newUser != null)
        loginInfo.newUser = step.newUser;
    if (step.hasLinkedAccounts != null)
        loginInfo.hasLinkedAccounts = step.hasLinkedAccounts;
    switch (step.action) {
        case 'input':
            return {
                action: 'input',
                factor: step.factor === 'pin' || RECOVERY_METHODS.includes(step.factor ?? '')
                    ? step.factor
                    : 'otp',
                requirement: step.requirement === 'enrollment' ? 'enrollment' : 'verification',
                purpose: step.purpose === 'pinRecovery' ? 'pinRecovery' : undefined,
                inputSpec: step.pinLength != null ? { pinLength: step.pinLength } : undefined,
                validationError: step.validationError ?? undefined,
                resendInfo: step.resendInfo ?? undefined,
                submit: (value) => Array.isArray(value)
                    ? call(() => FinvuModule.mfaSubmitAccounts(stepId, value))
                    : call(() => FinvuModule.mfaSubmit(stepId, value)),
                resend: step.hasResend ? () => call(() => FinvuModule.mfaResend(stepId)) : undefined,
                forgotPin: step.hasForgotPin ? () => call(() => FinvuModule.mfaForgotPin(stepId)) : undefined,
                recovery: step.recovery ?? undefined,
                cancel: step.hasCancel ? () => call(() => FinvuModule.mfaCancel(stepId)) : undefined,
                switchMethod: step.hasSwitchMethod
                    ? (method) => call(() => FinvuModule.mfaSwitchMethod(stepId, method))
                    : undefined,
                selectEmail: step.hasSelectEmail
                    ? (emailHash) => call(() => FinvuModule.mfaSelectEmail(stepId, emailHash))
                    : undefined,
            };
        case 'silent':
            return {
                action: 'silent',
                factor: step.factor === 'sna' ? 'sna' : 'deviceBinding',
                // Started right away, like the native completion
                completion: call(() => FinvuModule.mfaAwaitCompletion(stepId)),
            };
        case 'selectFactor':
            return {
                action: 'selectFactor',
                availableFactors: (step.availableFactors ?? []),
                selectFactor: (factor) => call(() => FinvuModule.mfaSelectFactor(stepId, factor)),
            };
        default: {
            const retry = step.hasRetry ? () => call(() => FinvuModule.mfaRetry(stepId)) : undefined;
            if (step.resultStatus === 'authenticated') {
                return {
                    action: 'complete',
                    result: { status: 'authenticated', session: step.session ?? {} },
                    retry,
                };
            }
            return {
                action: 'complete',
                result: {
                    status: 'failed',
                    error: {
                        code: step.error?.code || 'mfaFailed',
                        message: step.error?.message || 'Authentication failed',
                    },
                },
                retry,
            };
        }
    }
}
/**
 * Step-based MFA login (OTP, SNA, PIN with PIN recovery, device binding), backed by the native SDKs.
 *
 * ```ts
 * let step = await mfaClient.login({ mobileNumber: '9876543210', consentHandle });
 * ```
 * Act on each returned step until `step.action === 'complete'`. On `authenticated`
 * the SDK session is set, so the other APIs (getConsentRequestDetails, …) can be
 * called. Nothing here rejects. Call `connect()` first; for SNA and device binding
 * pass `finvuAuthSNAConfig` to `initializeWith`.
 */
export const mfaClient = {
    /**
     * Whether the user logging in is new. Known as soon as login() returns its first step,
     * so the first screen can greet a new or returning user. undefined before that, or when
     * Finvu did not send it.
     */
    get newUser() {
        return loginInfo.newUser;
    },
    /** Whether the user already has linked accounts. Same rules as newUser. */
    get hasLinkedAccounts() {
        return loginInfo.hasLinkedAccounts;
    },
    login(params) {
        loginInfo = {};
        return call(() => FinvuModule.mfaLogin(withoutUndefined({
            mobileNumber: params.mobileNumber,
            username: params.username,
            consentHandle: params.consentHandle,
            handleId: params.handleId,
            clientContext: params.clientContext,
            firstFactor: params.supportedFactors?.firstFactor ?? [],
            secondFactor: params.supportedFactors?.secondFactor ?? [],
            useEncConsent: params.useEncConsent ?? true,
            finalizeSession: params.finalizeSession,
            selectFactorChoice: params.selectFactorChoice ?? false,
            emailId: params.emailId,
        })));
    },
};
//# sourceMappingURL=FinvuMfa.js.map