export const LEAGUE_TABS = {
  NBA: [
    "scores",
    "news",
    "standings",
    "playoffs",
    "stats",
    "draft",
    "awards",
    "forum",
  ],
  WNBA: ["scores", "news", "standings", "draft", "awards", "forum"],
  NFL: [
    "scores",
    "news",
    "standings",
    "playoffs",
    "stats",
    "draft",
    "awards",
    "forum",
  ],
  UFL: ["scores", "news", "standings", "stats", "forum"],
  MLB: ["scores", "news", "standings", "stats", "awards", "forum"],
  NHL: ["scores", "news", "standings", "stats", "awards", "forum"],
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
  CBB: [
    "scores",
    "news",
    "standings",
    "stats",
    "bracket",
    "recruits",
    "awards",
    "forum",
  ],
  WCBB: ["scores", "news", "standings", "stats", "bracket", "awards", "forum"],
  CB: ["scores", "news", "standings", "forum"],
  SB: ["scores", "news", "standings", "forum"],
  UFC: ["fights", "news", "champions"],
  MLS: ["scores", "news", "standings", "forum"],
  EPL: ["scores", "news", "standings", "forum"],
  EUROPA: ["scores", "news", "standings", "forum"],
  CHAMPIONS: ["scores", "news", "standings", "forum"],
  BUNDESLIGA: ["scores", "news", "standings", "forum"],
  LEAGUESCUP: ["scores", "news", "standings", "forum"],
  FIFA: ["scores", "news", "standings", "forum"],
  F1: ["scores", "news", "standings", "forum"],
  NASCARPREMIER: ["scores", "news", "standings", "forum"],
  NASCARSECONDARY: ["scores", "news", "standings", "forum"],
  NASCARTRUCK: ["scores", "news", "standings", "forum"],
  FIFAF: ["scores", "news", "standings", "forum"],
  FIFAW: ["scores", "news", "standings", "forum"],
} as const;

export const TEAM_TABS = {
  NBA: ["schedule", "news", "roster", "depth", "stats", "standings", "forum"],
  WNBA: ["schedule", "news", "roster", "stats", "standings", "forum"],
  NFL: ["schedule", "news", "roster", "depth", "stats", "standings", "forum"],
  MLB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CB: ["schedule", "news", "standings", "forum"],
  SB: ["schedule", "news", "standings", "forum"],
  NHL: ["schedule", "news", "roster", "stats", "standings", "forum"],
  CFB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  UFL: ["schedule", "news", "standings", "forum"],
  CBB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  WCBB: ["schedule", "news", "roster", "stats", "standings", "forum"],
  SOCC: ["schedule", "news", "roster"],
} as const;

export type League = keyof typeof LEAGUE_TABS;
export type Team = keyof typeof TEAM_TABS;

export type LeagueTab<L extends League> = (typeof LEAGUE_TABS)[L][number];

export type TeamTab<T extends Team> = (typeof TEAM_TABS)[T][number];

export function isLeague(value: string): value is League {
  return value in LEAGUE_TABS;
}

export function isTeam(value: string): value is Team {
  return value in TEAM_TABS;
}
export function normalizeLeagueParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return String(rawValue || "")
    .trim()
    .toUpperCase();
}
