import axios from "axios";
import rateLimit from "axios-rate-limit";
import { teams } from "constants/teamsCBB";
import { useEffect, useRef, useState } from "react";
import type { CBBGame, CBBTeam } from "types/types";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_BASKETBALL_RAPIDAPI_HOST;

const http = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

type ApiSportsCbbGame = {
  id: number;
  date: string;
  time: string | null;
  timestamp: number;
  timezone: string;
  stage: string | null;
  week: string | null;
  venue: string | null;
  status: {
    long: string;
    short: string;
    timer: string | null;
  };
  league: {
    id: number;
    name: string;
    season: string;
    logo: string;
    country: any;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  scores: {
    home: { total: number };
    away: { total: number };
  };
};

// 🔍 Helper: match team by name instead of ID
function findLocalTeam(apiName: string): CBBTeam | undefined {
  const normalized = apiName.toLowerCase().replace(/[^a-z0-9]/g, "");

  return teams.find((t) => {
    const name = (t.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return name === normalized || name.includes(normalized);
  });
}

export function useLastTeamGame(teamId: number | string) {
  const [lastGame, setLastGame] = useState<CBBGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string | number, CBBGame | null>>(new Map());

  const fetchLastGame = async () => {
    setLoading(true);
    setError(null);

    if (cacheRef.current.has(teamId)) {
      setLastGame(cacheRef.current.get(teamId) || null);
      setLoading(false);
      return;
    }

    try {
      const res = await http.get<{ response: ApiSportsCbbGame[] }>(
        `https://${RAPIDAPI_HOST}/games`,
        {
          params: {
            team: teamId,
            season: "2025-2026",
          },
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
          },
        }
      );

      const games = res.data.response;

      // Only finished games
      const finished = games.filter(
        (g) => g.status.long.toLowerCase() === "game finished"
      );

      if (finished.length === 0) {
        cacheRef.current.set(teamId, null);
        setLastGame(null);
        return;
      }

      // Most recent
      const last = finished.sort((a, b) => b.timestamp - a.timestamp)[0];

      // Local team mapping
      const homeLocal = teams.find((t) => t.id === last.teams.home.id);
      const awayLocal = teams.find((t) => t.id === last.teams.away.id);

      if (!homeLocal || !awayLocal) {
        throw new Error("Local CBB team mapping missing");
      }

      const enriched: CBBGame = {
        id: last.id,
        date: last.date,
        time: new Date(last.date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        timestamp: last.timestamp,
        timezone: last.timezone,

        stage: last.stage,
        week: last.week,
        venue: last.venue,

        status: {
          long: last.status.long,
          short: last.status.short,
          timer: last.status.timer,
        },

        league: {
          id: last.league.id,
          name: last.league.name,
          type: "college",
          season: last.league.season,
          logo: last.league.logo,
          country: last.league.country,
        },

        teams: {
          home: homeLocal,
          away: awayLocal,
        },

        scores: {
          home: {
            quarter_1: last.scores.home.total,
            quarter_2: null,
            quarter_3: null,
            quarter_4: null,
            over_time: null,
            total: last.scores.home.total,
          },
          away: {
            quarter_1: last.scores.away.total,
            quarter_2: null,
            quarter_3: null,
            quarter_4: null,
            over_time: null,
            total: last.scores.away.total,
          },
        },
      };

      cacheRef.current.set(teamId, enriched);
      setLastGame(enriched);
    } catch (err: any) {
      console.error("Error fetching last CBB game:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamId) return;
    fetchLastGame();
  }, [teamId]);

  return { lastGame, loading, error, refresh: fetchLastGame };
}
