import type { FanPredictionPick } from "types/fanPredictions";

/** Supply the same initial game data as a normal scoreboard card. */
export function getPredictionGameHref(pick: FanPredictionPick) {
  const snapshot = pick.game?.sport === pick.sport ? pick.game : undefined;
  const home = { ...pick.home, ...snapshot?.home };
  const away = { ...pick.away, ...snapshot?.away };
  const game = {
    ...snapshot,
    id: pick.gameId,
    league: { code: pick.league },
    date: snapshot?.date || pick.startsAt,
    home,
    away,
    status: snapshot?.status ?? {
      state: pick.state,
      description: pick.statusDescription,
    },
    ...(pick.sport === "mma" && snapshot?.sport !== "mma"
      ? {
          competitors: [
            { ...home, homeAway: "home" },
            { ...away, homeAway: "away" },
          ],
        }
      : {}),
  };

  return {
    pathname: "/game/[sport]/[game]" as const,
    params: {
      sport: pick.sport,
      game: pick.gameId,
      league: pick.league,
      leagueId: pick.league,
      date: pick.startsAt,
      data: encodeURIComponent(JSON.stringify(game)),
    },
  };
}
