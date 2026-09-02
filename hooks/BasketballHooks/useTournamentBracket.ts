// hooks/BasketballHooks/useTournamentBracket.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { apiClient } from "utils/apiClient";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type TournamentLeagueInfo = {
  id: number;
  uid: string;
  code: string;
  name: string;
  slug: string;
};

export type TournamentRegionSide = "left" | "right";

export type TournamentRegionVerticalPosition = "top" | "bottom";

export type TournamentNextGamePosition = "top" | "bottom";

export type TournamentRoundCode =
  | "OPENING"
  | "ROUND_OF_64"
  | "ROUND_OF_32"
  | "SWEET_16"
  | "ELITE_8"
  | "FINAL_4"
  | "CHAMPIONSHIP";

export type TournamentGameStatus =
  | "scheduled"
  | "pre"
  | "in"
  | "live"
  | "post"
  | "final"
  | "postponed"
  | "canceled"
  | "cancelled"
  | "delayed"
  | string;

export type TournamentTeam = {
  /**
   * ESPN team ID.
   *
   * The current tournament endpoint exposes `id` directly and does not return
   * database-specific aliases such as databaseId, dbId, wcbbTeamId, etc.
   */
  id: string;

  name: string;
  shortName: string;
  abbreviation: string;
  logo: string | null;

  seed: number | null;
  score: number | null;
  winner: boolean | null;
};

export type TournamentVenue = {
  id: string;
  name: string;
  city: string;
  state: string;
  indoor: boolean;
};

export type TournamentGame = {
  id: string;
  tournamentId: string;

  /**
   * Region is null for Final Four / Championship games.
   */
  regionId: string | null;
  regionName: string | null;

  round: TournamentRoundCode;
  roundLabel: string;

  /**
   * Global tournament round ordering:
   *
   * 0 = First Four
   * 1 = Round of 64
   * 2 = Round of 32
   * 3 = Sweet 16
   * 4 = Elite Eight
   * 5 = Final Four
   * 6 = Championship
   */
  roundOrder: number;

  gameOrder: number;

  /**
   * Region bracket position.
   *
   * Opening, Final Four, and Championship games may not have a slot.
   */
  bracketSlot: number | null;

  topTeam: TournamentTeam;
  bottomTeam: TournamentTeam;

  winnerTeamId: string | null;

  /**
   * Previous games feeding this matchup.
   */
  topSourceGameId: string | null;
  bottomSourceGameId: string | null;

  /**
   * Destination game after this matchup.
   */
  nextGameId: string | null;
  nextGamePosition: TournamentNextGamePosition | null;

  /**
   * Primarily used by First Four games to describe where the winner enters
   * the main bracket.
   */
  destinationRegionId: string | null;
  destinationRound: TournamentRoundCode | null;
  destinationSeed: number | null;

  date: string | null;

  status: TournamentGameStatus;
  statusText: string | null;

  venue: TournamentVenue | null;

  broadcast: string | null;
  headline: string | null;
};

