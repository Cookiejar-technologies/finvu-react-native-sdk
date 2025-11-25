import { EventEmitter, NativeModulesProxy } from 'expo-modules-core';
import FinvuModule from './FinvuModule';
const emitter = new EventEmitter(FinvuModule ?? NativeModulesProxy.Finvu);
// Helper function to handle promises and standardize errors
async function handleResult(promise, errorMessage) {
    try {
        const result = await promise;
        // Parse JSON if result is a string that looks like JSON
        let data;
        if (typeof result === 'string' && result.startsWith('{')) {
            try {
                data = JSON.parse(result);
            }
            catch {
                data = result;
            }
        }
        else {
            data = result;
        }
        return { isSuccess: true, data };
    }
    catch (error) {
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
// Helper function to handle synchronous calls and standardize errors
function handleSyncResult(fn, errorMessage) {
    try {
        const result = fn();
        return { isSuccess: true, data: result };
    }
    catch (error) {
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
export async function initializeWith(config) {
    return handleResult(FinvuModule.initializeWith(config), 'Initialization failed');
}
/**
 * Connect to the Finvu service
 */
export async function connect() {
    return handleResult(FinvuModule.connect(), 'Connection failed');
}
/**
 * Disconnect from the Finvu service
 */
export async function disconnect() {
    return handleResult(FinvuModule.disconnect(), 'Failed to disconnect from finvu');
}
/**
 * Checks if the user is currently connected to the Finvu service.
 *
 * @returns A `Result` object containing a boolean indicating connection status.
 * Returns `true` if connected, `false` otherwise.
 */
export async function isConnected() {
    return handleResult(FinvuModule.isConnected(), 'Failed to fetch connection status from Finvu.');
}
/**
 * Checks if there is an active session with the Finvu service.
 *
 * @returns A `Result` object containing a boolean:
 * - `true` if a session exists,
 * - `false` if no session is found.
 */
export async function hasSession() {
    return handleResult(FinvuModule.hasSession(), 'Unable to determine if a Finvu session exists.');
}
/**
 * Login with username or mobile number
 * @param username Username (email format)
 * @param mobileNumber Mobile number
 * @param consentHandleId Consent handle ID
 */
export async function loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId) {
    return handleResult(FinvuModule.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId), 'Login failed');
}
/**
 * Verify login OTP
 * @param otp OTP received by the user
 * @param otpReference Reference from the login response
 */
export async function verifyLoginOtp(otp, otpReference) {
    return handleResult(FinvuModule.verifyLoginOtp(otp, otpReference), 'OTP verification failed');
}
/**
 * Discover accounts at a financial institution
 * @param fipId Financial Information Provider ID
 * @param fiTypes Financial Information types
 * @param identifiers Array of identifier objects
 */
export async function discoverAccounts(fipId, fiTypes, identifiers) {
    return handleResult(FinvuModule.discoverAccounts(fipId, fiTypes, identifiers), 'Discovering accounts failed');
}
/**
 * Get a list of all FIP options
 */
export async function fipsAllFIPOptions() {
    return handleResult(FinvuModule.fipsAllFIPOptions(), 'Fetching FIPs failed');
}
/**
 * Fetch linked accounts
 */
export async function fetchLinkedAccounts() {
    return handleResult(FinvuModule.fetchLinkedAccounts(), 'Fetching linked accounts failed');
}
/**
 * Link accounts
 * @param accounts Array of discovered accounts
 * @param fipDetails FIP details object
 */
export async function linkAccounts(accounts, fipDetails) {
    return handleResult(FinvuModule.linkAccounts(JSON.parse(JSON.stringify(accounts)), JSON.parse(JSON.stringify(fipDetails))), 'Linking accounts failed');
}
/**
 * Confirm account linking
 * @param referenceNumber Reference number from linkAccounts response
 * @param otp OTP received by the user
 */
export async function confirmAccountLinking(referenceNumber, otp) {
    return handleResult(FinvuModule.confirmAccountLinking(referenceNumber, otp), 'Confirming account linking failed');
}
/**
 * Approve consent request
 * @param consentDetails Consent details object
 * @param finvuLinkedAccounts Array of linked account details
 */
export async function approveConsentRequest(consentDetails, finvuLinkedAccounts) {
    return handleResult(FinvuModule.approveConsentRequest(JSON.parse(JSON.stringify(consentDetails)), JSON.parse(JSON.stringify(finvuLinkedAccounts))), 'Approving consent failed');
}
/**
 * Deny consent request
 * @param consentRequestDetailInfo Consent details object
 */
export async function denyConsentRequest(consentRequestDetailInfo) {
    return handleResult(FinvuModule.denyConsentRequest(JSON.parse(JSON.stringify(consentRequestDetailInfo))), 'Denying consent failed');
}
/**
 * Fetch FIP details
 * @param fipId Financial Information Provider ID
 */
export async function fetchFipDetails(fipId) {
    return handleResult(FinvuModule.fetchFipDetails(fipId), 'Fetching FIP details failed');
}
/**
 * Get entity information
 * @param entityId Entity ID
 * @param entityType Entity type
 */
export async function getEntityInfo(entityId, entityType) {
    return handleResult(FinvuModule.getEntityInfo(entityId, entityType), 'Getting entity info failed');
}
/**
 * Get consent request details
 * @param consentHandleId Consent handle ID
 */
export async function getConsentRequestDetails(consentHandleId) {
    return handleResult(FinvuModule.getConsentRequestDetails(consentHandleId), 'Fetching consent request details failed');
}
/**
 * Logout from Finvu
 */
export async function logout() {
    return handleResult(FinvuModule.logout(), 'Logout failed');
}
/**
 * Add listener for connection status changes
 */
export function addConnectionStatusChangeListener(listener) {
    return emitter.addListener('onConnectionStatusChange', listener);
}
/**
 * Add listener for login OTP received
 */
export function addLoginOtpReceivedListener(listener) {
    return emitter.addListener('onLoginOtpReceived', listener);
}
/**
 * Add listener for login OTP verified
 */
export function addLoginOtpVerifiedListener(listener) {
    return emitter.addListener('onLoginOtpVerified', listener);
}
// Event Tracking Methods
// Track if native listener has been added
let nativeListenerAdded = false;
/**
 * Enable or disable event tracking
 * @param enabled Whether to enable event tracking
 */
export function setEventsEnabled(enabled) {
    return handleSyncResult(() => {
        FinvuModule.setEventsEnabled(enabled);
        return undefined;
    }, 'Failed to set events enabled');
}
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
export function addEventListener(listener) {
    // Automatically set up native listener bridge on first call
    if (!nativeListenerAdded) {
        const result = handleSyncResult(() => {
            FinvuModule.addEventListener();
            return undefined;
        }, 'Failed to add native event listener');
        if (result.isSuccess) {
            nativeListenerAdded = true;
        }
        else {
            console.warn('Failed to set up native event listener:', result.error);
        }
    }
    return emitter.addListener('onEvent', listener);
}
/**
 * Remove event listener
 * Note: Call this when you no longer need to receive events (e.g., on app termination)
 */
export function removeEventListener() {
    nativeListenerAdded = false;
    return handleSyncResult(() => {
        FinvuModule.removeEventListener();
        return undefined;
    }, 'Failed to remove event listener');
}
/**
 * Register custom events before tracking them
 * @param events Map of event names to EventDefinition objects
 */
export function registerCustomEvents(events) {
    return handleSyncResult(() => {
        FinvuModule.registerCustomEvents(events);
        return undefined;
    }, 'Failed to register custom events');
}
/**
 * Track a custom event
 * @param eventName Name of the event to track (must be registered first)
 * @param params Optional parameters for the event
 */
export function track(eventName, params) {
    return handleSyncResult(() => {
        FinvuModule.track(eventName, params || {});
        return undefined;
    }, 'Failed to track event');
}
/**
 * Register aliases for SDK event names
 * @param aliases Map of SDK event names to custom alias names
 */
export function registerAliases(aliases) {
    return handleSyncResult(() => {
        FinvuModule.registerAliases(aliases);
        return undefined;
    }, 'Failed to register aliases');
}
export { default } from './FinvuModule';
export * from './Finvu.types';
//# sourceMappingURL=index.js.map