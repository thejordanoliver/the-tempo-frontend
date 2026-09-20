import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "utils/apiClient";

/* ----------------------------- Types ----------------------------- */

export interface Leader {
  id: number | string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  short_name: string | null;
  height: string | null;
  weight: string | number | null;
  position: string | null;
  jersey_number: number | string | null;
  experience: number | string | null;
  experience_display: string | null;
  experience_abbr: string | null;
  birth_city: string | null;
  birth_state: string | null;
  birth_country: string | null;
  birth_display: string | null;
  birth_date: string | null;
  team_id: number | string | null;
  headshot_url: string | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  rank: number | string | null;
  value: number | string | null;
  displayValue: string | null;

  teamId?: number | string | null;
  teamName?: string | null;
  teamAbbrev?: string | null;
  teamLogo?: string | null;
  seasonTeamId?: number | string | null;
  seasonTeamSlug?: string | null;

  [key: string]: unknown;
}

export interface LeaderCategory {
  categoryName: string;
  shortName: string;
  abbreviation: string;
  leaders: Leader[];
}

export type LeaderDataSource = "database" | null;

interface SeasonLeadersApiResponse {
  league?: string;
  requestedLeague?: string;
  requestedSeason?: number;
  season?: number;
  displaySeason?: string;
  source?: LeaderDataSource;
  seasonType?: number;
  seasonTypeLabel?: string;
  limit?: number;
  categories?: LeaderCategory[];
}

interface SeasonLeaderResult {
  categories: LeaderCategory[];
  loading: boolean;
  error: string | null;
  source: LeaderDataSource;
  returnedSeason: number | null;
  displaySeason: string | null;
  refresh: () => void;
}

/* ----------------------------- Hook ------------------------------ */

export function useSeasonLeaders(
  season: number,
  league: string,
  { enabled = true }: { enabled?: boolean } = {},
): SeasonLeaderResult {
  const [categories, setCategories] = useState<LeaderCategory[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<LeaderDataSource>(null);
  const [returnedSeason, setReturnedSeason] = useState<number | null>(null);
  const [displaySeason, setDisplaySeason] = useState<string | null>(null);

  /**
   * This is not a data cache.
   *
   * It prevents an older request from overwriting state if the
   * league or season changes before that request finishes.
   */
  const requestIdRef = useRef(0);

  const normalizedLeague = league.trim().toLowerCase();

  const fetchLeaders = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<SeasonLeadersApiResponse>(
        `api/leaders/${normalizedLeague}`,
        {
          params: {
            season,
          },
        },
      );

      /**
       * Ignore stale responses from an older league/season request.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      const data = response.data;

      setCategories(Array.isArray(data.categories) ? data.categories : []);

      setSource(data.source ?? null);

      setReturnedSeason(data.season ?? null);

      setDisplaySeason(
        data.displaySeason ??
          (data.season !== null && data.season !== undefined
            ? String(data.season)
            : null),
      );
    } catch (error: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(`❌ [${normalizedLeague}] Season Leaders Error:`, error);

      const message =
        error instanceof Error ? error.message : "Failed to fetch leaders";

      setCategories([]);
      setSource(null);
      setReturnedSeason(null);
      setDisplaySeason(null);
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, normalizedLeague, season]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    /**
     * Schedule the request after the current synchronous effect execution.
     *
     * This avoids synchronously calling setState from inside the effect,
     * which satisfies react-hooks/set-state-in-effect.
     */
    queueMicrotask(() => {
      if (!cancelled) {
        void fetchLeaders();
      }
    });

    return () => {
      cancelled = true;

      /**
       * Ignore any response belonging to the previous
       * league/season request.
       */
      requestIdRef.current += 1;
    };
  }, [enabled, fetchLeaders]);

  const refresh = useCallback(() => {
    if (!enabled) {
      return;
    }

    void fetchLeaders();
  }, [enabled, fetchLeaders]);

  return {
    categories,
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    source,
    returnedSeason,
    displaySeason,
    refresh,
  };
}
