
# Finvu Mobile SDK Integration Guide - React Native

## UX AA Sahamati Guidelines

While developing AA screens, please follow the UX AA guidelines by referring to the [Sahamati Guidelines](https://workdrive.zohopublic.in/external/sheet/e0c838a03871e6258f44ff5b62042f2b89817a37c027e035c01e7d5ed9ce338f)

## Code Guidelines

### 1. Avoid Third-Party Imports

In the AA journey screens, ensure that only AA flow-related code is present. No third-party API requests unrelated to the AA journey.

### 2. Do Not Store Data in Device Local Storage

Avoid storing data in local storage mechanisms like AsyncStorage or local databases.

### 3. Clean Data and Instances

Ensure all data is cleaned up when the AA journey ends, including closing states and clearing objects.

### 4. Avoid Redundant Calls

Minimize repeated calls to SDK methods to optimize performance and reduce unnecessary network requests.

### 5. Logout and Disconnect

Always call `logout()` and `disconnect()` when the user exits the AA journey, regardless of the outcome.

## Latest SDK Version

- React Native SDK: v2.1.0 (`@io.github.cookiejar-technologies/finvu-react-native-sdk` on npm)
- Android SDK: 2.1.0 · iOS FinvuSDK: 2.1.0

## Prerequisites

- Minimum Android SDK version: 25

- Minimum iOS version: 16

- React Native version: Compatible with latest version

## Installation

1. Install the SDK:

```bash
npm install @io.github.cookiejar-technologies/finvu-react-native-sdk
```

2. Android Configuration (Project-level `build.gradle`) in react native mobile app android folder:

```gradle
    allprojects {
        repositories {
            google()
            mavenCentral()
                    maven {
                    url 'https://maven.pkg.github.com/Cookiejar-technologies/finvu_android_sdk'
                    credentials {
                        username = System.getenv("GITHUB_PACKAGE_USERNAME")
                        password = System.getenv("GITHUB_PACKAGE_TOKEN")
                    }
            }
        }
    }
```

3. Android Configuration (App-level `build.gradle`) in react native mobile app android folder:

```gradle
    android {
        defaultConfig {
            minSdkVersion 25
        }
    }
```

4. ios configuration , add the following in your react native mobile app ios folders/podfile.

```
# Set minimum iOS version
platform :ios, '16.0'

# Add Finvu SDK dependency
pod 'FinvuSDK', :git => 'https://github.com/Cookiejar-technologies/finvu_ios_sdk.git', :tag => '2.1.0'
```

5. Build & Run React Native app:

```
npm install
npm run android
```

6. You can check a demo app on how to integrate finvu-react-native-sdk here.

```
https://github.com/Cookiejar-technologies/finvu-react-native-demo-app
```
## SDK Initialization and Connection Management

```typescript
    import * as  Finvu  from  '@io.github.cookiejar-technologies/finvu-react-native-sdk';

    // Initialize SDK
    const  config  = {
        finvuEndpoint:  "wss://wsslive.finvu.in/consentapi",
        certificatePins:  [
        "TmZriS3UEzT3t5s8SJATgFdUH/llYL8vieP2wOuBAB8=",
        "aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/="
        ]  // optional
    };

    // Initialize
    const  initResult  =  await  Finvu.initializeWith(config);

    // Connect to service
    const  connectResult  =  await  Finvu.connect();
```

## MFA Login (recommended)

The step-based MFA login replaces `loginWithUsernameOrMobileNumber` + `verifyLoginOtp`. The backend decides the factors (OTP, SNA, PIN, device binding); your app renders whatever step comes back until it gets a `complete` step. Calls never reject: failures arrive as a `complete` step with `result.status === 'failed'`.

### Setup for SNA and device binding

- Pass `finvuAuthSNAConfig` to `initializeWith` (`{ environment: FinvuEnviornment.PRODUCTION }` or `UAT`). Without it, login still works but SNA falls back to OTP and device binding is skipped.
- Android: on `<application>` in `AndroidManifest.xml` add `android:networkSecurityConfig="@xml/finvu_silent_network_authentication_network_security_config"` (the file ships in the SDK).
- iOS: in `Info.plist` add `NSFaceIDUsageDescription`, and `NSAppTransportSecurity` exceptions (allow insecure HTTP loads, include subdomains) for `80.in.safr.sekuramobile.com`, `api-csp.airtel.in`, `in-vil.ipification.com` and `partnerapi.jio.com`.

### Code

```typescript
import * as Finvu from '@io.github.cookiejar-technologies/finvu-react-native-sdk';
import { mfaClient, FinvuEnviornment } from '@io.github.cookiejar-technologies/finvu-react-native-sdk';
import type { MfaStep } from '@io.github.cookiejar-technologies/finvu-react-native-sdk';

// 1. Initialise (once) and connect
await Finvu.initializeWith({
  finvuEndpoint: 'wss://webvwlive.finvu.in/consentapiv2',
  finvuAuthSNAConfig: { environment: FinvuEnviornment.PRODUCTION },
});
const connected = await Finvu.connect();
if (!connected.isSuccess) { /* show error */ }

// 2. Start the login
let step: MfaStep = await mfaClient.login({ mobileNumber: '9876543210', consentHandle });

// 3. Render each step; every action returns the next step
async function render(step: MfaStep) {
  switch (step.action) {
    case 'input':
      // Input screen. Title from step.factor / step.requirement / step.purpose:
      //  otp                                   -> "Enter the OTP sent to your mobile"
      //  pin + 'enrollment'                    -> "Create a PIN"
      //  pin + 'verification'                  -> "Enter your PIN"
      //  purpose 'pinRecovery' (forgot PIN):
      //    questionLinkedAccount               -> "Last 4 digits of your account" (step.recovery.accounts)
      //    questionPan                         -> "Last 4 characters of your PAN"
      //    emailOtp / emailLink                -> "Enter the code we emailed" (step.recovery.emails, masked)
      //    pin + 'enrollment'                  -> "Set a new PIN" (step.inputSpec.pinLength digits)
      // Show step.validationError?.message (and attemptsRemaining) when present; if it has
      // support (e.g. noRecoveryOptions), show the contact details.
      // Submit:      render(await step.submit(value))       // linked accounts: submit([{ fipId, last4 }])
      // Resend:      if (step.resend)    render(await step.resend())     // OTP and email recovery
      // Forgot PIN:  if (step.forgotPin) render(await step.forgotPin())  // enter-PIN screen only
      // Recovery:    step.cancel / step.switchMethod(method) / step.selectEmail(emailHash) when set
      break;
    case 'silent':
      // SNA or device binding: show a loader; the SDK shows any biometric prompt itself
      render(await step.completion);
      break;
    case 'selectFactor':
      // One button per step.availableFactors entry
      // render(await step.selectFactor(chosenFactor))
      break;
    case 'complete':
      if (step.result.status === 'authenticated') {
        // Session is set: continue the consent journey
        const details = await Finvu.getConsentRequestDetails(consentHandle);
      } else {
        // Show step.result.error.message; offer "Start again" (call mfaClient.login again)
      }
      break;
  }
}
render(step);
```

## Authentication

### Login with Consent Handle (legacy OTP login)

```typescript
    const  loginResult  =  await  Finvu.loginWithUsernameOrMobileNumber(
        consentHandleId: "CONSENT_HANDLE_ID",
        username: "USER_HANDLE",
        mobileNumber: "MOBILE_NUMBER"
    );

    // Verify OTP
    const  verifyResult  =  await  Finvu.verifyLoginOtp(
        otp: "111111",
        otpReference: loginResult.data.reference
    );

    // Logout
    const  logoutResult  =  await  Finvu.logout();
```

## FIP Management

### Fetch FIP Options

```typescript
    const  fipsResult  =  await  Finvu.fipsAllFIPOptions();

    // Fetch specific FIP details
    const  fipDetailsResult  =  await  Finvu.fetchFipDetails("FIP_ID");
```

## Account Discovery

### Discover Accounts

```typescript
    const  discoveryResult  =  await  Finvu.discoverAccounts(

    fipId: "FIP_ID",

    fiTypes: ["DEPOSIT", "RECURRING_DEPOSIT"],
        identifiers: [
            {
                category:  "STRONG",
                type:  "MOBILE",
                value:  "930910XXXX"
            },

            {
                category:  "WEAK",
                type:  "PAN",
                value:  "DFKPGXXXXR"
            }
        ]
    );
```

### Identifier Examples

1. Banks require Mobile Number as a strong type.

```
    [

        TypeIdentifierInfo(
            category: "STRONG",
            type: "MOBILE",
            value: "930910XXXX"
        )

    ]
```

2. Investments require same as bank the mobile as first identifier and additional weak PAN as a second identifier.

```
    [
        TypeIdentifierInfo(
            category: "STRONG",
            type: "MOBILE",
            value: "930910XXXX"
        ),
        TypeIdentifierInfo(
            category: "WEAK",
            type: "PAN",
            value: "DFKPGXXXXR"
        )
    ]
```

3. Insurance require same as bank the mobile as first identifier and additional needs DOB as a second identifier.

```
[
    TypeIdentifierInfo(
        category: "STRONG",
        type: "MOBILE",
        value: "930910XXXX"
    ),
    TypeIdentifierInfo(
        category: "ANCILLARY",
        type: "DOB",
        value: "yyyy-MM-dd"
    )
]
```

## Account Linking

### Link Accounts

```typescript
    // Initiate account linking
    const  linkingResult  =  await  Finvu.linkAccounts(
        accounts: selectedAccounts,
        fipDetails: fipDetails
    );

    // Confirm linking with OTP
    const  confirmLinkingResult  =  await  Finvu.confirmAccountLinking(
        referenceNumber: linkingResult.data.referenceNumber,
        otp: "123456"
    );
    // Fetch linked accounts
    const  linkedAccountsResult  =  await  Finvu.fetchLinkedAccounts();
```

## Consent Management

### Manage Consent

```typescript
// Get consent details
const  consentDetailsResult  =  await  Finvu.getConsentRequestDetails(handleId);

// Approve consent
const  approveResult  =  await  Finvu.approveConsentRequest(
consentDetails: consentRequestDetailInfo,
linkedAccounts: selectedAccounts
);

OR

// Deny consent
const  denyResult  =  await  Finvu.denyConsentRequest(consentRequestDetailInfo);
```

## SDK Error Codes

| Code | Description |

|------|-------------|

| 1001 | AUTH_LOGIN_RETRY |

| 1002 | AUTH_LOGIN_FAILED |

| 8000 | SESSION_DISCONNECTED |

| 9999 | GENERIC_ERROR |

## Frequently Asked Questions

### GitHub Authentication

Set up GitHub Personal Access Token (PAT) with package read permissions:

```
GITHUB_PACKAGE_USERNAME=your_github_username
GITHUB_PACKAGE_TOKEN=your_github_pat
```

### Handling Errors

```typescript
    try {
        const  result  =  await  Finvu.someMethod();
        if (result.isSuccess) {
            // Process successful result
        } else {
            // Handle specific error
            console.error(result.error.code, result.error.message);
        }
    } catch (error) {
     // Handle unexpected errors
    }
```

## Support

For further assistance, contact Finvu support or refer to the detailed documentation.