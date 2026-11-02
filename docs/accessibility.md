# Accessibility

Shared controls use React Native accessibility roles, labels, and state. Keep
labels specific to the action. Text buttons should inherit their visible text;
icon-only buttons need an explicit label. Pass `accessibilityState.busy` for
pending operations and keep `disabled` aligned with the actual control state.

Use `MIN_TOUCH_TARGET` from `constants/styles.ts` for shared controls. Use the
theme's `secondaryText` token for secondary text on neutral surfaces. Keep font
scaling enabled, prefer minimum heights over fixed text-container heights, and
allow labels and modal actions to wrap. The bottom navigation height and content
inset share the same font-scale calculation.

Use `useReducedMotion` for decorative animation. It reads the device preference,
listens for changes, and supports Expo web's reduced-motion media preference.
Hidden controls must also be hidden from assistive technology and removed from
keyboard interaction. Skeleton primitives are decorative; their containing
screen should expose a single loading status where appropriate.

Team game cards for basketball, football, baseball, hockey, and soccer use
`getGameAccessibilityLabel` across list, grid, and stacked layouts. It consumes
backend-normalized data and announces full team names, progress, scores, and
dates. Upcoming, postponed, and canceled games must not announce placeholder
scores as results. Avoid live-region announcements on continuously updating
scores so they do not interrupt navigation.

## Verification

Automated checks:

```sh
npm run lint
npx tsc --noEmit
node --import tsx --test tests/gameAccessibility.test.ts tests/reducedMotion.test.mjs tests/themePreferences.test.mjs tests/tabStackRouteCoverage.test.ts
```

Device/browser checks still required before claiming an accessibility audit:

- With VoiceOver and TalkBack, traverse sign-in, sign-up, scores, leagues,
  explore, favorites, profile, forum, and messages. Verify meaningful labels,
  reading order, selected/checked states, and disabled actions.
- Open confirmations. Verify focus moves to the title, background content is
  isolated, both actions remain reachable, and the escape gesture dismisses.
- Increase system font size to the largest setting in both themes. Check forms,
  tab labels, game cards, news, and confirmation buttons for clipping. Ensure
  the enlarged bottom navigation does not obscure scroll content.
- Enable Reduce Motion and toggle it while the app is open. Check shared tab
  indicators, loaders, dropdowns, search, floating buttons, and menus.
- On web, navigate with Tab, Shift+Tab, Enter, and Space. Check visible focus,
  actionable labels, and that collapsed search and hidden floating buttons
  cannot receive keyboard focus.

These shared improvements do not constitute a full WCAG audit. Sport-specific
visualizations, media, remaining custom controls, and native screen-reader
behavior need separate device testing.
