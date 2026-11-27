import type { ResultItem, SearchSport } from "../../types/explore";

export const EXPLORE_SEARCH_MIN_QUERY_LENGTH = 2;
export const EXPLORE_SEARCH_MAX_QUERY_LENGTH = 80;

export function normalizeExploreSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function canSearchExploreQuery(query: string): boolean {
  const length = normalizeExploreSearchQuery(query).length;
  return (
    length >= EXPLORE_SEARCH_MIN_QUERY_LENGTH &&
    length <= EXPLORE_SEARCH_MAX_QUERY_LENGTH
  );
}

export function getExploreResultIdentity(item: ResultItem): string {
  if (item.type === "user") return `user:${item.id}`;
  // Soccer has one shared ID namespace across competitions and transfers.
  const league = item.sport === "soccer" ? "soccer" : item.league;
  return `${item.type}:${league}:${item.id}`;
}

// Only used when upgrading locally saved results from the old search contract.
const LEGACY_SPORT_BY_LEAGUE: Record<string, SearchSport> = {
  nba: "basketball",
  gleague: "basketball",
  wnba: "basketball",
  mcbb: "basketball",
  wcbb: "basketball",
  nfl: "football",
  cfb: "football",
  mlb: "baseball",
  cb: "baseball",
  sb: "baseball",
  nhl: "hockey",
  mch: "hockey",
  wch: "hockey",
  mcvb: "volleyball",
  wcvb: "volleyball",
  mma: "mma",
  soccer: "soccer",
};
const SEARCH_SPORTS = new Set(Object.values(LEGACY_SPORT_BY_LEAGUE));

export function parseRecentExploreSearches(value: string | null): ResultItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item): ResultItem[] => {
      if (!item || typeof item !== "object") return [];
      const raw = item as Record<string, unknown>;
      if (
        (typeof raw.id !== "number" && typeof raw.id !== "string") ||
        raw.id === "" ||
        (raw.type !== "team" && raw.type !== "player" && raw.type !== "user")
      )
        return [];
      if (raw.type === "user") return [raw as ResultItem];

      const legacyLeague =
        typeof raw.affiliation === "string" ? raw.affiliation : "";
      const league =
        typeof raw.league === "string" && raw.league.trim()
          ? raw.league.trim()
          : legacyLeague;
      const sport = SEARCH_SPORTS.has(raw.sport as SearchSport)
        ? raw.sport
        : LEGACY_SPORT_BY_LEAGUE[legacyLeague || league];
      if (!league || !sport) return [];

      const result = Object.fromEntries(
        Object.entries(raw).filter(
          ([key]) =>
            !["affiliation", "leagueKey", "is_active"].includes(key) &&
            !/^is[A-Z]+$/.test(key),
        ),
      );
      result.league = league;
      result.sport = sport;
      if (raw.type === "team") {
        result.fullName = raw.fullName ?? raw.full_name ?? null;
        result.shortName = raw.shortName ?? raw.short_name ?? null;
        delete result.full_name;
        delete result.short_name;
      } else {
        result.team = raw.team ?? null;
      }
      return [result as ResultItem];
    });
  } catch {
    return [];
  }
}
