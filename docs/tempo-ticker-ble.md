## Recovery after adding the rename characteristic

A phone may retain an older Bluetooth service table after firmware 0.6.0 adds the
name characteristic. Native discovery now verifies that it is readable and maps
CharacteristicNotFound to a specific optional-feature error. The controller keeps
the core connection and controls working, marks nameAvailable false, and displays
recovery guidance on Rename ticker. Ordinary status ACKs cannot re-enable it;
a successful name read on a new connection is required. Other connection/read
errors retain the normal failure behavior.

To refresh the iPhone service cache, forget the ticker in Settings → Bluetooth,
restart the ticker, then reconnect and pair in the app. Reload the updated app
bundle to receive this graceful fallback; no firmware or native app rebuild is
required for the fallback itself.

## Rename ticker (firmware 0.6.0)

Device → Rename ticker opens the shared confirm dialog and input. Names use 1–20
printable ASCII characters; surrounding whitespace is trimmed. A connected,
unlocked device must explicitly advertise rename support. Older firmware disables
the action with an upgrade hint. All UI names and the reconnect hint update only
after the saved name is read back exactly. The immutable peripheral ID stays the
same. Connect reads the canonical device name rather than a cached advertisement.

Status capability bit 7 (128) of v3 advertises this feature; v1/v2 reserved capability
rules are unchanged. Existing command frames and opcodes stay unchanged. Name GATT
UUID is `d69a0006-7a9b-4b28-95d3-09a1f487e001`, with public read and native protected
write-with-response. Writes require the same SC/MITM native bond as other controls.
The frontend bounds payloads and read results to 20 printable bytes, serializes
renames with other mutations, and verifies readback. Timeouts disconnect to prevent
unconfirmed writes from racing a later operation. Stale completions never rename
a newly connected device. Reconnect reads the persisted name after ambiguous errors.

The ticker commits names to NVS before publishing them, restores them on reboot,
and updates advertising from loop(). CoreBluetooth may cache a display name; the
app's canonical read still uses the durable value. Upload the new firmware and
reload the JavaScript bundle; there are no new native dependencies or backend calls.

## Ticker UI code organization

The three `app/ticker` screens compose shared UI and connect it to the ticker store.
`TickerUI` contains page/action/status/feedback primitives; `TickerSettingsSection`
contains sections, choices and switches. `TickerIcon` defines typed Ionicons names
and hides decorative glyphs from screen readers. Labels remain the accessible source
of meaning. `TickerDisplayControls` owns slider drafts and commit behavior;
`TickerDeviceSummary` owns the common connection summary. Content selection and
its bottom-sheet picker remain separate. Each component keeps static layout in named
StyleSheets, while theme colors and measurements remain dynamic. BLE commands,
ACK handling and authorization continue to live in the existing controller.

## My Ticker and discovery layout

My Ticker shares its connection summary with Settings and shows current content,
rotation and display state only while connected. The main action opens Ticker
Settings; connect/unlock guidance appears next to the device. Raw IDs and firmware
information stay in Device details. First-time setup has a single Add ticker action.

Add Ticker separates searching, nearby results, connection progress, no-results,
Bluetooth-off, permission-denied and unsupported states. Names are the main device
identity; a short suffix disambiguates duplicate names. Backgrounding or leaving
stops scans, and late connection results cannot redirect after the screen loses
focus. Existing connection/authentication checks stay in the shared controller.

## Ticker Settings layout

The settings screen follows this order: connection summary, Content, Rotation,
Display, then Device. Content keeps the selected league in a single row and offers
Scores / Schedule / Rankings. Rankings is available for college leagues. League
and schedule team selection use searchable/scrollable bottom sheets with the
shared SelectionCard artwork and shared search styling. A team becomes selected
only after the ticker acknowledges the command; closing a picker without selecting changes nothing.

Show only the active content's controls: a team row for Schedule, poll options for
Rankings, college rank labels for Scores/Schedule, and Top 25 game filtering only
for college Scores. Connection/unlock guidance is shown once near the top. Device
IDs, firmware, Wi-Fi and status refresh are collapsed under Device details. Rotation
uses Time per game or Time per team according to the active view.

## Firmware 0.5.0 / protocol v3: content views

Ticker Settings has a Display content card with League scores, Choose a team schedule,
and college poll choices. Schedule teams come from the app's existing league registries
and are searchable by name or abbreviation. Confirmed mode/team comes from device ACKs;
selection is not persisted as device truth. Team schedules use the current season and
include completed/upcoming games. CFB offers AP, Coaches, CFP; MCBB/WCBB offer AP/Coaches.
Missing polls are shown as unavailable, never replaced with a different poll.

