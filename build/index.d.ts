import { EventSubscription } from 'expo-modules-core';
import type { ConsentDetail, DiscoverAccountsResponse, DiscoveredAccount, FinvuConfig, FipDetails, FipsAllFIPOptionsResponse, LinkedAccountDetails } from './Finvu.types';
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
 * Login with username or mobile number
 * @param username Username (email format)
 * @param mobileNumber Mobile number
 * @param consentHandleId Consent handle ID
 */
export declare function loginWithUsernameOrMobileNumber(username: string, mobileNumber: string, consentHandleId: string): Promise<Result<{
    reference: string;
}>>;
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
export { default } from './FinvuModule';
export * from './Finvu.types';
//# sourceMappingURL=index.d.ts.map