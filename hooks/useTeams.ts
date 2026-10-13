// hooks/LeagueHooks/useTeams.ts
import { TeamDetails } from "@/types/team";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

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

export default function useTeams(
  league?: string,
  teamId?: string | number,
): UseTeamDetailsResult {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Used to prevent an older request from overwriting the result
   * of a newer request when the route/team changes quickly.
   */
  const requestIdRef = useRef(0);

  const fetchTeamDetails = useCallback(async () => {
    /*
     * Invalidate any request that may currently be running.
     */
    const requestId = ++requestIdRef.current;

    if (!league || !teamId) {
      setTeamDetails(null);
      setLeagueName(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<TeamDetailsResponse>(
        `api/teams/${encodeURIComponent(league)}/${encodeURIComponent(teamId)}`,
      );

      /*
       * Ignore the response if another request began after this one.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      setTeamDetails(response.data.team);
      setLeagueName(response.data.league);
    } catch (requestError: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const axiosLikeError = requestError as {
        message?: string;
        response?: {
          status?: number;
          data?: ErrorResponse;
        };
      };

      if (axiosLikeError.response?.status === 404) {
        setTeamDetails(null);
        setLeagueName(null);
        setError(null);
        return;
      }

      const responseData = axiosLikeError.response?.data;

      const message =
        responseData?.error ||
        responseData?.details ||
        axiosLikeError.message ||
        "Failed to fetch team details";

      setTeamDetails(null);
      setLeagueName(null);
      setError(message);

      console.error(`Error fetching ${league} team ${teamId}:`, requestError);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [league, teamId]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchTeamDetails());
  }, [fetchTeamDetails]);

  return {
    teamDetails,
    leagueName,
    loading,
    error,
    refetch: fetchTeamDetails,
  };
}
