import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type FootballCalendarWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
};

export type MMACalendarEvent = {
  label: string;
  stage: string;
  eventNumber: number;
  startDate: string;
  endDate: string;
  eventRef: string | null;
  eventId: string | null;
};

type CalendarFormat = "raw" | "football" | "soccer" | "mma";

type UseLeagueCalendarResult<T> = {
  calendar: T[];
  loading: boolean;
  error: Error | null;
};

const extractEventIdFromRef = (ref?: string | null) => {
  if (!ref) return null;

  const match = ref.match(/\/events\/([^?]+)/);
  return match?.[1] ?? null;
};

export function useLeagueCalendar(
  league: string,
  format: "football",
): UseLeagueCalendarResult<FootballCalendarWeek>;

export function useLeagueCalendar(
  league: string,
  format: "soccer",
): UseLeagueCalendarResult<FootballCalendarWeek>;


export function useLeagueCalendar(
  league: string,
  format: "mma",
): UseLeagueCalendarResult<MMACalendarEvent>;

export function useLeagueCalendar(
  league: string,
  format?: "raw",
): UseLeagueCalendarResult<string>;

export function useLeagueCalendar(
  league: string,
  format: CalendarFormat = "raw",
): UseLeagueCalendarResult<string | FootballCalendarWeek | MMACalendarEvent> {
  const [calendar, setCalendar] = useState<
    (string | FootballCalendarWeek | MMACalendarEvent)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await apiClient.get(
          `/api/games/calendar/${league.toLowerCase()}`,
        );

        if (!isMounted) return;

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

         if (format === "soccer") {
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

        if (format === "mma") {
          const flattened: MMACalendarEvent[] =
            data.calendar?.map((event: any, index: number) => {
              const eventRef = event.event?.$ref ?? null;

              return {
                label: event.label,
                stage: "Event",
                eventNumber: index + 1,
                startDate: event.startDate,
                endDate: event.endDate,
                eventRef,
                eventId: extractEventIdFromRef(eventRef),
              };
            }) || [];

          setCalendar(flattened);
          return;
        }

        setCalendar(data.calendar || []);
      } catch (err) {
        if (!isMounted) return;

        console.error(err);
        setError(new Error("Failed to fetch calendar"));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCalendar();

    return () => {
      isMounted = false;
    };
  }, [league, format]);

  return {
    calendar,
    loading,
    error,
  };
}
