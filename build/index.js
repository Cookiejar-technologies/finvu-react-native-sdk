// Reexport the native module. On web, it will be resolved to FinvuModule.web.ts
// and on native platforms to FinvuModule.ts
import { EventEmitter, NativeModulesProxy } from 'expo-modules-core';
import FinvuModule from './FinvuModule';
const emitter = new EventEmitter(FinvuModule.addListener ? FinvuModule : NativeModulesProxy.Finvu);
export async function initializeWith(config) {
    try {
        console.log('Initializing Finvu with config:', config);
        await FinvuModule.initializeWith(config);
        console.log('Finvu initialized successfully');
    }
    catch (e) {
        console.error('Initialization failed:', e);
    }
}
export async function connect() {
    try {
        console.log('Connecting...');
        const result = await FinvuModule.connect();
        console.log('Connected successfully:', result);
        return result;
    }
    catch (e) {
        console.error('Connection failed:', e);
        return undefined;
    }
}
export async function loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId) {
    try {
        console.log('Logging in...');
        const result = await FinvuModule.loginWithUsernameOrMobileNumber(username, mobileNumber, consentHandleId);
        console.log('Login success, reference:', result.reference);
        return result;
    }
    catch (e) {
        console.error('Login failed:', e);
        return undefined;
    }
}
export async function verifyLoginOtp(otp, otpReference) {
    try {
        console.log('Verifying OTP...');
        const result = await FinvuModule.verifyLoginOtp(otp, otpReference);
        console.log('OTP verified, userId:', result.userId);
        return result;
    }
    catch (e) {
        console.error('OTP verification failed:', e);
        return undefined;
    }
}
export async function fipsAllFIPOptions() {
    try {
        return await FinvuModule.fipsAllFIPOptions();
    }
    catch (e) {
        console.error('Fetching FIPs failed:', e);
        return undefined;
    }
}
export async function fetchLinkedAccounts() {
    try {
        return await FinvuModule.fetchLinkedAccounts();
    }
    catch (e) {
        console.error('Fetching linked accounts failed:', e);
        return undefined;
    }
}
export async function discoverAccounts(fipId, fiTypes, mobileNumber) {
    try {
        return await FinvuModule.discoverAccounts(fipId, fiTypes, mobileNumber);
    }
    catch (e) {
        console.error('Discovering accounts failed:', e);
        return undefined;
    }
}
export async function linkAccounts(finvuAccounts, finvuFipDetails) {
    try {
        return await FinvuModule.linkAccounts(finvuAccounts, finvuFipDetails);
    }
    catch (e) {
        console.error('Linking accounts failed:', e);
        return undefined;
    }
}
export async function confirmAccountLinking(referenceNumber, otp) {
    try {
        return await FinvuModule.confirmAccountLinking(referenceNumber, otp);
    }
    catch (e) {
        console.error('Confirming account linking failed:', e);
        return undefined;
    }
}
export async function approveConsentRequest(consentDetails, finvuLinkedAccounts) {
    try {
        return await FinvuModule.approveConsentRequest(consentDetails, finvuLinkedAccounts);
    }
    catch (e) {
        console.error('Approving consent failed:', e);
        return undefined;
    }
}
export async function denyConsentRequest(consentRequestDetailInfo) {
    try {
        return await FinvuModule.denyConsentRequest(consentRequestDetailInfo);
    }
    catch (e) {
        console.error('Denying consent failed:', e);
        return undefined;
    }
}
// Event listeners
export function addChangeListener(listener) {
    return emitter.addListener('onChange', listener);
}
export { default } from './FinvuModule';
export * from './Finvu.types';
//# sourceMappingURL=index.js.map