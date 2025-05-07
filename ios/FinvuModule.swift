import Foundation
import ExpoModulesCore
import FinvuSDK
import GoogleAPIClientForREST

class FinvuClientConfig: FinvuConfig {
    var finvuEndpoint: URL
    var certificatePins: [String]?
    
    public init(finvuEndpoint: URL, certificatePins: [String]?) {
        self.finvuEndpoint = finvuEndpoint
        self.certificatePins = certificatePins ?? []
    }
}

public class FinvuModule: Module {
  
  private var sdkInstance: FinvuManager!
  
  public override func definition() -> ModuleDefinition {
    
    Name("Finvu")
    
    Constants(
      // Add any constants here if needed
    )
    
    Events("onConnectionStatusChange", "onLoginOtpReceived", "onLoginOtpVerified")
    
    Function("initializeWith") { (config: [String: Any]) -> String in
      do {
        guard let finvuEndpoint = config["finvuEndpoint"] as? String else {
          throw NSError(domain: "FinvuModule", code: 1001, userInfo: [NSLocalizedDescriptionKey: "finvuEndpoint is required"])
        }
        let certificatePins = config["certificatePins"] as? [String]
        
        let finvuClientConfig = FinvuClientConfig(finvuEndpoint: finvuEndpoint, certificatePins: certificatePins)
        sdkInstance = FinvuManager.shared
        sdkInstance.initialize(with: finvuClientConfig)
        return "Initialized successfully"
        
      } catch let error {
        throw NSError(domain: "FinvuModule", code: 1002, userInfo: [NSLocalizedDescriptionKey: "INITIALIZATION_ERROR: \(error.localizedDescription)"])
      }
    }

    AsyncFunction("connect") {
      sdkInstance.connect { result in
        if result.isSuccess {
          self.sendEvent("onConnectionStatusChange", ["status": "Connected successfully"])
        } else {
          if let exception = result.exception as? FinvuException {
            let errorCode = exception.code
            self.sendEvent("onConnectionStatusChange", ["status": errorCode ?? "UNKNOWN_ERROR"])
            throw NSError(domain: "FinvuModule", code: 1003, userInfo: [NSLocalizedDescriptionKey: errorCode ?? "UNKNOWN_ERROR"])
          } else {
            self.sendEvent("onConnectionStatusChange", ["status": "UNKNOWN_ERROR"])
            throw NSError(domain: "FinvuModule", code: 1004, userInfo: [NSLocalizedDescriptionKey: "UNKNOWN_ERROR"])
          }
        }
      }
    }

    AsyncFunction("loginWithUsernameOrMobileNumber") { (username: String, mobileNumber: String, consentHandleId: String, promise: Promise) in
      do {
        sdkInstance.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId) { result in
          if result.isSuccess {
            let reference = result.getOrNull()?.reference
            promise.resolve(["reference": reference])
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("verifyLoginOtp") { (otp: String, otpReference: String, promise: Promise) in
      do {
        sdkInstance.verifyLoginOtp(otp, otpReference) { result in
          if result.isSuccess {
            let userId = result.getOrNull()?.userId
            promise.resolve(["userId": userId])
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("fipsAllFIPOptions") { promise in
      do {
        sdkInstance.fipsAllFIPOptions { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("fetchLinkedAccounts") { promise in
      do {
        sdkInstance.fetchLinkedAccounts { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("discoverAccounts") { (fipId: String, fiTypes: [String], mobileNumber: String, promise: Promise) in
      do {
        let identifiers: [TypeIdentifierInfo] = [
          TypeIdentifierInfo("STRONG", "MOBILE", mobileNumber),
          TypeIdentifierInfo("WEAK", "PAN", "")
        ]
        
        sdkInstance.discoverAccounts(fipId, fiTypes, identifiers) { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("linkAccounts") { (finvuAccounts: [DiscoveredAccount], finvuFipDetails: FipDetails, promise: Promise) in
      do {
        sdkInstance.linkAccounts(finvuAccounts, finvuFipDetails) { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("confirmAccountLinking") { (referenceNumber: String, otp: String, promise: Promise) in
      do {
        sdkInstance.confirmAccountLinking(referenceNumber, otp) { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("approveConsentRequest") { (consentDetails: ConsentDetail, finvuLinkedAccounts: [LinkedAccountDetails], promise: Promise) in
      do {
        sdkInstance.approveConsentRequest(consentDetails, finvuLinkedAccounts) { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }

    AsyncFunction("denyConsentRequest") { (consentRequestDetailInfo: ConsentDetail, promise: Promise) in
      do {
        sdkInstance.denyConsentRequest(consentRequestDetailInfo) { result in
          if result.isSuccess {
            let response = result.getOrNull()
            let json = try! JSONSerialization.data(withJSONObject: response!, options: [])
            let jsonString = String(data: json, encoding: .utf8)!
            promise.resolve(jsonString)
          } else {
            if let exception = result.exception as? FinvuException {
              let errorCode = exception.code ?? "UNKNOWN_ERROR"
              promise.reject(errorCode, exception.message, nil)
            }
          }
        }
      } catch let error {
        promise.reject("CONNECT_ERROR", error.localizedDescription, nil)
      }
    }
  }
}
