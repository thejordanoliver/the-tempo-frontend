export const LEAGUE_TABS = {
  NBA: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  NFL: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  MLB: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  NHL: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  CFB: [
    "scores",
    "news",
    "standings",
    "stats",
    "playoffs",
    "recruits",
    "awards",
    "forum",
  ],
  CBB: ["scores", "news", "standings", "stats", "bracket", "awards", "forum"],
  WCBB: ["scores", "news", "standings", "stats", "bracket", "awards", "forum"],
  MMA: ["fights", "news", "standings", "champions", "stats", "forum"],
} as const;

export const TEAM_TABS = {
  NBA: ["schedule", "news", "roster", "stats", "standings", "forum"],
  NFL: ["schedule", "news", "roster", "stats", "standings", "forum"],
  MLB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  NHL: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CFB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CBB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  WCBB: ["schedule", "news", "roster", "stats", "standings", "forum"],
} as const;

export type League = keyof typeof LEAGUE_TABS;
export type Team = keyof typeof TEAM_TABS;

export type LeagueTab<L extends League> = (typeof LEAGUE_TABS)[L][number];
export type TeamTab<T extends Team> = (typeof TEAM_TABS)[T][number];

