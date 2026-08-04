import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type SoccerPlayerStatsPlayer = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  team_id: string | null;
  team_slug: string | null;
  position: string | null;
  headshot_url: string | null;
};

export type SoccerCompetitionOption = {
  value: string;
  label: string;
  leagueId: string | null;
  leagueSlug: string;
  leagueName: string | null;
};

export type SoccerTeamOption = {
  value: string;
  label: string;
  teamId: string;
  teamName: string | null;
  teamSlug: string | null;
  competitions: SoccerCompetitionOption[];
};

export type SoccerStatItem = {
  name: string;
  label: string | null;
  value: string | number | null;
  description: string | null;
  displayName: string | null;
};

export type SoccerCategoryMetadata = {
  name: string | null;
  names: string[];
  labels: string[];
  description: string | null;
  displayName: string | null;
  descriptions: string[];
  displayNames: string[];
  shortDisplayName: string | null;
};

export type SoccerSeasonTypeOption = {
  id: string;
  name: string;
  slug: string;
  type: number | null;
  startDate: string | null;
  endDate: string | null;
  abbreviation: string | null;
  hasGroups: boolean;
  hasStandings: boolean;
  hasLegs: boolean;
};

export type SoccerSeasonTypeOptions = {
  count?: number;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  items?: SoccerSeasonTypeOption[];
};

export type SoccerGlossaryItem = {
  abbreviation: string;
  displayName: string;
};

export type SoccerResponseFilterOption = {
  value: string;
  displayValue: string;
};

export type SoccerResponseFilter = {
  displayName: string;
  name: string;
  value: string | null;
  options: SoccerResponseFilterOption[];
};

