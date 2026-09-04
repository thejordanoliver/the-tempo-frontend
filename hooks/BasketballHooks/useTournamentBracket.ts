// hooks/BasketballHooks/useTournamentBracket.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type TournamentLeagueInfo = {
  id: number;
  uid: string;
  code: string;
  name: string;
  slug: string;
};

export type TournamentRoundCode =
  | "OPENING"
  | "ROUND_OF_64"
  | "ROUND_OF_32"
  | "SWEET_16"
  | "ELITE_8"
  | "FINAL_4"
  | "CHAMPIONSHIP";

export type TournamentHomeAway = "home" | "away";

export type TournamentTeam = {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logo: string | null;
  seed: number | null;
  score: number | null;
  winner: boolean | null;
  homeAway: TournamentHomeAway;
};

export type TournamentVenue = {
  id: string;
  name: string;
  city: string;
  state: string;
  indoor: boolean;
};

type TournamentApiGame = {
  id: string;
  tournamentId: string;
  regionId: string | null;
  regionName: string | null;
  round: TournamentRoundCode;
  roundLabel: string;
  roundOrder: number;
  date: string | null;
  status: string;
  statusText: string | null;
  teams: TournamentTeam[];
  winnerTeamId: string | null;
  venue: TournamentVenue | null;
  broadcast: string | null;
  headline: string | null;
};

export type TournamentGame = Omit<TournamentApiGame, "teams"> & {
  homeTeam: TournamentTeam | null;
  awayTeam: TournamentTeam | null;
};

type TournamentApiRound = {
  round: TournamentRoundCode;
  label: string;
  order: number;
  games: TournamentApiGame[];
};

export type TournamentRound = {
  round: TournamentRoundCode;
  label: string;
  order: number;
  games: TournamentGame[];
};

export type TournamentMetadata = {
  source: string;
  fetchedAt: string;
  totalGames: number;
  warnings: string[];
};

type TournamentApiData = {
  tournamentId: string;
  tournamentName: string;
  season: number;
  competition: string;
  rounds: TournamentApiRound[];
  metadata: TournamentMetadata;
};

export type TournamentData = {
  tournamentId: string;
  tournamentName: string;
  season: number;
  competition: string;
  rounds: TournamentRound[];
  metadata: TournamentMetadata;
};

type TournamentApiResponse = {
  success: boolean;
  league: string;
  leagueInfo: TournamentLeagueInfo;
  data: TournamentApiData;
  error?: string;
};

export type TournamentRegion = {
  id: string;
  name: string;
  order: number;
  games: TournamentGame[];
};

export type UseTournamentBracketResult = {
  tournament: TournamentData | null;

  tournamentName: string | null;
  competition: string | null;

  league: string;
  leagueInfo: TournamentLeagueInfo | null;

  rounds: TournamentRound[];
  games: TournamentGame[];
  regions: TournamentRegion[];

  openingRoundGames: TournamentGame[];
  finalFourGames: TournamentGame[];
  championshipGame: TournamentGame | null;

  metadata: TournamentMetadata | null;
  warnings: string[];

  loading: boolean;
  refreshing: boolean;
  error: string | null;

  refresh: () => Promise<void>;
};

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const EMPTY_ROUNDS: TournamentRound[] = [];
const EMPTY_GAMES: TournamentGame[] = [];
const EMPTY_REGIONS: TournamentRegion[] = [];
const EMPTY_WARNINGS: string[] = [];

