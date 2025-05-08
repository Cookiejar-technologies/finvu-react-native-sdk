// Reexport the native module. On web, it will be resolved to FinvuModule.web.ts
// and on native platforms to FinvuModule.ts
import { EventEmitter, NativeModulesProxy, EventSubscription } from 'expo-modules-core';
import FinvuModule from './FinvuModule';
import type { ConsentDetail, DiscoverAccountsResponse, DiscoveredAccount, FinvuConfig, FipDetails, LinkedAccountDetails } from './Finvu.types';

// Define the event types for the EventEmitter
type FinvuEvents = {
  onChange: any; // Replace `any` with the actual type of the event payload if known
};

const emitter = new EventEmitter<FinvuEvents>(FinvuModule ?? NativeModulesProxy.Finvu);

export async function initializeWith(config: FinvuConfig) {
  try {
    console.log('Result inside before calling initializeWith');
    await FinvuModule.initializeWith(config);
    console.log('Initialized successfully');
  } catch (e) {
    console.error(e);
    throw parseFinvuError(e);
  }
}

export async function connect() {
  try {
    console.log('Result inside before calling connect');
    const result = await FinvuModule.connect();
    console.log('Result inside: ' + result);
    return result;
  } catch (e) {
    console.error(e);
    throw parseFinvuError(e);
  }
}

export async function loginWithUsernameOrMobileNumber(username: string, mobileNumber: string, consentHandleId: string) {
  try {
    console.log('Calling login');
    const result = await FinvuModule.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId);
    console.log('Logged Request: ' + result.reference);
    return result;
  } catch (e) {
    console.error(e);
    throw parseFinvuError(e);
  }
}

export async function verifyLoginOtp(otp: string, otpReference: string) {
  try {
    console.log('Calling verify');
    const result = await FinvuModule.verifyLoginOtp(otp, otpReference);
    console.log('Logged In with userId : ' + result.userId);
    return result;
  } catch (e) {
    console.error(e);
    throw parseFinvuError(e);
  }
}

export async function discoverAccounts(
  fipId: string,
  fiTypes: string[],
  identifiers: { category: string; type: string; value: string }[]
): Promise<DiscoverAccountsResponse> {
  try {
    const result = await FinvuModule.discoverAccounts(fipId, fiTypes, identifiers);
    const parsed: DiscoverAccountsResponse = JSON.parse(result);
    return parsed;
  } catch (e) {
    console.error('Discovering accounts failed:', e);
    throw parseFinvuError(e);
  }
}


export async function fipsAllFIPOptions() {
  try {
    return await FinvuModule.fipsAllFIPOptions();
  } catch (e) {
    console.error('Fetching FIPs failed:', e);
    throw parseFinvuError(e);
  }
}

export async function fetchLinkedAccounts() {
  try {
    return await FinvuModule.fetchLinkedAccounts();
  } catch (e) {
    console.error('Fetching linked accounts failed:', e);
    throw parseFinvuError(e);
  }
}

export async function linkAccounts(
  accounts: DiscoveredAccount[],
  fipDetails: FipDetails
) {
  try {

    const jsonAccounts = JSON.parse(JSON.stringify(accounts));
    const jsonFipDetails = JSON.parse(JSON.stringify(fipDetails));

    return await FinvuModule.linkAccounts(jsonAccounts, jsonFipDetails);
  } catch (e) {
    console.error('Linking accounts failed:', e);
    throw parseFinvuError(e);
  }
}

export async function confirmAccountLinking(referenceNumber: string, otp: string) {
  try {
    return await FinvuModule.confirmAccountLinking(referenceNumber, otp);
  } catch (e) {
    console.error('Confirming account linking failed:', e);
    throw parseFinvuError(e);
  }
}

export async function approveConsentRequest(
  consentDetails: ConsentDetail, 
  finvuLinkedAccounts: LinkedAccountDetails[]
) {
  try {
    const jsonConsentDetails = JSON.parse(JSON.stringify(consentDetails));
    const jsonFinvuLinkedAccounts = JSON.parse(JSON.stringify(finvuLinkedAccounts));

    return await FinvuModule.approveConsentRequest(jsonConsentDetails, jsonFinvuLinkedAccounts);
  } catch (e) {
    console.error('Approving consent failed:', e);
    throw parseFinvuError(e);
  }
}

export async function denyConsentRequest(consentRequestDetailInfo: ConsentDetail) {
  try {
    const jsonConsentRequestDetailInfo = JSON.parse(JSON.stringify(consentRequestDetailInfo));

    return await FinvuModule.denyConsentRequest(jsonConsentRequestDetailInfo);
  } catch (e) {
    console.error('Denying consent failed:', e);
    throw parseFinvuError(e);
  }
}

export async function fetchFipDetails(fipId: string): Promise<FipDetails> {
  try {
    const result = await FinvuModule.fetchFipDetails(fipId);
    const parsed: FipDetails = JSON.parse(result);
    return parsed;
  } catch (e) {
    console.error('Fetching FIP details failed:', e);
    throw parseFinvuError(e);
  }
}

export async function getEntityInfo(entityId: string, entityType: string) {
  try {
    return await FinvuModule.getEntityInfo(entityId, entityType);
  } catch (e) {
    console.error('Getting entity info failed:', e);
    throw parseFinvuError(e);
  }
}

export async function getConsentRequestDetails(consentHandleId: string) {
  try {
    return await FinvuModule.getConsentRequestDetails(consentHandleId);
  } catch (e) {
    console.error('Fetching consent request details failed:', e);
    throw parseFinvuError(e);
  }
}

export async function logout() {
  try {
    return await FinvuModule.logout();
  } catch (e) {
    console.error('Logout failed:', e);
    throw parseFinvuError(e);
  }
}

function parseFinvuError(error: any): any {
  if (!error?.message) return error;

  try {
    return JSON.parse(error.message);
  } catch (_) {
    return { message: error.message };
  }
}


export function addChangeListener(listener: (event: any) => void): EventSubscription {
  return emitter.addListener('onChange', listener);
}

export { default } from './FinvuModule';
export * from './Finvu.types';
