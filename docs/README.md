# Finvu documentation index

This folder contains module-by-module guides for the workspace at  
`/Users/pranad/Documents/Projects/finvu-react-native-demo-app-and-react-native-sdk/`.

| Document | Scope |
|----------|--------|
| [finvu-react-native-sdk.md](./finvu-react-native-sdk.md) | React Native / Expo module (`finvu-react-native-sdk/`) |
| [finvu-react-native-demo-app.md](./finvu-react-native-demo-app.md) | Demo app (`finvu-react-native-demo-app/`) |
| [native-android-ios-modules.md](./native-android-ios-modules.md) | Native Finvu artifacts: **core**, **client**, **internal**, **SNA** (Android/iOS); Flutter mapping |
| [flutter-platform.md](./flutter-platform.md) | Flutter app/SDK: not present in this repo; parity notes and security |
| [workspace-root.md](./workspace-root.md) | Root-level files (`CUSTOMER_RELEASE_BUILD_GUIDE.md`, event tracking, etc.) |
| [finvu-react-native-sdk-example.md](./finvu-react-native-sdk-example.md) | SDK bundled `example/` app |
| [finvu-react-native-demo-app-features-account-linking.md](./finvu-react-native-demo-app-features-account-linking.md) | Demo app: account linking feature folder |

**Note:** There is **no Flutter** project in this workspace. The Flutter section is written so the same native packaging and security story applies when you work in the Flutter repos.

## Security: leaked credentials

If a GitHub PAT was ever committed to Gradle or other files, **revoke and rotate** it in GitHub → Settings → Developer settings → Personal access tokens, then use only `GITHUB_PACKAGE_USERNAME` / `GITHUB_PACKAGE_TOKEN` in environment or CI secrets.
