import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiClient } from "utils/apiClient";
import {
  getCachedLeagueCalendar,
  getLeagueCalendarCacheKey,
  getLeagueCalendarDateKey,
  getLeagueCalendarMonth,
  getLeagueCalendarMonthAnchor,
  normalizeLeagueCalendarLeague,
  setCachedLeagueCalendar,
} from "utils/leagueCalendarCache";

export type FootballCalendarWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
};

export type CalendarEvent = {
  label: string;
  stage: string;
  eventNumber: number;
  startDate: string;
  endDate: string;
  eventRef: string | null;
  eventId: string | null;
};

type CalendarFormat =
  | "raw"
  | "football"
  | "soccer"
  | "ufc"
  | "racing";

type UseLeagueCalendarResult<T> = {
  calendar: T[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

type CalendarEntry = {
  label?: unknown;
  value?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  event?: {
    $ref?: unknown;
  };
};

type CalendarPhase = {
  label?: unknown;
  entries?: unknown;
};

type CalendarResponse = {
  calendar?: unknown;
};

type FetchLeagueCalendarOptions = {
  forceRefresh?: boolean;
};

const extractEventIdFromRef = (
  ref?: string | null,
): string | null => {
  if (!ref) {
    return null;
  }

  const match = ref.match(
    /\/events\/([^?]+)/,
  );

  return match?.[1] ?? null;
};

const isObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const getString = (
  value: unknown,
): string | null => {
  return typeof value === "string"
    ? value
    : null;
};

const extractRawCalendarDates = (
  value: unknown,
): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const dates: string[] = [];

  value.forEach((calendarItem) => {
    if (typeof calendarItem === "string") {
      const dateKey =
        getLeagueCalendarDateKey(
          calendarItem,
        );

      if (dateKey) {
        dates.push(dateKey);
      }

      return;
    }

    if (!isObject(calendarItem)) {
      return;
    }

    const directStartDate = getString(
      calendarItem.startDate,
    );

    if (directStartDate) {
      const dateKey =
        getLeagueCalendarDateKey(
          directStartDate,
        );

      if (dateKey) {
        dates.push(dateKey);
      }
    }

    if (
      Array.isArray(calendarItem.entries)
    ) {
      calendarItem.entries.forEach(
        (entry) => {
          if (!isObject(entry)) {
            return;
          }

          const entryStartDate =
            getString(entry.startDate);

          if (entryStartDate) {
            const dateKey =
              getLeagueCalendarDateKey(
                entryStartDate,
              );

            if (dateKey) {
              dates.push(dateKey);
            }
          }
        },
      );
    }
  });

  return Array.from(new Set(dates));
};

const isCanceledRequest = (
  value: unknown,
) => {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.name === "CanceledError" ||
    value.code === "ERR_CANCELED"
  );
};

export function useLeagueCalendar(
  league: string,
  format: "football",
  anchorDate?: string,
): UseLeagueCalendarResult<FootballCalendarWeek>;

export function useLeagueCalendar(
  league: string,
  format: "soccer",
  anchorDate?: string,
): UseLeagueCalendarResult<FootballCalendarWeek>;

export function useLeagueCalendar(
  league: string,
  format: "ufc",
  anchorDate?: string,
): UseLeagueCalendarResult<CalendarEvent>;

export function useLeagueCalendar(
  league: string,
  format: "racing",
  anchorDate?: string,
): UseLeagueCalendarResult<CalendarEvent>;

export function useLeagueCalendar(
  league: string,
  format?: "raw",
  anchorDate?: string,
): UseLeagueCalendarResult<string>;

export function useLeagueCalendar(
  league: string,
  format: CalendarFormat = "raw",
  anchorDate?: string,
): UseLeagueCalendarResult<
  | string
  | FootballCalendarWeek
  | CalendarEvent