The frame stays 20 bytes. v3 retains bytes 0–13 and duration byte 15. Byte 14 is a
bitmask: bit 0 rank labels, bit 1 Top 25 games. Byte 16 is mode (0 league scores,
1 team schedule, 2 AP, 3 Coaches, 4 CFP). Bytes 17–19 are unsigned 24-bit team ID,
little endian, required nonzero in schedule mode and zero in all other modes.
Opcode 10 set_view uses argument 0/2/3/4. Opcode 11 set_team_schedule uses bytes 5–7
as the team ID; bytes 8–19 must be zero. Other commands keep bytes 6–19 reserved zero.
Base capability bits remain unchanged; v3 additionally supports both content commands.
Changing league resets mode to scores and team to zero. New firmware accepts v3 commands;
the updated app still negotiates and supports v1/v2 firmware, where new controls are disabled.

Upload firmware 0.5.0 with headers and reload the app. No native phone build or backend
deployment is required. The existing paired BLE authorization policy applies to the
new commands. Duration applies to each game or poll team. Poll rank labels are always
shown. The game rank-label switch applies to college scores and schedules; the
Top 25 game filter applies only to league scores.

## Firmware 0.4.0: additional leagues

The v2 frame remains 20 bytes. League IDs 1 NBA, 2 NFL, 3 CFB stay unchanged;
4 MLB, 5 MCBB, 6 WNBA, 7 WCBB extend the same status byte 8 and set_league argument.
New league controls require firmware >=0.4.0; existing v1/v2 tickers retain their
original controls. Reload the app after uploading firmware 0.4.0; these changes
require no additional native dependencies.

The Sports preferences grid wraps into rows of three. College ranking labels and
Top 25 filtering also apply to men's and women's college basketball; the duration
setting applies to every league. The ticker fetches normalized hosted Tempo feeds,
with daily MLB/basketball slates and existing weekly football selection.

# Tempo Ticker frontend — Phase 1

## Current update: rankings and duration (firmware 0.3.0)

Firmware 0.3.0 adds **Show Top 25 rank labels**, **Top 25 games only**, and **Time per game** in Ticker Settings. Rank labels and filtering use backend-reported CFB team ranks 1–25; a game qualifies if either team is ranked. The filter is off by default and leaves the full cached slate intact. Missing ranks are never invented. An empty filtered slate shows NO TOP 25 GAMES. Ranking options have no effect on NBA/NFL. Labels default on.

Duration is 3–60 seconds (integer seconds, default 6), applies to every league, and is committed on slider release. The device ACK must confirm the requested duration before confirmed app state changes. Rejection or timeout preserves the previous confirmed setting. It changes game hold time, not the backend refresh interval. HTTP remains synchronous and can extend a hold during a slow fetch. These preferences are session settings and reset to defaults on firmware reboot.

This introduces **wire protocol v2**, still exactly 20 bytes and the same GATT UUIDs. Firmware reports 0.3.0 and capability mask 127. New opcodes: 7 `set_show_rankings` (0/1), 8 `set_duration` (3–60), 9 `set_top25_only` (0/1). Status/ACK bytes 14, 15 and 16 report rank-label enum (0 unknown/1 hidden/2 shown), duration (0 unknown, otherwise 3–60), and filter enum (0 unknown/1 all games/2 Top 25 only). Bytes 17–19 stay reserved zero. Capability bits 4/5/6 correspond to these controls. Command bytes 6–19 remain zero. Protected pairing and per-connection firmware authorization checks are unchanged.

The updated app decodes both **v1 and v2** and writes commands using the device's negotiated frame version. For v1 firmware, new settings are null/unavailable, not guessed; new controls stay disabled with an update explanation, while existing controls continue working. Firmware 0.3.0 accepts v2 commands. Upload the new sketch/headers, **fully reload the app JavaScript**, reconnect and pair/unlock. No new iPhone native dependency or binary build is needed. The remainder of this document describes the original v1/base control contract; this section defines the explicit v2 extension.

Validation: 41 ticker tests pass, including v1 compatibility, v2 bounds/encoding, ACK failures and authorization gates. Native C++ tests cover ranking/filter rotation and duration boundaries; the MatrixPortal sketch compiles. Physical display verification remains required after upload. The existing nine unrelated TypeScript errors remain.

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

