import axios from "axios";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teamIdMap as nflTeams } from "constants/teamsNFL";
import { useCallback, useEffect, useRef, useState } from "react";

type League = "cfb" | "nfl";

// --- Build ESPN → internal ID maps ---
const buildEspnMap = (obj: any, league: League) => {
  const map: Record<string, number> = {};

  if (league === "cfb") {
    cfbTeams.forEach((t) => {
      if (t.espnID) map[String(t.espnID)] = Number(t.espnID);
    });
  } else {
    // nflTeams: { internalId: espnID }
    Object.entries(nflTeams).forEach(([internal, espn]) => {
      map[String(espn)] = Number(internal);
    });
  }

  return map;
};

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
    team?: { id: number };
  };
  statYardage?: number;
  distance?: number;
  athletesInvolved?: Athlete[];
};

export type FootballScore = {
  home: number;
  away: number;
  homeTeam: string;
  awayTeam: string;
  periodScores?: { period: number; home: number; away: number }[];
};

export const useFootballGamePossession = (
  league: League,
  homeEspnId?: number,
  awayEspnId?: number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
) => {
  const espnToInternal = buildEspnMap(null, league);

  const [possessionTeamId, setPossessionTeamId] = useState<number>();
  const [shortDownDistanceText, setShortDownDistanceText] = useState<string>();
  const [downDistanceText, setDownDistanceText] = useState<string>();
  const [firstDownYardLine, setFirstDownYardLine] = useState<number>();
  const [displayClock, setDisplayClock] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [lastPlay, setLastPlay] = useState<string | PlayObject>();
  const [homeTimeouts, setHomeTimeouts] = useState<number>();
  const [awayTimeouts, setAwayTimeouts] = useState<number>();
  const [score, setScore] = useState<FootballScore>();
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
          const us = d.toLocaleDateString("en-US", {
            timeZone: "America/New_York",
          });
          const [m, day, y] = us.split("/");
          return `${y}${m.padStart(2, "0")}${day.padStart(2, "0")}`;
        };

        const yyyymmdd = makeYMD(targetDate);

        const url =
          league === "cfb"
            ? `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${yyyymmdd}`
            : `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${yyyymmdd}`;

        const { data } = await axios.get(url);
        const games = data.events || [];

        // MATCH GAME
        const game = games.find((g: any) => {
          const comps = g.competitions?.[0]?.competitors || [];
          const ids = comps.map((c: any) => Number(c.team.id));
          return ids.includes(homeEspnId) && ids.includes(awayEspnId);
        });

        if (!game) return;

        const comp = game.competitions[0];
        const status = comp.status || {};
        const situation = comp.situation || {};

        const state = status.type?.state;
        const isLive = state === "in";

        setDisplayClock(status.displayClock);
        setPeriod(status.period?.toString());
        setGameStatusDescription(status.type?.description);
        setGameStatusDetail(status.type?.detail);
        setGameStatusShortDetail(status.type?.shortDetail);

        // SCORE
        const comps = comp.competitors;
        const home = comps.find((c: any) => c.homeAway === "home");
        const away = comps.find((c: any) => c.homeAway === "away");

        if (home && away) {
          const maxPer = Math.max(
            home.linescores?.length ?? 0,
            away.linescores?.length ?? 0
          );

          const perScores = Array.from({ length: maxPer }, (_, idx) => ({
            period: idx + 1,
            home: home.linescores?.[idx]?.value ?? 0,
            away: away.linescores?.[idx]?.value ?? 0,
          }));

          setScore({
            home: Number(home.score),
            away: Number(away.score),
            homeTeam: home.team.displayName,
            awayTeam: away.team.displayName,
            periodScores: perScores,
          });
        }

        // POSSESSION
        if (isLive) {
          const espnPossId = situation.possession;
          setPossessionTeamId(
            espnPossId ? espnToInternal[String(espnPossId)] : undefined
          );

          setShortDownDistanceText(situation.shortDownDistanceText);
          setDownDistanceText(situation.downDistanceText);

          const los = situation.yardLine || 0;
          const dist = situation.distance || 0;

          setFirstDownYardLine(los + dist);

          const fieldPos = situation.possessionText;
          setPossessionText(
            situation.shortDownDistanceText && fieldPos
              ? `${situation.shortDownDistanceText}, ${fieldPos}`
              : situation.shortDownDistanceText || fieldPos
          );

          setHomeTimeouts(situation.homeTimeouts);
          setAwayTimeouts(situation.awayTimeouts);

          if (situation.lastPlay) {
            const playObj = situation.lastPlay as PlayObject;
            playObj.distance = situation.distance;
            setLastPlay(playObj);
          } else setLastPlay(undefined);
        } else {
          setPossessionTeamId(undefined);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [league, homeEspnId, awayEspnId, date, skipFetch]
  );

  // POLL
  useEffect(() => {
    if (skipFetch) return;

    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

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
    refresh: () => fetchData(false),
  };
};
