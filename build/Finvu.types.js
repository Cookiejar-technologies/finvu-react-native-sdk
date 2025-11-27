export var FinvuEnviornment;
(function (FinvuEnviornment) {
    FinvuEnviornment["PRODUCTION"] = "PRODUCTION";
    FinvuEnviornment["UAT"] = "UAT";
})(FinvuEnviornment || (FinvuEnviornment = {}));
/**
 * Consent Handle Status enum
 */
export var ConsentHandleStatus;
(function (ConsentHandleStatus) {
    ConsentHandleStatus["ACCEPT"] = "ACCEPT";
    ConsentHandleStatus["DENY"] = "DENY";
    ConsentHandleStatus["PENDING"] = "PENDING";
})(ConsentHandleStatus || (ConsentHandleStatus = {}));
/**
 * Standard SDK Event Types (matching native enum)
 */
export var FinvuEventType;
(function (FinvuEventType) {
    // WebSocket Events
    FinvuEventType["WEBSOCKET_CONNECTED"] = "WEBSOCKET_CONNECTED";
    FinvuEventType["WEBSOCKET_DISCONNECTED"] = "WEBSOCKET_DISCONNECTED";
    // Redirection Events
    FinvuEventType["CONSENT_REQUEST_VALID"] = "CONSENT_REQUEST_VALID";
    FinvuEventType["CONSENT_REQUEST_INVALID"] = "CONSENT_REQUEST_INVALID";
    // Authentication Events
    FinvuEventType["LOGIN_INITIATED"] = "LOGIN_INITIATED";
    FinvuEventType["LOGIN_OTP_GENERATED"] = "LOGIN_OTP_GENERATED";
    FinvuEventType["LOGIN_OTP_FAILED"] = "LOGIN_OTP_FAILED";
    FinvuEventType["LOGIN_OTP_LOCKED"] = "LOGIN_OTP_LOCKED";
    FinvuEventType["LOGIN_OTP_VERIFIED"] = "LOGIN_OTP_VERIFIED";
    FinvuEventType["LOGIN_OTP_NOT_VERIFIED"] = "LOGIN_OTP_NOT_VERIFIED";
    FinvuEventType["LOGIN_FALLBACK_INITIATED"] = "LOGIN_FALLBACK_INITIATED";
    // Discovery Events
    FinvuEventType["DISCOVERY_INITIATED"] = "DISCOVERY_INITIATED";
    FinvuEventType["ACCOUNTS_DISCOVERED"] = "ACCOUNTS_DISCOVERED";
    FinvuEventType["DISCOVERY_FAILED"] = "DISCOVERY_FAILED";
    FinvuEventType["ACCOUNTS_NOT_DISCOVERED"] = "ACCOUNTS_NOT_DISCOVERED";
    // Linking Events
    FinvuEventType["LINKING_INITIATED"] = "LINKING_INITIATED";
    FinvuEventType["LINKING_OTP_GENERATED"] = "LINKING_OTP_GENERATED";
    FinvuEventType["LINKING_OTP_FAILED"] = "LINKING_OTP_FAILED";
    FinvuEventType["LINKING_SUCCESS"] = "LINKING_SUCCESS";
    FinvuEventType["LINKING_FAILURE"] = "LINKING_FAILURE";
    // Consent Events
    FinvuEventType["LINKED_ACCOUNTS_SUMMARY"] = "LINKED_ACCOUNTS_SUMMARY";
    FinvuEventType["CONSENT_APPROVED"] = "CONSENT_APPROVED";
    FinvuEventType["CONSENT_DENIED"] = "CONSENT_DENIED";
    FinvuEventType["APPROVE_CONSENT_FAILED"] = "APPROVE_CONSENT_FAILED";
    FinvuEventType["CONSENT_HANDLE_FAILED"] = "CONSENT_HANDLE_FAILED";
    FinvuEventType["GET_CONSENT_STATUS_FAILED"] = "GET_CONSENT_STATUS_FAILED";
    // Error Events
    FinvuEventType["SESSION_ERROR"] = "SESSION_ERROR";
    FinvuEventType["SESSION_FAILURE"] = "SESSION_FAILURE";
})(FinvuEventType || (FinvuEventType = {}));
/**
 * Backend Error Codes
 * These error codes are returned directly from the backend API.
 */
export var FinvuBackendErrorCode;
(function (FinvuBackendErrorCode) {
    // Common Response Codes
    FinvuBackendErrorCode["F200"] = "F200";
    FinvuBackendErrorCode["F400"] = "F400";
    FinvuBackendErrorCode["F401"] = "F401";
    FinvuBackendErrorCode["F402"] = "F402";
    FinvuBackendErrorCode["F403"] = "F403";
    FinvuBackendErrorCode["F404"] = "F404";
    FinvuBackendErrorCode["F405"] = "F405";
    FinvuBackendErrorCode["F406"] = "F406";
    FinvuBackendErrorCode["F407"] = "F407";
    FinvuBackendErrorCode["F408"] = "F408";
    FinvuBackendErrorCode["F429"] = "F429";
    FinvuBackendErrorCode["F500"] = "F500";
})(FinvuBackendErrorCode || (FinvuBackendErrorCode = {}));
/**
 * Auth Flow Error Codes
 */
