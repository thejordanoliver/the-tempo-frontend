import axios from "axios";
import { teams } from "constants/teamsCFB";
import { useCallback, useEffect, useRef, useState } from "react";

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
    timeElapsed?: { displayValue?: string };
  };
  statYardage?: number;
  athletesInvolved?: Athlete[];
};

export type CFBScore = {
  home: number;
  away: number;
  homeTeam: string;
  awayTeam: string;
  periodScores?: { period: number; home: number; away: number }[];
};

// --- ESPN → internal mapping ---
const espnToInternal: Record<string, number> = {};
teams.forEach((t) => {
  if (t.espnID) espnToInternal[String(t.espnID)] = Number(t.id);
});

export const useCFBGamePossession = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
) => {
  const [possessionTeamId, setPossessionTeamId] = useState<number>();
  const [shortDownDistanceText, setShortDownDistanceText] = useState<string>();
  const [downDistanceText, setDownDistanceText] = useState<string>();
  const [firstDownYardLine, setFirstDownYardLine] = useState<number>();
  const [displayClock, setDisplayClock] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [lastPlay, setLastPlay] = useState<string | PlayObject>();
  const [homeTimeouts, setHomeTimeouts] = useState<number>();
  const [awayTimeouts, setAwayTimeouts] = useState<number>();
  const [score, setScore] = useState<CFBScore>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatusDescription, setGameStatusDescription] = useState<string>();
  const [gameStatusDetail, setGameStatusDetail] = useState<string>();
  const [gameStatusShortDetail, setGameStatusShortDetail] = useState<string>();
  const [possessionText, setPossessionText] = useState<string>();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipFetch = !homeEspnId || !awayEspnId || !date;

  const fetchData = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        // --- Parse date ---
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
        const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${yyyymmdd}`;

        const { data } = await axios.get(url);
        const games = data.events || [];

        const game = games.find((g: any) => {
          const competitors = g.competitions?.[0]?.competitors || [];
          const ids = competitors.map((c: any) => Number(c.team.id));
          return ids.includes(homeEspnId) && ids.includes(awayEspnId);
        });

        if (!game) {
          console.warn(`[CFB Possession] Game not found: ${homeEspnId} vs ${awayEspnId}`);
          return;
        }

        const competition = game.competitions?.[0];
        if (!competition) throw new Error("No competition data found");

        const status = competition.status || {};
        const situation = competition.situation || {};
        const gameStateStr = status.type?.state;
        const isLive = gameStateStr === "in";

        // --- Always update clock + period ---
        setDisplayClock(status.displayClock);
        setPeriod(status.period?.toString());
        setGameStatusDescription(status.type?.description);
        setGameStatusDetail(status.type?.detail);
        setGameStatusShortDetail(status.type?.shortDetail);

        // --- Score ---
        const competitors = competition.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        if (homeComp && awayComp) {
          const maxPeriods = Math.max(homeComp.linescores?.length ?? 0, awayComp.linescores?.length ?? 0);
          const periodScores = Array.from({ length: maxPeriods }, (_, idx) => ({
            period: idx + 1,
            home: homeComp.linescores?.[idx]?.value ?? 0,
            away: awayComp.linescores?.[idx]?.value ?? 0,
          }));

          setScore({
            home: Number(homeComp.score),
            away: Number(awayComp.score),
            homeTeam: homeComp.team.displayName,
            awayTeam: awayComp.team.displayName,
            periodScores,
          });
        }

        if (isLive) {
          // --- Possession & field info ---
          const espnPossessionId: string | undefined = situation.possession;
          setPossessionTeamId(espnPossessionId ? espnToInternal[espnPossessionId] : undefined);

          const downInfo = situation.shortDownDistanceText ?? "";
          const lineOfScrimmage = situation.yardLine ?? 0;
          const yardsToGo = situation.distance ?? 0;
          setFirstDownYardLine(lineOfScrimmage + yardsToGo);

          const fieldPosition = situation.possessionText ?? "";
          setShortDownDistanceText(downInfo);
          setDownDistanceText(situation.downDistanceText);
          setPossessionText(downInfo && fieldPosition ? `${downInfo}, ${fieldPosition}` : downInfo || fieldPosition);
          setHomeTimeouts(situation.homeTimeouts);
          setAwayTimeouts(situation.awayTimeouts);

          if (situation.lastPlay) {
            const playObj = situation.lastPlay as PlayObject;
            playObj.statYardage = situation.distance;
            setLastPlay(playObj);
          } else if (status.lastPlay) {
            setLastPlay(status.lastPlay as string);
          } else setLastPlay(undefined);
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
      } catch (err: any) {
        console.error("[CFB Possession] Error fetching:", err);
        setError(err.message || "Failed to fetch possession");
      } finally {
        setLoading(false);
      }
    },
    [homeEspnId, awayEspnId, date, skipFetch]
  );

  // --- Poll every 30s ---
  useEffect(() => {
    if (skipFetch) return;

    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, skipFetch]);

  const refresh = useCallback(() => fetchData(false), [fetchData]);

  return {
    possessionTeamId,
    shortDownDistanceText,
    firstDownYardLine,
    downDistanceText,
    displayClock,
    period,
    lastPlay,
    homeTimeouts,
    awayTimeouts,
    score,
    loading,
    error,
    gameStatusDescription,
    gameStatusDetail,
    gameStatusShortDetail,
    possessionText,
    refresh,
  };
};
