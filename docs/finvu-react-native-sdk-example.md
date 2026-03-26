# finvu-react-native-sdk / `example/`

Bundled **Expo dev client** app used to develop and smoke-test the RN module without the separate demo repo.

---

## 1) Purpose

Validate `FinvuModule` on device/emulator while changing `src/` or `android/` / `ios/` bridge code.

---

## 2) Versioning

Tracks the **parent** `finvu-react-native-sdk` version; not published separately.

---

## 3) Setup

```bash
cd finvu-react-native-sdk/example
npm install
```

Configure **Android** Maven credentials (same as main SDK / demo): `GITHUB_PACKAGE_USERNAME`, `GITHUB_PACKAGE_TOKEN`.

**iOS:** `pod install` under `example/ios/` if native deps change.

---

## 4) Structure

- `App.tsx` — minimal integration surface.
- `android/`, `ios/` — prebuild outputs for the example app name (`finvuexample`).

---

## 5) Release

Not released; maintainers may run `expo run:android` / `expo run:ios` for QA.

---

## 6) Relation to `finvu-react-native-demo-app`

| example/ | demo app |
|----------|----------|
| Lightweight, lives in SDK repo | Full UX flows, separate git repo |
| Best for SDK PR validation | Best for customer reference |
