import { EventEmitter, NativeModulesProxy, EventSubscription } from 'expo-modules-core';
import FinvuModule from './FinvuModule';
import type { ConsentDetail, DiscoverAccountsResponse, DiscoveredAccount, FinvuConfig, FipDetails, FipsAllFIPOptionsResponse, LinkedAccountDetails } from './Finvu.types';

// Define the event types for the EventEmitter
type FinvuEvents = {
  onConnectionStatusChange: (event: { status: string }) => void;
  onLoginOtpReceived: (event: any) => void;
  onLoginOtpVerified: (event: any) => void;
};

const emitter = new EventEmitter<FinvuEvents>(FinvuModule ?? NativeModulesProxy.Finvu);

// Define a consistent Result type for all responses
export type Result<T> = 
  | { isSuccess: true, data: T }  // Success response
  | { isSuccess: false, error: { code: string, message: string } };  // Error response

// Helper function to handle promises and standardize errors
async function handleResult<T>(promise: Promise<any>, errorMessage: string): Promise<Result<T>> {
  try {
    const result = await promise;
    
    // Parse JSON if result is a string that looks like JSON
    let data: T;
    if (typeof result === 'string' && result.startsWith('{')) {
      try {
        data = JSON.parse(result);
      } catch {
        data = result as unknown as T;
      }
    } else {
      data = result as T;
    }
    
    return { isSuccess: true, data }; 
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);
    return { 
      isSuccess: false, 
      error: { 
        code: error?.code || 'UNKNOWN_ERROR',
        message: error?.message || errorMessage
      } 
    };
  }
}

/**
 * Initialize the Finvu SDK with configuration options
 * @param config Configuration for the Finvu SDK
 */
export async function initializeWith(config: FinvuConfig): Promise<Result<string>> {
  return handleResult(FinvuModule.initializeWith(config), 'Initialization failed');
}

/**
 * Connect to the Finvu service
 */
export async function connect(): Promise<Result<void>> {
  return handleResult(FinvuModule.connect(), 'Connection failed');
}

/**
 * Login with username or mobile number
 * @param username Username (email format)
 * @param mobileNumber Mobile number
 * @param consentHandleId Consent handle ID
 */
export async function loginWithUsernameOrMobileNumber(
  username: string, 
  mobileNumber: string, 
  consentHandleId: string
): Promise<Result<{ reference: string }>> {
  return handleResult(
    FinvuModule.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId),
    'Login failed'
  );
}

/**
 * Verify login OTP
 * @param otp OTP received by the user
 * @param otpReference Reference from the login response
 */
export async function verifyLoginOtp(
  otp: string, 
  otpReference: string
): Promise<Result<{ userId: string }>> {
  return handleResult(
    FinvuModule.verifyLoginOtp(otp, otpReference),
    'OTP verification failed'
  );
}

/**
 * Discover accounts at a financial institution
 * @param fipId Financial Information Provider ID
 * @param fiTypes Financial Information types
 * @param identifiers Array of identifier objects
 */
export async function discoverAccounts(
  fipId: string,
  fiTypes: string[],
  identifiers: { category: string; type: string; value: string }[]
): Promise<Result<DiscoverAccountsResponse>> {
  return handleResult(
    FinvuModule.discoverAccounts(fipId, fiTypes, identifiers),
    'Discovering accounts failed'
  );
}

/**
 * Get a list of all FIP options
 */
export async function fipsAllFIPOptions(): Promise<Result<FipsAllFIPOptionsResponse>> {
  return handleResult(FinvuModule.fipsAllFIPOptions(), 'Fetching FIPs failed');
}

/**
 * Fetch linked accounts
 */
export async function fetchLinkedAccounts(): Promise<Result<{ linkedAccounts: any[] }>> {
  return handleResult(FinvuModule.fetchLinkedAccounts(), 'Fetching linked accounts failed');
}

/**
 * Link accounts
 * @param accounts Array of discovered accounts
 * @param fipDetails FIP details object
 */
export async function linkAccounts(
  accounts: DiscoveredAccount[],
  fipDetails: FipDetails
): Promise<Result<{ linkedAccounts?: any[], referenceNumber?: string }>> {
  return handleResult(
    FinvuModule.linkAccounts(
      JSON.parse(JSON.stringify(accounts)),
      JSON.parse(JSON.stringify(fipDetails))
    ),
    'Linking accounts failed'
  );
}

/**
 * Confirm account linking
 * @param referenceNumber Reference number from linkAccounts response
 * @param otp OTP received by the user
 */
export async function confirmAccountLinking(
  referenceNumber: string, 
  otp: string
): Promise<Result<any>> {
  return handleResult(
    FinvuModule.confirmAccountLinking(referenceNumber, otp),
    'Confirming account linking failed'
  );
}

/**
 * Approve consent request
 * @param consentDetails Consent details object
 * @param finvuLinkedAccounts Array of linked account details
 */
export async function approveConsentRequest(
  consentDetails: ConsentDetail, 
  finvuLinkedAccounts: LinkedAccountDetails[]
): Promise<Result<any>> {
  return handleResult(
    FinvuModule.approveConsentRequest(
      JSON.parse(JSON.stringify(consentDetails)),
      JSON.parse(JSON.stringify(finvuLinkedAccounts))
    ),
    'Approving consent failed'
  );
}

/**
 * Deny consent request
 * @param consentRequestDetailInfo Consent details object
 */
export async function denyConsentRequest(
  consentRequestDetailInfo: ConsentDetail
): Promise<Result<any>> {
  return handleResult(
    FinvuModule.denyConsentRequest(JSON.parse(JSON.stringify(consentRequestDetailInfo))),
    'Denying consent failed'
  );
}

/**
 * Fetch FIP details
 * @param fipId Financial Information Provider ID
 */
export async function fetchFipDetails(fipId: string): Promise<Result<FipDetails>> {
  return handleResult(FinvuModule.fetchFipDetails(fipId), 'Fetching FIP details failed');
}

/**
 * Get entity information
 * @param entityId Entity ID
 * @param entityType Entity type
 */
export async function getEntityInfo(
  entityId: string, 
  entityType: string
): Promise<Result<any>> {
  return handleResult(FinvuModule.getEntityInfo(entityId, entityType), 'Getting entity info failed');
}

/**
 * Get consent request details
 * @param consentHandleId Consent handle ID
 */
export async function getConsentRequestDetails(
  consentHandleId: string
): Promise<Result<ConsentDetail>> {
  return handleResult(FinvuModule.getConsentRequestDetails(consentHandleId), 'Fetching consent request details failed');
}

/**
 * Logout from Finvu
 */
export async function logout(): Promise<Result<void>> {
  return handleResult(FinvuModule.logout(), 'Logout failed');
}

/**
 * Add listener for connection status changes
 */
export function addConnectionStatusChangeListener(
  listener: (event: { status: string }) => void
): EventSubscription {
  return emitter.addListener('onConnectionStatusChange', listener);
}

/**
 * Add listener for login OTP received
 */
export function addLoginOtpReceivedListener(
  listener: (event: any) => void
): EventSubscription {
  return emitter.addListener('onLoginOtpReceived', listener);
}

/**
 * Add listener for login OTP verified
 */
export function addLoginOtpVerifiedListener(
  listener: (event: any) => void
): EventSubscription {
  return emitter.addListener('onLoginOtpVerified', listener);
}

export { default } from './FinvuModule';
export * from './Finvu.types';