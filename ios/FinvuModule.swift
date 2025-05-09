import ExpoModulesCore
import FinvuSDK

import ExpoModulesCore
import FinvuSDK

extension DiscoveredAccountsResponse {
    func toDictionary() -> [String: Any] {
        ["discoveredAccounts": accounts.map { account -> [String: Any] in
            [
                "accountType": account.accountType,
                "accountReferenceNumber": account.accountReferenceNumber,
                "maskedAccountNumber": account.maskedAccountNumber,
                "fiType": account.fiType
            ]
        }]
    }
}

// Extension for FIPDetails
extension FIPDetails {
    func toDictionary() -> [String: Any] {
        [
            "fipId": fipId,
            "typeIdentifiers": typeIdentifiers.map { fiTypeIdentifier -> [String: Any] in
                [
                    "fiType": fiTypeIdentifier.fiType,
                    "identifiers": fiTypeIdentifier.identifiers.map { identifier -> [String: Any] in
                        [
                            "category": identifier.category,
                            "type": identifier.type
                        ]
                    }
                ]
            }
        ]
    }
}

// Extension for other response types as needed
extension EntityInfo {
    func toDictionary() -> [String: Any] {
        [
            "entityId": entityId,
            "entityName": entityName,
            "entityIconUri": entityIconUri,
            "entityLogoUri": entityLogoUri ?? "",
            "entityLogoWithNameUri" : entityLogoWithNameUri
        ]
    }
}

extension LinkedAccountsResponse {
    func toDictionary() -> [String: Any] {
        ["linkedAccounts": linkedAccounts?.map { account -> [String: Any] in
            [
                "userId": account.userId,
                "fipId": account.fipId,
                "fipName": account.fipName,
                "maskedAccountNumber": account.maskedAccountNumber,
                "accountReferenceNumber": account.accountReferenceNumber,
                "linkReferenceNumber": account.linkReferenceNumber,
                "consentIdList": account.consentIdList ?? [],
                "fiType": account.fiType,
                "accountType": account.accountType,
                "authenticatorType": account.authenticatorType
            ]
        } ?? []]
    }
}

extension ConsentRequestDetailResponse {
    func toDictionary() -> [String: Any] {
        let detailDict: [String: Any] = [
            "consentId": detail.consentId ?? "",
            "consentHandle": detail.consentHandle,
            "financialInformationUser": [
                "id": detail.financialInformationUser.id,
                "name": detail.financialInformationUser.name
            ],
            "consentPurpose": [
                "code": detail.consentPurposeInfo.code,
                "text": detail.consentPurposeInfo.text,
            ],
            "consentDisplayDescriptions": detail.consentDisplayDescriptions,
            "fiTypes": detail.fiTypes ?? []
        ]
        return detailDict
    }
}

extension AccountLinkingRequestReference {
    func toDictionary() -> [String: Any] {
        ["referenceNumber": referenceNumber]
    }
}

extension ConfirmAccountLinkingInfo {
    func toDictionary() -> [String: Any] {
        ["linkedAccounts": linkedAccounts.map { account -> [String: Any] in
            [
                "customerAddress": account.customerAddress,
                "linkReferenceNumber": account.linkReferenceNumber,
                "accountReferenceNumber": account.accountReferenceNumber,
                "status": account.status
            ]
        }]
    }
}

