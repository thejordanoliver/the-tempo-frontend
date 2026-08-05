// hooks/CFB/useCFBConferenceStandings.ts

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface CFBStandingTeam {
  id: string;
  name: string;
  code: string | null;
  rank: string | number | null;
  overall: string | null;
  confOverall: string | null;
  homeOverall: string | null;
  awayOverall: string | null;
  divisionOverall?: string | null;
  divWins?: string | number | null;
  divLosses?: string | number | null;
  winPercent?: string | number | null;
  confWinPercent?: string | number | null;
  streak: string | null;
  gamesBehind: string | number | null;
  vsAPTop25: string | null;
  pointsFor: string | number | null;
  pointsAgainst: string | number | null;
}

export interface CFBStandingDivision {
  name: string;
  teams: CFBStandingTeam[];
}

export interface CFBStandingConference {
  id: string;
  name: string;
  code: string | null;
  shortName: string | null;
  divisions: CFBStandingDivision[];
}

interface CFBConferenceStandingsResponse {
  group: string | null;
  conference: CFBStandingConference | null;
  conferences: CFBStandingConference[];
}

export const useCFBConferenceStandings = (group?: number | string | null) => {
  const [conference, setConference] = useState<CFBStandingConference | null>(
    null,
  );
  const [conferences, setConferences] = useState<CFBStandingConference[]>([]);
  const [conferencesLoading, setConferencesLoading] = useState(false);
  const [ConferencesRefreshing, setConferencesRefreshing] = useState(false);
  const [conferencesError, setConferencesError] = useState<string | null>(null);

  const normalizedGroup = String(group ?? "").trim();
  const canFetch = /^\d+$/.test(normalizedGroup);

  const fetchStandings = useCallback(
    async (isRefresh = false) => {
      if (!canFetch) {
        setConference(null);
        setConferences([]);
        setConferencesLoading(false);
        setConferencesRefreshing(false);
        setConferencesError(null);
        return;
      }

      try {
        if (isRefresh) {
          setConferencesRefreshing(true);
        } else {
          setConferencesLoading(true);
        }

        setConferencesError(null);

        const { data } = await apiClient.get<CFBConferenceStandingsResponse>(
          "/api/standings/cfb/conference",
          {
            params: {
              group: normalizedGroup,
            },
          },
        );

        const rawConferences = Array.isArray(data?.conferences)
          ? data.conferences
          : [];

        const validConferences = rawConferences.filter(
          (item): item is CFBStandingConference =>
            Boolean(
              item && item.id && item.name && Array.isArray(item.divisions),
            ),
        );

        const selectedConference =
          data?.conference ??
          validConferences.find(
            (item) => String(item.id) === normalizedGroup,
          ) ??
          validConferences[0] ??
          null;

        setConference(selectedConference);
        setConferences(validConferences);
      } catch (requestError: unknown) {
        console.error("🔥 CFB CONFERENCE STANDINGS ERROR:", requestError);

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to load CFB conference standings";

        setConferencesError(message);
        setConference(null);
        setConferences([]);
      } finally {
        setConferencesLoading(false);
        setConferencesRefreshing(false);
      }
    },
    [canFetch, normalizedGroup],
  );

  useEffect(() => {
    fetchStandings(false);
  }, [fetchStandings]);

  const refresh = useCallback(() => {
    return fetchStandings(true);
  }, [fetchStandings]);

  return {
    conference,
    conferences,
    standings: conference?.divisions ?? [],
    conferencesLoading,
    ConferencesRefreshing,
    conferencesError,
    refresh,
  };
};

export default useCFBConferenceStandings;
