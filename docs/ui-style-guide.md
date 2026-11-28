# Tempo UI Style Guide

Read this before proposing or implementing a redesign or new UI. Start with the
current screen, its styles, and the closest shared component below. Follow the
current implementation for token values and component APIs. Update this guide
when an approved redesign changes a shared pattern.

## Visual foundation

- **Hierarchy.** Tempo is a mobile-first sports app. Make the matchup, score,
  game status, or primary action easy to find at a glance. Keep rows compact,
  align comparable values, and use smaller type for supporting details such as
  records, ranks, and timestamps. Give stat tables and feeds room to scan.
- **Surfaces.** Use `Colors` from [constants/styles.ts](../constants/styles.ts).
  `background` is white in light mode and charcoal in dark mode.
  `itemBackground` (`#eee` / `#2e2e2e`) separates cards, inputs, and selected
  surfaces where the existing component uses it. Use `text` and `secondaryText`
  for readable text on neutral surfaces. Use the appropriate theme-specific
  token for feedback and verify its contrast on the actual surface.
- **Theme.** Derive styling from `usePreferences().resolvedColorScheme` in
  [PreferencesContext](../contexts/PreferencesContext.tsx). The preference
  supports Light, Dark, and System. The [root layout](../app/_layout.tsx) applies
  the resolved theme to navigation, the status bar, and the system background.
- **Type.** Use Oswald through `Fonts` and use `globalStyles(isDark)` for shared
  text roles. Section and page headings carry more weight. Supporting text stays
  compact. Use the existing uppercased labels and tab styling where appropriate.

| Shared role              | Size / line height | Oswald weight  |
| ------------------------ | ------------------ | -------------- |
| `heading`                | 28 / 34            | Bold           |
| `subheading`             | 22 / 28            | Bold           |
| `title`                  | 20 / 26            | Bold           |
| `subtitle`, `textMedium` | 16 / 22            | Medium         |
| `text`                   | 16 / 22            | Regular        |
| `secondaryText`          | 14 / 20            | Regular        |
| `caption`, `label`       | 12 / 16            | Regular/Medium |

- **Spacing and shape.** Follow the owning stylesheet. Common starting points
  are 12-point horizontal gutters, 8–12-point gaps, and 8-point corners on
  compact cards. Shared buttons use 12-point corners. Use thin dividers for
  dense rows and pill shapes for existing segmented controls and badges.
- **Color and imagery.** Keep general navigation and controls neutral. Reuse
  league and team logos from the existing `constants/` lookup helpers and
  `assets/` collections. Keep logos contained and preserve their aspect ratio.
  Follow the owning game component for live, final, and scheduled treatments.
  Reuse team-color treatments from [TeamBackground](../components/CustomHeader/TeamBackground.tsx) and
  [GameHeader](../components/CustomHeader/GameHeader.tsx) on matching surfaces.
  Check text over the actual team colors and missing-image fallbacks.

## Shared components

- **Headers.** Reuse the route's header variant and action placement. The
  shared header covers home, league, team, game, profile, auth, and messages.
  [CustomHeader](../components/CustomHeader/CustomHeader.tsx) ·
  [CustomHeaderStyles](../styles/CustomHeaderStyles.ts)
- **Bottom navigation.** The blurred Home, Leagues, Explore, and Profile bar
  pairs labels with outline and filled icons for selection. Apply the shared
  content inset to scrolling content where the bar overlays it.
  [NavigationBar](../components/NavigationBar.tsx) ·
  [useNavigationBarContentStyle](../hooks/useNavigationBarContentStyle.ts)
- **Section headings.** Reuse the closest title, divider, or collapsible
  subheading. [Headings](../components/Headings)
- **Tabs and filters.** Use the underlined variants for section navigation,
  pills for segmented choices, and the Home/Away control for team splits. Keep
  the indicator in sync with pager gestures where used.
  [TabBar](../components/TabBars/TabBar.tsx) ·
  [MainTabScrollBar](../components/TabBars/MainTabScrollBar.tsx) ·
  [PillTabs](../components/TabBars/PillTabs.tsx) ·
  [HomeAwayTabBar](../components/TabBars/HomeAwayTabBar.tsx)
- **Buttons, forms, and search.** Use the shared filled, outline, and text
  actions, auth forms, field components, and search input. Follow the feature's
  existing icon family and weight. [Button](../components/Buttons/Button.tsx) ·
  [Forms](../components/Forms) · [FormStyles](../styles/FormStyles.ts) ·
  [Inputs](../components/Inputs) ·
  [BaseSearchInput](../components/SearchBars/BaseSearchInput.tsx)
- **Confirmations, previews, and pickers.** Reuse the confirmation modal for
  standard and destructive actions. Browse the owning feature and each sport's
  `GamePreview` for existing sheets, pickers, and game previews.
  [ConfirmModal](../components/ConfirmModal.tsx) ·
  [ModalsStyles](../styles/ModalsStyles)
- **Loading, empty, and error states.** Match the loaded layout with the
  existing screen or card skeleton. Use `globalStyles` empty and error styles
  where the feature has no established equivalent. [Skeletons](../components/Skeletons)

