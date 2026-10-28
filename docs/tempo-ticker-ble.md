# Tempo Ticker frontend — Phase 1

## Scope and architecture audit

Implemented in the **frontend only**, on `feat/tempo-ticker-ble`. The starting frontend working tree was clean. No firmware, backend, sports endpoints, auth flows, branches, or commits were changed.

The audit found Expo `~57.0.31`, React Native `0.86.3`, React `19.2.3`, strict TypeScript `~6.0.3`, Expo Router `~57.0.29`, and Zustand `^5.0.8`. No BLE library was installed. The existing community slider is reused. Unit tests use Node's test runner and `tsx`; lint uses Expo ESLint.

Profile lives in `app/(tabs)/(profile)/profile.tsx`. Detail screens use thin route exports and `useScopedRouter` to preserve their tab stack. Profile now has a **My Ticker** button. Its dashboard, Add Ticker, and settings routes live in the Profile stack, with reusable screen implementations under `app/ticker`. No tab was added.

The UI reuses `CustomHeader`, `Button`, `constants/styles.ts` typography/colors, the preferences context for light/dark mode, Ionicons, the existing navigation bar inset helper, and safe-area bottom spacing. All content scrolls for smaller phones and larger text.

Authentication uses `useAuth`, AsyncStorage session/profile data, and the canonical API client's session subscription. Ticker authorization is separate from Tempo account authentication: no account credentials are sent over BLE, and this feature makes no HTTP requests.

`services/ticker/controller.ts` owns connection, scan and command lifecycles and exposes a vanilla Zustand store. `store/tickerStore.ts` supplies one shared production controller and the React binding. The transport is injectable for hardware-free tests. Screens never operate the native BLE manager.

Only the last verified-protocol device identifier and display name are saved in `tempo:ticker:last-device:v1`. Settings, connection state, authorization, native objects, subscriptions and pairing secrets are never persisted. Reconnecting reads live status again. A saved device is always shown as disconnected until a new connection succeeds. Discovery stops on blur, app backgrounding, cancellation, error, and after 12 seconds. Connections are bounded to 20 seconds; commands to 8 seconds. Disconnect and Bluetooth shutdown invalidate stale callbacks and clear live device data.

## Native dependency and Expo setup

- `@sfourdrinier/react-native-ble-plx` **3.9.3**, pinned. This maintained `ble-plx` fork explicitly targets Expo 57 / RN 0.86; upstream's published compatibility table only covers older versions. Native build and radio behavior still require device validation.
- `base64-js` **1.5.1**, pinned, converts the library's base64 characteristic values to bounded binary frames.
- `expo-dev-client`, installed using `expo install` to match SDK 57.
- `@react-native-community/slider` was already installed; no extra slider dependency.

The native module is loaded lazily on iOS, so entering the app in Expo Go or on web does not eagerly instantiate an unsupported manager. The feature gives a development-build explanation when BLE is unavailable. Android BLE is deliberately gated in Phase 1; no Android permissions or configuration were changed.

`app.json` adds `ios.infoPlist.NSBluetoothAlwaysUsageDescription`. For this foreground-only iOS central, that Info.plist entry and standard React Native autolinking are sufficient. The library's full config plugin also adds Android permissions and optional restoration/background configuration, so it is intentionally not registered. No background modes, restoration subspec, or checked-in native projects are required. Rebuild the development binary after installing the native dependency; an OTA JavaScript update cannot add it.

Maintainer references:

