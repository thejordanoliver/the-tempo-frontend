// hooks/LeagueHooks/useTeamDetails.ts

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type TeamVenue = {
  id: number;
  city: string | null;
  guid: string | null;
  name: string;
  slug: string | null;
  grass: boolean | null;
  image: string | null;
  sport: string | null;
  state: string | null;
  indoor: boolean | null;
  address: string | null;
  apiRef: string | null;
  country: string | null;
  capacity: number | null;
  latitude: number | null;
  zipCode: string | null;
  longitude: number | null;
  venueKey: string | null;
  createdAt: string | null;
  leagueKey: string | null;
  sourceRef: string | null;
  updatedAt: string | null;
  geocodedAt: string | null;
  leagueSlug: string | null;
  sourceType: string | null;
  sourceTeamId: number | null;
  geocodingQuery: string | null;
  sourceImageUrl: string | null;
  geocodingProvider: string | null;
  geocodingConfidence: number | null;
  geocodingNeedsReview: boolean | null;
};
export type Conference = {
  id: number;
  uid: string;
  logo: string | null;
  name: string | null;
  groupId: number;
  createdAt: string | null;
  shortName: string | null;
  updatedAt: string | null;
  parentGroupId: number;
};

export type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  role: string;
  season: number;
  espnId: number;
  teamId: number;
  isActive: boolean;
  experience: number;
  record: string;
  birthDate: string;
};

export type Championships = {
  id: number;
  notes: string;
  league: string;
  season: number;
  teamId: number;
  teamName: string;
};

export type TeamDetails = {
  id: number;
  espnId: number | null;
  shortName: string;
  name: string;
  code: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  location: string | null;
  city: string | null;
  state?: string | null;
  established: number | null;
  conferenceId?: number | null;
  venueId: string | number | null;
  venueLeagueKey: string | null;
  venue: TeamVenue | null;
  conference: Conference | null;
  coach: Coach | null;
  championships: Championships[];
  // Supports additional league-specific database columns.
  [key: string]: unknown;
};

type TeamDetailsResponse = {
  success: boolean;
  league: string;
  team: TeamDetails;
};

type ErrorResponse = {
  success?: boolean;
  error?: string;
  details?: string;
};

type UseTeamDetailsResult = {
  teamDetails: TeamDetails | null;
  leagueName: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export default function useTeamDetails(
  league?: string,
  teamId?: string | number,
): UseTeamDetailsResult {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamDetails = useCallback(async () => {
    if (!league || teamId === undefined || teamId === null || teamId === "") {
      setTeamDetails(null);
      setLeagueName(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const normalizedLeague = league.trim().toLowerCase();

      const response = await apiClient.get<TeamDetailsResponse>(
        `api/teams/${encodeURIComponent(normalizedLeague)}/${encodeURIComponent(
          String(teamId),
        )}`,
      );

      setTeamDetails(response.data.team);

      setLeagueName(response.data.league);
    } catch (requestError: any) {
      const responseData = requestError?.response?.data as
        | ErrorResponse
        | undefined;

      const message =
        responseData?.error ||
        responseData?.details ||
        requestError?.message ||
        "Failed to fetch team details";

      setTeamDetails(null);
      setLeagueName(null);
      setError(message);

      console.error(`Error fetching ${league} team ${teamId}:`, requestError);
    } finally {
      setLoading(false);
    }
  }, [league, teamId]);

  useEffect(() => {
    void fetchTeamDetails();
  }, [fetchTeamDetails]);

  return {
    teamDetails,
    leagueName,
    loading,
    error,
    refetch: fetchTeamDetails,
  };
}
