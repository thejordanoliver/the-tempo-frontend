import axios from "axios";
import { teamIdMap } from "constants/teamsNFL";
import { useCallback, useEffect, useRef, useState } from "react";

/* =======================
   ESPN → internal mapping
======================= */
const espnToInternal: Record<string, number> = Object.fromEntries(
  Object.entries(teamIdMap).map(([internal, espn]) => [espn, Number(internal)])
);

/* =======================
   Types
======================= */
export type Athlete = {
  id: string;
  fullName: string;
  displayName: string;
  shortName: string;
  headshot?: string;
  jersey?: string;
  position?: string;
};

export type PlayObject = {
  id: string;
  text: string;
  type?: { text?: string; abbreviation?: string };
  scoreValue?: number;

  drive?: {
    description?: string;
    start?: { yardLine?: number; text?: string };
    end?: { yardLine?: number; text?: string };
    timeElapsed?: { displayValue?: string };
    result?: string;
    team?: { id: number };
  };

  start?: {
    yardLine?: number;
    yardLineSide?: string;
    yardLineText?: string;
    distance?: number;
    team?: { id: number };
  };

  end?: {
    yardLine?: number;
    yardLineSide?: string;
    yardLineText?: string;
    team?: { id: number };
  };

  team?: { id: number };
  possession?: string;
  distance?: number;
  statYardage?: number;
  athletesInvolved?: Athlete[];
};

export type NFLScore = {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
};

export type LineScore = {
  home: number[];
  away: number[];
};