> {
  const [calendar, setCalendarState] = useState<
    (
      | string
      | FootballCalendarWeek
      | CalendarEvent
    )[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  const calendarRef = useRef(calendar);
  const requestSequenceRef = useRef(0);
  const abortControllerRef =
    useRef<AbortController | null>(null);
  const displayedRawCacheKeyRef =
    useRef<string | null>(null);

  const normalizedLeague = useMemo(
    () =>
      normalizeLeagueCalendarLeague(
        league,
      ),
    [league],
  );

  const calendarMonth = useMemo(
    () =>
      getLeagueCalendarMonth(
        anchorDate,
      ),
    [anchorDate],
  );

  const setCalendar = useCallback(
    (
      nextCalendar: (
        | string
        | FootballCalendarWeek
        | CalendarEvent
      )[],
    ) => {
      calendarRef.current =
        nextCalendar;

      setCalendarState(
        nextCalendar,
      );
    },
    [],
  );

  const fetchLeagueCalendar =
    useCallback(
      async ({
        forceRefresh = false,
      }: FetchLeagueCalendarOptions = {}) => {
        const requestId =
          requestSequenceRef.current + 1;

        requestSequenceRef.current =
          requestId;

        abortControllerRef.current?.abort();

        const shouldUseMonthCache =
          format === "raw" &&
          calendarMonth !== null;

        const requestMonth =
          shouldUseMonthCache
            ? calendarMonth
            : null;

        const requestCacheKey =
          requestMonth !== null
            ? getLeagueCalendarCacheKey(
                normalizedLeague,
                requestMonth,
              )
            : null;

        let hydratedCachedCalendar =
          false;

        try {
          setError(null);

          if (
            shouldUseMonthCache &&
            requestMonth !== null
          ) {
            const cachedResult =
              await getCachedLeagueCalendar(
                normalizedLeague,
                requestMonth,
              );

            if (
              requestSequenceRef.current !==
              requestId
            ) {
              return;
            }

            if (cachedResult) {
              hydratedCachedCalendar =
                true;

              displayedRawCacheKeyRef.current =
                requestCacheKey;

              setCalendar(
                cachedResult.cache
                  .calendar,
              );

              setLoading(false);

              if (
                !forceRefresh &&
                cachedResult.cacheState ===
                  "fresh"
              ) {
                setRefreshing(false);
                return;
              }

              setRefreshing(true);
            } else if (
              forceRefresh &&
              requestCacheKey !== null &&
              displayedRawCacheKeyRef.current ===
                requestCacheKey &&
              calendarRef.current.length > 0
            ) {
              setLoading(false);
              setRefreshing(true);
            } else {
              displayedRawCacheKeyRef.current =
                null;

              setCalendar([]);
              setLoading(true);
              setRefreshing(false);
            }
          } else {
            displayedRawCacheKeyRef.current =
              null;

            setLoading(true);
            setRefreshing(false);
          }

          const abortController =
            new AbortController();

          abortControllerRef.current =
            abortController;

          const requestDate =
            requestMonth !== null
              ? getLeagueCalendarMonthAnchor(
                  requestMonth,
                )
              : anchorDate;

          const { data } =
            await apiClient.get<CalendarResponse>(
              `/api/games/calendar/${normalizedLeague}`,
              {
                params: requestDate
                  ? {
                      date: requestDate,
                    }
                  : undefined,
                signal:
                  abortController.signal,
              },
            );

          if (
            requestSequenceRef.current !==
            requestId
          ) {
            return;
          }

          if (format === "raw") {
            const rawDates =
              extractRawCalendarDates(
                data.calendar,
              );

            if (!rawDates) {
              throw new Error(
                "Invalid calendar response",
              );
            }

            displayedRawCacheKeyRef.current =
              requestCacheKey;

            setCalendar(rawDates);

            if (
              requestMonth !== null
            ) {
              await setCachedLeagueCalendar(
                normalizedLeague,
                requestMonth,
                rawDates,
              );
            }

            return;
          }

          if (
            format === "football" ||
            format === "soccer"
          ) {
            const calendarValue =
              Array.isArray(data.calendar)
                ? data.calendar
                : [];

            const flattened =
              calendarValue.flatMap(
                (phaseValue) => {
                  if (
                    !isObject(phaseValue)
                  ) {
                    return [];
                  }

                  const phase =
                    phaseValue as CalendarPhase;

                  const phaseLabel =
                    getString(phase.label) ??
                    "Regular Season";

                  if (
                    !Array.isArray(
                      phase.entries,
                    )
                  ) {
                    return [];
                  }

                  return phase.entries.flatMap(
                    (
                      entryValue,
                      index,
                    ) => {
                      if (
                        !isObject(entryValue)
                      ) {
                        return [];
                      }

                      const entry =
                        entryValue as CalendarEntry;

                      const parsedWeekNumber =
                        Number(entry.value);

                      return [
                        {
                          label:
                            getString(
                              entry.label,
                            ) ??
                            `Week ${index + 1}`,

                          stage: phaseLabel,

                          weekNumber:
                            Number.isFinite(
                              parsedWeekNumber,
                            )
                              ? parsedWeekNumber
                              : index + 1,

                          startDate:
                            getString(
                              entry.startDate,
                            ) ?? "",

                          endDate:
                            getString(
                              entry.endDate,
                            ) ?? "",
                        },
                      ];
                    },
                  );
                },
              );

            setCalendar(flattened);
            return;
          }

          if (
            format === "ufc" ||
            format === "racing"
          ) {
            const calendarValue =
              Array.isArray(data.calendar)
                ? data.calendar
                : [];

            const flattened =
              calendarValue.flatMap(
                (
                  eventValue,
                  index,
                ) => {
                  if (!isObject(eventValue)) {
                    return [];
                  }

                  const event =
                    eventValue as CalendarEntry;

                  const eventRef =
                    getString(
                      event.event?.$ref,
                    );

                  return [
                    {
                      label:
                        getString(event.label) ??
                        `Event ${index + 1}`,

                      stage: "Event",

                      eventNumber:
                        index + 1,

                      startDate:
                        getString(
                          event.startDate,
                        ) ?? "",

                      endDate:
                        getString(
                          event.endDate,
                        ) ?? "",

                      eventRef,

                      eventId:
                        extractEventIdFromRef(
                          eventRef,
                        ),
                    },
                  ];
                },
              );

            setCalendar(flattened);
            return;
          }
        } catch (caughtError) {
          if (
            requestSequenceRef.current !==
              requestId ||
            isCanceledRequest(
              caughtError,
            )
          ) {
            return;
          }

          console.error(
            `Failed to fetch ${normalizedLeague} calendar:`,
            caughtError,
          );

          const hasUsableCalendar =
            hydratedCachedCalendar ||
            (requestCacheKey !== null &&
              displayedRawCacheKeyRef.current ===
                requestCacheKey &&
              calendarRef.current.length > 0);

          if (
            shouldUseMonthCache &&
            hasUsableCalendar
          ) {
            setError(null);
            return;
          }

          displayedRawCacheKeyRef.current =
            null;

          setCalendar([]);

          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error(
                  "Failed to fetch calendar",
                ),
          );
        } finally {
          if (
            requestSequenceRef.current ===
            requestId
          ) {
            setLoading(false);
            setRefreshing(false);
            abortControllerRef.current =
              null;
          }
        }
      },
      [
        anchorDate,
        calendarMonth,
        format,
        normalizedLeague,
        setCalendar,
      ],
    );

  useEffect(() => {
    fetchLeagueCalendar();

    return () => {
      requestSequenceRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current =
        null;
    };
  }, [fetchLeagueCalendar]);

  const refresh = useCallback(async () => {
    await fetchLeagueCalendar({
      forceRefresh: true,
    });
  }, [fetchLeagueCalendar]);

  return {
    calendar,
    loading,
    refreshing,
    error,
    refresh,
  };
}