## References by feature

- **Home and scores.** Review the favorites strip and For You feed alongside
  the sport's game cards. Where supported, check `list`, `grid`, and `stacked`
  layouts with their matching skeletons. [Home](<../app/(tabs)/(home)/index.tsx>) ·
  [FavoritesScroll](../components/Favorites/FavoritesScroll.tsx) ·
  [ForYouFeed](../components/Home/ForYouFeed.tsx) ·
  [LeagueGamesList](../components/League/Games/LeagueGamesList.tsx) ·
  [GamecardStyles](../styles/GamecardStyles)
- **Leagues and schedules.** Check list and carousel preferences, the relevant
  date or event selector, and the standings, leaders, recruiting, or playoff
  presentation. [Leagues](<../app/(tabs)/(league)/league.tsx>) ·
  [LeagueCarousel](../components/League/LeagueCarousel.tsx) ·
  [LeagueList](../components/League/LeagueList.tsx) ·
  [LeagueStyles](../styles/LeagueStyles) · [Playoff bracket](playoff-bracket.md)
- **Game details.** Keep the matchup header and status easy to find. Follow
  the sport's line score, box score, live plays, and visualization patterns.
  [Sport routes](<../app/(tabs)/(home)/game>) · [Sports components](../components/Sports) ·
  [GameDetailStyles](../styles/GameDetailStyles) · [NBA visualizations](nba-visualizations.md)
- **Team and player pages.** Match existing imagery, tabs, and stat layouts for
  the sport. [TeamDetailScreen](../components/Team/TeamDetailScreen.tsx) ·
  [PlayerHeader](../components/Player/PlayerHeader.tsx) ·
  [PlayerDetailsPager](../components/Player/PlayerDetailsPager.tsx) ·
  [TeamStyles](../styles/TeamStyles) · [PlayerStyles](../styles/PlayerStyles)
- **Explore and favorites.** Check search states, widget sizes, editing and
  reordering, and team selection cues. Review the separate implementation for
  iOS home-screen widgets. [Explore](<../app/(tabs)/(explore)/explore.tsx>) ·
  [ExploreWidgetDashboard](../components/Explore/ExploreWidgetDashboard.tsx) ·
  [ExploreStyles](../styles/ExploreStyles) · [Favorites](../components/Favorites) ·
  [Device game widgets](device-game-widgets.md)
- **Predictions and badges.** Check how the current view communicates
  selection, results, and badge tiers. [FanPrediction](../components/FanPrediction) ·
  [FanPredictionStyles](../styles/FanPredictionStyles) · [Badges](../components/Badges) ·
  [ProfileBadgeSectionStyles](../styles/ProfileStyles/ProfileBadgeSectionStyles.ts)
- **Profile, settings, and auth.** Reuse banner and avatar treatments, settings
  rows, and form focus, validation, and disabled states.
  [Profile](<../app/(tabs)/(profile)/profile.tsx>) ·
  [Profile components](../components/Profile) · [SettingsStyles](../styles/SettingsStyles.ts) ·
  [Login](../app/login.tsx) · [FormStyles](../styles/FormStyles.ts)
- **Forum, news, and messages.** Preserve the hierarchy of author, content,
  and actions. Check media, composer focus, and keyboard insets.
  [Forum](../components/Forum) · [ForumStyles](../styles/ForumStyles) ·
  [News](../components/News) · [NewsStyles](../styles/NewsStyles) ·
  [Messages](../components/Messages) · [MessageStyles](../styles/MessageStyles)
- **Notifications.** Compare banner and notification center treatments.
  [Notifications](../components/Notifications) ·
  [NotificationCenterStyles](../styles/NotificationCenterStyles.ts)
- **Ticker and development previews.** On branches with ticker support, check
  `components/Ticker` and `styles/TickerStyles`. When present, use the
  development routes `/design-preview/ticker` and
  `/design-preview/notification-banners` to preview those surfaces.

## Redesign workflow

1. Trace the Expo Router route to the implementation. Several routes share the
   same screen or component across tab stacks. Check its callers before changing
   shared styling so the change reaches the intended scope.
2. Reuse the components and tokens above. Keep feature styling in the owning
   style module or component, and preserve navigation, data, and interactions
   unless the request changes them.
3. Check Light, Dark, and System, plus a narrow viewport and larger text. Ensure
   content clears the safe areas, bottom navigation, and keyboard. Use
   `MIN_TOUCH_TARGET` for shared controls, label icon-only actions, expose
   selected, disabled, and busy states, and keep scores and statuses readable
   through text or an accessible label. Use [useReducedMotion](../hooks/useReducedMotion.ts)
   for decorative movement. Follow [Accessibility](accessibility.md) for device
   and web checks.
4. Verify the states the redesign touches. On sports screens, check scheduled,
   live, final, and postponed or canceled states when supported. Exercise
   loading, empty, error, long labels, missing images, and active controls where
   applicable. Use the repository commands in [AGENTS.md](../AGENTS.md) and
   visually check the change on the relevant Expo platform. For pager, modal,
   gesture, or keyboard changes, include native and web checks where supported.
