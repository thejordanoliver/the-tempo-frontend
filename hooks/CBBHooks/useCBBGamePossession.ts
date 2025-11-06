import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

export type CBBScore = {
  home: number;
  away: number;
  homeTeam: string;
  awayTeam: string;
  periodScores?: { period: number; home: number; away: number }[];
};

type GameState = {
  possessionTeamId?: number;
  displayClock?: string;
  period?: string | number;
  score?: CBBScore;
  gameStatusDescription?: string;
  gameStatusShortDetail?: string;
  possessionText?: string;
  isLive?: boolean; // ✅ Add live flag
};

export const useCBBGamePossession = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
) => {
  const [gameState, setGameState] = useState<GameState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skipFetch = !homeEspnId || !awayEspnId || !date;

  const fetchData = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        // --- Parse base date ---
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
        if (!targetDate || isNaN(targetDate.getTime())) return;

        const makeYMD = (d: Date) => {
          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, "0");
          const day = String(d.getUTCDate()).padStart(2, "0");
          return `${year}${month}${day}`;
        };

        // --- Try day before, day of, and day after ---
        const dateCandidates = [
          new Date(targetDate.getTime() - 24 * 60 * 60 * 1000),
          targetDate,
          new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        ];

        let foundGame: any = null;
        let usedDate: string | null = null;

        for (const d of dateCandidates) {
          const yyyymmdd = makeYMD(d);
          const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${yyyymmdd}&groups=50&limit=500`;
          const { data } = await axios.get(url);
          const games = data?.events ?? [];

          const game = games.find((g: any) => {
            const competitors = g.competitions?.[0]?.competitors ?? [];
            const ids = competitors.map((c: any) => Number(c.team?.id));
            return ids.includes(Number(homeEspnId)) && ids.includes(Number(awayEspnId));
          });

          if (game) {
            foundGame = game;
            usedDate = yyyymmdd;
            break;
          }
        }

        if (!foundGame) {
          console.warn(
            `[CBB Possession] Game not found for IDs ${homeEspnId} vs ${awayEspnId}`
          );
          return;
        }

        const competition = foundGame.competitions?.[0];
        const status = competition?.status ?? {};
        const situation = competition?.situation ?? {};

        const homeComp = competition.competitors?.find(
          (c: any) => c.homeAway === "home"
        );
        const awayComp = competition.competitors?.find(
          (c: any) => c.homeAway === "away"
        );
        if (!homeComp || !awayComp) return;

        const homeScore = Number(homeComp.score ?? 0);
        const awayScore = Number(awayComp.score ?? 0);

        const maxPeriods = Math.max(
          homeComp.linescores?.length ?? 0,
          awayComp.linescores?.length ?? 0
        );
        const periodScores =
          maxPeriods > 0
            ? Array.from({ length: maxPeriods }, (_, idx) => ({
                period: idx + 1,
                home: Number(homeComp.linescores?.[idx]?.value ?? 0),
                away: Number(awayComp.linescores?.[idx]?.value ?? 0),
              }))
            : undefined;

        const score: CBBScore = {
          home: homeScore,
          away: awayScore,
          homeTeam: homeComp.team?.displayName ?? "",
          awayTeam: awayComp.team?.displayName ?? "",
          periodScores,
        };

        const desc = status?.type?.description ?? status?.type?.detail ?? "";
        const short = status?.type?.shortDetail ?? "";
        const state = status?.type?.state ?? ""; // can be "pre", "in", or "post"

        const isLive = state === "in"; // ✅ Detect if game is live

        let period = situation?.period ?? status?.period ?? "";
        if (typeof desc === "string" && desc.toLowerCase().includes("halftime")) {
          period = 2;
        }

        setGameState({
          possessionTeamId: situation.possession ?? undefined,
          displayClock:
            situation.displayClock ||
            situation.clock ||
            status.displayClock ||
            status.clock ||
            "",
          period,
          possessionText: situation.possessionText ?? undefined,
          gameStatusDescription: desc,
          gameStatusShortDetail: short,
          score,
          isLive, // ✅ Save flag
        });

        console.log(`[CBB Possession] Found game on date ${usedDate} (${isLive ? "LIVE" : "Not Live"})`);
      } catch (err: any) {
        console.error("[useCBBGamePossession] Error fetching:", err.message);
        setError(err.message);
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [homeEspnId, awayEspnId, date, skipFetch]
  );

  useEffect(() => {
    // --- Initial fetch ---
    fetchData();

    // --- Poll only when game is live ---
    const maybeStartPolling = async () => {
      const firstFetch = await fetchData();
      if ((firstFetch as any)?.isLive) {
        intervalRef.current = setInterval(() => fetchData(true), 30000);
      }
    };
    maybeStartPolling();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return { ...gameState, refresh: fetchData, loading, error };
};
