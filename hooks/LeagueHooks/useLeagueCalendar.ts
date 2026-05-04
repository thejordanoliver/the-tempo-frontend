import { useEffect, useState } from "react";
import { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

export type FootballCalendarWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
};

type CalendarFormat = "raw" | "football";

type UseLeagueCalendarResult<T> = {
  calendar: T[];
  loading: boolean;
  error: Error | null;
};

export function useLeagueCalendar(
  league: LeagueType,
  format: "football",
): UseLeagueCalendarResult<FootballCalendarWeek>;

export function useLeagueCalendar(
  league: LeagueType,
  format?: "raw",
): UseLeagueCalendarResult<string>;

export function useLeagueCalendar(
  league: LeagueType,
  format: CalendarFormat = "raw",
): UseLeagueCalendarResult<string | FootballCalendarWeek> {
  const [calendar, setCalendar] = useState<(string | FootballCalendarWeek)[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await apiClient.get(
          `api/games/calendar/${league.toLowerCase()}`,
        );

        if (format === "football") {
          const flattened: FootballCalendarWeek[] =
            data.calendar?.flatMap((phase: any) =>
              (phase.entries ?? []).map((entry: any) => ({
                label: entry.label,
                stage: phase.label,
                weekNumber: Number(entry.value),
                startDate: entry.startDate,
                endDate: entry.endDate,
              })),
            ) || [];

          setCalendar(flattened);
          return;
        }

        setCalendar(data.calendar || []);
      } catch (err) {
        console.error(err);
        setError(new Error("Failed to fetch calendar"));
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [league, format]);

  return {
    calendar,
    loading,
    error,
  };
}