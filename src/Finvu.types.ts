export type ChangeEventPayload = {
  value: string;
};

export type FinvuViewProps = {
  name: string;
};

export enum FinvuEnviornment {
  PRODUCTION = "PRODUCTION",
  UAT = "UAT",
}

export type FinvuAuthSNAConfig = {
  environment: FinvuEnviornment;
}

export type FinvuConfig ={
  finvuEndpoint: string;
  certificatePins?: string[];
  finvuAuthSNAConfig?: FinvuAuthSNAConfig;
}

export interface LoginWithUsernameOrMobileNumberResponse {
  authType : string;
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

// UserInfo
export interface UserInfo {
  userId: string;
  mobileNumber: string;
  emailId: string;
}

// FipDetails & Related Classes
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

// Linked Account
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

// Consent Related Models
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