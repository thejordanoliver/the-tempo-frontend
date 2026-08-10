// hooks/BasketballHooks/useTournamentBracket.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type TournamentLeagueInfo = {
  id: number;
  uid: string;
  code: string;
  name: string;
  slug: string;
};

export type TournamentTeam = {
  id?: string | number;
  databaseId?: string | number | null;
  database_id?: string | number | null;
  dbId?: string | number | null;
  db_id?: string | number | null;
  teamDatabaseId?: string | number | null;
  team_database_id?: string | number | null;
  wcbbTeamId?: string | number | null;
  wcbb_team_id?: string | number | null;
  espnId?: string | number | null;
  espn_id?: string | number | null;
  espnTeamId?: string | number | null;
  espn_team_id?: string | number | null;
  name?: string;
  shortName?: string;
  abbreviation?: string;
  seed?: number | null;
  score?: number | string | null;
  winner?: boolean | null;
  logo?: string | null;
  record?: string | null;
};

export type TournamentVenue = {
  id: string | null;
  name: string | null;
  city: string | null;
  state: string | null;
  indoor: boolean | null;
};

export type TournamentGame = {
  id: string;
  tournamentId: string;
  regionId: string | null;
  regionName: string | null;
  round: string;
  roundLabel: string;
  roundOrder: number;
  gameOrder: number;
  bracketSlot: string | number | null;

  /*
   * The API returns each team as an object.
   * It may return an empty object when team data is unavailable.
   */
  topTeam: TournamentTeam;
  bottomTeam: TournamentTeam;

  winnerTeamId: string | null;
  topSourceGameId: string | null;
  bottomSourceGameId: string | null;
  nextGameId: string | null;
  nextGamePosition: string | null;

  destinationRegionId: string | null;
  destinationRound: string | null;
  destinationSeed: number | null;

  date: string | null;
  status: string;
  statusText: string | null;
  venue: TournamentVenue | null;
  broadcast: string | null;
  headline: string | null;
};

export type TournamentRound = {
  id?: string;
  name?: string;
  label?: string;
  round?: string;
  roundLabel?: string;
  roundOrder?: number;
  games?: TournamentGame[];
  [key: string]: unknown;
};

export type TournamentRegion = {
  id?: string;
  regionId?: string;
  name?: string;
  regionName?: string;
  rounds?: TournamentRound[];
  games?: TournamentGame[];
  [key: string]: unknown;
};

export type TournamentMetadata = {
  source: string;
  fetchedAt: string;
  totalGames: number;
  warnings: string[];
};

export type TournamentData = {
  tournamentId: string;
  tournamentName: string;
  season: number;
  competition: string;
  openingRoundLabel: string;
  regions: TournamentRegion[];
  openingRoundGames: TournamentGame[];
  finalFourGames: TournamentGame[];
  championshipGame: TournamentGame | null;
  metadata: TournamentMetadata;
};

export type TournamentResponse = {
  success: boolean;
  league: string;
  leagueInfo: TournamentLeagueInfo;
  data: TournamentData;
  error?: string;
};

export type TournamentRoundsMap = Record<string, TournamentGame[]>;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isTournamentGame = (value: unknown): value is TournamentGame => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.round === "string" &&
    typeof value.roundLabel === "string"
  );
};

/**
 * Recursively finds games inside the tournament data.
 *
 * This supports:
 * - openingRoundGames
 * - games nested inside regions/rounds
 * - finalFourGames
 * - championshipGame
 */
const collectTournamentGames = (
  tournament: TournamentData,
): TournamentGame[] => {
  const gamesById = new Map<string, TournamentGame>();
  const visited = new WeakSet<object>();

  const visit = (value: unknown) => {
    if (value === null || value === undefined) {
      return;
    }

    if (isTournamentGame(value)) {
      gamesById.set(value.id, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value) || visited.has(value)) {
      return;
    }

    visited.add(value);
    Object.values(value).forEach(visit);
  };

  visit(tournament.openingRoundGames);
  visit(tournament.regions);
  visit(tournament.finalFourGames);
  visit(tournament.championshipGame);

  return Array.from(gamesById.values()).sort((firstGame, secondGame) => {
    if (firstGame.roundOrder !== secondGame.roundOrder) {
      return firstGame.roundOrder - secondGame.roundOrder;
    }

    return firstGame.gameOrder - secondGame.gameOrder;
  });
};

