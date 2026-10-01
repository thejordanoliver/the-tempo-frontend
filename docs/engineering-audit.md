# Engineering audit — 2026-10-01

This pass reviewed the shared frontend HTTP/session lifecycle and backend authentication and follow mutation boundaries. It is not an exhaustive security audit or performance benchmark.

## Applied principles

- Distinguish authentication failures from authorization denials. Refresh credentials only for authentication failures; backend invalid-token responses now expose an explicit machine-readable code while preserving the existing status/message.
- Settle every queued request on refresh failure, including missing credentials. Mark each replay once to prevent refresh loops.
- Preserve a replacement session when an older refresh request fails, as well as when it succeeds.
- Bound refresh network requests to 15 seconds and validate token pairs before persisting them.
- Remove inherited Authorization headers when no session exists.
- Attempt secure-token and legacy-token cleanup even if another storage cleanup fails.
- Validate signed user IDs before database queries and permit only the JWT algorithm used by this application.
- Validate follow IDs without permissive JavaScript coercion. Return a retryable 503 when acquiring a follow transaction connection fails; release acquired clients and roll back only active transactions.

These changes preserve the shared API client, backend-owned sports data, secure native credential storage, and transaction-before-notification ordering.

## Verification

Frontend lint and TypeScript checks pass. The frontend test baseline had one stale storage assertion; it now checks delegation to secure storage. Four new behavioral tests exercise the actual HTTP interceptors with injected platform dependencies.

Backend TypeScript checks pass. The full backend baseline had 8 failing suites and 16 failing tests (532 passing tests). After this change, the same suites and tests fail, with 548 passing tests. Sixteen new regressions verify malformed authentication claims, unsafe/coerced follow IDs, and connection acquisition failures.

## Remaining verified work

The backend baseline failures require separate investigation:
- standingsRoute: CFB rankings response mapping
- gameNotificationService: poll rejection handling expectations
- teamScheduleScoreFallbacks, basketballScheduleService, basketball/marchMadnessRoute: suites failing to initialize
- seasonLeaders: database player enrichment/fallback contracts
- rosterPresentation and rosterRoutes: EDGE normalization and section ordering

Resolve these against intended product behavior rather than changing assertions solely to make checks green. No production database, deployment, remote API, or device UI was exercised in this pass.
