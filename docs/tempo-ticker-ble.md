## Quiet hours — firmware 0.15.0 / protocol v11

The Quiet hours section adds an optional weekly schedule with local start/end
times, selected start days, 30 time zones, display-off or a 1–50% brightness cap,
and a temporary Stay on override. New schedules suggest the phone's supported
time zone. The selected day is the day a period starts; overnight periods end
the following morning. DST adjusts automatically for the selected zone. During
a repeated hour, starts use the first occurrence and ends use the second;
nonexistent spring times move forward by the gap. The scoreboard's own date
format/timezone is independent of quiet-hours conversion.

The schedule defaults off. A new 10 PM–7 AM/all-days/off draft is suggested.
The app saves all fields together and verifies the complete metadata readback.
Schedule edits take effect only after Save quiet hours. Same saved values skip
both the app command and the firmware flash write. Stay on skips the current
period through its end; Resume quiet hours cancels it. A phone disconnect keeps
the skip; a reboot or schedule change clears it. Manual display-off continues
to apply, dimming never raises a lower manual brightness, and the latest normal
brightness returns at the end of the period. Pairing codes stay visible.

| Wire field | Meaning |
| --- | --- |
| Version / firmware | Byte 0 is 11; bytes 11–13 are `0,15,0`; frames stay 20 bytes. |
| Opcode 23 | `set_quiet_hours`; bytes 5–13 contain the nine schedule fields below; bytes 14–19 zero. |
| Opcode 24 | `set_quiet_override`; byte 5 is boolean; bytes 6–19 zero. Setting true requires an active period. |
| Status byte 10, bits 5/6/7 | Schedule enabled / current quiet period active / temporary skip active. Lower five bits preserve power/color meanings. |
| Status byte 9, bit 2 | Clock synchronized; lower two bits retain Wi-Fi state. Bits 3–7 remain zero. |
| Characteristic `d69a0009-7a9b-4b28-95d3-09a1f487e001` | Read-only 11-byte metadata: `[configured,1,...scheduleFields]`. |

Schedule fields are `[enabled,startMinuteLo,startMinuteHi,endMinuteLo,
endMinuteHi,daysMask,behavior,dimPercent,timeZoneId]`. Times are minutes since
midnight, 0–1439, and must differ. The nonempty 7-bit day mask uses Sunday bit 0
through Saturday bit 6. Behavior 0 is off and 1 is dim; dimPercent is 1–50 even
when off. Stable zone IDs 0–29 follow `constants/tickerTimeZones.ts` and
`QUIET_ZONES` in firmware; append new IDs without reordering. Firmware stores
`[1,...scheduleFields]` as one `tempo-quiet/schedule` blob before publishing the
new settings. Rejected or failed writes preserve the previous saved schedule.
The temporary override is RAM-only.

The ticker evaluates the schedule on a dedicated half-second task, even while
HTTP blocks the main loop. It publishes status changes over the existing
response characteristic; ACK/status notifications share a transmit mutex.
After a cold boot, Wi-Fi/NTP must synchronize the clock before quiet hours can
start. Manual power/brightness apply until then. Once synchronized, a powered
ticker can follow the schedule without the app or continuous Wi-Fi.

The app supports v1–v11. Older frames retain their reserved-bit checks and
report null quiet-hours state with no quiet-hours capabilities. A missing cached
metadata characteristic disables only this editor with forget/re-pair guidance.
Save operations queue behind brightness and reserve the connection through ACK
and exact readback; disconnects/timeouts cannot publish late metadata into a new
connection. No native dependency or backend changes are required.

## Smart game priority — firmware 0.14.0 / protocol v10

Rotation settings now includes a Smart game priority toggle. It defaults off,
persists on the ticker, and applies to scores, team schedules, and Favorites
inside each custom rotation item. Enabled order is close live games late in
play, other live games, upcoming games ordered by start, and finals with the
most recent start first. Unavailable/unknown games follow. All games remain in
the cycle; poll rankings, playlist item order, filters, and card timing retain
their existing behavior. Disabling restores cached API order immediately.

