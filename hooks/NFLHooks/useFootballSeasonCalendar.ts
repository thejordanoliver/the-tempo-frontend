import { useEffect, useState } from "react";
import { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

type NFLWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
};


export function useFootballSeasonCalendar(league: LeagueType) {
  const [calendar, setCalendar] = useState<NFLWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await apiClient.get(
          `api/games/football/${league.toLowerCase()}/calendar`,
        );

        // 🔥 FLATTEN + NORMALIZE HERE
        const flattened: NFLWeek[] =
          data.calendar?.flatMap((phase: any) =>
            phase.entries.map((entry: any) => ({
              label: entry.label,
              stage: phase.label, // Preseason / Regular Season / Postseason
              weekNumber: Number(entry.value),
              startDate: entry.startDate,
              endDate: entry.endDate,
            })),
          ) || [];

        setCalendar(flattened);
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