/* =======================
   Hook
======================= */
export const useNFLGamePossession = (
  home?: string | number,
  away?: string | number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
) => {
  const [possessionTeamId, setPossessionTeamId] = useState<number>();
  const [shortDownDistanceText, setShortDownDistanceText] = useState<string>();
  const [downDistanceText, setDownDistanceText] = useState<string>();
  const [firstDownYardLine, setFirstDownYardLine] = useState<number>();
  const [redzone, setRedzone] = useState<boolean>();

  const [displayClock, setDisplayClock] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [lastPlay, setLastPlay] = useState<string | PlayObject>();
  const [homeTimeouts, setHomeTimeouts] = useState<number>();
  const [awayTimeouts, setAwayTimeouts] = useState<number>();

  const [score, setScore] = useState<NFLScore>();
  const [lineScore, setLineScore] = useState<LineScore>({ home: [], away: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gameStatusDescription, setGameStatusDescription] = useState<string>();
  const [gameStatusDetail, setGameStatusDetail] = useState<string>();
  const [gameStatusShortDetail, setGameStatusShortDetail] = useState<string>();
  const [possessionText, setPossessionText] = useState<string>();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipFetch = !home || !away || !date;

  const fetchData = useCallback(
    async (isPolling = false): Promise<string | undefined> => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        /* ---------- Parse date ---------- */
        let targetDate: Date | null = null;

        if (typeof date === "string") targetDate = new Date(date);
        else if (typeof date === "object") {
          targetDate = date.timestamp
            ? new Date(date.timestamp * 1000)
            : date.utc
            ? new Date(date.utc)
            : date.date
            ? new Date(date.date)
            : null;
        }

        if (!targetDate) return;

        const makeYMD = (d: Date) => {
          const usDate = d.toLocaleDateString("en-US", { timeZone: "America/New_York" });
          const [month, day, year] = usDate.split("/");
          return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
        };
        const yyyymmdd = makeYMD(targetDate);

        /* ---------- ESPN API ---------- */
        const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${yyyymmdd}`;
        const { data } = await axios.get(url);
        const games = data.events || [];

        /* ---------- Match game by IDs ---------- */
        const homeId = Number(home);
        const awayId = Number(away);

        const game = games.find((g: any) => {
          const competitors = g.competitions?.[0]?.competitors || [];
          const ids = competitors.map((c: any) => Number(c.team.id));
          return ids.includes(homeId) && ids.includes(awayId);
        });

        if (!game) {
          console.warn(`[NFL Possession] Game not found: ${home} vs ${away}`);
          setLineScore({ home: [], away: [] });
          return;
        }

        const competition = game.competitions?.[0];
        if (!competition) throw new Error("No competition data");

        const status = competition.status?.type;
        const isLive = status?.state === "in";

        /* ---------- Status ---------- */
        const currentStatus =
          status?.description ??
          status?.detail ??
          status?.shortDetail ??
          status?.name ??
          status?.state;

        setGameStatusDescription(currentStatus);
        setGameStatusDetail(status?.detail);
        setGameStatusShortDetail(status?.shortDetail);
        setDisplayClock(competition.status?.displayClock);
        setPeriod(competition.status?.period?.toString());

        /* ---------- Score + LineScore ---------- */
        const competitors = competition.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        if (homeComp && awayComp) {
          const homeLines = homeComp.linescores ?? [];
          const awayLines = awayComp.linescores ?? [];
          const maxPeriods = Math.max(homeLines.length, awayLines.length);

          setLineScore({
            home: homeLines.map((l: any) => l.value ?? 0),
            away: awayLines.map((l: any) => l.value ?? 0),
          });

          setScore({
            home: { total: Number(homeComp.score) },
            away: { total: Number(awayComp.score) },
            homeTeam: homeComp.team.displayName,
            awayTeam: awayComp.team.displayName,
            periodScores: Array.from({ length: maxPeriods }, (_, i) => ({
              period: i + 1,
              home: homeLines[i]?.value ?? 0,
              away: awayLines[i]?.value ?? 0,
            })),
          });
        }

        /* ---------- Live-only ---------- */
        if (isLive && competition.situation) {
          const s = competition.situation;

          setPossessionTeamId(s.possession ? espnToInternal[s.possession] : undefined);
          setShortDownDistanceText(s.shortDownDistanceText);
          setDownDistanceText(s.downDistanceText);
          setRedzone(s.isRedZone);
          setHomeTimeouts(s.homeTimeouts);
          setAwayTimeouts(s.awayTimeouts);

          const downInfo = s.shortDownDistanceText ?? "";
          const field = s.possessionText ?? "";

          setFirstDownYardLine(
            s.yardLine != null && s.distance != null ? s.yardLine + s.distance : undefined
          );

          setPossessionText(downInfo && field ? `${downInfo}, ${field}` : downInfo || field);

          if (s.lastPlay) {
            const play = s.lastPlay as PlayObject;
            play.distance = s.distance;
            setLastPlay(play);
          } else {
            setLastPlay(undefined);
          }
        } else {
          setPossessionTeamId(undefined);
          setShortDownDistanceText(undefined);
          setDownDistanceText(undefined);
          setFirstDownYardLine(undefined);
          setPossessionText(undefined);
          setHomeTimeouts(undefined);
          setAwayTimeouts(undefined);
          setLastPlay(undefined);
        }

        return currentStatus;
      } catch (err: any) {
        console.error("[NFL Possession] Error:", err);
        setError(err.message || "Failed to fetch possession");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [home, away, date, skipFetch]
  );

  /* ---------- Poll every 30s while live ---------- */
  useEffect(() => {
    if (skipFetch) return;

    const poll = async () => {
      const currentStatus = await fetchData(true);

      // Stop polling if game is not live
      if (currentStatus?.toLowerCase() !== "in progress" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Initial fetch + start interval
    poll();
    intervalRef.current = setInterval(poll, 12000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, skipFetch]);

  const refresh = useCallback(() => fetchData(false), [fetchData]);

  return {
    possessionTeamId,
    shortDownDistanceText,
    firstDownYardLine,
    redzone,
    downDistanceText,
    displayClock,
    period,
    lastPlay,
    homeTimeouts,
    awayTimeouts,
    score,
    lineScore,
    loading,
    error,
    gameStatusDescription,
    gameStatusDetail,
    gameStatusShortDetail,
    possessionText,
    refresh,
  };
};
