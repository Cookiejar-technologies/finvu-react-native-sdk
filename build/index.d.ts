import { EventSubscription } from 'expo-modules-core';
import type { ConsentDetail, DiscoverAccountsResponse, DiscoveredAccount, FinvuConfig, FipDetails, FipsAllFIPOptionsResponse, LinkedAccountDetails, LoginWithUsernameOrMobileNumberResponse, EventDefinition, FinvuEventListener } from './Finvu.types';
export type Result<T> = {
    isSuccess: true;
    data: T;
} | {
    isSuccess: false;
    error: {
        code: string;
        message: string;
    };
};
/**
 * Initialize the Finvu SDK with configuration options
 * @param config Configuration for the Finvu SDK
 */
export declare function initializeWith(config: FinvuConfig): Promise<Result<string>>;
/**
 * Connect to the Finvu service
 */
export declare function connect(): Promise<Result<void>>;
/**
 * Disconnect from the Finvu service
 */
export declare function disconnect(): Promise<Result<void>>;
/**
 * Checks if the user is currently connected to the Finvu service.
 *
 * @returns A `Result` object containing a boolean indicating connection status.
 * Returns `true` if connected, `false` otherwise.
 */
export declare function isConnected(): Promise<Result<boolean>>;
/**
 * Checks if there is an active session with the Finvu service.
 *
 * @returns A `Result` object containing a boolean:
 * - `true` if a session exists,
 * - `false` if no session is found.
 */
export declare function hasSession(): Promise<Result<boolean>>;
/**
 * Login with username or mobile number
 * @param username Username (email format)
 * @param mobileNumber Mobile number
 * @param consentHandleId Consent handle ID
 */
export declare function loginWithUsernameOrMobileNumber(username: string, mobileNumber: string, consentHandleId: string): Promise<Result<LoginWithUsernameOrMobileNumberResponse>>;
/**
 * Verify login OTP
 * @param otp OTP received by the user
 * @param otpReference Reference from the login response
 */
export declare function verifyLoginOtp(otp: string, otpReference: string): Promise<Result<{
    userId: string;
}>>;
/**
 * Discover accounts at a financial institution
 * @param fipId Financial Information Provider ID
 * @param fiTypes Financial Information types
 * @param identifiers Array of identifier objects
 */
export declare function discoverAccounts(fipId: string, fiTypes: string[], identifiers: {
    category: string;
    type: string;
    value: string;
}[]): Promise<Result<DiscoverAccountsResponse>>;
/**
 * Get a list of all FIP options
 */
export declare function fipsAllFIPOptions(): Promise<Result<FipsAllFIPOptionsResponse>>;
/**
 * Fetch linked accounts
 */
export declare function fetchLinkedAccounts(): Promise<Result<{
    linkedAccounts: any[];
}>>;
/**
 * Link accounts
 * @param accounts Array of discovered accounts
 * @param fipDetails FIP details object
 */
export declare function linkAccounts(accounts: DiscoveredAccount[], fipDetails: FipDetails): Promise<Result<{
    linkedAccounts?: any[];
    referenceNumber?: string;
}>>;
/**
 * Confirm account linking
 * @param referenceNumber Reference number from linkAccounts response
 * @param otp OTP received by the user
 */
export declare function confirmAccountLinking(referenceNumber: string, otp: string): Promise<Result<any>>;
/**
 * Approve consent request
 * @param consentDetails Consent details object
 * @param finvuLinkedAccounts Array of linked account details
 */
export declare function approveConsentRequest(consentDetails: ConsentDetail, finvuLinkedAccounts: LinkedAccountDetails[]): Promise<Result<any>>;
/**
 * Deny consent request
 * @param consentRequestDetailInfo Consent details object
 */
export declare function denyConsentRequest(consentRequestDetailInfo: ConsentDetail): Promise<Result<any>>;
/**
 * Fetch FIP details
 * @param fipId Financial Information Provider ID
 */
export declare function fetchFipDetails(fipId: string): Promise<Result<FipDetails>>;
/**
 * Get entity information
 * @param entityId Entity ID
 * @param entityType Entity type
 */
export declare function getEntityInfo(entityId: string, entityType: string): Promise<Result<any>>;
/**
 * Get consent request details
 * @param consentHandleId Consent handle ID
 */
export declare function getConsentRequestDetails(consentHandleId: string): Promise<Result<ConsentDetail>>;
/**
 * Logout from Finvu
 */
export declare function logout(): Promise<Result<void>>;
/**
 * Add listener for connection status changes
 */
export declare function addConnectionStatusChangeListener(listener: (event: {
    status: string;
}) => void): EventSubscription;
/**
 * Add listener for login OTP received
 */
export declare function addLoginOtpReceivedListener(listener: (event: any) => void): EventSubscription;
/**
 * Add listener for login OTP verified
 */
export declare function addLoginOtpVerifiedListener(listener: (event: any) => void): EventSubscription;
/**
 * Enable or disable event tracking
 * @param enabled Whether to enable event tracking
 */
export declare function setEventsEnabled(enabled: boolean): Result<void>;
/**
 * Add event listener to receive SDK events
 * This function automatically sets up the native listener bridge if not already set up.
 *
 * @param listener Callback function to receive events
 * @returns EventSubscription that can be used to remove the listener
 *
 * @example
 * ```typescript
 * const subscription = addEventListener((event) => {
 *   console.log('Event:', event.eventName, event.params);
 * });
 *
 * // Later, to remove:
 * subscription.remove();
 * ```
 */
export declare function addEventListener(listener: FinvuEventListener): EventSubscription;
/**
 * Remove event listener
 * Note: Call this when you no longer need to receive events (e.g., on app termination)
 */
export declare function removeEventListener(): Result<void>;
/**
 * Register custom events before tracking them
 * @param events Map of event names to EventDefinition objects
 */
export declare function registerCustomEvents(events: Record<string, EventDefinition>): Result<void>;
/**
 * Track a custom event
 * @param eventName Name of the event to track (must be registered first)
 * @param params Optional parameters for the event
 */
export declare function track(eventName: string, params?: Record<string, any>): Result<void>;
/**
 * Register aliases for SDK event names
 * @param aliases Map of SDK event names to custom alias names
 */
export declare function registerAliases(aliases: Record<string, string>): Result<void>;
export { default } from './FinvuModule';
export * from './Finvu.types';
//# sourceMappingURL=index.d.ts.map