package expo.modules.finvu

import com.finvu.android.FinvuManager
import com.finvu.android.publicInterface.FinvuErrorCode
import com.finvu.android.publicInterface.FinvuException
import com.finvu.android.publicInterface.TypeIdentifierInfo
import com.finvu.android.publicInterface.DiscoveredAccount
import com.finvu.android.publicInterface.FipDetails
import com.finvu.android.publicInterface.ConsentDetail
import com.finvu.android.publicInterface.LinkedAccountDetails
import com.finvu.android.utils.FinvuConfig
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import com.google.gson.Gson

class FinvuModule : Module() {

  data class FinvuClientConfig(
    override val finvuEndpoint: String,
    override val certificatePins: List<String>?
  ) : FinvuConfig

  private val sdkInstance: FinvuManager = FinvuManager.shared

  override fun definition() = ModuleDefinition {
    Name("Finvu")
    Constants(
      // Add any constants here if needed
    )

    Events("onConnectionStatusChange", "onLoginOtpReceived", "onLoginOtpVerified")

    Function("initializeWith") { config: Map<String, Any> ->
      try {
        val finvuEndpoint = config["finvuEndpoint"] as? String ?: throw IllegalArgumentException("finvuEndpoint is required")
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
            if (exception != null) {
              val errorCode = when (exception.code) {
                FinvuErrorCode.SSL_PINNING_FAILURE_ERROR.code -> "SSL_PINNING_FAILURE_ERROR"
                else -> "UNKNOWN_ERROR"
              }
              sendEvent("onConnectionStatusChange", mapOf("status" to errorCode))
              throw RuntimeException(errorCode)
            } else {
              sendEvent("onConnectionStatusChange", mapOf("status" to "UNKNOWN_ERROR"))
              throw RuntimeException("UNKNOWN_ERROR")
            }
          }
      }
    }

    AsyncFunction("loginWithUsernameOrMobileNumber") { username: String, mobileNumber: String, consentHandleId: String,promise: Promise ->
      try {
        sdkInstance.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId) { result ->
            if (result.isSuccess) {
              val reference = result.getOrNull()?.reference
              promise.resolve(mapOf("reference" to reference))
            } else {
              val exception = result.exceptionOrNull() as? FinvuException
              val errorCode = exception?.code ?: "UNKNOWN_ERROR"
              promise.reject(errorCode.toString(), exception?.message, null)
              //sendEvent("onLoginOtpReceived", mapOf("status" to errorCode))
              //throw RuntimeException(errorCode.toString())
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
              promise.reject(errorCode.toString(), exception?.message,null)
              throw RuntimeException(errorCode.toString())
            }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("fipsAllFIPOptions") { promise: Promise ->
      try {
        sdkInstance.fipsAllFIPOptions { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            println("fipsAllFIPOptions result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
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
            println("fetchLinkedAccounts result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("discoverAccounts") {fipId: String, fiTypes: List<String>, mobileNumber: String, promise: Promise ->
      try {
        println("discoverAccounts started $fipId $fiTypes $mobileNumber")
        val identifiers = mutableListOf(
          TypeIdentifierInfo(
            "STRONG",
            "MOBILE",
            mobileNumber
          )
        )
        identifiers.add(
          TypeIdentifierInfo(
          "WEAK",
          "PAN",
          ""
          )
        )
        sdkInstance.discoverAccounts(fipId, fiTypes, identifiers) { result ->
        println("discoverAccounts called $fipId $fiTypes $identifiers")
          if (result.isSuccess) {
            val response = result.getOrNull()
            println("discoverAccounts result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
          }
        }
      } catch (e: Exception) {
        println("discoverAccounts error $e")
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }
    
    AsyncFunction("linkAccounts") {finvuAccounts: List<DiscoveredAccount>, finvuFipDetails: FipDetails, promise: Promise ->
      try {
        sdkInstance.linkAccounts(finvuAccounts, finvuFipDetails) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            println("linkAccounts result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("confirmAccountLinking") {referenceNumber: String, otp: String, promise: Promise ->
      try {
        sdkInstance.confirmAccountLinking(referenceNumber, otp) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            println("confirmAccountLinking result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("approveConsentRequest") {consentDetails: ConsentDetail, finvuLinkedAccounts: List<LinkedAccountDetails>, promise: Promise ->
      try {
        sdkInstance.approveConsentRequest(consentDetails, finvuLinkedAccounts) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            println("approveConsentRequest result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }

    AsyncFunction("denyConsentRequest") {consentRequestDetailInfo: ConsentDetail, promise: Promise ->
      try {
        sdkInstance.denyConsentRequest(consentRequestDetailInfo) { result ->
          if (result.isSuccess) {
            val response = result.getOrNull()
            println("denyConsentRequest result $response")
            val json = Gson().toJson(response) // Convert object to JSON string
            promise.resolve(json) // Send JSON string to JavaScript
          } else {
            val exception = result.exceptionOrNull() as? FinvuException
            val errorCode = exception?.code ?: "UNKNOWN_ERROR"
            promise.reject(errorCode.toString(), exception?.message,null)
            throw RuntimeException(errorCode.toString())
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
        throw RuntimeException("CONNECT_ERROR", e)
      }
    }
  }
}