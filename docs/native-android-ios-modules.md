# Native modules: core, client, internal, SNA (Android & iOS)

This workspace **consumes** native Finvu SDKs; it does not contain their full source trees. Below is how those layers are referred to in integration docs and Gradle/Pod setup, and how they relate to React Native.

---

## Android (Maven / GitHub Packages)

Resolved from: `https://maven.pkg.github.com/Cookiejar-technologies/finvu_android_sdk`

In `finvu-react-native-sdk/android/build.gradle` you will see dependencies such as:

- `com.finvu.android:client-sdk-test` — **client**: high-level API used by apps (e.g. `FinvuManager`, flows matching `publicInterface`).
- `com.finvu.android:core-sdk-test` — **core**: shared runtime, networking/session, error codes, utilities used by the client.

**Internal** (conceptual): implementation packages inside those artifacts (not a separate public Maven coordinate in this RN repo). Treat them as **do not call directly** from app code; use the public Finvu Android API surfaced through `client`.

**SNA (Strong authentication adapter)**

- **`com.finvu.android:sna-adapter`** optional dependency for SIM / network-based auth flows.
- If **not** included, the SDK uses a **Noop** provider; `ClassNotFoundException` logs for `FinvuSnaAuthProviderImpl` can appear but are **handled** — see `CUSTOMER_RELEASE_BUILD_GUIDE.md` and `FIX_AUTH_PROVIDER_REGISTRY.md`.
- `FinvuAuthProviderRegistry` / `FinvuSnaAuthProvider` live in the **public auth interface** (`com.finvu.android.publicInterface.auth`); the **sna_adapter** artifact supplies a concrete implementation when present.

**React Native bridge:** `FinvuModule.kt` imports `com.finvu.android.FinvuManager`, `com.finvu.android.publicInterface.*`, `FinvuConfig`, optional `FinvuSNAAuthConfig` — so the bridge sits **above** client/core and forwards JS calls.

---

## iOS (CocoaPods)

- Pod: **`FinvuSDK`** from `https://github.com/Cookiejar-technologies/finvu_ios_sdk.git` (tagged releases).
- The React Native `Finvu.podspec` declares `s.dependency 'FinvuSDK'`; Swift bridge (`FinvuModule.swift`) imports `FinvuSDK` and maps errors (including **`SSL_PINNING_FAILURE_ERROR` → `8001`** in the Swift mapper).

**Parity:** iOS **core/client/internal** split is **inside** the `FinvuSDK` binary; integrators interact with the public Swift API exposed by that pod, same as Android’s “client” surface.

---

## Flutter SDK / Flutter app (not in this repo)

There is **no Flutter** project in this workspace. In a typical Finvu Flutter setup:

| Flutter side | Native side |
|--------------|----------------|
| Dart plugin / federated plugin | Android: same Maven coords (`client`, `core`, optional `sna-adapter`) |
| | iOS: same `FinvuSDK` pod |
| Platform channels | Mirror what `FinvuModule.kt` / `FinvuModule.swift` do |

**How to document Flutter in your org:** Copy the **Android** `build.gradle` + **iOS** Podfile patterns from this repo’s README and demo app; replace React Native bridge with **MethodChannel** (or Pigeon) equivalents.

---

## Versioning matrix (who bumps what)

| Component | Owner action |
|-----------|----------------|
| `core-sdk` / `client-sdk` Maven versions | Android native team; bump in RN `android/build.gradle` |
| `sna-adapter` | Optional; version in app `build.gradle` dependencies |
| `FinvuSDK` git tag | iOS native team; bump in app `Podfile` |
| RN wrapper `package.json` | Mobile platform team after native bumps are validated |

---

## Release URLs (native)

- Android packages repo: `Cookiejar-technologies/finvu_android_sdk` (GitHub Packages Maven)
- iOS SDK repo: `https://github.com/Cookiejar-technologies/finvu_ios_sdk`
- Auth: GitHub PAT with **`read:packages`** for Gradle; git HTTPS access for pod checkout
