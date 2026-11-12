# Dependency security risk assessment — Expo Router SDK 57

**Assessment date:** 2026-11-12  
**Review/exception expiration:** 2026-12-12 00:00 UTC (CI fails at expiration)  
**Status:** Unresolved, temporarily allowlisted for CI with explicit warning; **not** a formal security or production release approval  
**Risk owner:** Tempo frontend maintainer (owner approval required before production release)

## Verified dependency chain

The production dependencies recorded in `package-lock.json` are:

```text
expo-router@57.0.31 (direct dependency)
└── query-string@7.1.3
    └── decode-uri-component@0.2.2
```

An npm audit executed in GitHub Actions on 2026-11-12 reported **three high-severity vulnerable package entries** for this **single chain** (not three separate root causes). The decoder has two known advisories:

| Advisory | CVE | Impact | Patched decoder |
| --- | --- | --- | --- |
| [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | CVE-2026-45822 | Excessive CPU/time on malformed percent-encoded inputs | 0.5.0 |
| [GHSA-qr28-fpjm-wq7f](https://github.com/advisories/GHSA-qr28-fpjm-wq7f) | CVE-2026-118664 | Quadratic CPU/time on distinct encoded runs | 0.5.1 |

**0.5.0 is still affected by the second issue; a safe patched version is 0.5.1 or newer.** Both problems affect availability; the advisories do not identify data theft, integrity compromise, or arbitrary code execution.

## Tempo exposure and practical risk

- The vulnerable chain is within the **frontend Expo Router dependency tree**. This does not establish a vulnerability in Tempo's separate Express API/backend or its server-side input handling.
- Tempo handles web links and native deep links. Crafted, malformed, long query parameters could cause **client-side UI stalls** if they reach vulnerable parsing paths. The exact exploitability of the app's routing entry points has **not** been dynamically demonstrated or ruled out.
- On a statically exported web app, the known Node.js whole-server denial-of-service example is **not automatically applicable** to Tempo's backend. Reassess immediately if any request-time server-side rendering or server URL parser uses this dependency on untrusted requests.
- Default URL/header length restrictions can reduce the worst case on some servers, but are **not** a proven native/mobile defense. We are **not** claiming a deployed length limit or exploit prevention for all navigation entry points.
- **Impact:** Availability only; user experience could be disrupted. **Likelihood:** Uncertain but plausibly lower than an exposed unauthenticated Node HTTP parser given current client-side usage. **Provisional residual risk:** Medium for the frontend client, escalating to High if exposed to unbounded untrusted input in a shared server process. This is engineering judgment, not a vendor severity downgrade.

## Why a direct fix is not merged

- Expo Router 57.0.31 depends on `query-string@^7.1.3`, which pulls `decode-uri-component@^0.2.2` using CommonJS.
- The fixed decoder (`0.5.1`) is ESM-only; overriding only the decoder breaks this CommonJS consumer.
- `npm audit fix --force` proposes Expo Router **58.0.31**, a breaking change across the SDK 57/58 navigation boundary. Expo documents navigation and rendering migrations that require more extensive testing.
- Force-upgrading router or transitive dependencies without an integration migration creates a different risk: navigation failures and broken production builds.

## Temporary, tightly bounded CI control

`scripts/check-dependency-advisories.mjs` runs a live `npm audit --json` and **fails closed** unless all the following hold:

1. Exactly the three known affected package names are reported, with High severity and expected install locations.
2. The decoder lists exactly the two known GHSA advisory URLs and the parent entries describe precisely the existing chain.
3. The lockfile resolves exactly the three audited package versions, with no other installed copies.
4. npm audit supplies the expected vulnerability metadata and succeeds in returning a parseable report.
5. The current date is **before 2026-12-12 00:00 UTC**.

An allowed run emits a visible GitHub Actions **warning** stating that the advisories remain unresolved. This is a **provisional engineering exception to retain CI regression coverage**, not a blanket `continue-on-error` or approval to ship.

## Remediation and verification plan

1. Track a supported Expo SDK 58 / Router 58 migration, or an official compatible patched release from the vendor. Prefer a supported dependency graph instead of a hand-written decoder shim.
2. Verify the chosen router version no longer installs a vulnerable decoder: `npm ls expo-router query-string decode-uri-component` and `npm audit --audit-level=high`.
3. Re-run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npx expo install --check`, `npm run export:all`, and `npm run test:e2e`. Validate login, all tab stacks, deep links with malformed query strings, native routing, and app start/restart on release builds.
4. Once `npm audit` reports **zero high/critical advisories**, replace the temporary audit guard with a strict `npm audit --audit-level=high` check and delete this exception.
5. Reassess before **2026-12-12 UTC**. CI intentionally fails once the deadline is reached, and fails immediately if any new vulnerability, version, advisory, or scope appears.

**Decision needed:** The maintainer must explicitly approve any remaining risk before public production release. Passing the temporary CI check alone is insufficient to declare production readiness.
