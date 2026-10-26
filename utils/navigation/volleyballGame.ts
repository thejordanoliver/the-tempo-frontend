import type {
  VolleyballGame,
  VolleyballLeagueKey,
} from "../../types/volleyball/volleyball";

export function getVolleyballLeagueKey(
  value: unknown,
): VolleyballLeagueKey | null {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["mcvb", "401", "mens-college-volleyball"].includes(key)) return "mcvb";
  if (["wcvb", "402", "womens-college-volleyball"].includes(key)) return "wcvb";
  return null;
}

export function getVolleyballGameRoute(game: VolleyballGame) {
  return {
    pathname: "/game/volleyball/[game]" as const,
    params: {
      game: String(game.id),
      league: game.league.code,
      leagueId: String(game.league.id),
      data: encodeURIComponent(JSON.stringify(game)),
    },
  };
}

type Params = {
  game?: string | string[];
  data?: string | string[];
  league?: string | string[];
  leagueId?: string | string[];
};
const first = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export function getVolleyballGameParams(
  params: Params,
  initialGame?: VolleyballGame,
) {
  let game = initialGame;
  if (!game) {
    const raw = first(params.data) ?? first(params.game);
    if (raw) {
      try {
        game = JSON.parse(decodeURIComponent(raw)) as VolleyballGame;
      } catch {
        /* A game ID is also a valid route parameter. */
      }
    }
  }
  const routeId = first(params.game);
  const id =
    routeId && /^\d+$/.test(routeId) ? routeId : String(game?.id ?? "");
  const matches = String(game?.id) === id;
  const explicitLeague = first(params.league) ?? first(params.leagueId);
  const league =
    explicitLeague !== undefined
      ? getVolleyballLeagueKey(explicitLeague)
      : matches
        ? getVolleyballLeagueKey(game?.league?.code ?? game?.league?.id)
        : null;
  return { gameId: /^[1-9]\d*$/.test(id) ? id : "", league };
}