Close-game thresholds are 8 points for NBA/WNBA/NFL/CFB, 6 for MCBB/WCBB, and
2 runs for MLB. A finish gets priority in the last five minutes of the final
regulation period, overtime, or MLB inning 8 onward. Missing/invalid scores and
clocks do not create a close-finish boost. Upcoming/final timestamps use UTC.
Refreshes keep the current matchup unless a newly more urgent eligible band
appears; repeated updates do not keep restarting the same live slate.

| Field | v10 behavior |
| --- | --- |
| Protocol version | Byte 0 is `10`; frame length and GATT UUIDs are unchanged. |
| Firmware | Bytes 11–13 are `0,14,0`. |
| Command 22 | `set_smart_priority`; byte 5 is `0` or `1`, bytes 6–19 zero. |
| Status byte 14, bit 7 | Confirmed smart-priority boolean; lower 7 bits retain their v9 meanings. |
| Storage | Separate `smart` boolean in the existing `tempo-display` namespace. |

The protected command publishes state only after a successful durable write;
unchanged values skip flash writes. ACKs must confirm the exact requested
boolean. Brightness queueing and disconnect cancellation follow the existing
serialized command behavior. The app decodes v1–v10 and reports
`settings.smartGamePriority = null` without the capability on v1–v9. Bit 7
remains reserved/rejected in those older frames. Upload firmware 0.14.0 and
reload app JavaScript to use this setting; no native dependency changes are
needed.

## Header emoji — firmware 0.13.0 / protocol v9

The custom-header editor offers ❤️ ⭐ 🏆 🔥.
Supported emoji can also be typed or pasted. Each counts as one of 20 header
characters, and emoji presentation selectors normalize to the canonical icon.
Unsupported Unicode (including skin tones and ZWJ sequences) is rejected with
guidance to use the picker. The panel renders 8×8 colored pixel art in 9px cells;
ASCII uses the existing 6px cells. Layout clips by rendered width and preserves
clearance for the right-aligned league label.

The custom-header characteristic now accepts ASCII plus stable glyph IDs:

| Byte | Emoji |
| --- | --- |
| `88` | ❤️ |
| `87` | ⭐ |
| `85` | 🏆 |
| `86` | 🔥 |

Bytes above are hexadecimal, not UTF-8. The four IDs retain their original values;
all other emoji IDs are rejected. ASCII-only headings retain their exact
encoding, and 20 emojis still fit one minimum-MTU write. Firmware persists the
same encoded bytes and restores them after restart. Device-name encoding stays
ASCII. The app checks firmware >= 0.13.0 before enabling or sending emoji; older
firmware retains custom text support. Protocol version 9 and UUIDs are unchanged,
with firmware bytes `0,13,0`. Rejected saves preserve the confirmed heading.

## Custom header names — firmware 0.11.0 / protocol v8

## Firmware 0.12.0 / protocol v9: Custom rotation

The Rotation section includes an editor for 1–8 ordered items. Add, reorder,
remove, and choose 3–60 seconds per card for each item, then Save & start rotation.
Touch and hold an item’s drag handle to reorder it; cards snap into their new
positions when released. Pickup locks the page at its current position; edge
scrolling starts only after the finger moves toward an edge and stops on release.
The red trash icon removes an item from the draft.
Reordering preserves each item’s league, content, team, and timing. Changes take
effect on the ticker only after Save & start rotation.

Items support any of the seven leagues’ scores or a team schedule, AP/Coaches
polls for college leagues, CFP for CFB, and previously synced favorites. Each slate
plays once before advancing. Empty/fully filtered slates advance after one
interval. Poll availability is unchanged. The normal duration control is hidden
while custom rotation is active; each item owns its duration. Selecting normal
content stops custom rotation and retains the saved list. A saved, enabled list
resumes after a power cycle and runs without a phone connection.

