export const LEAGUE_TABS = {
  NBA: ["scores", "news", "standings", "playoffs", "stats", "draft", "awards", "forum"],
  WNBA: ["scores", "news", "standings", "playoffs", "stats", "draft", "awards", "forum"],
  NFL: ["scores", "news", "standings", "playoffs", "stats", "draft", "awards", "forum"],
  UFL: ["scores", "news", "standings", "stats", "forum"],
  MLB: ["scores", "news", "standings", "stats", "awards", "forum"],
  NHL: ["scores", "news", "standings", "playoffs", "stats", "forum"],
  CFB: ["scores", "news", "standings", "stats", "recruits", "awards", "forum"],
  CBB: ["scores", "news", "standings",  "stats", "bracket",  "recruits", "awards", "forum"],
  WCBB: ["scores", "news", "standings", "stats", "bracket",  "awards", "forum"],
  CB: ["scores", "news", "standings", "forum"],
  SB: ["scores", "news", "standings", "forum"],
  MMA: ["news", "fights", "champions"],
  MLS: ["scores", "news", "standings", "forum"],
  EPL: ["scores", "news", "standings", "forum"],
  EUROPA: ["scores", "news", "standings", "forum"],
  CHAMPIONS: ["scores", "news", "standings", "forum"],
  BUNDESLIGA: ["scores", "news", "standings", "forum"],
  FIFA: ["scores", "news", "standings", "forum"],
  FIFAF: ["scores", "news", "standings", "forum"],
  FIFAW: ["scores", "news", "standings", "forum"],
} as const;

export const TEAM_TABS = {
  NBA: ["schedule", "news", "roster", "stats", "standings", "forum"],
  WNBA: ["schedule", "news", "roster", "stats", "standings", "forum"],
  NFL: ["schedule", "news", "roster", "stats", "standings", "forum"],
  MLB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CB: ["schedule", "news", "standings", "forum"],
  SB: ["schedule", "news", "standings", "forum"],
  NHL: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CFB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CBB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  WCBB: ["schedule", "news", "roster", "stats", "standings", "forum"],
} as const;

export type League = keyof typeof LEAGUE_TABS;
export type Team = keyof typeof TEAM_TABS;

export type LeagueTab<L extends League> = (typeof LEAGUE_TABS)[L][number];
export type TeamTab<T extends Team> = (typeof TEAM_TABS)[T][number];
