import ExpoModulesCore
import FinvuSDK

func mapErrorCode(_ error: NSError) -> String {
    switch error.code {
    case 1001:
        return "AUTH_LOGIN_RETRY"
    case 1002:
        return "AUTH_LOGIN_FAILED"
    case 8000:
        return "SESSION_DISCONNECTED"
    case 9999:
        return "GENERIC_ERROR"
    default:
        return "UNKNOWN_ERROR"
    }
}


class FinvuClientConfig: FinvuConfig {
    var finvuEndpoint: URL
    var certificatePins: [String]?
    
    public init(finvuEndpoint: URL, certificatePins: [String]?) {
        self.finvuEndpoint = finvuEndpoint
        self.certificatePins = certificatePins ?? []
    }
}

public class FinvuModule: Module {
    private let sdkInstance = FinvuManager.shared

    public func definition() -> ModuleDefinition {
        Name("FinvuModule")
        
        Events("onConnectionStatusChange", "onLoginOtpReceived", "onLoginOtpVerified")

        Function("initializeWith", initializeWith)
        AsyncFunction("connect", connect)
        AsyncFunction("disconnect", disconnect)
        AsyncFunction("isConnected", isConnected)
        AsyncFunction("hasSession", hasSession)
        AsyncFunction("loginWithUsernameOrMobileNumber", loginWithUsernameOrMobileNumber)
        AsyncFunction("discoverAccounts", discoverAccounts)
        AsyncFunction("verifyLoginOtp", verifyLoginOtp)
        AsyncFunction("fetchFipDetails", fetchFipDetails)
        AsyncFunction("getEntityInfo", getEntityInfo)
        AsyncFunction("getConsentRequestDetails", getConsentRequestDetails)
        AsyncFunction("logout", logout)
        AsyncFunction("fipsAllFIPOptions", fipsAllFIPOptions)
        AsyncFunction("fetchLinkedAccounts", fetchLinkedAccounts)
        AsyncFunction("linkAccounts", linkAccounts)
        AsyncFunction("confirmAccountLinking", confirmAccountLinking)
        AsyncFunction("approveConsentRequest", approveConsentRequest)
        AsyncFunction("denyConsentRequest", denyConsentRequest)
    }

    private func initializeWith(config: [String: Any]) throws -> String {
        do {
            guard let finvuEndpointString = config["finvuEndpoint"] as? String,
                    let finvuEndpoint = URL(string: finvuEndpointString) else {
                throw NSError(domain: "FinvuModule", code: -1, userInfo: [NSLocalizedDescriptionKey: "finvuEndpoint is required and must be a valid URL"])
            }
            
            let certificatePins = (config["certificatePins"] as? [String])
            let finvuClientConfig = FinvuClientConfig(finvuEndpoint: finvuEndpoint, certificatePins: certificatePins)
            
            sdkInstance.initializeWith(config: finvuClientConfig)
            return "Initialized successfully"
        } catch {
            print(error)
            throw NSError(domain: "FinvuModule", code: -1, userInfo: [NSLocalizedDescriptionKey: "INITIALIZATION_ERROR"])
        }
    }

    private func connect(promise: Promise) {
        sdkInstance.connect { error in
            DispatchQueue.main.async {
                if let error = error as NSError? {
                    // Convert NSError to React Native error
                    let errorCode : String = mapErrorCode(error)
                    self.sendEvent("onConnectionStatusChange", ["status": errorCode])
                    promise.reject(errorCode, error.localizedDescription)
                } else {
                    // No error means success
                    self.sendEvent("onConnectionStatusChange", ["status": "Connected successfully"])
                    promise.resolve(["status": "Connected successfully"])
                }
            }
        }
    }

    private func disconnect(promise: Promise) {
        DispatchQueue.main.async {
            do {
                self.sdkInstance.disconnect()
                self.sendEvent("onConnectionStatusChange", ["status": "Disconnected successfully"])
                promise.resolve(["status": "Disconnected successfully"])
            } catch let error as NSError {
                let errorCode : String = mapErrorCode(error)
                self.sendEvent("onConnectionStatusChange", ["status": errorCode])
                promise.reject(errorCode, error.localizedDescription)
            } catch {
                self.sendEvent("onConnectionStatusChange", ["status": "UNKNOWN_ERROR"])
                promise.reject("UNKNOWN_ERROR", "An unknown error occurred while disconnecting.")
            }
        }
    }

