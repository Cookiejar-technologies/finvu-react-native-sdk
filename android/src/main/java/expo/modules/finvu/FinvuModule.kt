package expo.modules.finvu

import com.finvu.android.FinvuManager
import com.finvu.android.publicInterface.*
import com.finvu.android.utils.FinvuConfig
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.google.gson.Gson

class FinvuModule : Module() {

  data class FinvuClientConfig(
    override val finvuEndpoint: String,
    override val certificatePins: List<String>?
  ) : FinvuConfig

  private val sdkInstance: FinvuManager = FinvuManager.shared

  override fun definition() = ModuleDefinition {
    Name("Finvu")
    Constants()

    Events("onConnectionStatusChange", "onLoginOtpReceived", "onLoginOtpVerified")

    Function("initializeWith") { config: Map<String, Any> ->
      try {
        val finvuEndpoint = config["finvuEndpoint"] as? String
          ?: throw IllegalArgumentException("finvuEndpoint is required")
        val certificatePins = (config["certificatePins"] as? List<*>)?.map { it.toString() }

        val finvuClientConfig = FinvuClientConfig(finvuEndpoint, certificatePins)
        sdkInstance.initializeWith(finvuClientConfig)
        "Initialized successfully"
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("INITIALIZATION_ERROR", e)
      }
    }

    AsyncFunction("connect") {
      sdkInstance.connect { result ->
        if (result.isSuccess) {
          sendEvent("onConnectionStatusChange", mapOf("status" to "Connected successfully"))
        } else {
          val exception = result.exceptionOrNull() as? FinvuException
          val errorCode = exception?.code ?: "UNKNOWN_ERROR"
          val errorName = if (errorCode == FinvuErrorCode.SSL_PINNING_FAILURE_ERROR.code) {
            "SSL_PINNING_FAILURE_ERROR"
          } else {
            "UNKNOWN_ERROR"
          }
          sendEvent("onConnectionStatusChange", mapOf("status" to errorName))
          throw RuntimeException(errorName)
        }
      }
    } 

    AsyncFunction("disconnect") {
      try {
        sdkInstance.disconnect()
        sendEvent("onConnectionStatusChange", mapOf("status" to "Disconnected successfully"))
      } catch (e: Exception) {
        e.printStackTrace()
        sendEvent("onConnectionStatusChange", mapOf("status" to "DISCONNECT_FAILED"))
        throw RuntimeException("DISCONNECT_FAILED", e)
      }
    }
    

    AsyncFunction("isConnected") { promise: Promise ->
      try {
        val isConnected = sdkInstance.isConnected()
        promise.resolve(isConnected)
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("hasSession") { promise: Promise ->
      try {
        val hasSession = sdkInstance.hasSession();
        promise.resolve(hasSession)
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("loginWithUsernameOrMobileNumber") { username: String, mobileNumber: String, consentHandleId: String, promise: Promise ->
      try {
        sdkInstance.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId) { result ->
          if (result.isSuccess) {
            val reference = result.getOrNull()?.reference
            promise.resolve(mapOf("reference" to reference))
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("verifyLoginOtp") { otp: String, otpReference: String, promise: Promise ->
      try {
        sdkInstance.verifyLoginOtp(otp, otpReference) { result ->
          if (result.isSuccess) {
            val userId = result.getOrNull()?.userId
            promise.resolve(mapOf("userId" to userId))
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("fetchFipDetails") { fipId: String, promise: Promise ->
      try {
        sdkInstance.fetchFipDetails(fipId) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            val json = Gson().toJson(response)
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("FETCH_FIP_DETAILS_ERROR", e)
      }
    }

    AsyncFunction("getEntityInfo") { entityId: String, entityType: String, promise: Promise ->
      try {
        sdkInstance.getEntityInfo(entityId, entityType) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            val json = Gson().toJson(response)
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("ENTITY_INFO_ERROR", e)
      }
    }

    AsyncFunction("getConsentRequestDetails") { consentHandleId: String, promise: Promise ->
      try {
        sdkInstance.getConsentRequestDetails(consentHandleId) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            val json = Gson().toJson(response)
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONSENT_DETAILS_ERROR", e)
      }
    }

    AsyncFunction("logout") { promise: Promise ->
      try {
        sdkInstance.logout { result ->
          if (result.isSuccess) {
            promise.resolve(null) // `Unit` -> `null` in JS
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("LOGOUT_ERROR", e)
      }
    }

    AsyncFunction("fipsAllFIPOptions") { promise: Promise ->
      try {
        sdkInstance.fipsAllFIPOptions { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            val json = Gson().toJson(response)
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("fetchLinkedAccounts") { promise: Promise ->
      try {
        sdkInstance.fetchLinkedAccounts { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            val json = Gson().toJson(response)
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("discoverAccounts") { fipId: String, fiTypes: List<String>, identifiersMapList: List<Map<String, String>>, promise: Promise ->
        try {
            val identifiers = identifiersMapList.map {
                TypeIdentifierInfo(
                    category = it["category"] ?: "",
                    type = it["type"] ?: "",
                    value = it["value"] ?: ""
                )
            }
        sdkInstance.discoverAccountsAsync(fipId, fiTypes, identifiers) { result ->
          if (result.isSuccess) {
            val json = Gson().toJson(result.getOrNull())
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        promise.reject("CONNECT_ERROR", e.message, null)
      }
    }

    AsyncFunction("linkAccounts") { finvuAccountsMap: List<Map<String, Any>>, finvuFipDetailsMap: Map<String, Any>, promise: Promise ->
      try {
        val gson = Gson()

        // Convert JS-passed Map/List into JSON and then into Kotlin data classes
        val finvuAccountsJson = gson.toJson(finvuAccountsMap)
        val finvuFipDetailsJson = gson.toJson(finvuFipDetailsMap)

        val discoveredAccounts = gson.fromJson(finvuAccountsJson, Array<DiscoveredAccount>::class.java).toList()
        val fipDetails = gson.fromJson(finvuFipDetailsJson, FipDetails::class.java)

        sdkInstance.linkAccounts(discoveredAccounts, fipDetails) { result ->
          if (result.isSuccess) {
            val json = gson.toJson(result.getOrNull())
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("confirmAccountLinking") { referenceNumber: String, otp: String, promise: Promise ->
      try {
        sdkInstance.confirmAccountLinking(referenceNumber, otp) { result ->
          if (result.isSuccess) {
            val json = Gson().toJson(result.getOrNull())
            promise.resolve(json)
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message, null)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

  AsyncFunction("approveConsentRequest") { consentDetailsMap: Map<String, Any>, finvuLinkedAccountsMap: List<Map<String, Any>>, promise: Promise ->
      try {
          // Convert maps to JSON strings
          val jsonConsentDetails = Gson().toJson(consentDetailsMap)
          val jsonFinvuLinkedAccounts = Gson().toJson(finvuLinkedAccountsMap)

          val ConsentDetails = Gson().fromJson(jsonConsentDetails, ConsentDetail::class.java)
          val LinkedAccounts = Gson().fromJson(jsonFinvuLinkedAccounts, Array<LinkedAccountDetails>::class.java).toList()

          sdkInstance.approveConsentRequest(ConsentDetails, LinkedAccounts) { result ->
              if (result.isSuccess) {
                  val json = Gson().toJson(result.getOrNull())
                  promise.resolve(json)
              } else {
                  val exception = result.exceptionOrNull() as? FinvuException
                  val errorCode = exception?.code ?: "UNKNOWN_ERROR"
                  promise.reject(errorCode.toString(), exception?.message, null)
              }
          }
      } catch (e: Exception) {
          e.printStackTrace()
          promise.reject("CONNECT_ERROR", e.message, null)
      }
  }

    AsyncFunction("denyConsentRequest") { consentDetailsMap: Map<String, Any>, promise: Promise ->
        try {
            // Convert map to JSON
            val jsonConsentDetails = Gson().toJson(consentDetailsMap)

            val ConsentDetails = Gson().fromJson(jsonConsentDetails, ConsentDetail::class.java)
            sdkInstance.denyConsentRequest(ConsentDetails) { result ->
                if (result.isSuccess) {
                    val json = Gson().toJson(result.getOrNull())
                    promise.resolve(json)
                } else {
                    val exception = result.exceptionOrNull() as? FinvuException
                    val errorCode = exception?.code ?: "UNKNOWN_ERROR"
                    promise.reject(errorCode.toString(), exception?.message, null)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("CONNECT_ERROR", e.message, null)
        }
    }
  }   
}