# Forum audit: sharing and feed reliability

Reviewed the forum feed, post interactions, post destination route, and existing direct-message delivery integration.

## Fixed: Share button did not share anything

`components/Forum/PostItem/Interactions.tsx` previously invoked the share-count mutation immediately. No phone composer or in-app recipient selection appeared.

The button now opens `PostShareModal`, with a post preview, a vertical list of recent DM recipients with user search, confirmation through the existing alert modal before sending a DM, a horizontally scrolling row of circular external-share options for the native text-message composer and the system share sheet. DMs use `MessagesContext` so they retain socket delivery, REST fallback, cache updates, backend privacy enforcement, and idempotent message IDs. Failed sends retain their IDs across reopening the sheet. Shared DMs provide a button to open the post route.

Opening or cancelling the sheet does not increment shares. Confirmed SMS sends and successful DMs for other users’ posts invoke the existing backend share mutation. Sharing your own post still delivers the message but does not record a share. The backend independently prevents self-share records and counter increments, including requests from older clients. If share-count tracking fails after delivery, the feedback explains that delivery succeeded. Android returns an unknown SMS outcome, which is deliberately not counted as confirmed delivery ([Expo SMS documentation](https://docs.expo.dev/versions/v57.0.0/sdk/sms/)).

## Outstanding: Repeated pagination requests can duplicate posts (P2)

In `hooks/ForumHooks/useForum.ts`, `fetchPosts` sets `loading` only for page 1, and `loadMore` gates on that flag. Repeated end-of-list events while page 2 is pending can fetch page 2 multiple times. Every response appends its posts without deduplicating IDs.

Recommended follow-up: track pagination requests with a synchronous pending guard, deduplicate appended posts by ID, and test repeated end-of-list events and refresh during pagination.

## Outstanding: Stale responses can replace another forum's feed (P2)

`useForum` does not cancel requests or check request identity before writing posts, pagination, errors, or loading flags. If the league/team changes while a request is pending, an older response can populate the newer forum. A pagination response can also append old posts after a refresh.

Recommended follow-up: scope requests to league/team and a refresh generation, cancel superseded requests, and reject responses from obsolete generations.

## Link and platform limitations

New shares use `tempo://post/[postId]`. The legacy `nbascorestracker` scheme remains registered, and existing DM links still open. Recipients need Tempo installed. The Expo configuration currently has no associated domains or Android HTTPS intent filters; public HTTPS share pages and universal links require a separately configured public domain.

`expo-sms` is now an SDK-compatible dependency. A custom native development/release app must be rebuilt to include it and register the new Tempo scheme. Browser and iOS simulator SMS attempts show an unavailable message; they still support Tempo DMs. Phone composer behavior needs real-device verification.

The iOS option displays a Messages-style icon for the system SMS composer. On Android, the local `tempo-messaging` Expo module reads the selected default SMS app’s public label and actual icon through `Telephony.Sms.getDefaultSmsPackage` and `PackageManager`. It declares only the scoped SMS-delivery package query, with no SMS/contact permissions ([Android API reference](https://developer.android.com/reference/android/provider/Telephony.Sms#getDefaultSmsPackage(android.content.Context))). Expo Go/older builds use a generic SMS icon; Android must be rebuilt to include the local module. Native icon behavior has not been verified on a device.

## Verification

- 23 focused frontend tests pass, covering post links, SMS outcomes, unsupported devices, DM privacy failure/retry identifiers, stale recipient search, and existing forum mutation/delivery behavior.
- Full lint passes with no errors.
- Full TypeScript checking reports existing sports/profile errors and none in the sharing changes.

- Web export is blocked by an existing native-only `react-native-pager-view` import in `app/edit-favorites.tsx`. No visual/device verification was completed.
- iOS production bundle export succeeds.
- Expo confirms both URL schemes and discovers the local Android messaging module through autolinking. Android native compilation/device testing was not run (no Android SDK available in this environment).
- All 22 backend forum-route tests pass, including a self-share that preserves an existing share count and inserts no share record. Backend TypeScript checking passes.
