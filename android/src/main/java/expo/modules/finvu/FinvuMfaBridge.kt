package expo.modules.finvu

import com.finvu.android.FinvuManager
import com.finvu.android.mfa.LoginParams
import com.finvu.android.mfa.MfaCompleteStep
import com.finvu.android.mfa.MfaInputStep
import com.finvu.android.mfa.MfaSelectFactorStep
import com.finvu.android.mfa.MfaSilentStep
import com.finvu.android.mfa.MfaStep
import com.finvu.android.mfa.SupportedFactors
import expo.modules.kotlin.Promise
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Bridges the native MFA step objects to JS. Native steps carry functions, which cannot
 * cross the bridge, so each live step is kept here under a stepId and JS refers to it by
 * that id. Every call resolves (never rejects); failures are a 'complete' step with
 * resultStatus 'failed'. Steps are cleared on a new login and on logout.
 */
internal class FinvuMfaBridge {

  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private val steps = ConcurrentHashMap<String, MfaStep>()

  fun clear() = steps.clear()

  fun login(params: Map<String, Any?>, promise: Promise) {
    clear()
    @Suppress("UNCHECKED_CAST")
    val loginParams = LoginParams(
      mobileNumber = params["mobileNumber"] as? String,
      username = params["username"] as? String,
      consentHandle = params["consentHandle"] as? String,
      handleId = params["handleId"] as? String,
      clientContext = params["clientContext"] as? Map<String, Any?>,
      supportedFactors = SupportedFactors(
        firstFactor = (params["firstFactor"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
        secondFactor = (params["secondFactor"] as? List<*>)?.filterIsInstance<String>() ?: emptyList()
      ),
      useEncConsent = params["useEncConsent"] as? Boolean ?: true,
      finalizeSession = params["finalizeSession"] as? Boolean,
      selectFactorChoice = params["selectFactorChoice"] as? Boolean ?: false
    )
    run(promise) { FinvuManager.shared.mfaClient.login(loginParams) }
  }

  fun submit(stepId: String, value: String, promise: Promise) =
    withStep<MfaInputStep>(stepId, promise) { it.submit(value) }

  fun resend(stepId: String, promise: Promise) =
    withStep<MfaInputStep>(stepId, promise) { it.resend?.invoke() }

  fun forgotPin(stepId: String, promise: Promise) =
    withStep<MfaInputStep>(stepId, promise) { it.forgotPin?.invoke() }

  fun selectFactor(stepId: String, factor: String, promise: Promise) =
    withStep<MfaSelectFactorStep>(stepId, promise) { it.selectFactor(factor) }

  fun awaitCompletion(stepId: String, promise: Promise) =
    withStep<MfaSilentStep>(stepId, promise) { it.completion.await() }

  fun retry(stepId: String, promise: Promise) =
    withStep<MfaCompleteStep>(stepId, promise) { it.retry?.invoke() }

  /** Runs [block] on the step with [stepId]; a null result means the action is not available on it. */
  private inline fun <reified T : MfaStep> withStep(
    stepId: String,
    promise: Promise,
    noinline block: suspend (T) -> MfaStep?
  ) {
    val step = steps[stepId] as? T
    if (step == null) {
      promise.resolve(failed("mfaStepNotFound", "MFA step not found or no longer valid"))
      return
    }
    run(promise) { block(step) }
  }

  private fun run(promise: Promise, block: suspend () -> MfaStep?) {
    scope.launch {
      val result = try {
        block()?.let { toMap(it) } ?: failed("actionNotAvailable", "This action is not available on the step")
      } catch (e: CancellationException) {
        throw e
      } catch (t: Throwable) {
        failed("mfaFailed", t.message ?: "Authentication failed")
      }
      promise.resolve(result)
    }
  }

  private fun toMap(step: MfaStep): Map<String, Any?> {
    val stepId = UUID.randomUUID().toString()
    steps[stepId] = step
    val map = when (step) {
      is MfaInputStep -> mapOf(
        "factor" to step.factor,
        "requirement" to step.requirement,
        "purpose" to step.purpose,
        "pinLength" to step.inputSpec?.pinLength,
        "validationError" to step.validationError?.let {
          mapOf("code" to it.code, "message" to it.message, "attemptsRemaining" to it.attemptsRemaining)
            .filterValues { value -> value != null }
        },
        "resendInfo" to step.resendInfo?.let {
          mapOf("resendAfterSeconds" to it.resendAfterSeconds, "resendsRemaining" to it.resendsRemaining)
            .filterValues { value -> value != null }
        },
        "hasResend" to (step.resend != null),
        "hasForgotPin" to (step.forgotPin != null),
        "hasRetry" to false
      )
      is MfaSilentStep -> mapOf("factor" to step.factor, "hasResend" to false, "hasForgotPin" to false, "hasRetry" to false)
      is MfaSelectFactorStep -> mapOf(
        "availableFactors" to step.availableFactors,
        "hasResend" to false,
        "hasForgotPin" to false,
        "hasRetry" to false
      )
      is MfaCompleteStep -> mapOf(
        "resultStatus" to step.result.status,
        "session" to step.result.session?.let {
          mapOf("userId" to it.userId, "sessionId" to it.sessionId, "csid" to it.csid)
            .filterValues { value -> value != null }
        },
        "error" to step.result.error?.let { mapOf("code" to it.code, "message" to it.message) },
        "hasResend" to false,
        "hasForgotPin" to false,
        "hasRetry" to (step.retry != null)
      )
    }
    return (mapOf("stepId" to stepId, "action" to step.action) + map).filterValues { it != null }
  }

  /** A failed 'complete' step built on this side (not stored: it has no retry). */
  private fun failed(code: String, message: String): Map<String, Any?> = mapOf(
    "stepId" to UUID.randomUUID().toString(),
    "action" to "complete",
    "resultStatus" to "failed",
    "error" to mapOf("code" to code, "message" to message),
    "hasResend" to false,
    "hasForgotPin" to false,
    "hasRetry" to false
  )
}