- [Fork compatibility and installation](https://github.com/sfourdrinier/react-native-ble-plx#compatibility)
- [Expo plugin options](https://github.com/sfourdrinier/react-native-ble-plx/blob/master/docs/EXPO_PLUGIN.md)
- [Upstream limitations, including explicit bonding APIs](https://github.com/dotintent/react-native-ble-plx)

## Provisional GATT contract

**Not implemented by current firmware.** This is a proposal for the next firmware phase, not a claim of successful hardware pairing/control. A matching advertisement is a discovery candidate, not evidence of authenticity.

Canonical code: `services/ticker/protocol.ts`; shared types: `types/ticker.ts`.

| Attribute                               | UUID                                   | Required property              |
| --------------------------------------- | -------------------------------------- | ------------------------------ |
| Tempo service                           | `d69a0001-7a9b-4b28-95d3-09a1f487e001` | Advertise this 128-bit service |
| Device info/status                      | `d69a0002-7a9b-4b28-95d3-09a1f487e001` | Read                           |
| Commands                                | `d69a0003-7a9b-4b28-95d3-09a1f487e001` | Write with response            |
| Command acknowledgments / status events | `d69a0004-7a9b-4b28-95d3-09a1f487e001` | Notify or indicate, with CCCD  |

Advertise a local name such as `Tempo-Ticker` or `Tempo-Ticker-A1B2`. The app filters by the service UUID and verifies the service, characteristic properties, frame version and capabilities after connecting. It does not trust the name alone. The identifier shown is the OS peripheral identifier (an opaque UUID on iOS), not a guaranteed hardware MAC address.

### Encoding and payload limits

Every read, write and notification is **exactly 20 bytes**, binary, protocol version 1. This fits an ATT MTU of 23 (20 usable bytes). No arbitrary JSON, UTF-8 strings, fragmentation, or MTU negotiation is needed. The BLE library transports these bytes as base64 (28 characters), which is not encryption. Invalid lengths, versions, enum values or reserved bits fail verification; malformed notifications close the connection.

All multi-byte numbers are unsigned little endian. Reserved bytes must be zero. Future expanded data needs a separately negotiated version/characteristic; do not silently append bytes.

| Byte(s) | Command frame (kind 1)      | Response (kind 2) / status (kind 3)                              |
| ------- | --------------------------- | ---------------------------------------------------------------- |
| 0       | Version `1`                 | Version `1`                                                      |
| 1       | `1`                         | `2` for ACK, `3` for status                                      |
| 2–3     | Nonzero request ID, 1–65535 | Echo ID for ACK; `0` for status                                  |
| 4       | Opcode                      | Echo opcode for ACK; `0` for status                              |
| 5       | Argument, or `0`            | Result for ACK; `0` for status                                   |
| 6       | `0`                         | Capability bit mask                                              |
| 7       | `0`                         | Confirmed brightness 0–100; `255` = not reported                 |
| 8       | `0`                         | Active league: 0 = not reported, 1 = NBA, 2 = NFL, 3 = CFB       |
| 9       | `0`                         | Wi-Fi: 0 = not reported, 1 = connected, 2 = disconnected         |
| 10      | `0`                         | Display: 0 = not reported, 1 = off, 2 = on                       |
| 11–13   | `0`                         | Firmware major/minor/patch, each 0–254; all `255` = not reported |
| 14–19   | `0`                         | `0`, reserved                                                    |

Capability byte 6: bit 0 = `set_brightness`, bit 1 = `set_league`, bit 2 = `refresh_scores`, bit 3 = `set_display`; bits 4–7 must be zero. Read-only `get_status` and `get_settings` are required by v1. Wi-Fi and firmware are optional observations, never fabricated by the frontend. There is deliberately **no trusted authorization bit** in these frames.

| Opcode | Logical command        | Argument                  |
| ------ | ---------------------- | ------------------------- |
| 1      | `get_status`           | 0                         |
| 2      | `get_settings`         | 0                         |
| 3      | `set_brightness`       | Integer percentage 0–100  |
| 4      | `set_league`           | 1 = nba, 2 = nfl, 3 = cfb |
| 5      | `refresh_scores`       | 0                         |
| 6      | Optional `set_display` | 0 = off, 1 = on           |

ACK results: 0 = ok, 1 = unsupported, 2 = unauthorized, 3 = invalid, 4 = failed. Successful ACKs include a complete current status/settings snapshot in bytes 6–13. Failure ACKs should also include current status or valid unknown sentinels. Unknown opcodes/results are rejected.

Examples (hex, all 20 bytes):

- Request ID 1, brightness 80%: `01 01 01 00 03 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00`
- Successful matching ACK, capabilities brightness/league/refresh, NBA, Wi-Fi connected, display not reported, firmware 1.0.0: `01 02 01 00 03 00 07 50 01 01 00 01 00 00 00 00 00 00 00 00`

### Correlation and confirmed state

One command is in flight at a time. Request IDs are monotonically increasing and not reused during a controller lifetime. At 65535 requests a new controller/app session is required instead of wrapping and risking a stale ACK. Responses must match both ID and opcode on the current connection generation. Late, unrelated or mismatched ACKs are ignored. Unsolicited status frames use kind 3 / ID 0.

The app subscribes before issuing `get_settings`. A successful local BLE write only means the ATT write completed: it does not commit UI settings. Brightness writes occur on slider release, league selection sends exactly one league, and success requires a matching ACK whose snapshot confirms the requested value. Errors/timeouts retain the last confirmed setting and show retry/refresh guidance. Unsolicited valid status can independently update confirmed state. No automatic mutation retries occur; after a timeout, the user should read status to reconcile a possible applied-but-unacknowledged command.

`refresh_scores` ACK means the firmware accepted the request; it does not claim ESPN data or the display is already refreshed. No sports scores are displayed by this frontend feature.

## Security integration gate

BLE connection, OS pairing/bonding, and device authorization are separate states. `ble-plx` does not expose a trusted explicit bonding API. iOS may prompt for pairing when firmware requires protected GATT access, but the app does not label that as verified bonding.

`TickerAuthorizer.verify(device)` in `services/ticker/transport.ts` is the integration point for a future trusted native/firmware security implementation. Production uses `pendingFirmwareAuthorization`, which **always denies authorization**. No screen toggle, AsyncStorage flag, device name, UUID, or self-reported field can unlock it. Tests inject an authorizer solely to exercise gated command paths. Read-only protocol inspection is allowed without authorization; state-changing commands are blocked before any write.

Before replacing this gate, agree on and verify authenticated BLE LE Secure Connections/bonding with MITM protection appropriate to the device's actual input/output capabilities and an ownership/physical approval flow. Require encrypted/authenticated characteristic access and firmware-side authorization for all mutations. A physical confirm or other vetted security design may require firmware and trusted native integration work. Do not substitute a hardcoded PIN, custom challenge scheme, or trust in an advertised UUID. Firmware must independently enforce authorization even if a client bypasses its own UI.

No Wi-Fi credentials, tokens, account identifiers, or other sensitive payloads belong in v1. Future provisioning requires a separately reviewed secure protocol. Do not place secrets in AsyncStorage.

## Run on a physical iPhone

1. In `the-tempo-frontend`, run `npm ci`. Keep the project's normal environment configuration; follow the README for hosted versus local backend startup.
2. With Xcode/signing and a physical iPhone ready, run `npx expo run:ios --device`. Alternatively use the existing EAS `development` profile: `npx eas-cli build --profile development --platform ios`, register/install on the physical device, then run `npm start -- --dev-client`.
   For a local backend instead, use `npm run start:local -- --dev-client`.
3. Use an SDK 57-compatible toolchain; the BLE maintainer documents iOS 16.4+, RN 0.86 and Xcode 26.4+ for Expo 57.
4. Open the development build, sign into Tempo normally, then **Profile → My Ticker → Add Ticker**. Allow Bluetooth. Turn Bluetooth on in iPhone Settings if prompted; recover a denied permission through **Open iPhone Settings**.
5. Current firmware should yield no compatible devices. Once proposed firmware exists, it must advertise the service and pass GATT/frame verification. A protocol-compatible device can show reported information, but controls remain locked until the security integration above is implemented.
6. Test brightness 0/100, all three leagues, rejected and missing ACKs, Bluetooth toggling, app background/foreground, disconnect/reconnect, connection cancellation and two different tickers. Test small iPhone layouts and both app themes. Verify actual panel behavior independently of UI ACKs.

**Expo Go cannot load this BLE native module. iOS Simulator does not validate physical BLE.** No physical device pairing, native iOS build, or panel controls have been verified as part of this implementation.

## Exact next-phase firmware requirements

1. Add BLE central-connectable peripheral support on the Matrix Portal S3 without breaking existing Wi-Fi/ESPN rendering. Advertise the dedicated 128-bit service and optional unique local name.
2. Implement all three characteristics with the properties above and a CCCD on the response characteristic. Use 20-byte frames even at the minimum MTU.
3. Provide a fresh kind-3 status on read, protocol version 1, accurate capability bits, actual settings, optional real Wi-Fi and firmware version; use unknown sentinels for unavailable data.
4. Implement correlated `get_status`, `get_settings`, brightness, single selected league (`nba`/`nfl`/`cfb`) and refresh commands. Reject out-of-range values, unsupported commands, malformed/reserved bytes and unknown versions. Optional display power must not be advertised until implemented.
5. Notify/indicate a matching ACK within eight seconds. Apply settings before a success snapshot; echo ID/opcode exactly. Use error result codes instead of false success. Refresh work may continue after accepting the request. Expose unsolicited status updates with ID/opcode/result zero.
6. Define and enforce secure authenticated pairing/ownership authorization, characteristic protection and revocation/disconnect behavior. Integrate the trusted frontend authorizer only once verification is possible. A valid v1 status frame alone never unlocks control.
7. Validate the wire contract and security on a physical iPhone; test service discovery, notification subscription timing, radio loss, repeated connections, MTU 23, power cycling and concurrent Wi-Fi/LED operation. Align changes to the provisional contract in firmware and frontend together.

## Files

Created:

- `types/ticker.ts`
- `services/ticker/{protocol,transport,nativeTransport,controller}.ts`
- `store/tickerStore.ts`
- `components/Ticker/TickerUI.tsx`
- `app/ticker/{index,add,settings}.tsx`
- `app/(tabs)/(profile)/ticker/{index,add,settings}.tsx`
- `tests/tickerProtocol.test.ts`, `tests/tickerController.test.ts`
- `docs/tempo-ticker-ble.md`

Modified:

- `app/(tabs)/(profile)/profile.tsx`: My Ticker entry.
- `utils/navigation/tabStackNavigation.ts`: scoped ticker route family.
- `tests/tabStackRouteCoverage.test.ts`: ticker route coverage.
- `app.json`: iOS Bluetooth usage description only.
- `package.json`, `package-lock.json`: dependencies and `test:ticker` command.

## Validation

- `npm run test:ticker`: **27 passed**, with injected BLE transport/authorization mocks; no hardware required.
- `npm run test:navigation`: **13 passed**, including the new Profile ticker routes.
- `npm run lint`: passed with no warnings or errors.
- `npx tsc --noEmit`: nine pre-existing errors, with no new feature errors; error output matched the pre-change baseline.
- `npx expo config --type introspect --json`: passed; Bluetooth usage text is present. No new BLE background modes or Android BLE permissions were introduced (existing audio/background and Android media configuration remain).
- `CI=1 npx expo export --platform ios --output-dir /tmp/tempo-ticker-ios-export`: passed; iOS Hermes JavaScript bundle generated. This checks bundling, not native compilation or physical radio operation.
- `git diff --check`: passed. No commits, pushes, merges or branch switches.

Physical iPhone BLE, native binary compilation, visual device/simulator QA and real firmware controls remain unverified. The sandbox could not access CoreSimulator services; no successful UI runtime check is claimed.

The initial TypeScript check already had **nine errors**: missing `hooks/useFanPredictionAnalytics` and five resulting implicit-any errors in `FanPredictionAnalysis.tsx`, two volleyball route-type mismatches (`ProfileFavoritesSection` and `useFavoriteTeams`), and missing `cb`/`sb` keys in `useHomeData`. These are unrelated to the ticker. Lint passed before changes.
