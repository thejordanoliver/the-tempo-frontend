import axios from "axios";
import { teams } from "constants/teamsCFB";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type GameState = {
  possessionTeamId?: number;
  shortDownDistanceText?: string;
  downDistanceText?: string;
  displayClock?: string;
  period?: string;
  lastPlay?: string | PlayObject;
  homeTimeouts?: number;
  awayTimeouts?: number;
  score?: CFBScore;
  gameStatusDescription?: string;
  gameStatusDetail?: string;
  gameStatusShortDetail?: string;
  possessionText?: string;
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
  const [gameState, setGameState] = useState<GameState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch = !homeEspnId || !awayEspnId || !date;

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

        const gameStateStr = competition.status?.type?.state;
        if (gameStateStr !== "in") return;

        const situation = competition.situation || {};
        const status = competition.status || {};

        const downInfo = situation.shortDownDistanceText ?? "";
        const fieldPosition = situation.possessionText ?? "";
        const possessionText =
          downInfo && fieldPosition
            ? `${downInfo}, ${fieldPosition}`
            : downInfo || fieldPosition || undefined;

        const competitors = competition.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        let score: CFBScore | undefined;
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

          score = {
            home: Number(homeComp.score),
            away: Number(awayComp.score),
            homeTeam: homeComp.team.displayName,
            awayTeam: awayComp.team.displayName,
            periodScores,
          };
        }

        // Build the new state
        const newState: GameState = {
          possessionTeamId: Number(situation.possession),
          shortDownDistanceText: situation.shortDownDistanceText,
          downDistanceText: situation.downDistanceText,
          displayClock: status.displayClock,
          period: status.period,
          lastPlay: situation.lastPlay || status.lastPlay,
          homeTimeouts: situation.homeTimeouts,
          awayTimeouts: situation.awayTimeouts,
          score,
          gameStatusDescription: status.type?.description,
          gameStatusDetail: status.type?.detail,
          gameStatusShortDetail: status.type?.shortDetail,
          possessionText,
        };

        // ✅ Only update if data changed (prevents redundant re-renders)
        setGameState((prev) => {
          return JSON.stringify(prev) !== JSON.stringify(newState) ? newState : prev;
        });
      } catch (err: any) {
        console.error("[CFB Possession] Error fetching:", err);
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

  return useMemo(
    () => ({
      ...gameState,
      loading,
      error,
      refresh,
    }),
    [gameState, loading, error, refresh]
  );
};