The status remains 20 bytes. Version byte is 9; firmware bytes are `0,12,0`.
View byte 16 adds `6` (custom rotation). In that view bytes 17–19 contain the
nonzero 24-bit rotation signature; schedule team ID and Favorites signature are
null in app state. The selected-league field is the normal single-view league;
it does not track each currently playing rotation item. Header/color/date and
other existing fields preserve their v8 meanings.

| Opcode | Command | Payload |
| --- | --- | --- |
| 19 | `rotation_begin` | Byte 5: item count 1–8; remaining bytes zero. Resets staging. |
| 20 | `rotation_chunk` | Byte 5: offset; byte 6: count 1–2; from byte 7: six bytes per entry; unused bytes zero. |
| 21 | `rotation_commit` | Bytes 5–7: expected signature, little endian; remaining bytes zero. |

Each entry is `[league, view, teamIDLo, teamIDMid, teamIDHi, seconds]`. League IDs
and views 0–5 match existing commands; only schedule view 1 has a nonzero team ID.
Favorites uses canonical league 0, view 5, team ID 0 and requires synced teams.
The signature uses FNV-1a over count followed by all entry bytes, retaining the
low 24 bits and mapping zero to one. Shared native/app fixture NBA scores (6s),
CFB team 129689 schedule (8s), WCBB AP (3s) yields **4834019**.

New read-only characteristic `d69a0008-7a9b-4b28-95d3-09a1f487e001` contains
`[enabled, count, ...entries]`, with length `2 + count * 6` (maximum 50 bytes).
An unconfigured list has an empty value. It supports standard ATT long reads.
The app reads/validates this metadata during connection to restore the editor;
a missing cached characteristic disables only custom rotation, with reconnect
and re-pair guidance. v1–v8 remain supported and do not expose rotation commands.

The controller snapshots drafts, queues behind brightness, locks the complete
begin/chunk/commit sequence, waits for each ACK, and accepts the new saved list
only when the commit confirms mode 6 and its exact signature. Firmware persists
the complete enabled list before publishing it, clears staging on disconnect,
and preserves the previous list on incomplete/invalid/failed commits. A list
change or content-mode exit invalidates in-flight HTTP responses. Offline devices
continue the current cached slate; loading each new slate uses synchronous HTTP
and may pause the display. No backend or native dependency changes are required.

Display → Header → Custom name opens a 1–20-character text editor. Saving writes
and verifies the independent display heading, then activates Custom name mode.
The Bluetooth device name, header color and league label retain their meanings.
The app preview uses the confirmed custom text. Printable ASCII, no leading or
trailing spaces, and the 20-byte limit match the firmware's existing name policy;
an empty read means no custom text has been saved, while empty writes are invalid.

V8 keeps the 20-byte control/status frame and adds header mode 3 (`custom`) to
status byte 14 bits 5–6. Modes 0–2 and all other v7 fields remain unchanged.
`set_header` argument 3 requires v8; older firmware keeps its original mode bounds.
The updated app derives `canCustomHeader` from v8 and reads the separate text at
connect time. Text/availability are connection metadata, not fabricated status bytes.

New characteristic `d69a0007-7a9b-4b28-95d3-09a1f487e001` is publicly readable and
requires encrypted/authenticated/authorized writes on the native verified SC bond.
Its payload is the raw printable text, at most 20 bytes, fitting the minimum MTU.
The device persists text in its own `tempo-header` NVS namespace before publishing
it. Rejected writes restore the characteristic's previous durable value. Unchanged
writes avoid flash updates. The display-options byte now allocates all four header
mode values; boot restores Custom only when a valid nonempty label exists.

The controller reserves the connection across write, exact readback and mode ACK.
Only verified text updates the app's custom-header metadata; only the confirmed
mode ACK selects Custom. A successful text save followed by a failed mode command
retains the verified text for retry. A hanging text operation disconnects rather
than publishing unconfirmed state, and late work cannot affect another connection.
A cached missing characteristic disables this feature with rediscovery guidance,
without disabling ordinary ticker controls. Core status notifications cannot
re-enable it without a fresh successful characteristic read.

