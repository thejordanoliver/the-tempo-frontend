export type NewsPlayerScreen =
  | "baseball"
  | "basketball"
  | "football"
  | "hockey"
  | "mma"
  | "soccer";

export interface NewsPlayerTarget {
  screen: NewsPlayerScreen;
  playerId: string;
  league: string;
}

const PLAYER_TARGETS: Record<
  string,
  Pick<NewsPlayerTarget, "screen" | "league">
> = {
  mlb: { screen: "baseball", league: "mlb" },
  nba: { screen: "basketball", league: "nba" },
  wnba: { screen: "basketball", league: "wnba" },
  "mens-college-basketball": { screen: "basketball", league: "cbb" },
  "womens-college-basketball": { screen: "basketball", league: "wcbb" },
  nfl: { screen: "football", league: "nfl" },
  "college-football": { screen: "football", league: "cfb" },
  nhl: { screen: "hockey", league: "nhl" },
  mma: { screen: "mma", league: "mma" },
  ufc: { screen: "mma", league: "mma" },
  pfl: { screen: "mma", league: "mma" },
  soccer: { screen: "soccer", league: "SOCC" },
};

function isEspnHost(hostname: string): boolean {
  const normalizedHost = hostname.toLowerCase();
  return normalizedHost === "espn.com" || normalizedHost.endsWith(".espn.com");
}

export function getNewsPlayerTarget(link: string): NewsPlayerTarget | null {
  try {
    const url = new URL(link);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !isEspnHost(url.hostname)
    ) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const profileIndex = segments.findIndex(
      (segment) => segment === "player" || segment === "fighter",
    );

    if (
      profileIndex < 1 ||
      segments[profileIndex + 1] !== "_" ||
      segments[profileIndex + 2] !== "id"
    ) {
      return null;
    }

    const playerId = segments[profileIndex + 3];
    if (!playerId || !/^\d+$/.test(playerId)) return null;

    const section = segments
      .slice(0, profileIndex)
      .reverse()
      .find((segment) => PLAYER_TARGETS[segment]);
    const target = section ? PLAYER_TARGETS[section] : undefined;

    if (!target) return null;
    if (segments[profileIndex] === "fighter" && target.screen !== "mma") {
      return null;
    }

    return { ...target, playerId };
  } catch {
    return null;
  }
}
