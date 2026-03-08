import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------- */
/* MMA TYPES                                          */
/* -------------------------------------------------- */

export type LineScoreRound = {
  round: number;
  score: number;
  display?: string;
};

export type LineScores = {
  total: number | null;
  displayTotal: string | null;
  rounds: LineScoreRound[];
};

export type MMAFighter = {
  id: string;
  name: string;
  shortName: string;
  record: string | null;
  flag: string | null;
  winner: boolean;
  linescores?: LineScores | null;
};

export type PeriodScore = {
  period: number;
  home: number | null;
  away: number | null;
};

export type MMAFight = {
  fightId: string;
  category: string;
  date: string;

  venue: {
    id: string;
    fullName: string;
    address: {
      city: string;
      state: string;
      address1: string;
      country: string;
    };
    indoor: boolean;
  };

  fighters: {
    first: MMAFighter;
    second: MMAFighter;
  };

  status: {
    period: number;
    displayClock: string;
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
  };

  broadcasts?: string[];
  broadcast?: string | null;
  rounds?: number;
  periodScores?: PeriodScore[];
};

export type MMAEvent = {
  id: string;
  name: string;
  shortName: string;
  date: string;
};

/* -------------------------------------------------- */
/* DETAILS TYPE                                       */
/* -------------------------------------------------- */

export type GameDetails = {
  venue: any | null;
  neutralSite?: boolean;

  event?: MMAEvent;
  fights?: MMAFight[];
  fight?: MMAFight;
};

/* -------------------------------------------------- */
/* DATE TYPE                                          */
/* -------------------------------------------------- */

type DateParam =
  | string
  | {
      date?: string;
      utc?: string;
      timestamp?: number;
    };

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/* -------------------------------------------------- */
/* HOOK                                               */
/* -------------------------------------------------- */

export const useMMADetails = (
  league: string,
  homeId?: string | null,
  awayId?: string | null,
  date?: DateParam,
) => {
  const [details, setDetails] = useState<GameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch = !league || !homeId || !awayId || homeId === awayId;

  /* -------------------------------------------------- */
  /* FETCH DETAILS                                      */
  /* -------------------------------------------------- */

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (skipFetch) return;

      try {
        if (!silent) setLoading(true);
        setWarning(null);

        const params: Record<string, any> = {
          league,
          home: homeId,
          away: awayId,
        };

        if (date) {
          if (typeof date === "string") params.date = date;
          else if (date.timestamp) params.date = date.timestamp;
          else if (date.utc) params.date = date.utc;
          else if (date.date) params.date = date.date;
        }

        const { data } = await axios.get(`${BASE_URL}/api/mma/details`, {
          params,
        });

        if (league === "ufc" && data?.fight) {
          /* ---------------- MAP FIGHTS ---------------- */

          const fights: MMAFight[] =
            data.fights?.map((f: any) => ({
              ...f,
              broadcasts: f.broadcasts ?? [],
              broadcast: f.broadcast ?? f.broadcasts?.[0] ?? null,
              rounds: f.rounds ?? null,
              periodScores: f.periodScores ?? [],

              fighters: {
                first: {
                  ...f.fighters.first,
                  linescores: f.fighters.first?.linescores ?? null,
                },
                second: {
                  ...f.fighters.second,
                  linescores: f.fighters.second?.linescores ?? null,
                },
              },
            })) ?? [];

          /* ---------------- MAP SINGLE FIGHT ---------------- */

          const fight: MMAFight = {
            ...data.fight,
            broadcasts: data.fight.broadcasts ?? [],
            broadcast:
              data.fight.broadcast ?? data.fight.broadcasts?.[0] ?? null,
            rounds: data.fight.rounds ?? null,
            periodScores: data.fight.periodScores ?? [],

            fighters: {
              first: {
                ...data.fight.fighters.first,
                linescores:
                  data.fight.fighters.first?.linescores ?? null,
              },
              second: {
                ...data.fight.fighters.second,
                linescores:
                  data.fight.fighters.second?.linescores ?? null,
              },
            },
          };

          setDetails({
            event: data.event,
            venue: data.venue ?? fight?.venue ?? null,
            fights,
            fight,
            neutralSite: false,
          });

          setLastRefresh(new Date());
          return;
        }

        setWarning("Fight data unavailable");
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : "Unable to refresh fight data";

        console.warn(`[${league}] fight details fetch failed`, message);
        setWarning(message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, homeId, awayId, date, skipFetch],
  );

  /* -------------------------------------------------- */
  /* INITIAL FETCH                                      */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (skipFetch) return;
    fetchDetails(true);
  }, [skipFetch, fetchDetails]);

  /* -------------------------------------------------- */
  /* LIVE POLLING                                       */
  /* -------------------------------------------------- */

  useEffect(() => {
    const isLive = details?.fight?.status?.state === "in";

    if (!isLive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      fetchDetails(true);
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [details?.fight?.status?.state, fetchDetails]);

  /* -------------------------------------------------- */
  /* MANUAL REFRESH                                     */
  /* -------------------------------------------------- */

  const refresh = useCallback(() => {
    if (!skipFetch) fetchDetails(false);
  }, [fetchDetails, skipFetch]);

  /* -------------------------------------------------- */
  /* RETURN                                             */
  /* -------------------------------------------------- */

  return {
    details,
    loading,
    warning,
    refresh,
    isLive: details?.fight?.status?.state === "in",
    lastRefresh,
  };
};