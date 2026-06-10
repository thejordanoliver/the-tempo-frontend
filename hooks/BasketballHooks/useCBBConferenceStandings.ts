// hooks/CBB/useCBBConferenceStandings.ts
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface CBBStandingTeam {
  teamId: string;
  name: string;
  abbreviation: string;
  rank: string;
  overall: string;
  confOverall: string;
  homeOverall: string;
  awayOverall: string;
  streak: string;
  gamesBehind: string;
  vsAPTop25: string;
  pointsFor: string;
  pointsAgainst: string;
}

export interface CBBStandingDivision {
  name: string;
  teams: CBBStandingTeam[];
}

export interface CBBStandingConference {
  id: string;
  name: string;
  abbreviation: string;
  shortName: string;
  divisions: CBBStandingDivision[];
}

interface CBBConferenceStandingsResponse {
  conferences: Partial<CBBStandingConference>[];
}

export const useCBBConferenceStandings = () => {
  const [conferences, setConferences] = useState<CBBStandingConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await apiClient.get<CBBConferenceStandingsResponse>(
        "api/standings/cbb/conference",
      );

      const rawConferences = response.data?.conferences ?? [];

      const cleanedConferences = rawConferences.filter(
        (conference): conference is CBBStandingConference =>
          Boolean(
            conference &&
            conference.id &&
            conference.name &&
            conference.abbreviation &&
            conference.shortName &&
            Array.isArray(conference.divisions),
          ),
      );

      setConferences(cleanedConferences);
    } catch (err) {
      console.error("🔥 CBB CONFERENCE STANDINGS ERROR:", err);
      setError("Failed to load CBB conference standings");
      setConferences([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const refresh = useCallback(() => {
    fetchStandings(true);
  }, [fetchStandings]);

  return {
    conferences,
    loading,
    refreshing,
    error,
    refresh,
  };
};