    private func isConnected(promise: Promise) {
        do {
            let status = self.sdkInstance.isConnected()
            promise.resolve(status)
        } catch let error as NSError {
            let errorCode : String = mapErrorCode(error)
            promise.reject(errorCode, error.localizedDescription)
        } catch {
            promise.reject("UNKNOWN_ERROR", "An unknown error occurred while checking connection status.")
        }
    }
    
    private func hasSession(promise: Promise) {
        do {
            let hasSession = self.sdkInstance.hasSession()
            promise.resolve(hasSession)
        } catch let error as NSError {
            let errorCode : String = mapErrorCode(error)
            promise.reject(errorCode, error.localizedDescription)
        } catch {
            promise.reject("UNKNOWN_ERROR", "An unknown error occurred while checking session.")
        }
    }

    private func loginWithUsernameOrMobileNumber(username: String, mobileNumber: String, consentHandleId: String, promise: Promise) {
        sdkInstance.loginWith(username: username, mobileNumber: mobileNumber, consentHandleId: consentHandleId) { result, error in
            DispatchQueue.main.async {
                if let error = error as NSError? {
                    let errorCode : String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let reference = result.reference
                    promise.resolve(["reference": reference])
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }

    private func discoverAccounts(fipId: String, fiTypes: [String], identifiersMapList: [[String: String]], promise: Promise) {
        let identifiers = identifiersMapList.map { mapData in
            TypeIdentifierInfo(
                category: mapData["category"] ?? "",
                type: mapData["type"] ?? "",
                value: mapData["value"] ?? ""
            )
        }

        sdkInstance.discoverAccounts(fipId: fipId, fiTypes: fiTypes, identifiers: identifiers) { result, error in
            DispatchQueue.main.async {
                if let error = error as NSError? {
                    let errorCode: String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let accountsArray: [[String: Any]] = result.accounts.map { account in
                        return [
                            "accountType": account.accountType,
                            "accountReferenceNumber": account.accountReferenceNumber,
                            "maskedAccountNumber": account.maskedAccountNumber,
                            "fiType": account.fiType
                        ]
                    }

                    let resultDict: [String: Any] = [
                        "discoveredAccounts": accountsArray
                    ]

                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }

    private func verifyLoginOtp(otp: String, otpReference: String, promise: Promise) {
        sdkInstance.verifyLoginOtp(otp: otp, otpReference: otpReference) { result, error in
            DispatchQueue.main.async {
                if let error = error as NSError? {
                    // Convert NSError to React Native error
                    let errorCode : String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    // Handle successful OTP verification
                    let userId = result.userId
                    promise.resolve(["userId": userId])
                } else {
                    // Handle case where there is no result and no error
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }
    
    private func fetchFipDetails(fipId: String, promise: Promise) {
        sdkInstance.fetchFIPDetails(fipId: fipId) { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    let errorCode: String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    var typeIdentifiersArray: [[String: Any]] = []

                    for typeIdentifier in result.typeIdentifiers {
                        var identifiersArray: [[String: String]] = []

                        for identifier in typeIdentifier.identifiers {
                            let identifierDict: [String: String] = [
                                "category": identifier.category,
                                "type": identifier.type
                            ]
                            identifiersArray.append(identifierDict)
                        }

                        let typeIdentifierDict: [String: Any] = [
                            "fiType": typeIdentifier.fiType,
                            "identifiers": identifiersArray
                        ]

                        typeIdentifiersArray.append(typeIdentifierDict)
                    }

                    let resultDict: [String: Any] = [
                        "fipId": result.fipId,
                        "typeIdentifiers": typeIdentifiersArray
                    ]

                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }
    
    private func getEntityInfo(entityId: String, entityType: String, promise: Promise) {
        sdkInstance.getEntityInfo(entityId: entityId, entityType: entityType) { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    let errorCode: String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    // Inline dictionary conversion
                    let resultDict: [String: Any] = [
                        "entityId": result.entityId,
                        "entityName": result.entityName,
                        "entityIconUri": result.entityIconUri as Any,
                        "entityLogoUri": result.entityLogoUri as Any,
                        "entityLogoWithNameUri": result.entityLogoWithNameUri as Any
                    ]
                    
                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }
  
    private func getConsentRequestDetails(consentHandleId: String, promise: Promise) {
        sdkInstance.getConsentRequestDetails(consentHandleId: consentHandleId) { result, error in
                DispatchQueue.main.async {
                    if let error = error as NSError? {
                        let errorCode: String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        let detail = result.detail
                        let formatter = ISO8601DateFormatter()

                        let financialUserDict: [String: Any] = [
                            "id": detail.financialInformationUser.id,
                            "name": detail.financialInformationUser.name
                        ]

                        let purposeInfoDict: [String: Any] = [
                            "code": detail.consentPurposeInfo.code,
                            "text": detail.consentPurposeInfo.text
                        ]

                        let dateTimeRangeDict: [String: Any] = [
                            "from": formatter.string(from : detail.consentDateTimeRange.from),
                            "to": formatter.string(from : detail.consentDateTimeRange.to)
                        ]

                        let dataTimeRangeDict: [String: Any] = [
                            "from": formatter.string(from : detail.dataDateTimeRange.from),
                            "to": formatter.string(from : detail.dataDateTimeRange.to)
                        ]

                        let dataLifePeriodDict: [String: Any] = [
                            "unit": detail.consentDataLifePeriod.unit,
                            "value": detail.consentDataLifePeriod.value
                        ]

                        let dataFrequencyDict: [String: Any] = [
                            "unit": detail.consentDataFrequency.unit,
                            "value": detail.consentDataFrequency.value
                        ]

                        let detailDict: [String: Any] = [
                            "consentId": detail.consentId ?? "",
                            "consentHandle": detail.consentHandle,
                            "statusLastUpdateTimestamp": detail.statusLastUpdateTimestamp.map { formatter.string(from: $0) } ?? "",
                            "financialInformationUser": financialUserDict,
                            "consentPurposeInfo": purposeInfoDict,
                            "consentDisplayDescriptions": detail.consentDisplayDescriptions,
                            "consentDateTimeRange": dateTimeRangeDict,
                            "dataDateTimeRange": dataTimeRangeDict,
                            "consentDataLifePeriod": dataLifePeriodDict,
                            "consentDataFrequency": dataFrequencyDict,
                            "fiTypes": detail.fiTypes ?? []
                        ]

                        let resultDict: [String: Any] = [
                            "consentDetail": detailDict
                        ]

                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                            let jsonString = String(data: jsonData, encoding: .utf8)!
                            promise.resolve(jsonString)
                        } catch {
                            promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                        }
                    } else {
                        promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                    }
            }
        }
    }
    
    private func logout(promise: Promise) {
        sdkInstance.logout { error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    // Convert NSError to React Native error
                    let errorCode : String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else {
                    promise.resolve(nil)
                }
            }
        }
    }
    
    private func fipsAllFIPOptions(promise: Promise) {
        sdkInstance.fipsAllFIPOptions { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    let errorCode: String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    // Convert FIPSearchResponse to Dictionary
                    let searchOptionsArray = result.searchOptions.map { fipInfo in
                        return [
                            "fipId": fipInfo.fipId,
                            "productName": fipInfo.productName ?? "",
                            "fipFiTypes": fipInfo.fipFitypes,
                            "fipFsr": fipInfo.fipFsr ?? "",
                            "productDesc": fipInfo.productDesc ?? "",
                            "productIconUri": fipInfo.productIconUri ?? "",
                            "enabled": fipInfo.enabled
                        ] as [String: Any]
                    }

                    let responseDict: [String: Any] = [
                        "searchOptions": searchOptionsArray
                    ]

                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: responseDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }
    
    private func fetchLinkedAccounts(promise: Promise) {
        sdkInstance.fetchLinkedAccounts { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    let errorCode: String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let linkedAccountsArray: [[String: Any]] = result.linkedAccounts?.map { account in
                        let formatter = ISO8601DateFormatter()
                        let linkedAccountUpdateTimestampString = account.linkedAccountUpdateTimestamp.map { formatter.string(from: $0) }

                        return [
                            "userId": account.userId,
                            "fipId": account.fipId,
                            "fipName": account.fipName,
                            "maskedAccountNumber": account.maskedAccountNumber,
                            "accountReferenceNumber": account.accountReferenceNumber,
                            "linkReferenceNumber": account.linkReferenceNumber,
                            "consentIdList": account.consentIdList ?? [],
                            "fiType": account.fiType,
                            "accountType": account.accountType,
                            "linkedAccountUpdateTimestamp": linkedAccountUpdateTimestampString ?? "",
                            "authenticatorType": account.authenticatorType
                        ]
                    } ?? []

                    let responseDict: [String: Any] = [
                        "linkedAccounts": linkedAccountsArray
                    ]

                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: responseDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }

    private func linkAccounts(finvuAccountsMap: [[String: Any]], finvuFipDetailsMap: [String: Any], promise: Promise) {
        // Parse DiscoveredAccountInfo array
        let discoveredAccounts = finvuAccountsMap.map { accountDict -> DiscoveredAccountInfo in
            return DiscoveredAccountInfo(
                accountType: accountDict["accountType"] as? String ?? "",
                accountReferenceNumber: accountDict["accountReferenceNumber"] as? String ?? "",
                maskedAccountNumber: accountDict["maskedAccountNumber"] as? String ?? "",
                fiType: accountDict["fiType"] as? String ?? ""
            )
        }

        var parsedTypeIdentifiers: [FIPFiTypeIdentifier] = []
        if let typeIdentifiersArray = finvuFipDetailsMap["typeIdentifiers"] as? [[String: Any]] {
            parsedTypeIdentifiers = typeIdentifiersArray.compactMap { item -> FIPFiTypeIdentifier? in
                guard
                    let fiType = item["fiType"] as? String,
                    let identifiers = item["identifiers"] as? [[String: Any]]
                else {
                    return nil
                }

                let parsedIdentifiers = identifiers.compactMap { idDict -> TypeIdentifier? in
                    guard
                        let category = idDict["category"] as? String,
                        let type = idDict["type"] as? String
                    else {
                        return nil
                    }
                    return TypeIdentifier(category: category, type: type)
                }

                return FIPFiTypeIdentifier(fiType: fiType, identifiers: parsedIdentifiers)
            }
        }

        let fipDetails =  FIPDetails(fipId: finvuFipDetailsMap["fipId"] as? String ?? "", typeIdenifiers: parsedTypeIdentifiers)
        // Call SDK
        sdkInstance.linkAccounts(fipDetails: fipDetails, accounts: discoveredAccounts) { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    let errorCode = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let resultDict: [String: Any] = [
                        "referenceNumber": result.referenceNumber
                    ]

                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }

    private func confirmAccountLinking(referenceNumber: String, otp: String, promise: Promise) {
        let linkingReference = AccountLinkingRequestReference(referenceNumber: referenceNumber)
        
        sdkInstance.confirmAccountLinking(linkingReference: linkingReference, otp: otp) { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    let errorCode: String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let linkedAccountsArray = result.linkedAccounts.map { account in
                        return [
                            "customerAddress": account.customerAddress,
                            "linkReferenceNumber": account.linkReferenceNumber,
                            "accountReferenceNumber": account.accountReferenceNumber,
                            "status": account.status
                        ] as [String: Any]
                    }

                    let responseDict: [String: Any] = [
                        "linkedAccounts": linkedAccountsArray
                    ]

                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: responseDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }
    
    private func approveConsentRequest(consentDetailsMap: [String: Any], finvuLinkedAccountsMap: [[String: Any]], promise: Promise) {
        // Extract necessary information from consentDetailsMap to create ConsentRequestDetailInfo
        let consentHandle = consentDetailsMap["consentHandle"] as? String ?? ""
        
        // Extract FIU (Financial Information User) info
        let fiuMap = consentDetailsMap["financialInformationUser"] as? [String: Any] ?? [:]
        let fiuId = fiuMap["id"] as? String ?? ""
        
        // Create ConsentRequestDetailInfo object with minimal required fields
        let fiuInfo = FinancialInformationEntityInfo(
            id: fiuId,
            name: fiuMap["name"] as? String ?? ""
        )
        
        // Extract purpose info
        let purposeMap = consentDetailsMap["consentPurpose"] as? [String: Any] ?? [:]
        let purposeInfo = ConsentPurposeInfo(
            code: purposeMap["code"] as? String ?? "",
            text: purposeMap["text"] as? String ?? ""
        )
        
        // Create basic ConsentRequestDetailInfo
        let consentDetail = ConsentRequestDetailInfo(
            consentId: consentDetailsMap["consentId"] as? String,
            consentHandle: consentHandle,
            statusLastUpdateTimestamp: nil,
            financialInformationUser: fiuInfo,
            consentPurposeInfo: purposeInfo,
            consentDisplayDescriptions: consentDetailsMap["consentDisplayDescriptions"] as? [String] ?? [],
            consentDateTimeRange: DateTimeRange(from: Date(), to: Date()),
            dataDateTimeRange: DateTimeRange(from: Date(), to: Date()),
            consentDataLifePeriod: ConsentDataLifePeriod(unit: "", value: 0),
            consentDataFrequency: ConsentDataFrequency(unit: "", value: 0),
            fiTypes: consentDetailsMap["fiTypes"] as? [String]
        )
        
        // Create LinkedAccountDetailsInfo objects from dictionaries
        let linkedAccounts = finvuLinkedAccountsMap.map { accountDict -> LinkedAccountDetailsInfo in
            return LinkedAccountDetailsInfo(
                userId: accountDict["userId"] as? String ?? "",
                fipId: accountDict["fipId"] as? String ?? "",
                fipName: accountDict["fipName"] as? String ?? "",
                maskedAccountNumber: accountDict["maskedAccountNumber"] as? String ?? "",
                accountReferenceNumber: accountDict["accountReferenceNumber"] as? String ?? "",
                linkReferenceNumber: accountDict["linkReferenceNumber"] as? String ?? "",
                consentIdList: accountDict["consentIdList"] as? [String],
                fiType: accountDict["fiType"] as? String ?? "",
                accountType: accountDict["accountType"] as? String ?? "",
                linkedAccountUpdateTimestamp: nil,
                authenticatorType: accountDict["authenticatorType"] as? String ?? ""
            )
        }
        
        // Call the correct SDK method - note the different method name
        sdkInstance.approveAccountConsentRequest(consentDetail: consentDetail, linkedAccounts: linkedAccounts) { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    // Convert NSError to React Native error
                    let errorCode : String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let consentsArray = result.consentsInfo?.map { consent in
                        return [
                            "fipId": consent.fipId ?? "",
                            "consentId": consent.consentId
                        ]
                    } ?? []

                    let responseDict: [String: Any] = [
                        "consentIntentId": result.consentIntentId ?? NSNull(),
                        "consentsInfo": consentsArray
                    ]
                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: responseDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }

    private func denyConsentRequest(consentDetailsMap: [String: Any], promise: Promise) {
        // Extract necessary information from consentDetailsMap to create ConsentRequestDetailInfo
        let consentHandle = consentDetailsMap["consentHandle"] as? String ?? ""
        
        // Extract FIU (Financial Information User) info
        let fiuMap = consentDetailsMap["financialInformationUser"] as? [String: Any] ?? [:]
        let fiuId = fiuMap["id"] as? String ?? ""
        
        // Create ConsentRequestDetailInfo object with minimal required fields
        let fiuInfo = FinancialInformationEntityInfo(
            id: fiuId,
            name: fiuMap["name"] as? String ?? ""
        )
        
        // Extract purpose info
        let purposeMap = consentDetailsMap["consentPurpose"] as? [String: Any] ?? [:]
        let purposeInfo = ConsentPurposeInfo(
            code: purposeMap["code"] as? String ?? "",
            text: purposeMap["text"] as? String ?? ""
        )
        
        // Create basic ConsentRequestDetailInfo
        let consentDetail = ConsentRequestDetailInfo(
            consentId: consentDetailsMap["consentId"] as? String,
            consentHandle: consentHandle,
            statusLastUpdateTimestamp: nil,
            financialInformationUser: fiuInfo,
            consentPurposeInfo: purposeInfo,
            consentDisplayDescriptions: consentDetailsMap["consentDisplayDescriptions"] as? [String] ?? [],
            consentDateTimeRange: DateTimeRange(from: Date(), to: Date()),
            dataDateTimeRange: DateTimeRange(from: Date(), to: Date()),
            consentDataLifePeriod: ConsentDataLifePeriod(unit: "", value: 0),
            consentDataFrequency: ConsentDataFrequency(unit: "", value: 0),
            fiTypes: consentDetailsMap["fiTypes"] as? [String]
        )
        
        // Call the correct SDK method - note the different method name
        sdkInstance.denyAccountConsentRequest(consentDetail: consentDetail) { result, error in
            DispatchQueue.main.async {
                if let error = error as? NSError {
                    // Convert NSError to React Native error
                    let errorCode : String = mapErrorCode(error)
                    promise.reject(errorCode, error.localizedDescription)
                } else if let result = result {
                    let consentsArray = result.consentsInfo?.map { consent in
                        return [
                            "fipId": consent.fipId ?? "",
                            "consentId": consent.consentId
                        ]
                    } ?? []

                    let responseDict: [String: Any] = [
                        "consentIntentId": result.consentIntentId ?? "",
                        "consentsInfo": consentsArray
                    ]
                    do {
                        let jsonData = try JSONSerialization.data(withJSONObject: responseDict, options: [])
                        let jsonString = String(data: jsonData, encoding: .utf8)!
                        promise.resolve(jsonString)
                    } catch {
                        promise.reject("JSON_ERROR", "Failed to serialize result to JSON")
                    }
                } else {
                    promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                }
            }
        }
    }
}
