export type ChangeEventPayload = {
    value: string;
};
export type FinvuViewProps = {
    name: string;
};
export declare enum FinvuEnviornment {
    PRODUCTION = "PRODUCTION",
    UAT = "UAT"
}
export type FinvuAuthSNAConfig = {
    environment: FinvuEnviornment;
};
export type FinvuConfig = {
    finvuEndpoint: string;
    certificatePins?: string[];
    finvuAuthSNAConfig?: FinvuAuthSNAConfig;
};
export interface LoginWithUsernameOrMobileNumberResponse {
    authType: string;
    reference: string;
    snaToken?: string;
}
export interface DiscoveredAccount {
    fiType: string;
    accountReferenceNumber: string;
    accountType: string;
    maskedAccountNumber: string;
}
export interface TypeIdentifier {
    category: string;
    type: string;
}
export interface FipFiTypeIdentifier {
    fiType: string;
    identifiers: TypeIdentifier[];
}
export interface FipDetails {
    fipId: string;
    typeIdentifiers: FipFiTypeIdentifier[];
}
export interface UserInfo {
    userId: string;
    mobileNumber: string;
    emailId: string;
}
export interface FipDetails {
    fipId: string;
    typeIdentifiers: FipFiTypeIdentifier[];
}
export interface FipFiTypeIdentifier {
    fiType: string;
    identifiers: TypeIdentifier[];
}
export interface TypeIdentifier {
    category: string;
    type: string;
}
export interface LinkedAccount {
    accountReferenceNumber: string;
    customerAddress: string;
    linkReferenceNumber: string;
    status: string;
}
export interface LinkedAccountDetails {
    userId: string;
    fipId: string;
    fipName: string;
    maskedAccountNumber: string;
    accountReferenceNumber: string;
    linkReferenceNumber: string;
    consentIdList: string[] | null;
    fiType: string;
    accountType: string;
    linkedAccountUpdateTimestamp: Date | null;
    authenticatorType: string;
}
export interface ConsentDetail {
    consentId: string | null;
    consentHandle: string;
    statusLastUpdateTimestamp: Date | null;
    financialInformationUser: FinancialInformationEntity;
    consentPurpose: ConsentPurpose;
    consentDisplayDescriptions: string[];
    dataDateTimeRange: DateTimeRange;
    consentDateTimeRange: DateTimeRange;
    consentDataLife: ConsentDataLifePeriod;
    consentDataFrequency: ConsentDataFrequency;
    fiTypes: string[] | null;
}
export interface DateTimeRange {
    from: Date;
    to: Date;
}
export interface ConsentDataFrequency {
    unit: string;
    value: number;
}
export interface ConsentDataLifePeriod {
    unit: string;
    value: number;
}
export interface FinancialInformationEntity {
    id: string;
    name: string;
}
export interface ConsentPurpose {
    code: string;
    text: string;
}
export interface ConsentAccountDetails {
    fiType: string;
    fipId: string;
    accountType: string;
    accountReferenceNumber: string | null;
    maskedAccountNumber: string;
    linkReferenceNumber: string;
}
export interface ConsentInfoDetails {
    consentHandle: string | null;
    consentId: string | null;
    consentStatus: string;
    statusLastUpdateTimestamp: string;
    financialInformationProvider: FinancialInformationEntity | null;
    financialInformationUser: FinancialInformationEntity | null;
    consentPurpose: ConsentPurpose;
    consentDisplayDescriptions: string[];
    dataDateTimeRange: DateTimeRange;
    consentDateTimeRange: DateTimeRange;
    consentDataLife: ConsentDataLifePeriod;
    consentDataFrequency: ConsentDataFrequency;
    accounts: ConsentAccountDetails[];
    fiTypes: string[] | null;
    accountAggregator: AccountAggregatorView;
}
export interface AccountAggregatorView {
    id: string;
}
export interface DiscoveredAccount {
    accountReferenceNumber: string;
    accountType: string;
    fiType: string;
    maskedAccountNumber: string;
}
export interface DiscoverAccountsResponse {
    discoveredAccounts: DiscoveredAccount[];
}
export interface TypeIdentifier {
    category: string;
    type: string;
}
export interface FipFiTypeIdentifier {
    fiType: string;
    identifiers: TypeIdentifier[];
}
export interface FipDetails {
    fipId: string;
    typeIdentifiers: FipFiTypeIdentifier[];
}
/**
 * FIP information interface matching Kotlin data class
 */
