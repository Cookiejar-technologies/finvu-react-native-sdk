import { EventSubscription } from 'expo-modules-core';
import type { FinvuConfig } from './Finvu.types';
export declare function initializeWith(config: FinvuConfig): Promise<void>;
export declare function connect(): Promise<string | undefined>;
export declare function loginWithUsernameOrMobileNumber(username: string, mobileNumber: string, consentHandleId: string): Promise<any>;
export declare function verifyLoginOtp(otp: string, otpReference: string): Promise<any>;
export declare function fipsAllFIPOptions(): Promise<any>;
export declare function fetchLinkedAccounts(): Promise<any>;
export declare function discoverAccounts(fipId: string, fiTypes: string[], mobileNumber: string): Promise<any>;
export declare function linkAccounts(finvuAccounts: any[], finvuFipDetails: any): Promise<any>;
export declare function confirmAccountLinking(referenceNumber: string, otp: string): Promise<any>;
export declare function approveConsentRequest(consentDetails: any, finvuLinkedAccounts: any[]): Promise<any>;
export declare function denyConsentRequest(consentRequestDetailInfo: any): Promise<any>;
export declare function addChangeListener(listener: (event: any) => void): EventSubscription;
export { default } from './FinvuModule';
export * from './Finvu.types';
//# sourceMappingURL=index.d.ts.map