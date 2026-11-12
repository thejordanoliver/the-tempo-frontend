# Signed production build validation

## Prerequisites

Tempo's EAS project is linked in `app.json`, and the `production` profile
in `eas.json` uses the **production** EAS environment. The iOS identifier
is `com.jordanoliver.thetempo`; the Android package is
`com.jordanoliver.thetempo`.

- Do **not** send Apple credentials, provisioning profiles, keystores,
  `EXPO_TOKEN`, `SENTRY_AUTH_TOKEN`, or production API secrets to GitHub
  issues, chat, or the repository.
- In Expo's production environment, ensure `EXPO_PUBLIC_API_URL` is a
  reachable HTTPS backend URL (not `tempo-api.invalid` or `localhost`).
  Verify production Sentry settings if crash reporting is enabled.
- Confirm Apple Developer Program access and EAS-managed iOS distribution
  credentials. Ensure Android's EAS-managed keystore belongs to the package
  that will be distributed. Do not silently replace an existing app's
  signing identity.

## First-time credential setup (interactive, run on your Mac)

```bash
git switch backup-main
git pull --ff-only origin backup-main
npm ci
npx eas-cli@latest whoami
npx eas-cli@latest project:info
npx eas-cli@latest credentials:configure-build --platform android --profile production
npx eas-cli@latest credentials:configure-build --platform ios --profile production
```

Follow Expo's prompts to register or re-use the intended keystore,
Apple distribution certificate, and provisioning profile. iOS provisioning
may require Apple Developer Program authentication. Keep sensitive
credentials on EAS's secure infrastructure.

## Build both signed production artifacts (manual gate)

A release-candidate native build is intentional and may consume EAS build
credits. Only run this after the SDK 58 migration PR has passed CI and been
merged to protected `backup-main`.

```bash
git switch backup-main
git pull --ff-only origin backup-main
npm ci
npm audit --audit-level=high
npx expo install --check
npx eas-cli@latest workflow:run .eas/workflows/validate-production-builds.yml
```

The manual EAS workflow runs **production iOS and Android builds** without
auto-submitting them to App Store Connect or Google Play. Alternatively,
build using:

```bash
npx eas-cli@latest build --platform all --profile production --non-interactive --wait
npx eas-cli@latest build:list
```

Non-interactive builds require preconfigured app signing credentials.
If a credential is missing, use the interactive credential setup above.

## Release verification checklist

- [ ] EAS workflow finished successfully for **both** platforms
- [ ] iOS artifact is a production-signed `.ipa` and Android artifact is a
      signed `.aab` (or documented store-acceptable signed artifact)
- [ ] Correct bundle IDs, production API URL, and environment used
- [ ] No unsupported native modules or SDK 58 native build failures
- [ ] Device startup, login, token refresh, tab navigation, game views,
      live updates, deep links, and error handling tested on iOS
- [ ] Same workflows tested on an Android device
- [ ] Notifications, video, widgets and permissions validated as applicable
- [ ] A real Sentry native exception and associated source-map/stack-trace
      resolution verified for each platform if Sentry is enabled
- [ ] EAS build links/IDs, source commit SHA, devices and results recorded
- [ ] Explicit release approval recorded before store submission

A green GitHub `verify` check confirms source-level tests and JS exports,
**not** native signing, installation, runtime functionality or distribution.
