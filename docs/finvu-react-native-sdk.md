# finvu-react-native-sdk

Path: `finvu-react-native-sdk/`

Expo module that wraps native **Finvu Android** and **Finvu iOS** SDKs and exposes a TypeScript API for Account Aggregator flows (connect, login, discover/link accounts, consent).

---

## 1) Purpose and why it exists

- **Purpose:** Let React Native / Expo apps integrate Finvu without reimplementing WebSocket sessions, OTP, FIP discovery, or consent APIs in JavaScript.
- **Why:** Single JS surface (`initializeWith`, `connect`, `loginWithUsernameOrMobileNumber`, …) with native performance and security (TLS pinning hooks, native SDK error codes, optional SNA auth config on Android).

---

## 2) Versioning

| Layer | Where | Notes |
|--------|--------|--------|
| **npm package** | `package.json` → `"version"` (e.g. `0.2.5`) | Source of truth for consumers; `Finvu.podspec` reads this for iOS pod version string. |
| **Published name** | `@cookiejar-technologies/finvu-react-native-sdk-test` in current `package.json` | Align `name` with org policy before customer-facing release. |
| **Android library `build.gradle`** | `version = '0.1.0'` / `versionName` | Should stay aligned with npm version to avoid confusion. |
| **Native Android deps** | `android/build.gradle` → `com.finvu.android:client-sdk-test`, `core-sdk-test` | Bump when native team releases new artifacts on GitHub Packages. |
| **iOS** | Demo `Podfile` pins `FinvuSDK` tag (e.g. `1.1.1`); podspec depends on `FinvuSDK` | Tag must match supported iOS native release. |

Semantic versioning: use `npm version patch|minor|major` before publish (see §5).

---

## 3) Setup and installation

### Clone and install

```bash
cd finvu-react-native-sdk
npm install
npm run build
```

### Android — GitHub Packages (Finvu Android artifacts)

Finvu’s Android SDKs are hosted on **GitHub Packages** under `Cookiejar-technologies/finvu_android_sdk`. Any **app** (or this module’s **example** app) that resolves Gradle dependencies must supply credentials.

**Recommended (CI and local):** environment variables (never commit tokens):

```bash
export GITHUB_PACKAGE_USERNAME=your_github_username
export GITHUB_PACKAGE_TOKEN=ghp_xxxxxxxx   # PAT: read:packages
```

**Gradle (consumer `android/build.gradle` `allprojects.repositories`):**

```gradle
maven {
    url 'https://maven.pkg.github.com/Cookiejar-technologies/finvu_android_sdk'
    credentials {
        username = System.getenv("GITHUB_PACKAGE_USERNAME") ?: ""
        password = System.getenv("GITHUB_PACKAGE_TOKEN") ?: ""
    }
}
```

### iOS — FinvuSDK from Git

`README.md` documents:

```ruby
pod 'FinvuSDK', :git => 'https://github.com/Cookiejar-technologies/finvu_ios_sdk.git', :tag => 'x.y.z'
```

Run `pod install` in the app `ios/` folder after changing the tag.

### npm / GitHub Packages registry (publishing the JS package)

- `.npmrc` in the SDK repo: `@cookiejar-technologies:registry=https://npm.pkg.github.com`
- Publish uses `publishConfig.registry` in `package.json` (`https://npm.pkg.github.com`).
- Login: `npm login --scope=@cookiejar-technologies --registry=https://npm.pkg.github.com` (PAT with `write:packages` for publish).

---

## 4) Architecture and folder structure

```
finvu-react-native-sdk/
├── src/                    # TypeScript public API
│   ├── index.ts            # Exports: Result<T>, all Finvu.* methods, event tracking
│   ├── FinvuModule.ts      # requireNativeModule('FinvuModule')
│   └── Finvu.types.ts      # Shared types
├── android/                # Expo Kotlin module
│   └── src/main/java/expo/modules/finvu/FinvuModule.kt
├── ios/
│   ├── FinvuModule.swift   # Bridge to FinvuSDK (Swift)
│   └── Finvu.podspec       # CocoaPods: ExpoModulesCore + FinvuSDK
├── example/                # Bundled Expo example app for SDK dev
├── build/                  # Compiled JS output (published)
├── package.json
├── expo-module.config.json # Registers FinvuModule on apple + android
└── README.md
```

### Data flow

1. **JS** calls `Finvu.initializeWith(config)` → **native** `FinvuModule.initializeWith`.
2. **Android:** `FinvuModule.kt` builds `FinvuClientConfig` (endpoint, optional `certificatePins`, optional `finvuAuthSNAConfig` → `FinvuSNAAuthClientConfig` with `Activity` + `FinvuEnvironment`) and passes to `FinvuManager.shared`.
3. **iOS:** `FinvuModule.swift` maps config into native `FinvuConfig` / client types from **FinvuSDK** pod.
4. Events (`onConnectionStatusChange`, `onLoginOtpReceived`, `onEvent`, …) are sent from native to JS via Expo `EventEmitter`.

### Relationship to native “submodules”

The React Native repo does **not** contain the Kotlin/Swift source of **core** / **client** / **internal** / **SNA**. Those ship as **Maven artifacts** (Android) and **FinvuSDK** (iOS). See [native-android-ios-modules.md](./native-android-ios-modules.md).

---

## 5) Release process

| Step | Action |
|------|--------|
| 1 | Merge changes; bump **native** dependency versions in `android/build.gradle` if needed. |
| 2 | Align **iOS** `FinvuSDK` tag in consumer Podfile / release notes. |
| 3 | `npm run build` (runs via `prepare` / expo-module). |
| 4 | Version: `npm version patch` (or minor/major). |
| 5 | **GitHub npm registry:** ensure logged in with token that can publish to `@cookiejar-technologies`. |
| 6 | `npm run publish:github` or `npm publish --registry=https://npm.pkg.github.com`. |

**URLs**

- React Native SDK repo: `https://github.com/Cookiejar-technologies/finvu-react-native-sdk`
- Android packages Maven: `https://maven.pkg.github.com/Cookiejar-technologies/finvu_android_sdk`
- npm GitHub Packages: `https://npm.pkg.github.com` (scope `@cookiejar-technologies`)
- iOS native: `https://github.com/Cookiejar-technologies/finvu_ios_sdk`

**Credentials**

| Action | Token / account |
|--------|------------------|
| Pull Android Maven deps | GitHub PAT: **`read:packages`** |
| Publish npm to GitHub | PAT: **`write:packages`** (and repo access as required by org) |
| Clone iOS SDK | Repo access; version by **git tag** in Podfile |

---

## 6) Newbie checklist: local dev, linking, package name

### Develop against the SDK locally (yarn/npm link or file path)

1. In `finvu-react-native-sdk`: `npm run build`.
2. In the demo app `package.json`, point to the local folder instead of the registry, for example:
   - `"@cookiejar-technologies/finvu-react-native-sdk-test": "file:../finvu-react-native-sdk"`
3. From demo app root: `npm install`, then `npx expo prebuild` if native folders need refresh, `pod install` in `ios/`.
4. Set `GITHUB_PACKAGE_USERNAME` and `GITHUB_PACKAGE_TOKEN` before any Android Gradle sync.

### Package name (`name` field)

- Publishing under GitHub Packages usually uses **`@org/package-name`**.
- Keep **`publishConfig.registry`** and **`.npmrc` scope** in sync with `package.json` `name`.
- After renaming, consumers must update **imports** if the published name changes (scoped vs unscoped).

### Testing

- Use `example/` inside the SDK repo for minimal reproduction.
- Use `finvu-react-native-demo-app` for full UI flows.
