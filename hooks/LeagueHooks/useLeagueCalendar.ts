import { useEffect, useState } from "react";
import { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

export function useLeagueCalendar(league: LeagueType) {
  const [calendar, setCalendar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await apiClient.get(
          `api/games/${league.toLowerCase()}/calendar`,
        );

        setCalendar(data.calendar || []);
      } catch (err) {
        console.error(err);
        setError(new Error("Failed to fetch calendar"));
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  return {
    calendar,
    loading,
    error,
  };
}