export type SoccerPlayerSeason = {
  id: string;
  player_id: string;
  player_name: string;
  season: number;
  display_season: string | null;
  short_display_season: string | null;
  season_abbreviation: string | null;
  season_start_date: string | null;
  season_end_date: string | null;
  team_id: string;
  team_slug: string | null;
  team_name: string | null;
  league_id: string;
  league_slug: string;
  league_name: string | null;
  position: string | null;
  season_type_id: string;
  season_type_value: string | null;
  season_type_name: string | null;
  season_type_abbreviation: string | null;
  season_type_slug: string | null;
  season_type_start_date: string | null;
  season_type_end_date: string | null;
  has_groups: boolean | null;
  has_standings: boolean | null;
  has_legs: boolean | null;
  stats: Record<string, Record<string, string | number | null>>;
  stat_items: Record<string, SoccerStatItem[]>;
  category_metadata: Record<string, SoccerCategoryMetadata>;
  season_type_options: SoccerSeasonTypeOptions;
  filters: SoccerResponseFilter[];
  glossary: SoccerGlossaryItem[];
  team_metadata: Record<string, unknown>;
  league_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SoccerPlayerStatsFilters = {
  teamId: string | null;
  competition: string | null;
  allTeams: boolean;
};

export type SoccerPlayerStatsResponse = {
  league: "socc";
  playerId: string;
  player: SoccerPlayerStatsPlayer;
  filters: SoccerPlayerStatsFilters;
  options?: {
    teams?: SoccerTeamOption[];
  };
  teamOptions?: SoccerTeamOption[];
  seasons: SoccerPlayerSeason[];
  count: number;
  hasStats: boolean;
};

export type UsePlayerSeasonsOptions = {
  teamId?: string | number | null;
  competition?: string | null;
  allTeams?: boolean;
  enabled?: boolean;
};

function isCanceledRequest(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const requestError = error as {
    name?: string;
    code?: string;
  };

  return (
    requestError.name === "CanceledError" ||
    requestError.name === "AbortError" ||
    requestError.code === "ERR_CANCELED"
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load soccer player statistics";
}

function normalizeText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function buildTeamOptionsFromSeasonFilters(
  seasons: SoccerPlayerSeason[],
): SoccerTeamOption[] {
  const teamOptions = new Map<string, SoccerTeamOption>();
  const competitionOptions = new Map<string, SoccerCompetitionOption>();

  seasons.forEach((season) => {
    const filters = season.filters ?? [];
    const teamFilter = filters.find((filter) => filter.name === "team");
    const competitionFilter = filters.find((filter) =>
      ["competition", "league"].includes(filter.name),
    );

    competitionFilter?.options?.forEach((option) => {
      const leagueSlug = normalizeText(option.value);

      if (!leagueSlug || competitionOptions.has(leagueSlug)) {
        return;
      }

      competitionOptions.set(leagueSlug, {
        value: leagueSlug,
        label: normalizeText(option.displayValue) ?? leagueSlug,
        leagueId: null,
        leagueSlug,
        leagueName: normalizeText(option.displayValue),
      });
    });

    teamFilter?.options?.forEach((option) => {
      const teamId = normalizeText(option.value);

      if (!teamId || teamOptions.has(teamId)) {
        return;
      }

      teamOptions.set(teamId, {
        value: teamId,
        label: normalizeText(option.displayValue) ?? teamId,
        teamId,
        teamName: normalizeText(option.displayValue),
        teamSlug: null,
        competitions: [],
      });
    });

    if (!teamOptions.has(season.team_id)) {
      teamOptions.set(season.team_id, {
        value: season.team_id,
        label:
          normalizeText(season.team_name) ??
          normalizeText(season.team_slug) ??
          season.team_id,
        teamId: season.team_id,
        teamName: normalizeText(season.team_name),
        teamSlug: normalizeText(season.team_slug),
        competitions: [],
      });
    }

    if (!competitionOptions.has(season.league_slug)) {
      competitionOptions.set(season.league_slug, {
        value: season.league_slug,
        label:
          normalizeText(season.league_name) ??
          normalizeText(season.league_slug) ??
          season.league_slug,
        leagueId: season.league_id,
        leagueSlug: season.league_slug,
        leagueName: normalizeText(season.league_name),
      });
    }
  });

  const competitions = Array.from(competitionOptions.values());

  return Array.from(teamOptions.values()).map((teamOption) => ({
    ...teamOption,
    competitions,
  }));
}

function mergeTeamOptions(
  responseTeamOptions: SoccerTeamOption[] | undefined,
  fallbackTeamOptions: SoccerTeamOption[],
): SoccerTeamOption[] {
  const mergedTeamOptions = new Map<string, SoccerTeamOption>();

  const addTeamOption = (teamOption: SoccerTeamOption) => {
    const teamId =
      normalizeText(teamOption.teamId) ?? normalizeText(teamOption.value);

    if (!teamId) {
      return;
    }

    const existingTeamOption = mergedTeamOptions.get(teamId);
    const competitions =
      teamOption.competitions?.length > 0
        ? teamOption.competitions
        : existingTeamOption?.competitions ?? [];

    mergedTeamOptions.set(teamId, {
      ...existingTeamOption,
      ...teamOption,
      value: normalizeText(teamOption.value) ?? teamId,
      label:
        normalizeText(teamOption.label) ??
        normalizeText(teamOption.teamName) ??
        existingTeamOption?.label ??
        teamId,
      teamId,
      teamName:
        normalizeText(teamOption.teamName) ??
        normalizeText(teamOption.label) ??
        existingTeamOption?.teamName ??
        null,
      teamSlug: normalizeText(teamOption.teamSlug) ?? existingTeamOption?.teamSlug ?? null,
      competitions,
    });
  };

  fallbackTeamOptions.forEach(addTeamOption);
  responseTeamOptions?.forEach(addTeamOption);

  return Array.from(mergedTeamOptions.values());
}

export function usePlayerSeasons(
  playerId?: string | number | null,
  options: UsePlayerSeasonsOptions = {},
) {
  const {
    teamId = null,
    competition = null,
    allTeams = false,
    enabled = true,
  } = options;

  const [data, setData] = useState<SoccerPlayerStatsResponse | null>(null);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const normalizedPlayerId = String(playerId ?? "").trim();
  const normalizedTeamId =
    teamId === null || teamId === undefined ? null : String(teamId).trim();
  const normalizedCompetition = competition?.trim() || null;
  const canFetch = enabled && /^\d+$/.test(normalizedPlayerId);

  const fetchStats = useCallback(
    async (silent = false) => {
      if (!canFetch) {
        abortControllerRef.current?.abort();
        setData(null);
        setSeasonsError(null);
        setSeasonsLoading(false);
        setRefreshing(false);
        return;
      }

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (silent) {
        setRefreshing(true);
      } else {
        setSeasonsLoading(true);
      }

      setSeasonsError(null);

      try {
        const { data: response } =
          await apiClient.get<SoccerPlayerStatsResponse>(
            `api/player/stats/socc/${normalizedPlayerId}`,
            {
              params: {
                ...(normalizedTeamId
                  ? { teamId: normalizedTeamId }
                  : {}),
                ...(normalizedCompetition
                  ? { competition: normalizedCompetition }
                  : {}),
                ...(allTeams ? { allTeams: true } : {}),
              },
              signal: controller.signal,
            },
          );

        if (!controller.signal.aborted) {
          setData(response);
        }
      } catch (requestError: unknown) {
        if (!controller.signal.aborted && !isCanceledRequest(requestError)) {
          setSeasonsError(getErrorMessage(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setSeasonsLoading(false);
          setRefreshing(false);
        }
      }
    }, [
      allTeams,
      canFetch,
      normalizedCompetition,
      normalizedPlayerId,
      normalizedTeamId,
    ]);

  useEffect(() => {
    fetchStats(false);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchStats]);

  const refresh = useCallback(() => fetchStats(true), [fetchStats]);

  const seasons = Array.isArray(data?.seasons) ? data.seasons : [];
  const responseTeamOptions = data?.options?.teams ?? data?.teamOptions;
  const teamOptions = mergeTeamOptions(
    responseTeamOptions,
    buildTeamOptionsFromSeasonFilters(seasons),
  );

  return {
    data,
    seasons,
    teamOptions,
    selectedFilters: data?.filters ?? null,
    count: data?.count ?? 0,
    hasStats: data?.hasStats ?? false,
    seasonsLoading,
    refreshing,
    seasonsError,
    refresh,
  };
}

export default usePlayerSeasons;
