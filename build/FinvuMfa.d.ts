import type { MfaLoginParams, MfaStep } from './Finvu.types';
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
export declare const mfaClient: {
    /**
     * Whether the user logging in is new. Known as soon as login() returns its first step,
     * so the first screen can greet a new or returning user. undefined before that, or when
     * Finvu did not send it.
     */
    readonly newUser: boolean | undefined;
    /** Whether the user already has linked accounts. Same rules as newUser. */
    readonly hasLinkedAccounts: boolean | undefined;
    login(params: MfaLoginParams): Promise<MfaStep>;
};
//# sourceMappingURL=FinvuMfa.d.ts.map