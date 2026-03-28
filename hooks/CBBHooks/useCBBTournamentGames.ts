// hooks/CBBHooks/useCBBTournamentGames.ts
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { BASE_URL } from "utils/apiClient";

// 🔥 Core types from your API
type Season = {
  year: number;
  displayName: string;
  startDate: string;
  endDate: string;
  type: {
    id: string;
    name: string;
    abbreviation: string; // "post"
  };
};

type League = {
  id: string;
  name: string;
  slug: string;
};

type Competition = {
  id: string;
  date: string;
  tournamentId?: number;
  notes?: { headline: string }[];
  status?: {
    type: {
      description: string;
      shortDetail: string;
      state: string;
    };
  };
};

type Game = {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Competition[];
};

export function useCBBTournamentGames(initialDate?: Date) {
  const [games, setGames] = useState<Game[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [count, setCount] = useState<number>(0);
  const [date, setDate] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate ?? new Date(),
  );

  // 🔥 Helper: extract tournament round
  const getRound = (game: Game): string | null => {
    const headline = game.competitions?.[0]?.notes?.[0]?.headline;
    return headline ?? null;
  };

  // 🔥 Fetch
  const fetchTournamentGames = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      const formattedDate = dayjs(date).format("YYYYMMDD");

      const res = await axios.get(`${BASE_URL}/api/details/tournament`, {
        params: { date: formattedDate },
      });

      const data = res.data;

      setGames(data?.events || []);
      setSeason(data?.season || null);
      setLeague(data?.league || null);
      setCount(data?.count || 0);
      setDate(data?.date || "");
    } catch (err: any) {
      console.error("Tournament fetch error:", err);

      if (err.response) {
        setError(err.response.data?.error || "Server error");
      } else if (err.request) {
        setError("Network error");
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔁 Auto-fetch
  useEffect(() => {
    fetchTournamentGames(selectedDate);
  }, [selectedDate, fetchTournamentGames]);

  const refresh = async () => {
    await fetchTournamentGames(selectedDate);
  };

  // 🔥 Derived helpers
  const isPostseason = season?.type?.abbreviation === "post";

  const roundsMap = games.reduce<Record<string, Game[]>>((acc, game) => {
    const round = getRound(game) || "Other";
    if (!acc[round]) acc[round] = [];
    acc[round].push(game);
    return acc;
  }, {});

  return {
    games,
    season,
    league,
    count,
    date,

    // 🔥 Power features
    isPostseason,
    roundsMap, // grouped by round (HUGE for bracket UI)

    loading,
    error,
    selectedDate,
    setSelectedDate,
    refresh,
  };
}
