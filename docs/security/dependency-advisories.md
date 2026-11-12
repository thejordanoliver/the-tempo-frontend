# Resolved: Expo Router decoder denial-of-service advisories

**Original assessment:** 2026-11-12\
**Remediation branch:** `security/expo58-release-readiness`\
**Status:** Dependency remediation implemented; PR CI and signed native release validation required before release

## Original findings

The Expo SDK 57 lockfile contained:

```text
expo-router@57.0.31
└── query-string@7.1.3
    └── decode-uri-component@0.2.2
```

This generated three high-severity **package findings** for one affected
dependency chain. The underlying decoder was affected by:

- [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)
  (exponential decoding, fixed in `0.5.0`)
- [GHSA-qr28-fpjm-wq7f](https://github.com/advisories/GHSA-qr28-fpjm-wq7f)
  (quadratic-time decoding, fixed in `0.5.1`)

These are availability/denial-of-service risks from untrusted malformed URLs;
there is no basis for claiming account compromise or data theft.

## Remediation

Tempo upgraded through the supported **Expo SDK 58** dependency map:
`expo-router@~58.0.31`, `react-native@0.88.1`,
`react@19.3.0`, and matching Expo modules, including Sentry 8.28.
The new lockfile contains **neither** `query-string` nor
`decode-uri-component`; the bootstrap job's `npm audit --audit-level=high`
reported **0 vulnerabilities**.

The old expiring exception in `scripts/check-dependency-advisories.mjs`,
its tests, and the temporary migration workflow have been removed. CI now
runs `npm audit --audit-level=high` directly, with no
`continue-on-error`.

### npm peer resolution note

The SDK 58-supported `@react-native-community/datetimepicker@9.2.1` has
an optional `react-native-windows` peer. npm attempts to select Windows
0.85, which has an incompatible React Native 0.85 peer against Tempo's
React Native 0.88. Tempo builds iOS, Android, and Web; it does not import
Windows runtime components. The project-level `.npmrc` currently sets
`legacy-peer-deps=true` so installs remain reproducible without bringing
an incompatible Windows runtime into the dependency tree. **This option
does not validate peer dependency compatibility**; the lockfile, Expo
compatibility check, native build tests, and review of changed dependencies
remain essential. Remove this option once the optional peer metadata is
compatible with React Native 0.88.

### Sentry config note

Expo CLI's upgrade initially attempted to auto-add
`@sentry/react-native` to `app.config.ts` after installing the packages.
Tempo already includes the equivalent `@sentry/react-native/expo` config
plugin conditionally, when the DSN and build-time auth/organization variables
are configured. A dynamic app config cannot be edited automatically by the
Expo CLI; that CLI message did not indicate an unsuccessful package install.

## Remaining release gates

1. Review and merge PR only after `verify` passes: install, lint, typecheck,
   unit and browser tests, strict audit, compatibility checks, and
   iOS/Android/Web production exports.
2. Test routing and deep linking on iOS 27 and Android release builds.
3. Produce real **signed production IPA and AAB** using the existing EAS
   project and production environment. Confirm both build records finished,
   signing credentials worked, and the corresponding artifact type is correct.
4. Test signed distribution builds for startup, login, game views, navigation,
   refresh/favorites, video and notification permissions, widgets, API connectivity,
   and crash reporting/source maps before public production release.

**A passing JS export is not a signed production build.** No claims about
actual iOS/Android signing or App Store/Play Store distribution should be
made until those EAS build records and device checks exist.
