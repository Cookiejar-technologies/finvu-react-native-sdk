import type { FinvuConfig } from './Finvu.types';
export interface FinvuModuleType {
    initializeWith(config: FinvuConfig): Promise<void>;
    connect(): Promise<string>;
    loginWithUsernameOrMobileNumber(username: string, mobileNumber: string, consentHandleId: string): Promise<any>;
    verifyLoginOtp(otp: string, otpReference: string): Promise<any>;
    fipsAllFIPOptions(): Promise<any>;
    discoverAccounts(fipId: string, fiTypes: string[], mobileNumber: string): Promise<any>;
    fetchLinkedAccounts(): Promise<any>;
    linkAccounts(accounts: any[], fipDetails: any): Promise<any>;
    confirmAccountLinking(referenceNumber: string, otp: string): Promise<any>;
    approveConsentRequest(consentDetails: any, linkedAccounts: any[]): Promise<any>;
    denyConsentRequest(consentRequestDetailInfo: any): Promise<any>;
}
declare const _default: FinvuModuleType;
export default _default;
//# sourceMappingURL=FinvuModule.d.ts.map