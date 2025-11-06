import axios from "axios";
import { teamIdMap } from "constants/teamsNFL";
import { useCallback, useEffect, useRef, useState } from "react";

// Flip map: ESPN team ID → internal team ID
const espnToInternal: Record<string, number> = Object.fromEntries(
  Object.entries(teamIdMap).map(([internal, espn]) => [espn, Number(internal)])
);

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
    team?: { id: number }; // <-- add this
  };

  start?: {
    yardLine?: number;
    yardLineSide?: string;
    yardLineText?: string;
    distance?: number; // ✅ add this
    team?: { id: number };
  };
  end?: {
    yardLine?: number;
    yardLineSide?: string;
    yardLineText?: string;
    team?: { id: number };
  };
  team?: { id: number };
  possession?: string; // ✅ Added this
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

export const useNFLGamePossession = (
  home: string | null | undefined,
  away: string | null | undefined,
  date: string | { date?: string; utc?: string; timestamp?: number } | undefined
) => {
  const [possessionTeamId, setPossessionTeamId] = useState<
    number | undefined
  >();
  const [shortDownDistanceText, setShortDownDistanceText] = useState<
    string | undefined
  >();
  const [downDistanceText, setDownDistanceText] = useState<
    string | undefined
  >();
  const [displayClock, setDisplayClock] = useState<string | undefined>();
  const [period, setPeriod] = useState<string | undefined>();
  const [lastPlay, setLastPlay] = useState<string | PlayObject | undefined>();
  const [homeTimeouts, setHomeTimeouts] = useState<number | undefined>();
  const [awayTimeouts, setAwayTimeouts] = useState<number | undefined>();
  const [score, setScore] = useState<NFLScore | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatusDescription, setGameStatusDescription] = useState<
    string | undefined
  >();
  const [gameStatusDetail, setGameStatusDetail] = useState<
    string | undefined
  >();
  const [gameStatusShortDetail, setGameStatusShortDetail] = useState<
    string | undefined
  >();
  const [possessionText, setPossessionText] = useState<string | undefined>();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipFetch = !home || !away || !date;

  const fetchData = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        // --- Parse date input ---
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

        // --- ESPN API call ---
        const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${yyyymmdd}`;
        const { data } = await axios.get(url);
        const games = data.events || [];

        // --- Find target game ---
        const game = games.find((g: any) => {
          const competitors = g.competitions?.[0]?.competitors || [];
          const teamNames = competitors.flatMap((c: any) => [
            c.team.abbreviation?.toLowerCase(),
            c.team.displayName?.toLowerCase(),
            c.team.shortDisplayName?.toLowerCase(),
            c.team.name?.toLowerCase(),
          ]);
          const normalize = (s: string) => s.toLowerCase();
          return (
            teamNames.some((n: string) => n && n.includes(normalize(home))) &&
            teamNames.some((n: string) => n && n.includes(normalize(away)))
          );
        });

        if (!game) {
          console.warn(
            `[NFL Possession] Game not found on ESPN for ${home} vs ${away}`
          );
          return;
        }

        const competition = game.competitions[0];
        if (!competition) throw new Error("No competition data found");

        const statusObj = competition.status?.type;
        setGameStatusDescription(
          statusObj?.description ??
            statusObj?.detail ??
            statusObj?.shortDetail ??
            statusObj?.name ??
            statusObj?.state
        );
        setGameStatusDetail(statusObj?.detail);
        setGameStatusShortDetail(statusObj?.shortDetail);

        const gameState = competition.status?.type?.state;
        const isLive = gameState === "in";

        // --- Always update clock + period ---
        setDisplayClock(competition.status?.displayClock ?? "");
        setPeriod(competition.status?.period?.toString());

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

          // --- Map scores for NFLGameHeader ---
          setScore({
            home: { total: Number(homeComp.score) },
            away: { total: Number(awayComp.score) },
            periodScores,
            homeTeam: homeComp.team.displayName,
            awayTeam: awayComp.team.displayName,
          });
        }

        // --- Update possession & play info only if live ---
        if (isLive && competition.situation) {
          const espnPossessionId: string | undefined =
            competition.situation.possession;
          setPossessionTeamId(
            espnPossessionId ? espnToInternal[espnPossessionId] : undefined
          );

          setShortDownDistanceText(competition.situation.shortDownDistanceText);
          setDownDistanceText(competition.situation.downDistanceText);

          setHomeTimeouts(competition.situation.homeTimeouts);
          setAwayTimeouts(competition.situation.awayTimeouts);

          const downInfo = competition.situation.shortDownDistanceText ?? "";
          const fieldPosition = competition.situation.possessionText ?? "";
          setPossessionText(
            downInfo && fieldPosition
              ? `${downInfo}, ${fieldPosition}`
              : downInfo || fieldPosition
          );

          if (competition.situation.lastPlay) {
            const playObj = competition.situation.lastPlay as PlayObject;
            playObj.distance = competition.situation.distance;

            const extractSide = (text?: string) => {
              if (!text) return { side: undefined, yardLineText: undefined };
              const parts = text.split(" ");
              if (parts.length === 2) {
                const [side, num] = parts;
                return { side, yardLineText: `${side} ${num}` };
              }
              return { side: undefined, yardLineText: text };
            };

            if (playObj.drive?.start?.text) {
              const { side, yardLineText } = extractSide(
                playObj.drive.start.text
              );
              playObj.start = {
                ...playObj.start,
                yardLineSide: side,
                yardLineText,
              };
            }

            if (playObj.drive?.end?.text) {
              const { side, yardLineText } = extractSide(
                playObj.drive.end.text
              );
              playObj.end = {
                ...playObj.end,
                yardLineSide: side,
                yardLineText,
              };
            }

            setLastPlay(playObj);
          } else if (competition.status?.lastPlay) {
            setLastPlay(competition.status.lastPlay as string);
          } else setLastPlay(undefined);
        } else {
          setPossessionTeamId(undefined);
          setPossessionText(undefined);
          setShortDownDistanceText(undefined);
          setDownDistanceText(undefined);
          setLastPlay(undefined);
        }
      } catch (err: any) {
        console.error("[NFL Possession] Error fetching possession:", err);
        setError(err.message || "Failed to fetch possession");
        setPossessionTeamId(undefined);
        setShortDownDistanceText(undefined);
        setDownDistanceText(undefined);
        setDisplayClock(undefined);
        setPeriod(undefined);
        setLastPlay(undefined);
        setHomeTimeouts(undefined);
        setAwayTimeouts(undefined);
        setScore(undefined);
        setGameStatusDescription(undefined);
        setGameStatusDetail(undefined);
        setGameStatusShortDetail(undefined);
      } finally {
        setLoading(false);
      }
    },
    [home, away, date, skipFetch]
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
