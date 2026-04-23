import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function useCBSeasonCalendar() {
  const [calendar, setCalendar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await apiClient.get("api/games/cb/calendar");

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