**Firmware 0.2.0 implements usable paired controls** in the sibling LED ticker repository. Upload that firmware and reload the app. Discovery and read-only status still work before pairing; choose **Unlock controls** to perform an OS-protected authorization read and enter the code shown on the physical ticker in the native iPhone prompt. Firmware independently enforces authenticated, encrypted Secure Connections bonding on every mutation. Version 0.1.0 devices remain read-only until updated. The v1 wire format stays provisional for future extensions; the supported operations below are now implemented. Physical 0.2.0 pairing/control verification is still required.

Canonical code: `services/ticker/protocol.ts`; shared types: `types/ticker.ts`.

| Attribute                               | UUID                                   | Required property                                                 |
| --------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| Tempo service                           | `d69a0001-7a9b-4b28-95d3-09a1f487e001` | Advertise this 128-bit service                                    |
| Device info/status                      | `d69a0002-7a9b-4b28-95d3-09a1f487e001` | Read                                                              |
| Commands                                | `d69a0003-7a9b-4b28-95d3-09a1f487e001` | Write with response                                               |
| Command acknowledgments / status events | `d69a0004-7a9b-4b28-95d3-09a1f487e001` | Notify or indicate, with CCCD                                     |
| Protected authorization                 | `d69a0005-7a9b-4b28-95d3-09a1f487e001` | Read; native encryption, authentication and SC-bond authorization |

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

The app subscribes before issuing public `get_settings`. The separate protected authorization read is triggered only by Unlock controls. A successful local BLE write only means the ATT write completed: it does not commit UI settings. Brightness writes occur on slider release, league selection sends exactly one league, and success requires a matching ACK whose snapshot confirms the requested value. Errors/timeouts retain the last confirmed setting and show retry/refresh guidance. Unsolicited valid status can independently update confirmed state. No automatic mutation retries occur; after a timeout, the user should read status to reconcile a possible applied-but-unacknowledged command.

`refresh_scores` ACK means the firmware accepted the request; it does not claim ESPN data or the display is already refreshed. No sports scores are displayed by this frontend feature.

## Native pairing and control authorization

Production now supplies `createProtectedGattAuthorizer(transport)` to the controller. Merely connecting or receiving a valid status frame keeps controls locked. The user chooses **Unlock controls**; `readAuthorization` reads `d69a0005-7a9b-4b28-95d3-09a1f487e001` through the existing native BLE library. That firmware characteristic requires encrypted/authenticated GATT access and native authorization. iOS handles the Bluetooth pairing prompt. The owner enters the fresh six-digit passkey shown on the LED panel. No PIN field, bond key, shared secret, homemade challenge scheme or authorization flag is passed through JavaScript/AsyncStorage.

The firmware configures Display Only, bonding, MITM and Secure Connections. It checks native GAP encryption/authentication/bonding flags and a 16-byte key, plus the SC/authenticated metadata in the native bond store. Every state-changing command repeats that check against the actual requesting connection handle. An app bypass does not bypass firmware enforcement. Read-only commands remain public. The protected characteristic returns a normal status frame, not a trusted self-reported authorization bit.

The app's native ATT read must complete before its per-connection control gate opens. The protected-read flow depends on the firmware GATT protection contract and the OS pairing ceremony with the physical device; CoreBluetooth/ble-plx does not expose independent device attestation or direct bond-state inspection. The app therefore labels its state as control access, not independently verified hardware identity. Sensitive account/Wi-Fi provisioning is outside this protocol; no such payload is sent. Do not turn advertised UUIDs, names or returned capability bits into identity proofs.

Cancellation, rejection, a 90-second pairing deadline, Bluetooth shutdown or disconnect keep controls locked. Late callbacks cannot authorize a new connection. Authorization is not persisted in the Zustand store; native OS/device bond keys can support a subsequent protected read without another code prompt. Retrying **Unlock controls** is available after failure. The default controller authorizer remains deny-by-default for unsupported transports/tests; production explicitly wires the protected native implementation.

## Run on a physical iPhone

1. In `the-tempo-frontend`, run `npm ci`. Keep the project's normal environment configuration; follow the README for hosted versus local backend startup.
2. With Xcode/signing and a physical iPhone ready, run `npx expo run:ios --device`. Alternatively use the existing EAS `development` profile: `npx eas-cli build --profile development --platform ios`, register/install on the physical device, then run `npm start -- --dev-client`.
   For a local backend instead, use `npm run start:local -- --dev-client`.
