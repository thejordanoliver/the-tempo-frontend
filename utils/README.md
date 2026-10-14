# Utilities

Keep helpers in the folder for the feature they support. Import the specific module directly; avoid barrel exports that pull unrelated dependencies into consumers.

- `auth/`: secure session storage and refresh race checks.
- `common/`: shared date and error helpers.
- `ui/`: colors, glass effects, images, and modals.
- `navigation/`: route parameters, tabs, and stack navigation.
- `explore/`, `widgets/`: search, feeds, carousels, and widget layout/persistence.
- `favorites/`: favorite sport/team selection and lookup.
- `games/`, `players/`, `teams/`, `stats/`: shared sports presentation helpers.
- `sports/`: baseball, basketball, football, hockey, and MMA helpers.
- `brackets/`: tournament/playoff selection and layout.
- `messages/`, `notifications/`, `profile/`, `forums/`, `news/`: feature helpers.

`apiClient.ts` remains the canonical backend client at `utils/apiClient.ts`; `apiConfig.ts` stays beside it. Backend requests belong in hooks or services. These folders are for existing helpers and view-specific mapping, not provider-data normalization.
