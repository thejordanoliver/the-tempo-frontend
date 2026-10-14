import type { MLBPlayoffBracketResponse, MLBPlayoffLeague, MLBPlayoffRound, MLBPlayoffSeries, MLBPlayoffTeam } from "types/baseball/baseball";

export type Matchup = Pick<MLBPlayoffSeries, "id" | "label" | "bestOf" | "teams" | "winnerTeamId" | "games">;

export function findSeries(
  bracket: MLBPlayoffBracketResponse,
  league: MLBPlayoffLeague,
  round: MLBPlayoffRound,
) {
  return bracket.series.filter(
    (series) => series.league === league && series.round === round,
  );
}

export function seededMatchup(
  bracket: MLBPlayoffBracketResponse,
  league: Exclude<MLBPlayoffLeague, "world-series">,
  seeds: number[],
  label: string,
  bestOf: number,
): Matchup {
  return {
    id: `${league}-${seeds.join("-")}`,
    label,
    bestOf,
    teams: seeds
      .map((seed) =>
        bracket.teams.find(
          (team) => team.league === league && team.seed === seed,
        ),
      )
      .filter(Boolean) as MLBPlayoffTeam[],
    games: [],
    winnerTeamId: null,
  };
}

export function lowestKnownSeed(matchup: Matchup) {
  const seeds = matchup.teams
    .map((team) => team.seed)
    .filter((seed) => seed > 0);

  return seeds.length > 0 ? Math.min(...seeds) : Number.MAX_SAFE_INTEGER;
}

