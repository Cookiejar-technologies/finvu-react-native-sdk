# Workspace root (files outside `finvu-react-native-sdk/` and `finvu-react-native-demo-app/`)

Path: repository root (sibling to the two main folders).

---

## 1) Purpose

Miscellaneous **release guides**, **event tracking** notes, and archives that apply to **customers** or **cross-cutting** concerns.

---

## 2) Versioning

| Item | Notes |
|------|--------|
| Root markdown files | Not versioned as a package; track with git tags on the repo. |
| `finvu-react-native-sdk-source.zip` | Snapshot; replace with clear naming + version if distributed. |

---

## 3) Setup

No install at root. Use per-project docs:

- [finvu-react-native-sdk.md](./finvu-react-native-sdk.md)
- [finvu-react-native-demo-app.md](./finvu-react-native-demo-app.md)

---

## 4) Files and what they mean

| File | Purpose |
|------|---------|
| **CUSTOMER_RELEASE_BUILD_GUIDE.md** | Release APK: ProGuard rules, optional `sna-adapter`, harmless `ClassNotFoundException` when SNA not bundled, `adb` testing. |
| **FIX_AUTH_PROVIDER_REGISTRY.md** | Deep fix for **Android auth provider registry** / ServiceLoader / reflection when SNA adapter missing — intended for **core SDK** maintainers. |
| **event-tracking-react-native.md** | Event tracking API (mentions cross-platform including Flutter). |
| **event-tracking.md** | Empty placeholder — replace or remove. |
| **example.txt** | Empty — ignore or delete. |

---

## 5) Release process

- **Customer docs:** Ship `CUSTOMER_RELEASE_BUILD_GUIDE.md` with SDK releases or Confluence.
- **SDK zip:** If `finvu-react-native-sdk-source.zip` is shared, document checksum + version inside the zip README.

---

## 6) Credentials

None at workspace root. All secrets belong in **GitHub PAT** (Android), **npm publish token**, **Apple** signing — see SDK and demo docs.
