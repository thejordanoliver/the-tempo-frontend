// hooks//useConferenceStandings.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface StandingTeam {
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

export interface StandingDivision {
  name: string;
  teams: StandingTeam[];
}

export interface StandingConference {
  id: string;
  name: string;
  code: string | null;
  shortName: string | null;
  divisions: StandingDivision[];
}

interface ConferenceStandingsResponse {
  group: string | null;
  conference: StandingConference | null;
  conferences: StandingConference[];
}

export const useConferenceStandings = (
  league: string,
  group?: number | string | null,
  { enabled = true }: { enabled?: boolean; } = {},
) => {
  const [conference, setConference] = useState<StandingConference | null>(
    null,
  );
  const [conferences, setConferences] = useState<StandingConference[]>([]);
  const [conferencesLoading, setConferencesLoading] = useState(false);
  const [ConferencesRefreshing, setConferencesRefreshing] = useState(false);
  const [conferencesError, setConferencesError] = useState<string | null>(null);
  const [completedRequestKey, setCompletedRequestKey] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const normalizedGroup = String(group ?? "").trim();
  const canFetch = /^\d+$/.test(normalizedGroup);
  const requestKey = `${league}:${normalizedGroup}`;

  const fetchStandings = useCallback(
    async (isRefresh = false) => {
      if (!enabled) {
        setConferencesLoading(false);
        setConferencesRefreshing(false);
        return;
      }

      if (!canFetch) {
        setConference(null);
        setConferences([]);
        setConferencesLoading(false);
        setConferencesRefreshing(false);
        setConferencesError(null);
        return;
      }

      const version = ++requestVersion.current;

      try {
        if (isRefresh) {
          setConferencesRefreshing(true);
        } else {
          setConferencesLoading(true);
        }

        setConferencesError(null);

        const { data } = await apiClient.get<ConferenceStandingsResponse>(
          `/api/standings/${league}/conference`,
          {
            params: {
              group: normalizedGroup,
            },
          },
        );
        if (version !== requestVersion.current) return;

        const rawConferences = Array.isArray(data?.conferences)
          ? data.conferences
          : [];

        const validConferences = rawConferences.filter(
          (item): item is StandingConference =>
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
        if (version !== requestVersion.current) return;
        console.error("🔥 CONFERENCE STANDINGS ERROR:", requestError);

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to load  conference standings";

        setConferencesError(message);
        setConference(null);
        setConferences([]);
      } finally {
        if (version === requestVersion.current) {
          setCompletedRequestKey(requestKey);
          setConferencesLoading(false);
          setConferencesRefreshing(false);
        }
      }
    },
    [canFetch, enabled, league, normalizedGroup, requestKey],
  );

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return fetchStandings(false);
    });
    return () => {
      active = false;
      requestVersion.current += 1;
    };
  }, [fetchStandings]);

  const refresh = useCallback(() => {
    return fetchStandings(true);
  }, [fetchStandings]);

  return {
    conference,
    conferences,
    standings: conference?.divisions ?? [],
    conferencesLoading:
      enabled && canFetch &&
      (conferencesLoading || completedRequestKey !== requestKey),
    ConferencesRefreshing,
    conferencesError,
    refresh,
  };
};
