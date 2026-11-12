# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Local backend on Wi-Fi

Keep your API configuration in the Git-ignored `.env` file. Run
`npm run start:local` to detect your computer's LAN IPv4 address and start Expo
with `EXPO_PUBLIC_API_URL=http://<address>:4000` for that session. The script
preserves `.env` and does not create additional environment files.

If your computer's LAN address changes, restart `npm run start:local` and
reconnect the app to Expo. Your phone and backend computer must be on the same
reachable network, with the backend listening on port 4000.

Expo options can be forwarded with `npm run start:local -- --ios` (or `--android`
or `--web`). To print the detected URL without starting Expo or changing files,
use `npm run start:local -- --update-only`. If detection is ambiguous or a VPN uses
the default route, select the LAN interface explicitly, for example
`TEMPO_LOCAL_INTERFACE=en0 npm run start:local` on macOS.

Use this command only for local development. To use your Render backend, set
`EXPO_PUBLIC_API_URL=https://your-backend.onrender.com` in `.env` and run
`npm run start:hosted`. This command uses the API URL from `.env` even when the
parent shell has a different URL set. Other environment settings still load
normally. Both commands accept Expo's cache
clear flag: `npm run start:local -- -c` or `npm run start:hosted -- -c`.
Stop the running Expo server before switching modes. These commands select the
backend for development sessions; production builds need their own API configuration.

## Release checks

Tempo is upgrading from Expo SDK 57 to **SDK 58** (React Native 0.88).
Use Node 22 and install the committed lockfile with `npm ci`. Copy
`.env.example` to a local `.env`; set `EXPO_PUBLIC_API_URL` to the API for
your intended environment. The repo's `.npmrc` scopes a temporary npm peer
resolution workaround to the Windows-only peer of the SDK 58 date picker;
never override or ignore npm audit failures.

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm audit --audit-level=high
npx expo install --check
npm run export:all
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs these checks on pull requests and pushes to
`main`, `master`, and `backup-main`. The required `verify` status check
protects `backup-main`. The browser tests exercise sign-in validation,
tab navigation, password recovery, and volleyball league routes without
restoring removed volleyball team screens. Set `TEMPO_WEB_DIR` if testing a
different web export directory.

**Dependency vulnerability remediation:** The old
`expo-router@57 -> query-string@7 -> decode-uri-component@0.2.2` chain
was removed by the SDK 58 migration. The temporary audit exception has
been deleted, and CI now fails on **all high/critical advisories**.
See [security remediation details](docs/security/dependency-advisories.md).
A clean audit is not evidence that native release builds work.

**Signed production build validation is a separate mandatory gate.**
See [iOS/Android release build instructions](docs/release/production-build-validation.md)
and the manual `.eas/workflows/validate-production-builds.yml` workflow.
The production profile uses real EAS production environment variables,
Apple provisioning and distribution signing, and an Android signing key.
Do not deploy or submit until both builds finish and pass on-device checks.

## Optional crash reporting

Tempo uses the `tempo-frontend` React Native project in the `the-tempo` Sentry
organization. The project DSN, organization, project slug, and `production`
environment are configured in EAS production; `SENTRY_AUTH_TOKEN` is stored there
with secret visibility for native build artifact uploads. Local settings live in the ignored
`.env`. The initial release-web verification event is
[TEMPO-FRONTEND-1](https://the-tempo.sentry.io/issues/7839900601/), tagged
`setup-verification`; its temporary trigger has been removed.
After uploading that build's source maps, a fresh event,
[TEMPO-FRONTEND-2](https://the-tempo.sentry.io/issues/7839922905/), resolved to
`app/_layout.tsx` with readable source context. Native crash reporting and native
artifact uploads still need validation in the next signed device release build.

Sentry reporting is disabled unless a valid HTTPS `EXPO_PUBLIC_SENTRY_DSN` is set
in a release build. Development sessions do not send reports. Rebuild the app
after changing Expo public environment variables.
Use `EXPO_PUBLIC_SENTRY_ENVIRONMENT=preview` for preview release builds; the
default is `production`. Native release identifiers come from the installed app's
version/build, and Expo web uses the app configuration's name and version.

For readable release stack traces, set `SENTRY_ORG`, `SENTRY_PROJECT`, and
`SENTRY_AUTH_TOKEN` in the build service's secret environment. Never prefix the
auth token with `EXPO_PUBLIC_` or commit it. Source-map upload is disabled until
all three are supplied; the DSN is public routing configuration, not that token.
See [Expo's Sentry guide](https://docs.expo.dev/guides/using-sentry/).

The JavaScript event filter retains exception types and stack locations while
removing arbitrary error messages, account data, requests, and breadcrumbs.
Session replay, tracing, logs, and automatic session/breadcrumb tracking are
disabled. Native crash reports also require reviewing the Sentry project's data
scrubbing settings; JavaScript `beforeSend` does not filter native crash events.
Verify a controlled crash in a dedicated release test build and confirm readable
stack traces before relying on reporting in production.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
