# finvu-react-native-demo-app

Path: `finvu-react-native-demo-app/`

Expo (dev client) app demonstrating **login → dashboard → account discovery/linking → consent** using the published Finvu React Native package.

---

## 1) Purpose and why it exists

- **Purpose:** Reference integration for integrators: wiring, UX patterns, and sequential AA flows.
- **Why:** Validates the SDK against a real app (navigation, context, dialogs, OTP entry) and documents GitHub Packages + CocoaPods setup for Android and iOS.

---

## 2) Versioning

| Item | Location |
|------|-----------|
| App semver | `package.json` → `"version"` (e.g. `1.0.0`) |
| Finvu RN SDK | `package.json` → `@cookiejar-technologies/finvu-react-native-sdk-test` version range |
| iOS FinvuSDK | `ios/Podfile` → `pod 'FinvuSDK', … :tag => 'x.y.z'` |
| Android native SDKs | Transitive via RN SDK / Gradle (resolved from GitHub Packages) |

This app is typically **private** and not published to npm; version is for release tagging / internal tracking.

---

## 3) Setup and installation

### Prerequisites

- Node 18+ (match Expo 53 / RN 0.79 expectations)
- Xcode + CocoaPods (iOS)
- Android Studio + JDK (Android)
- GitHub account with **`read:packages`** for `Cookiejar-technologies/finvu_android_sdk`

### Steps

```bash
cd finvu-react-native-demo-app
npm install
```

**Android — credentials for Maven**

Set before opening Gradle or running `expo run:android`:

```bash
export GITHUB_PACKAGE_USERNAME=your_github_username
export GITHUB_PACKAGE_TOKEN=your_personal_access_token
```

Project-level `android/build.gradle` uses these env vars for:

`https://maven.pkg.github.com/Cookiejar-technologies/finvu_android_sdk`

**iOS**

```bash
cd ios && pod install && cd ..
```

`Podfile` pulls **FinvuSDK** from `https://github.com/Cookiejar-technologies/finvu_ios_sdk.git` at a fixed **tag**.

**Run**

```bash
npx expo start --dev-client
npm run android   # or npm run ios
```

### Demo-specific values

`src/context/FinvuContext.tsx` holds **sample** `mobileNumber`, `userHandle`, `consentHandleId`. Replace with your test environment values (see README in the demo app folder).

---

## 4) Architecture and folder structure

```
finvu-react-native-demo-app/
├── App.tsx                 # Root
├── Home.tsx                # Main screens / navigation hub (large file)
├── index.ts
├── src/
│   ├── context/
│   │   └── FinvuContext.tsx    # Shared demo user + consent handle state
│   ├── Features/
│   │   └── accountLinking/     # Discover → link → OTP dialogs
│   │       ├── components/     # OtpInputDialog, PanInputDialog, DobInputDialog
│   │       └── views/          # DiscoverAccountsPage, DiscoveredAccountsPage, LinkedAccountPage
│   ├── components/             # FinvuDialog, EventsDisplay
│   ├── constants/routes.ts
│   ├── types/
│   ├── utils/accountLinkingUtils.ts
│   └── styles/sharedStyles.ts
├── android/
├── ios/
├── app.json
└── package.json
```

### How features are built

| Area | Role |
|------|------|
| **FinvuContext** | Global demo state (handles, login flags). Production apps should source IDs from backend, not hardcode. |
| **Home.tsx** | Orchestrates SDK calls (`Finvu.connect`, login, FIP list, consent) and navigation. |
| **Features/accountLinking** | Isolated UI for discovery/linking and OTP/PAN/DOB inputs per FIP rules. |
| **EventsDisplay** | Optional UI for SDK event stream when debugging. |

### Security-related behavior (app + SDK)

- **TLS:** Configure `certificatePins` in `initializeWith` when using production endpoints (see SDK README).
- **Storage:** SDK README advises **not** persisting AA data in AsyncStorage; this demo should not add persistent secret storage for production guidance.
- **Release builds:** See root `CUSTOMER_RELEASE_BUILD_GUIDE.md` and [workspace-root.md](./workspace-root.md) for ProGuard and optional SNA adapter.

---

## 5) Release process (internal / customer handoff)

This repo is usually distributed as **source** (Git clone) or **internal build artifacts**, not npm.

| Artifact | Command / output |
|----------|------------------|
| Android release APK/AAB | `cd android && ./gradlew assembleRelease` (or Expo variant flags) |
| iOS | Archive in Xcode after `pod install` |

**Credentials**

- Same **GitHub PAT** (`read:packages`) for Gradle on build machines.
- Apple signing: team certificates / provisioning profiles (standard iOS release).
- No npm publish unless you explicitly publish the app (uncommon).

---

## 6) Newbie checklist

1. **Never commit** GitHub PATs; use `GITHUB_PACKAGE_USERNAME` / `GITHUB_PACKAGE_TOKEN`.
2. Install pods after any native dependency change.
3. Match **FinvuSDK** tag in `Podfile` to the version your team supports.
4. Update **`package.json`** SDK dependency to the published version you want to test.
5. For local SDK development, use `file:../finvu-react-native-sdk` (see [finvu-react-native-sdk.md](./finvu-react-native-sdk.md) §6).
