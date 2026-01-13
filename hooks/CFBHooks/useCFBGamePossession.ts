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
  if (t.espnID) espnToInternal[String(t.espnID)] = Number(t.espnID);
});

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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
  const [redzone, setRedzone] = useState<boolean>();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fatalErrorRef = useRef(false);

  // --- Validate ESPN IDs ---
  const homeInternalId =
    homeEspnId != null ? espnToInternal[String(homeEspnId)] : undefined;

  const awayInternalId =
    awayEspnId != null ? espnToInternal[String(awayEspnId)] : undefined;

  const skipFetch =
    !homeEspnId ||
    !awayEspnId ||
    !date ||
    !homeInternalId ||
    !awayInternalId;

  const lineScore = score?.periodScores
    ? {
        home: score.periodScores.map((p) => p.home),
        away: score.periodScores.map((p) => p.away),
      }
    : undefined;

  const fetchData = useCallback(
    async (isPolling = false) => {
      if (skipFetch || fatalErrorRef.current) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/cfb/details/game-possession`,
          {
            params: { homeId: homeEspnId, awayId: awayEspnId, date },
          }
        );

        const { status, possession, score } = data;

        setDisplayClock(status.clock);
        setPeriod(status.period?.toString());
        setGameStatusDescription(status.description);
        setGameStatusDetail(status.detail);
        setGameStatusShortDetail(status.shortDetail);
        setLastPlay(status.lastPlay ?? undefined);

        if (score) setScore(score);

        if (status.state === "in" && possession) {
          setPossessionTeamId(
            possession.teamId
              ? espnToInternal[String(possession.teamId)]
              : undefined
          );

          const firstDown =
            possession.yardLine != null && possession.distance != null
              ? possession.yardLine + possession.distance
              : undefined;

          setFirstDownYardLine(firstDown);
          setShortDownDistanceText(possession.shortDownDistanceText);
          setDownDistanceText(possession.downDistanceText);
          setPossessionText(
            possession.shortDownDistanceText && possession.possessionText
              ? `${possession.shortDownDistanceText}, ${possession.possessionText}`
              : possession.shortDownDistanceText || possession.possessionText
          );

          setHomeTimeouts(possession.homeTimeouts);
          setAwayTimeouts(possession.awayTimeouts);
          setRedzone(possession.isRedZone);
        } else {
          setPossessionTeamId(undefined);
          setShortDownDistanceText(undefined);
          setDownDistanceText(undefined);
          setFirstDownYardLine(undefined);
          setPossessionText(undefined);
          setHomeTimeouts(undefined);
          setAwayTimeouts(undefined);
          setRedzone(undefined);
        }
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          console.warn("[CFB Possession] Game not found — stopping polling");
          fatalErrorRef.current = true;
          setError("Game not found");
          return;
        }

        console.warn("[CFB Possession] Error:", err);
        setError(err.message || "Failed to fetch possession");
      } finally {
        setLoading(false);
      }
    },
    [homeEspnId, awayEspnId, date, skipFetch]
  );

  // --- Poll every 15s ---
  useEffect(() => {
    if (skipFetch || fatalErrorRef.current) return;

    fetchData();
    intervalRef.current = setInterval(() => {
      if (!fatalErrorRef.current) fetchData(true);
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, skipFetch]);

  const refresh = useCallback(() => {
    if (!fatalErrorRef.current) fetchData(false);
  }, [fetchData]);

  return {
    possessionTeamId,
    shortDownDistanceText,
    firstDownYardLine,
    downDistanceText,
    displayClock,
    period,
    lastPlay,
    lineScore,
    redzone,
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