Upload the new firmware with adjacent headers and reload the app JavaScript, then
reconnect. No backend deployment or new native library/build is required. Physically
verify OS pairing protections, text edits, independent Bluetooth naming, colors,
long-name clipping, disconnects and power-cycle restoration after upload.

## Header colors — firmware 0.10.0 / protocol v7

Display → Header color offers green, white, red, blue, yellow, orange, purple
and cyan (wire IDs 0–7). Green preserves the existing default. The picker shows
swatches and a confirmed-color header preview. The chosen color applies to the
brand/device name, divider, poll heading and display-message header; league labels
remain gray. Hidden stays hidden, with its color retained for when shown again.

V7 keeps the same 20-byte frames and UUIDs. Status/ACK byte 10 now stores display
state in bits 0–1 (0=unreported, 1=off, 2=on; 3 invalid), color ID in bits 2–4,
and zero in bits 5–7. All other v6 fields are unchanged. Command 18
(`set_header_color`) takes ID 0–7 in byte 5 and zero in bytes 6–19. It requires
the authenticated SC bond; success follows persistence, and the app verifies the
confirmed color in the matching ACK. Earlier firmware reports `headerColor: null`
and no new capability; its display-power decoding retains the original layout.

NVS display options retain date bits 0–1, broadcast-hidden bit 2, header bits 3–4,
and add color bits 5–7. Existing saved options migrate to color 0 without resetting
other choices. Mode 3 remains invalid. Saves preserve all other preference bits,
skip unchanged values, and cannot publish a color after a failed NVS write.
The firmware uses the fixed RGB palette in DisplayHeader.h; app swatches match
its unquantized RGB values. Existing brightness scaling still applies to all pixels.

Update app JavaScript before connecting to v7 firmware, upload the sketch and
adjacent headers, reconnect, and verify colors/power/brightness and restart
restoration on hardware. No backend deployment or native app rebuild is required.

## Header options — firmware 0.9.0 / protocol v6

Ticker Settings → Display → Header selects `tempo` (THE TEMPO), `device_name`,
or `hidden`. The first two keep the game league label; long device names are
clipped with an ellipsis to reserve its space. Hidden removes top text and divider,
including poll titles. Polls otherwise retain their AP/Coaches/CFP heading.
The device uses its saved name and requests a redraw after a successful rename.
The preference persists in NVS and applies without fetching scores again.

V6 retains the existing 20-byte frame and UUIDs. Status byte 14 adds header mode
in bits 5–6: 0=THE TEMPO, 1=device name, 2=hidden; 3 is invalid. Bit 7 remains zero;
all lower bits retain their v5 meanings. Command 17 (`set_header`) takes 0–2 in
byte 5, with bytes 6–19 zero. Native paired authorization is required. The app
confirms the requested mode in the matching ACK before committing the setting.
Older versions decode with `headerMode: null` and no `set_header` capability.

NVS display options keep date in bits 0–1 and broadcast-hidden in bit 2, adding
header mode in bits 3–4. Existing saved values 0–7 migrate without losing either
preference. A failed save cannot publish a new option. Unchanged saves avoid flash
writes. Update app JavaScript before connecting to v6 firmware, upload the sketch
with adjacent headers, and verify modes, long names, rename redraws and restart
restoration on hardware. No backend deployment/native rebuild is required.

## Favorite teams — firmware 0.8.0 / protocol v5

Ticker Settings → Content → Favorites syncs up to 50 supported profile teams.
The device saves the list and active mode, then fetches matching daily basketball/
baseball games and current-week football games without the phone. Unsupported
leagues are excluded explicitly; use Sync favorite teams after profile edits.
The feature uses existing backend scoreboards, with no backend change/deployment.

V5 keeps the same UUIDs and 20-byte frame. Status byte 16 adds mode `5` (Favorites).
For this mode, bytes 17–19 contain the nonzero 24-bit list signature instead of a
schedule team ID. The app reports `teamId: null` and `favoritesSignature` separately.
Modes 0–4 retain their existing meanings; older firmware has no new capabilities.
Firmware is 0.8.0. V1–v4 remain supported by the updated app; update app JavaScript
before connecting to v5 firmware.