export interface FIPInfo {
    fipId: string;
    productName?: string;
    fipFiTypes: string[];
    fipFsr?: string;
    productDesc?: string;
    productIconUri?: string;
    enabled: boolean;
}
/**
 * Response for all FIP options matching Kotlin data class
 */
export interface FipsAllFIPOptionsResponse {
    searchOptions: FIPInfo[];
}
/**
 * Event Definition for custom events
 */
export interface EventDefinition {
    category: string;
    count?: number;
    stage?: string;
    fipId?: string;
    fips?: string[];
    fiTypes?: string[];
}
/**
 * Finvu Event structure
 */
export interface FinvuEvent {
    eventName: string;
    eventCategory: string;
    timestamp: string;
    aaSdkVersion: string;
    params: Record<string, any>;
}
/**
 * Event Listener callback type
 */
export type FinvuEventListener = (event: FinvuEvent) => void;
/**
 * Standard SDK Event Types (matching native enum)
 */
export declare enum FinvuEventType {
    WEBSOCKET_CONNECTED = "WEBSOCKET_CONNECTED",
    WEBSOCKET_DISCONNECTED = "WEBSOCKET_DISCONNECTED",
    CONSENT_REQUEST_VALID = "CONSENT_REQUEST_VALID",
    CONSENT_REQUEST_INVALID = "CONSENT_REQUEST_INVALID",
    LOGIN_INITIATED = "LOGIN_INITIATED",
    LOGIN_OTP_GENERATED = "LOGIN_OTP_GENERATED",
    LOGIN_OTP_FAILED = "LOGIN_OTP_FAILED",
    LOGIN_OTP_LOCKED = "LOGIN_OTP_LOCKED",
    LOGIN_OTP_VERIFIED = "LOGIN_OTP_VERIFIED",
    LOGIN_OTP_NOT_VERIFIED = "LOGIN_OTP_NOT_VERIFIED",
    LOGIN_FALLBACK_INITIATED = "LOGIN_FALLBACK_INITIATED",
    DISCOVERY_INITIATED = "DISCOVERY_INITIATED",
    ACCOUNTS_DISCOVERED = "ACCOUNTS_DISCOVERED",
    DISCOVERY_FAILED = "DISCOVERY_FAILED",
    ACCOUNTS_NOT_DISCOVERED = "ACCOUNTS_NOT_DISCOVERED",
    LINKING_INITIATED = "LINKING_INITIATED",
    LINKING_OTP_GENERATED = "LINKING_OTP_GENERATED",
    LINKING_OTP_FAILED = "LINKING_OTP_FAILED",
    LINKING_SUCCESS = "LINKING_SUCCESS",
    LINKING_FAILURE = "LINKING_FAILURE",
    LINKED_ACCOUNTS_SUMMARY = "LINKED_ACCOUNTS_SUMMARY",
    CONSENT_APPROVED = "CONSENT_APPROVED",
    CONSENT_DENIED = "CONSENT_DENIED",
    APPROVE_CONSENT_FAILED = "APPROVE_CONSENT_FAILED",
    CONSENT_HANDLE_FAILED = "CONSENT_HANDLE_FAILED",
    GET_CONSENT_STATUS_FAILED = "GET_CONSENT_STATUS_FAILED",
    SESSION_ERROR = "SESSION_ERROR",
    SESSION_FAILURE = "SESSION_FAILURE"
}
//# sourceMappingURL=Finvu.types.d.ts.map