3. Use an SDK 57-compatible toolchain; the BLE maintainer documents iOS 16.4+, RN 0.86 and Xcode 26.4+ for Expo 57.
4. Open the development build, sign into Tempo normally, then **Profile → My Ticker → Add Ticker**. Allow Bluetooth. Turn Bluetooth on in iPhone Settings if prompted; recover a denied permission through **Open iPhone Settings**.
5. Upload `TempoScoreboard.ino` **0.2.0** and its adjacent headers, reload the iPhone development app, and reconnect. Choose **Unlock controls**, then enter the code displayed on the panel into the native iOS Bluetooth pairing prompt. Successful protected access enables supported controls. No new phone native dependency/build is needed beyond the existing BLE development build.
6. Test brightness 0/100, all three leagues, rejected and missing ACKs, Bluetooth toggling, app background/foreground, disconnect/reconnect, connection cancellation and two different tickers. Test small iPhone layouts and both app themes. Verify actual panel behavior independently of UI ACKs.

**Expo Go cannot load this BLE native module. iOS Simulator does not validate physical BLE.** No physical device pairing, native iOS build, or panel controls have been verified as part of this implementation.

## Firmware behavior and physical verification

Firmware 0.2.0 advertises the existing service and adds the protected authorization read. Capability byte 6 is 15. `set_brightness`, one active `set_league`, `refresh_scores` and `set_display` are implemented. Native firmware checks secure bond state per command; invalid/unauthorized requests cannot invoke control callbacks. Settings success ACKs are sent after applying changes. A refresh ACK means accepted/queued, with requests coalesced while HTTP is busy.

An unscaled RGB565 frame cache in PSRAM makes 0% → 100% and off → on reversible without repeatedly dimming already-scaled pixels. A display mutex coordinates BLE rendering with the Arduino loop. Pairing codes temporarily override display-off/zero brightness at a readable level. Network calls stay in the Arduino loop; old-league HTTP responses are discarded after a league change. BLE controls do not send sports API requests directly from callbacks. Score fetching remains on the Tempo backend.

After upload, physically verify the new code prompt, failed/cancelled pairing, native bonded reconnection, 0/100% brightness, all leagues, display off/on, refresh acceptance, Wi-Fi loss and radio shutdown. Check that an unpaired BLE client cannot change settings. Existing 0.1.0 discovery and backend HTTPS fetching were confirmed by the user's Serial logs; new 0.2.0 security/control operation remains unverified on hardware until that check.

## Files

Created:

- `types/ticker.ts`
- `services/ticker/{protocol,transport,nativeTransport,controller,authorization}.ts`
- `store/tickerStore.ts`
- `components/Ticker/TickerUI.tsx`
- `app/ticker/{index,add,settings}.tsx`
- `app/(tabs)/(profile)/ticker/{index,add,settings}.tsx`
- `tests/tickerProtocol.test.ts`, `tests/tickerController.test.ts`, `tests/tickerAuthorization.test.ts`
- `docs/tempo-ticker-ble.md`

Modified:

- `app/(tabs)/(profile)/profile.tsx`: My Ticker entry.
- `utils/navigation/tabStackNavigation.ts`: scoped ticker route family.
- `tests/tabStackRouteCoverage.test.ts`: ticker route coverage.
- `app.json`: iOS Bluetooth usage description only.
- `package.json`, `package-lock.json`: dependencies and `test:ticker` command.

## Validation

- `npm run test:ticker`: **41 passed**, with injected BLE transport/authorization mocks; no hardware required.
- `npm run test:navigation`: **13 passed**, including the Profile ticker routes.
- `npm run lint`: passed with no warnings or errors.
- `npx tsc --noEmit`: nine pre-existing errors, with no new feature errors; error output matched the pre-change baseline.
- `npx expo config --type introspect --json`: passed; Bluetooth usage text is present. No new BLE background modes or Android BLE permissions were introduced (existing audio/background and Android media configuration remain).
- `CI=1 npx expo export --platform ios --max-workers 2 --output-dir /tmp/tempo-controls-ios-export`: passed; iOS Hermes JavaScript bundle generated. This checks bundling, not native compilation or physical radio operation.
- `git diff --check`: passed. No commits, pushes, merges or branch switches.

Firmware 0.2.0 compiles for the MatrixPortal S3 with QSPI PSRAM. New native passkey pairing, physical control effects and visual device QA remain unverified. The sandbox could not access CoreSimulator services; no successful UI runtime check is claimed.

The initial TypeScript check already had **nine errors**: missing `hooks/useFanPredictionAnalytics` and five resulting implicit-any errors in `FanPredictionAnalysis.tsx`, two volleyball route-type mismatches (`ProfileFavoritesSection` and `useFavoriteTeams`), and missing `cb`/`sb` keys in `useHomeData`. These are unrelated to the ticker. Lint passed before changes.