export type TournamentRegion = {
  id: string;
  name: string;

  order: number;

  side: TournamentRegionSide;
  verticalPosition: TournamentRegionVerticalPosition;

  games: TournamentGame[];
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

export type TournamentGamesById = Map<string, TournamentGame>;

export type UseTournamentBracketResult = {
  tournament: TournamentData | null;

  tournamentId: string | null;
  tournamentName: string | null;
  tournamentSeason: number;

  competition: string | null;
  openingRoundLabel: string | null;

  league: string;
  leagueInfo: TournamentLeagueInfo | null;

  regions: TournamentRegion[];

  openingRoundGames: TournamentGame[];
  finalFourGames: TournamentGame[];
  championshipGame: TournamentGame | null;

  bracket: TournamentGame[];
  gamesById: TournamentGamesById;

  count: number;
  isPostseason: boolean;

  roundsMap: TournamentRoundsMap;
  roundNames: string[];

  metadata: TournamentMetadata | null;
  warnings: string[];

  loading: boolean;
  refreshing: boolean;
  error: string | null;

  refresh: () => Promise<void>;
};

/* -------------------------------------------------------------------------- */
/*                               Empty constants                              */
/* -------------------------------------------------------------------------- */

const EMPTY_GAMES: TournamentGame[] = [];
const EMPTY_REGIONS: TournamentRegion[] = [];
const EMPTY_WARNINGS: string[] = [];

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getErrorMessage = (error: unknown): string => {
  if (!isRecord(error)) {
    return "Something went wrong.";
  }

  const response = error.response;

  if (isRecord(response)) {
    const responseData = response.data;

    if (
      isRecord(responseData) &&
      typeof responseData.error === "string" &&
      responseData.error.trim()
    ) {
      return responseData.error;
    }

    return "Server error.";
  }

  if ("request" in error) {
    return "Network error.";
  }

  if (typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return "Something went wrong.";
};

const collectTournamentGames = (
  tournament: TournamentData,
): TournamentGame[] => {
  const gamesById = new Map<string, TournamentGame>();

  const addGames = (games: readonly TournamentGame[]) => {
    for (const game of games) {
      gamesById.set(game.id, game);
    }
  };

  addGames(tournament.openingRoundGames);

  for (const region of tournament.regions) {
    addGames(region.games);
  }

  addGames(tournament.finalFourGames);

  if (tournament.championshipGame) {
    gamesById.set(tournament.championshipGame.id, tournament.championshipGame);
  }

  return Array.from(gamesById.values()).sort((firstGame, secondGame) => {
    if (firstGame.roundOrder !== secondGame.roundOrder) {
      return firstGame.roundOrder - secondGame.roundOrder;
    }

    if (firstGame.gameOrder !== secondGame.gameOrder) {
      return firstGame.gameOrder - secondGame.gameOrder;
    }

    return firstGame.id.localeCompare(secondGame.id);
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

  const [responseLeague, setResponseLeague] = useState(league);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  /* ------------------------------------------------------------------------ */
  /*                                  Fetch                                   */
  /* ------------------------------------------------------------------------ */

  const fetchTournamentGames = useCallback(
    async (isRefresh = false): Promise<void> => {
      const normalizedLeague = league.trim();

      if (!normalizedLeague || !Number.isFinite(season)) {
        requestIdRef.current += 1;

        setTournament(null);
        setLeagueInfo(null);
        setResponseLeague(normalizedLeague || league);
        setError("A valid league and season are required.");

        setLoading(false);
        setRefreshing(false);

        return;
      }

      const requestId = ++requestIdRef.current;

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

        /**
         * League/season changed and a newer request already started.
         */
        if (requestId !== requestIdRef.current) {
          return;
        }

        const payload = response.data;

        if (!payload.success || !payload.data) {
          throw new Error(
            payload.error || "Tournament data could not be loaded.",
          );
        }

        setTournament(payload.data);
        setLeagueInfo(payload.leagueInfo);
        setResponseLeague(payload.league);
      } catch (fetchError: unknown) {
        /**
         * Ignore stale failures too. An older request should not replace the
         * state or error belonging to a newer league/season.
         */
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error("Tournament fetch error:", fetchError);

        /**
         * A refresh failure keeps the currently displayed bracket.
         *
         * An initial fetch failure clears stale tournament information.
         */
        if (!isRefresh) {
          setTournament(null);
          setLeagueInfo(null);
          setResponseLeague(normalizedLeague);
        }

        setError(getErrorMessage(fetchError));
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [league, season],
  );

  /* ------------------------------------------------------------------------ */
  /*                              Initial fetch                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    void fetchTournamentGames();

    /**
     * Invalidate this request if the dependency changes or the component
     * unmounts before the request completes.
     */
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchTournamentGames]);

  /* ------------------------------------------------------------------------ */
  /*                                 Refresh                                  */
  /* ------------------------------------------------------------------------ */

  const refresh = useCallback(async (): Promise<void> => {
    await fetchTournamentGames(true);
  }, [fetchTournamentGames]);

  /* ------------------------------------------------------------------------ */
  /*                              Derived bracket                             */
  /* ------------------------------------------------------------------------ */

  const bracket = useMemo<TournamentGame[]>(() => {
    if (!tournament) {
      return EMPTY_GAMES;
    }

    return collectTournamentGames(tournament);
  }, [tournament]);

  const gamesById = useMemo<TournamentGamesById>(() => {
    return new Map(bracket.map((game) => [game.id, game]));
  }, [bracket]);

  /* ------------------------------------------------------------------------ */
  /*                                  Rounds                                  */
  /* ------------------------------------------------------------------------ */

  const roundsMap = useMemo<TournamentRoundsMap>(() => {
    const rounds: TournamentRoundsMap = {};

    for (const game of bracket) {
      const roundName = game.roundLabel || game.round;

      const existingRound = rounds[roundName];

      if (existingRound) {
        existingRound.push(game);
      } else {
        rounds[roundName] = [game];
      }
    }

    return rounds;
  }, [bracket]);

  const roundNames = useMemo<string[]>(() => {
    return Object.keys(roundsMap);
  }, [roundsMap]);

  /* ------------------------------------------------------------------------ */
  /*                            Derived response data                          */
  /* ------------------------------------------------------------------------ */

  const regions = tournament?.regions ?? EMPTY_REGIONS;

  const openingRoundGames = tournament?.openingRoundGames ?? EMPTY_GAMES;

  const finalFourGames = tournament?.finalFourGames ?? EMPTY_GAMES;

  const championshipGame = tournament?.championshipGame ?? null;

  const metadata = tournament?.metadata ?? null;

  const warnings = tournament?.metadata.warnings ?? EMPTY_WARNINGS;

  const count = tournament?.metadata.totalGames ?? bracket.length;

  const isPostseason = tournament !== null;

  /* ------------------------------------------------------------------------ */
  /*                                  Return                                  */
  /* ------------------------------------------------------------------------ */

  return {
    tournament,

    tournamentId: tournament?.tournamentId ?? null,
    tournamentName: tournament?.tournamentName ?? null,
    tournamentSeason: tournament?.season ?? season,

    competition: tournament?.competition ?? null,
    openingRoundLabel: tournament?.openingRoundLabel ?? null,

    league: responseLeague,
    leagueInfo,

    regions,

    openingRoundGames,
    finalFourGames,
    championshipGame,

    bracket,
    gamesById,

    count,
    isPostseason,

    roundsMap,
    roundNames,

    metadata,
    warnings,

    loading,
    refreshing,
    error,

    refresh,
  };
}
