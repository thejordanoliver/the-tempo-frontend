// hooks/CFB/useCFBConferenceStandings.ts
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface CFBStandingTeam {
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

export interface CFBStandingDivision {
  name: string;
  teams: CFBStandingTeam[];
}

export interface CFBStandingConference {
  id: string;
  name: string;
  abbreviation: string;
  shortName: string;
  divisions: CFBStandingDivision[];
}

interface CFBConferenceStandingsResponse {
  conferences: Partial<CFBStandingConference>[];
}

export const useCFBConferenceStandings = () => {
  const [conferences, setConferences] = useState<CFBStandingConference[]>([]);
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

      const response = await apiClient.get<CFBConferenceStandingsResponse>(
        "api/standings/cfb/conference",
      );

      const rawConferences = response.data?.conferences ?? [];

      const cleanedConferences = rawConferences.filter(
        (conference): conference is CFBStandingConference =>
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
      console.error("🔥 CFB CONFERENCE STANDINGS ERROR:", err);
      setError("Failed to load CFB conference standings");
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