const REGION_ORDER = new Map<string, number>([
  ["east", 0],
  ["south", 1],
  ["west", 2],
  ["midwest", 3],
]);

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorMessage = (error: unknown): string => {
  if (!isRecord(error)) {
    return "Something went wrong.";
  }

  const response = error.response;

  if (isRecord(response) && isRecord(response.data)) {
    const message = response.data.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  if ("request" in error) {
    return "Network error.";
  }

  return "Something went wrong.";
};

const normalizeGame = (game: TournamentApiGame): TournamentGame => {
  const homeTeam = game.teams.find((team) => team.homeAway === "home") ?? null;

  const awayTeam = game.teams.find((team) => team.homeAway === "away") ?? null;

  const { teams: _teams, ...gameData } = game;

  return {
    ...gameData,
    homeTeam,
    awayTeam,
  };
};

const normalizeTournament = (data: TournamentApiData): TournamentData => ({
  tournamentId: data.tournamentId,
  tournamentName: data.tournamentName,
  season: data.season,
  competition: data.competition,
  rounds: data.rounds.map((round) => ({
    round: round.round,
    label: round.label,
    order: round.order,
    games: round.games.map(normalizeGame),
  })),
  metadata: data.metadata,
});

const getRoundGames = (
  rounds: readonly TournamentRound[],
  roundCode: TournamentRoundCode,
): TournamentGame[] =>
  rounds.find((round) => round.round === roundCode)?.games ?? EMPTY_GAMES;

const buildRegions = (games: readonly TournamentGame[]): TournamentRegion[] => {
  if (games.length === 0) {
    return EMPTY_REGIONS;
  }

  const regionMap = new Map<string, TournamentRegion>();

  for (const game of games) {
    if (!game.regionId || !game.regionName) {
      continue;
    }

    const existingRegion = regionMap.get(game.regionId);

    if (existingRegion) {
      existingRegion.games.push(game);
      continue;
    }

    regionMap.set(game.regionId, {
      id: game.regionId,
      name: game.regionName,
      order: REGION_ORDER.get(game.regionId.toLowerCase()) ?? 99,
      games: [game],
    });
  }

  return Array.from(regionMap.values()).sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.name.localeCompare(b.name);
  });
};

/* -------------------------------------------------------------------------- */
/*                                    Hook                                    */
/* -------------------------------------------------------------------------- */

export function useTournamentBracket(
  league: string,
  season: number,
): UseTournamentBracketResult {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<TournamentLeagueInfo | null>(
    null,
  );
  const [responseLeague, setResponseLeague] = useState(
    league.trim().toLowerCase(),
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchTournament = useCallback(
    async (refreshingRequest = false): Promise<void> => {
      const normalizedLeague = league.trim().toLowerCase();

      if (!normalizedLeague || !Number.isInteger(season) || season <= 0) {
        requestIdRef.current += 1;

        setTournament(null);
        setLeagueInfo(null);
        setResponseLeague(normalizedLeague);
        setLoading(false);
        setRefreshing(false);
        setError("A valid league and season are required.");

        return;
      }

      const requestId = ++requestIdRef.current;

      try {
        if (refreshingRequest) {
          setRefreshing(true);
        } else {
          setLoading(true);
          setTournament(null);
          setLeagueInfo(null);
          setResponseLeague(normalizedLeague);
        }

        setError(null);

        const response = await apiClient.get<TournamentApiResponse>(
          `api/games/basketball/${normalizedLeague}/tournament`,
          {
            params: { season },
          },
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        const payload = response.data;

        if (!payload.success || !payload.data) {
          throw new Error(
            payload.error || "Tournament data could not be loaded.",
          );
        }

        setTournament(normalizeTournament(payload.data));
        setLeagueInfo(payload.leagueInfo);
        setResponseLeague(payload.league);
      } catch (fetchError: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!refreshingRequest) {
          setTournament(null);
          setLeagueInfo(null);
        }

        setError(getErrorMessage(fetchError));
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, season],
  );

  useEffect(() => {
    void fetchTournament();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchTournament]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchTournament(true);
  }, [fetchTournament]);

  const rounds = tournament?.rounds ?? EMPTY_ROUNDS;

  const games = useMemo(() => rounds.flatMap((round) => round.games), [rounds]);

  const regions = useMemo(() => buildRegions(games), [games]);

  const openingRoundGames = useMemo(
    () => getRoundGames(rounds, "OPENING"),
    [rounds],
  );

  const finalFourGames = useMemo(
    () => getRoundGames(rounds, "FINAL_4"),
    [rounds],
  );

  const championshipGame = useMemo(
    () => getRoundGames(rounds, "CHAMPIONSHIP")[0] ?? null,
    [rounds],
  );

  const metadata = tournament?.metadata ?? null;
  const warnings = metadata?.warnings ?? EMPTY_WARNINGS;

  return {
    tournament,

    tournamentName: tournament?.tournamentName ?? null,
    competition: tournament?.competition ?? null,

    league: responseLeague,
    leagueInfo,

    rounds,
    games,
    regions,

    openingRoundGames,
    finalFourGames,
    championshipGame,

    metadata,
    warnings,

    loading,
    refreshing,
    error,

    refresh,
  };
}