Protected transfer commands:

| Opcode | Command | Payload |
| --- | --- | --- |
| 14 | favorites_begin | Byte 5: count 1–50; bytes 6–19 zero. |
| 15 | favorites_chunk | Byte 5: offset; byte 6: count 1–3; bytes 7 onward: four bytes per team (league ID, 24-bit little-endian team ID); unused bytes zero. |
| 16 | favorites_commit | Bytes 5–7: 24-bit list signature; bytes 8–19 zero. |

League IDs remain NBA=1, NFL=2, CFB=3, MLB=4, MCBB=5, WNBA=6, WCBB=7.
Team IDs must be 1–0xffffff. List entries must be unique by league and ID. The
signature is FNV-1a with 32-bit unsigned arithmetic over count then each team's
four canonical bytes, masked to 24 bits with zero mapped to one. It correlates
the confirmed list; authorization continues to require the authenticated SC bond.

The app reserves the controller for the whole sequence, sends at most three
teams per packet, awaits each matching ACK, and verifies final mode and signature.
A disconnect cancels remaining commands and the firmware staging buffer. Missing
packets, invalid/duplicate teams, wrong signatures or failed NVS writes cannot
replace the prior active list. No automatic mutation retries occur. Firmware NVS
stores enabled flag, count and canonical team bytes in one blob; unchanged saves
avoid flash writes. Scores/schedule/poll selection persists the exit from Favorites.

The device refreshes only represented leagues sequentially, filters before the
256-game cache capacity check, and publishes a new slate only when every league
succeeds. A game involving two favorites appears once. Game identity includes its
league; headers/logos/status/possession use that per-game league. This preserves
existing synchronous-fetch pauses; multi-league fetching can extend them. No
account token is transferred or persisted. Hardware sync, radio disconnect,
refresh failure and power-cycle testing remain necessary after upload.

## Display preferences — firmware 0.7.0 / protocol v4

Ticker Settings → Display offers `MM/DD`, `DD/MM`, `MMM D`, `YYYY-MM-DD`, and
Show broadcast. Defaults are `MM/DD` and broadcasts on. Settings are confirmed
only after a matching successful ACK contains the requested value. They serialize
behind live brightness changes, use the existing protected command path, and are
stored on the ticker across restarts. Save failures leave the previous confirmed
value intact. No backend work or native app rebuild is required.

V4 keeps the same UUIDs and 20-byte minimum-MTU frame. Version byte 0 is `4`.
Status/ACK byte 14 retains show-rankings in bit 0 and Top 25 only in bit 1, adds
date format in bits 2–3 (`0` MM/DD, `1` DD/MM, `2` MMM D, `3` YYYY-MM-DD), and
broadcast-hidden in bit 4 (`0` show, `1` hide). Bits 5–7 remain zero. Byte 6 and
bytes 15–19 retain their v3 meanings. New controls are supported by protocol v4;
v1–v3 decode with null values for these preferences and no new capabilities.

Commands `12` (`set_date_format`, argument 0–3) and `13`
(`set_show_broadcast`, argument 0/1) carry their argument in byte 5; bytes 6–19
must be zero. Requests and responses use the negotiated version. Update the app
JavaScript before using v4 firmware; older app decoders cannot read v4 frames.

Game date changes reformat the already cached local day without a fetch. Poll
publication dates retain their calendar day. Broadcast off suppresses the network
line and restores the single-footer layout. Final/missing broadcasts stay hidden
regardless of preference. Check all four date formats, paired/unpaired controls,
failed ACKs, reconnects and power-cycle persistence on hardware after upload.

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
its bottom-sheet picker remain separate. Named StyleSheets live in
`styles/TickerStyles`, grouped by component or screen. `hooks/TickerHooks` contains
the preference-based theme hook and favorite-team hook. Components keep dynamic
theme colors and measurements near their usage. BLE commands,
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