// Extension to help with JSON serialization
extension NSObject {
    func toDictionary() -> [String: Any] {
        var dict = [String: Any]()
        let mirror = Mirror(reflecting: self)
        
        for child in mirror.children {
            guard let key = child.label else { continue }
            
            let value = child.value
            
            if let objArray = value as? [NSObject] {
                dict[key] = objArray.map { $0.toDictionary() }
            } else if let obj = value as? NSObject, !(value is NSNumber) && !(value is NSString) && !(value is NSArray) {
                dict[key] = obj.toDictionary()
            } else if let date = value as? Date {
                let formatter = ISO8601DateFormatter()
                dict[key] = formatter.string(from: date)
            } else {
                dict[key] = value
            }
        }
        
        return dict
    }
}

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
        Name("Finvu")
        
        Events("onConnectionStatusChange", "onLoginOtpReceived", "onLoginOtpVerified")

        Function("initializeWith") { (config: [String: Any]) -> String in
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

        AsyncFunction("connect") { (promise: Promise) in
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

        AsyncFunction("loginWithUsernameOrMobileNumber") { (username: String, mobileNumber: String, consentHandleId: String, promise: Promise) in
            sdkInstance.loginWith(username: username, mobileNumber: mobileNumber, consentHandleId: consentHandleId) { result, error in
                DispatchQueue.main.async {
                    if let error = error as NSError? {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        // Handle successful login
                        let reference = result.reference
                        promise.resolve(["reference": reference])
                    } else {
                        // Handle case where there is no result and no error
                        promise.reject("UNKNOWN_ERROR", "An unknown error occurred.")
                    }
                }
            }
        }

        AsyncFunction("discoverAccounts") { (fipId: String, fiTypes: [String], identifiersMapList: [[String: String]], promise: Promise) in
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
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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

        AsyncFunction("verifyLoginOtp") { (otp: String, otpReference: String, promise: Promise) in
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
        
        AsyncFunction("fetchFipDetails") { (fipId: String, promise: Promise) in
            sdkInstance.fetchFIPDetails(fipId: fipId) { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
        
        AsyncFunction("getEntityInfo") { (entityId: String, entityType: String, promise: Promise) in
            sdkInstance.getEntityInfo(entityId: entityId, entityType: entityType) { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
        
        AsyncFunction("getConsentRequestDetails") { (consentHandleId: String, promise: Promise) in
            sdkInstance.getConsentRequestDetails(consentHandleId: consentHandleId) { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
        
        AsyncFunction("logout") { (promise: Promise) in
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
        
        AsyncFunction("fipsAllFIPOptions") { (promise: Promise) in
            sdkInstance.fipsAllFIPOptions { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
        
        AsyncFunction("fetchLinkedAccounts") { (promise: Promise) in
            sdkInstance.fetchLinkedAccounts { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
        
        AsyncFunction("linkAccounts") { (finvuAccountsMap: [[String: Any]], finvuFipDetailsMap: [String: Any], promise: Promise) in
            // Create discovered account objects from the dictionary
            let discoveredAccounts = finvuAccountsMap.map { accountDict -> DiscoveredAccountInfo in
                return DiscoveredAccountInfo(
                    accountType: accountDict["accountType"] as? String ?? "",
                    accountReferenceNumber: accountDict["accountReferenceNumber"] as? String ?? "",
                    maskedAccountNumber: accountDict["maskedAccountNumber"] as? String ?? "",
                    fiType: accountDict["fiType"] as? String ?? ""
                )
            }
            
            // Create FIP details object
            let fipDetails = FIPDetails(
                fipId: finvuFipDetailsMap["fipId"] as? String ?? "",
                typeIdenifiers: [] // Empty array since we don't have this data from React Native
            )
            
            sdkInstance.linkAccounts(fipDetails: fipDetails, accounts: discoveredAccounts) { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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

        
        AsyncFunction("confirmAccountLinking") { (referenceNumber: String, otp: String, promise: Promise) in
            sdkInstance.confirmAccountLinking(linkingReference: AccountLinkingRequestReference(referenceNumber: referenceNumber), otp: otp) { result, error in
                DispatchQueue.main.async {
                    if let error = error as? NSError {
                        // Convert NSError to React Native error
                        let errorCode : String = mapErrorCode(error)
                        promise.reject(errorCode, error.localizedDescription)
                    } else if let result = result {
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
        
        AsyncFunction("approveConsentRequest") { (consentDetailsMap: [String: Any], finvuLinkedAccountsMap: [[String: Any]], promise: Promise) in
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
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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

        AsyncFunction("denyConsentRequest") { (consentDetailsMap: [String: Any], promise: Promise) in
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
                        do {
                            let jsonData = try JSONSerialization.data(withJSONObject: result.toDictionary(), options: [])
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
}