export var FinvuAuthErrorCode;
(function (FinvuAuthErrorCode) {
    FinvuAuthErrorCode["A001"] = "A001";
    FinvuAuthErrorCode["A002"] = "A002";
    FinvuAuthErrorCode["A003"] = "A003";
    FinvuAuthErrorCode["A004"] = "A004";
    FinvuAuthErrorCode["A005"] = "A005";
    FinvuAuthErrorCode["A006"] = "A006";
})(FinvuAuthErrorCode || (FinvuAuthErrorCode = {}));
/**
 * Discovery & Linking Flow Error Codes
 */
export var FinvuDiscoveryErrorCode;
(function (FinvuDiscoveryErrorCode) {
    FinvuDiscoveryErrorCode["D001"] = "D001";
    FinvuDiscoveryErrorCode["D002"] = "D002";
    FinvuDiscoveryErrorCode["D003"] = "D003";
    FinvuDiscoveryErrorCode["D004"] = "D004";
    FinvuDiscoveryErrorCode["D005"] = "D005";
    FinvuDiscoveryErrorCode["D006"] = "D006";
    FinvuDiscoveryErrorCode["D007"] = "D007";
    FinvuDiscoveryErrorCode["D008"] = "D008";
    FinvuDiscoveryErrorCode["D009"] = "D009";
    FinvuDiscoveryErrorCode["D010"] = "D010";
    FinvuDiscoveryErrorCode["D011"] = "D011";
})(FinvuDiscoveryErrorCode || (FinvuDiscoveryErrorCode = {}));
/**
 * Consent Flow Error Codes
 */
export var FinvuConsentErrorCode;
(function (FinvuConsentErrorCode) {
    FinvuConsentErrorCode["C001"] = "C001";
    FinvuConsentErrorCode["C002"] = "C002";
    FinvuConsentErrorCode["C003"] = "C003";
    FinvuConsentErrorCode["C004"] = "C004";
    FinvuConsentErrorCode["C005"] = "C005";
    FinvuConsentErrorCode["C006"] = "C006";
    FinvuConsentErrorCode["C007"] = "C007";
    FinvuConsentErrorCode["C008"] = "C008";
    FinvuConsentErrorCode["C009"] = "C009";
    FinvuConsentErrorCode["C010"] = "C010";
})(FinvuConsentErrorCode || (FinvuConsentErrorCode = {}));
/**
 * SDK Error Codes
 * These error codes are generated by the SDK itself when the backend returns a null error code or for SDK-specific errors.
 */
export var FinvuSDKErrorCode;
(function (FinvuSDKErrorCode) {
    FinvuSDKErrorCode["AUTH_LOGIN_RETRY"] = "1001";
    FinvuSDKErrorCode["AUTH_LOGIN_FAILED"] = "1002";
    FinvuSDKErrorCode["AUTH_FORGOT_PASSWORD_FAILED"] = "1003";
    FinvuSDKErrorCode["AUTH_LOGIN_VERIFY_MOBILE_NUMBER"] = "1004";
    FinvuSDKErrorCode["AUTH_FORGOT_HANDLE_FAILED"] = "1005";
    FinvuSDKErrorCode["SESSION_DISCONNECTED"] = "8000";
    FinvuSDKErrorCode["SSL_PINNING_FAILURE_ERROR"] = "8001";
    FinvuSDKErrorCode["RECORD_NOT_FOUND"] = "8002";
    FinvuSDKErrorCode["LOGOUT"] = "9000";
    FinvuSDKErrorCode["GENERIC_ERROR"] = "9999";
})(FinvuSDKErrorCode || (FinvuSDKErrorCode = {}));
/**
 * Helper function to check if an error code is a specific type
 */
export function isBackendError(code) {
    return code.startsWith('F') && /^F\d{3}$/.test(code);
}
export function isAuthError(code) {
    return code.startsWith('A') && /^A\d{3}$/.test(code);
}
export function isDiscoveryError(code) {
    return code.startsWith('D') && /^D\d{3}$/.test(code);
}
export function isConsentError(code) {
    return code.startsWith('C') && /^C\d{3}$/.test(code);
}
export function isSDKError(code) {
    return ['1001', '1002', '1003', '1004', '1005', '8000', '8001', '8002', '9000', '9999'].includes(code);
}
//# sourceMappingURL=Finvu.types.js.map