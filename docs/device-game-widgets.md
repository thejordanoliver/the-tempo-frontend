# Device game widgets

Tempo's **Favorite Games** Home Screen widget uses `expo-widgets` on iOS. Small
and medium sizes show the highest-priority favorite-team game; large shows up to
three. Live games come first, followed by the closest upcoming or completed
games, matching Explore. Before kickoff, team records replace scores.

## Build and add

To check widgets on a connected iPad without a Metro connection, run:

```bash
npm run ios:device
```

Choose the connected iPad when prompted. To target a particular device directly,
append `-- --device <device-udid>`.
This command builds and installs a Release app with its JavaScript included,
using `EXPO_PUBLIC_API_URL` from `.env` for the hosted backend. The iPad needs
internet access for backend data, but it does not need to reach the Mac's
development servers.

Physical iPhone and iPad builds need provisioning profiles for both the app and
widget that include the same App Group. Select the appropriate team for both
`thetempo` and `ExpoWidgetsTarget` in Xcode under **Signing & Capabilities**, with
automatic signing enabled and `group.com.jordanoliver.thetempo` selected for both
targets. Verify the generated profiles before concluding that a different team
or membership is needed. An iOS/iPadOS simulator can test the widget without
device provisioning.

1. Build the native iOS app with `npx expo run:ios`, or your usual EAS iOS build.
   To install on a connected iPad, use `npx expo run:ios --device` and select it.
   The widget extension requires a new native build after changes to `app.json`.
2. Open Tempo, sign in, and add favorite teams. This registers the widget layout
   and shares its first timeline with the extension.
3. Long-press the iPhone or iPad Home Screen, choose **Edit → Add Widget**, search for
   **Tempo** (the app's current display name is **the-tempo**), and select
   **Favorite Games** at the desired size.
4. Long-press a placed widget and choose **Edit Widget** to select a league.
   Multiple widget instances can show different leagues.

Tap a game to open its details. The widget follows Tempo's light/dark preference;
when the preference is System, it follows the widget's appearance.

If a debug build shows **No script URL provided**, keep Metro running on the Mac,
connect the iPad to the same reachable network, and allow Tempo under
**Settings → Privacy & Security → Local Network**. The app declares
`NSLocalNetworkUsageDescription` so it can request this access. Reopen the app
after granting permission. Check `http://<Mac LAN IP>:8081/status` in iPad Safari;
a reachable Metro server responds with `packager-status:running`.
If it does not load in Safari, check that both devices are on a network that lets
them communicate; guest-network isolation and VPN routing can prevent this.
If iPadOS refuses to launch an otherwise valid signed build, check the developer
trust status under **Settings → General → VPN & Device Management**.

## Updates and data

The existing Explore provider requests normalized backend games through
`services/exploreWidgetsApi.ts` and `apiClient`. On native iOS builds it also
loads games when the Explore tab is closed, including when there are no game
cards on the Explore board. The existing sports socket subscriptions update the
shared cache while Tempo is active. Native timeline writes are limited to once
every 15 seconds, with immediate writes for account/favorite/theme changes and
when the app backgrounds. Sign-out immediately clears shared game data.

The widget does not make network requests in its isolated runtime. Opening or
returning to Tempo refreshes the cache when stale. A future timeline entry marks
cached scores as old after 15 minutes and asks the user to open Tempo to refresh.
Continuous updates while the app is suspended would require separate background
or server push work; this implementation does not claim to provide them.

The native module is checked before loading the widget. Expo Go, web, and Android
continue to use the app normally without registering a device widget. Android's
experimental plugin is not enabled.

Widget push updates are explicitly disabled. The local config plugin
`plugins/withDeviceWidgetEntitlements.js` removes the unnecessary
`aps-environment` entitlement added by Expo Widgets 57.0.27 when push updates
are disabled, while retaining the required App Group. If push updates are
enabled in the future, the plugin preserves the push entitlement.

## Verify

Run `node --import tsx --test tests/deviceGameWidget.test.mjs tests/widgetDataLoading.test.mjs`
and `npx tsc --noEmit`. On an iOS development build, check all three sizes, league
selection, game links for each sport, appearance, app background/resume, removal
of favorites, sign-out, and switching accounts.
