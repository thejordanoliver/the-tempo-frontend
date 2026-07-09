import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

import type {
  TournamentBracketApiResponse,
  TournamentBracketCompetition,
  TournamentBracketData,
} from "components/Sports/Basketball/TournamentBracket/tournamentBracket.types";
import { transformTournamentBracketResponse } from "components/Sports/Basketball/TournamentBracket/tournamentBracket.utils";

export type MarchMadnessLeague = "cbb" | "wcbb";

export type MarchMadnessLeagueInfo = {
  id: number;
  uid: string;
  code: string;
  name: string;
  slug: string;
};

export type MarchMadnessApiResponse = {
  success?: boolean;
  league?: MarchMadnessLeague;
  leagueInfo?: MarchMadnessLeagueInfo | null;
  data?: TournamentBracketApiResponse;
  bracket?: TournamentBracketApiResponse;
  tournament?: TournamentBracketApiResponse;
  error?: string;
  message?: string;
};

export type UseMarchMadnessOptions = {
  season?: number;
  league?: MarchMadnessLeague;
  enabled?: boolean;
};

export type UseMarchMadnessResult = {
  bracket: TournamentBracketData | null;
  leagueInfo: MarchMadnessLeagueInfo | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export type UseTournamentBracketOptions = {
  competition: TournamentBracketCompetition;
  season?: number;
  enabled?: boolean;
};

export type UseTournamentBracketResult = UseMarchMadnessResult & {
  tournament: TournamentBracketData | null;
};

type FetchMode = "load" | "refresh";

type InFlightRequest = {
  key: string;
  promise: Promise<FetchBracketResult | null>;
};

type FetchBracketResult = {
  bracket: TournamentBracketData;
  leagueInfo: MarchMadnessLeagueInfo | null;
};

function getRequestErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unable to load the March Madness bracket."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load the March Madness bracket.";
}

function getFallbackCompetition(
  league: MarchMadnessLeague,
): TournamentBracketCompetition {
  return league === "wcbb" ? "WCBB" : "CBB";
}

function parseSeasonEndYear(seasonLabel: string): number {
  const years = seasonLabel
    .match(/\d{4}/g)
    ?.map((year) => Number(year))
    .filter(Number.isFinite);

  return years?.[years.length - 1] ?? new Date().getFullYear();
}

export function getCurrentMarchMadnessSeason(): number {
  return parseSeasonEndYear(getCBBSeason());
}

function getBracketPayload(response: MarchMadnessApiResponse) {
  return response.data ?? response.bracket ?? response.tournament ?? response;
}

export function useMarchMadness({
  season = getCurrentMarchMadnessSeason(),
  league = "cbb",
  enabled = true,
}: UseMarchMadnessOptions = {}): UseMarchMadnessResult {
  const [bracket, setBracket] =
    useState<TournamentBracketData | null>(null);
  const [leagueInfo, setLeagueInfo] =
    useState<MarchMadnessLeagueInfo | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const inFlightRequestRef = useRef<InFlightRequest | null>(null);
  const loadedRequestKeyRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const requestKey = `${league}:${season}`;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchBracket = useCallback(
    async (mode: FetchMode = "load") => {
      if (!enabled) {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        return null;
      }

      if (inFlightRequestRef.current?.key === requestKey) {
        const result = await inFlightRequestRef.current.promise;
        return result?.bracket ?? null;
      }

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const isRefresh = mode === "refresh";
      const shouldClearBracket =
        !isRefresh && loadedRequestKeyRef.current !== requestKey;

      if (mountedRef.current) {
        if (shouldClearBracket) {
          setBracket(null);
          setLeagueInfo(null);
        }

        setError(null);
        setLoading(!isRefresh);
        setRefreshing(isRefresh);
      }

      const requestPromise = apiClient
        .get<MarchMadnessApiResponse>(
          `api/games/basketball/${league}/march-madness`,
          {
            params: {
              season,
            },
            signal: controller.signal,
          },
        )
        .then((response): FetchBracketResult => {
          const responseData = response.data ?? {};

          if (responseData.success === false) {
            throw new Error(
              responseData.error ||
                responseData.message ||
                "The March Madness bracket response was invalid.",
            );
          }

          return {
            bracket: transformTournamentBracketResponse(
              getBracketPayload(responseData),
              getFallbackCompetition(league),
            ),
            leagueInfo: responseData.leagueInfo ?? null,
          };
        });

      inFlightRequestRef.current = {
        key: requestKey,
        promise: requestPromise,
      };

      try {
        const result = await requestPromise;

        if (
          !result ||
          !mountedRef.current ||
          controller.signal.aborted ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        setBracket(result.bracket);
        setLeagueInfo(result.leagueInfo);
        setError(null);
        loadedRequestKeyRef.current = requestKey;

        return result.bracket;
      } catch (requestError: unknown) {
        if (
          controller.signal.aborted ||
          axios.isCancel(requestError) ||
          requestId !== requestIdRef.current
        ) {
          return null;
        }

        if (mountedRef.current) {
          setError(getRequestErrorMessage(requestError));
        }

        return null;
      } finally {
        if (inFlightRequestRef.current?.promise === requestPromise) {
          inFlightRequestRef.current = null;
        }

        if (mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [enabled, league, requestKey, season],
  );

  useEffect(() => {
    if (!enabled) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      inFlightRequestRef.current = null;
      requestIdRef.current += 1;
      setLoading(false);
      setRefreshing(false);
      return;
    }

    void fetchBracket("load");
  }, [enabled, fetchBracket]);

  const refresh = useCallback(async () => {
    await fetchBracket("refresh");
  }, [fetchBracket]);

  return {
    bracket,
    leagueInfo,
    loading,
    refreshing,
    error,
    refresh,
  };
}

export function useTournamentBracket({
  competition,
  season = getCurrentMarchMadnessSeason(),
  enabled = true,
}: UseTournamentBracketOptions): UseTournamentBracketResult {
  const result = useMarchMadness({
    league: competition === "WCBB" ? "wcbb" : "cbb",
    season,
    enabled,
  });

  return {
    ...result,
    tournament: result.bracket,
  };
}

export default useMarchMadness;