const getErrorMessage = (error: unknown): string => {
  if (!isRecord(error)) {
    return "Something went wrong";
  }

  const response = error.response;

  if (isRecord(response)) {
    const responseData = response.data;

    if (isRecord(responseData) && typeof responseData.error === "string") {
      return responseData.error;
    }

    return "Server error";
  }

  if ("request" in error) {
    return "Network error";
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong";
};

export function useTournamentBracket(league: string, season: number) {
  const normalizedLeague = useMemo(
    () => league.trim().toLowerCase(),
    [league],
  );
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [leagueInfo, setLeagueInfo] =
    useState<TournamentLeagueInfo | null>(null);

  const [responseLeague, setResponseLeague] = useState(normalizedLeague);
  const [bracket, setBracket] = useState<TournamentGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournamentGames = useCallback(
    async (isRefresh = false) => {
      if (!normalizedLeague || !Number.isFinite(season)) {
        setTournament(null);
        setLeagueInfo(null);
        setBracket([]);
        setResponseLeague(normalizedLeague);
        setError("A valid league and season are required.");
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<TournamentResponse>(
          `api/games/basketball/${normalizedLeague}/tournament`,
          {
            params: {
              season,
            },
          },
        );

        const payload = response.data;

        if (!payload.success || !payload.data) {
          throw new Error(
            payload.error || "Tournament data could not be loaded.",
          );
        }

        const tournamentGames = collectTournamentGames(payload.data);

        setTournament(payload.data);
        setLeagueInfo(payload.leagueInfo);
        setResponseLeague(payload.league);
        setBracket(tournamentGames);
      } catch (fetchError: unknown) {
        console.error("Tournament fetch error:", fetchError);

        /*
         * Keep the currently displayed bracket when a manual refresh fails.
         * Clear it only when the initial request fails.
         */
        if (!isRefresh) {
          setTournament(null);
          setLeagueInfo(null);
          setBracket([]);
        }

        setError(getErrorMessage(fetchError));
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizedLeague, season],
  );

  useEffect(() => {
    void fetchTournamentGames();
  }, [fetchTournamentGames]);

  const refresh = useCallback(async () => {
    await fetchTournamentGames(true);
  }, [fetchTournamentGames]);

  const roundsMap = useMemo<TournamentRoundsMap>(() => {
    return bracket.reduce<TournamentRoundsMap>((rounds, game) => {
      const roundName = game.roundLabel || game.round || "Other";

      if (!rounds[roundName]) {
        rounds[roundName] = [];
      }

      rounds[roundName].push(game);

      return rounds;
    }, {});
  }, [bracket]);

  const roundNames = useMemo(() => {
    return Object.keys(roundsMap);
  }, [roundsMap]);

  const count = tournament?.metadata.totalGames ?? bracket.length;
  const isPostseason = tournament !== null;

  return {
    tournament,
    tournamentId: tournament?.tournamentId ?? null,
    tournamentName: tournament?.tournamentName ?? null,
    tournamentSeason: tournament?.season ?? season,
    competition: tournament?.competition ?? null,
    openingRoundLabel: tournament?.openingRoundLabel ?? null,

    league: responseLeague,
    leagueInfo,

    regions: tournament?.regions ?? [],
    openingRoundGames: tournament?.openingRoundGames ?? [],
    finalFourGames: tournament?.finalFourGames ?? [],
    championshipGame: tournament?.championshipGame ?? null,

    bracket,
    count,
    isPostseason,
    roundsMap,
    roundNames,

    metadata: tournament?.metadata ?? null,
    warnings: tournament?.metadata.warnings ?? [],

    loading,
    refreshing,
    error,
    refresh,
  };
}
