export var FinvuEnviornment;
(function (FinvuEnviornment) {
    FinvuEnviornment["PRODUCTION"] = "PRODUCTION";
    FinvuEnviornment["UAT"] = "UAT";
})(FinvuEnviornment || (FinvuEnviornment = {}));
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
//# sourceMappingURL=Finvu.types.js.map