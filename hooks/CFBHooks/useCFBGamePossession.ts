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
  const [possessionTeamId, setPossessionTeamId] = useState<number | undefined>();
  const [shortDownDistanceText, setShortDownDistanceText] = useState<string | undefined>();
  const [downDistanceText, setDownDistanceText] = useState<string | undefined>();
  const [displayClock, setDisplayClock] = useState<string | undefined>();
  const [period, setPeriod] = useState<string | undefined>();
  const [lastPlay, setLastPlay] = useState<string | PlayObject | undefined>();
  const [homeTimeouts, setHomeTimeouts] = useState<number | undefined>();
  const [awayTimeouts, setAwayTimeouts] = useState<number | undefined>();
  const [score, setScore] = useState<CFBScore | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatusDescription, setGameStatusDescription] = useState<string | undefined>();
  const [gameStatusDetail, setGameStatusDetail] = useState<string | undefined>();
  const [gameStatusShortDetail, setGameStatusShortDetail] = useState<string | undefined>();
  const [possessionText, setPossessionText] = useState<string | undefined>();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipFetch = !homeEspnId || !awayEspnId || !date;

  // --- Fetch live game possession data ---
  const fetchData = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
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
          const usDate = d.toLocaleDateString("en-US", {
            timeZone: "America/New_York",
          });
          const [month, day, year] = usDate.split("/");
          return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
        };

        const yyyymmdd = makeYMD(targetDate);
        const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${yyyymmdd}`;

        const { data } = await axios.get(url);
        const games = data.events || [];

        // ✅ Match game by ESPN IDs
        const game = games.find((g: any) => {
          const competitors = g.competitions?.[0]?.competitors || [];
          const ids = competitors.map((c: any) => Number(c.team.id));
          return ids.includes(homeEspnId) && ids.includes(awayEspnId);
        });

        if (!game) {
          console.warn(
            `[CFB Possession] Game not found for ESPN IDs: ${homeEspnId} vs ${awayEspnId}`
          );
          return;
        }

        const competition = game.competitions?.[0];
        if (!competition) throw new Error("No competition data found");

        // Only poll live games
        const gameState = competition.status?.type?.state;
        if (gameState !== "in") return;

        const statusObj = competition.status?.type;
        setGameStatusDescription(statusObj?.description);
        setGameStatusDetail(statusObj?.detail);
        setGameStatusShortDetail(statusObj?.shortDetail);

        // --- Possession ---
        const espnPossessionId = Number(competition.situation?.possession);
        setPossessionTeamId(espnPossessionId);
        setShortDownDistanceText(competition.situation?.shortDownDistanceText);
        setDownDistanceText(competition.situation?.downDistanceText);
        setHomeTimeouts(competition.situation?.homeTimeouts);
        setAwayTimeouts(competition.situation?.awayTimeouts);
        setDisplayClock(competition.status?.displayClock);
        setPeriod(competition.status?.period);

        const lastPlayData =
          competition.situation?.lastPlay ||
          competition.status?.lastPlay ||
          undefined;
        setLastPlay(lastPlayData);

        // --- Build possessionText (e.g., “1st & 10 • LSU 25”) ---
        const possessionTeamName =
          teams.find((t) => Number(t.espnID) === espnPossessionId)?.name ??
          competition.situation?.possessionText ??
          "";

        const shortText = competition.situation?.shortDownDistanceText ?? "";
        const downText = competition.situation?.downDistanceText ?? "";

   // --- Combine shortDownDistanceText + field position (e.g., "2nd & 11 • ORE 12") ---
const downInfo = competition.situation?.shortDownDistanceText ?? "";
const fieldPosition = competition.situation?.possessionText ?? "";
const combinedPossession =
  downInfo && fieldPosition
    ? `${downInfo}, ${fieldPosition}`
    : downInfo || fieldPosition || undefined;

setPossessionText(combinedPossession);


        // --- Score data ---
        const competitors = competition.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        if (homeComp && awayComp) {
          const maxPeriods = Math.max(
            homeComp.linescores?.length ?? 0,
            awayComp.linescores?.length ?? 0
          );

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
      } catch (err: any) {
        console.error("[CFB Possession] Error fetching possession:", err);
        setError(err.message || "Failed to fetch possession data");
      } finally {
        setLoading(false);
      }
    },
    [homeEspnId, awayEspnId, date, skipFetch]
  );


  // --- Poll every 60s ---
  useEffect(() => {
    if (skipFetch) return;
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, skipFetch]);

  const refresh = useCallback(() => fetchData(false), [fetchData]);
  // ✅ Return all state
  return {
    possessionTeamId,
    shortDownDistanceText,
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
    possessionText, // ✅ Added to return
    refresh,
  };
};
