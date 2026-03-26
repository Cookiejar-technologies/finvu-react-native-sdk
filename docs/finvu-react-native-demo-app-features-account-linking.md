# Demo app feature: Account linking (`src/Features/accountLinking/`)

Part of `finvu-react-native-demo-app`.

---

## 1) Purpose

Demonstrate **FIP selection → discover accounts → select accounts → OTP (and PAN/DOB where required) → linked accounts**, using `Finvu.discoverAccounts`, `Finvu.linkAccounts`, `Finvu.confirmAccountLinking`, `Finvu.fetchLinkedAccounts`.

---

## 2) Versioning

No separate version; ships with the demo app.

---

## 3) Setup

Same as [finvu-react-native-demo-app.md](./finvu-react-native-demo-app.md). No extra credentials beyond SDK.

---

## 4) Folder structure and logic

| Path | Role |
|------|------|
| `views/DiscoverAccountsPage.tsx` | User picks FIP and enters identifiers (mobile, optional PAN/DOB). |
| `views/DiscoveredAccountsPage.tsx` | Lists discovered accounts; multi-select for linking. |
| `views/LinkedAccountPage.tsx` | Shows linked accounts post-success. |
| `components/OtpInputDialog.tsx` | OTP for linking confirmation. |
| `components/PanInputDialog.tsx` / `DobInputDialog.tsx` | Weak/ancillary identifiers per FIP type. |
| `../../utils/accountLinkingUtils.ts` | Shared helpers for mapping SDK responses. |

**Why it exists:** Keeps discovery/linking UI separate from `Home.tsx` and reusable for navigation-based flows.

---

## 5) Release

Ships with the demo APK/IPA; no independent release.

---

## 6) Changing behavior

1. Adjust identifier rules in discover calls to match **FIP** documentation (mobile strong, PAN weak, etc.).
2. Ensure OTP reference from `linkAccounts` is passed to `confirmAccountLinking`.
3. After flow end, call `Finvu.logout` / `Finvu.disconnect` per SDK guidelines.
