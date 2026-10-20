import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ScoreboardCalendarSource } from "./useLeagueCalendar";

export type ScoreboardCalendarResponse = {
  calendar?: unknown[] | null;
  calendarStartDate?: string | null;
  calendarEndDate?: string | null;
};

export type OnScoreboardCalendar = (response: ScoreboardCalendarResponse | null) => void;

/** Connect a screen's games request to its calendar, including selector bootstrapping. */
export function useScoreboardCalendar(league: string) {
  const [result, setResult] = useState<{
    league: string;
    response: ScoreboardCalendarResponse | null;
  } | null>(null);
  const activeLeagueRef = useRef(league);
  useEffect(() => { activeLeagueRef.current = league; }, [league]);
  const onScoreboardCalendar = useCallback<OnScoreboardCalendar>((response) => {
    if (activeLeagueRef.current !== league) return;
    setResult((current) => {
      // Some refresh feeds omit metadata. Retain the calendar already loaded.
      if (current?.league === league && Array.isArray(current.response?.calendar) &&
          !Array.isArray(response?.calendar)) return current;
      return { league, response };
    });
  }, [league]);
  const scoreboardCalendar = useMemo<ScoreboardCalendarSource>(() => ({
    pending: result?.league !== league,
    calendar: result?.league === league ? result.response?.calendar : null,
    startDate: result?.league === league ? result.response?.calendarStartDate : null,
    endDate: result?.league === league ? result.response?.calendarEndDate : null,
  }), [league, result]);
  return { scoreboardCalendar, onScoreboardCalendar };
}
