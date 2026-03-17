export const LEAGUE_TABS = {
  NBA: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  NFL: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  MLB: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  NHL: ["scores", "news", "standings", "stats", "draft", "awards", "forum"],
  CFB: [
    "scores",
    "news",
    "rankings",
    "standings",
    "stats",
    "playoffs",
    "recruits",
    "awards",
    "forum",
  ],
  CBB: ["scores", "news", "rankings", "standings", "stats", "bracket", "awards", "forum"],
  WCBB: ["scores", "news", "rankings",  "standings", "stats", "draft", "awards", "forum"],
  MMA: ["fights", "news", "standings", "champions", "stats", "forum"],
} as const;

export type League = keyof typeof LEAGUE_TABS;

export type LeagueTab<L extends League> = (typeof LEAGUE_TABS)[L][number];
