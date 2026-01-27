import axios from "axios";
import rateLimit from "axios-rate-limit";
import { teams as nflTeams } from "constants/teamsNFL";
import { teams as cfbTeams } from "constants/teamsCFB";
import { useCallback, useEffect, useRef, useState } from "react";
import { Game } from "types/nfl";
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_FOOTBALL_RAPIDAPI_HOST || "";

const http = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

type GameType<L extends string> = Game;



export function useLastTeamGame<L extends "1" | "2">(
  teamId: string | number,
  league: L = "1" as L
) {
  const [lastGame, setLastGame] = useState<GameType<L> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, GameType<L> | null>>(new Map());

  const fetchLastGame = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `${league}-${teamId}`;
      if (cacheRef.current.has(cacheKey)) {
        setLastGame(cacheRef.current.get(cacheKey)!);
        setLoading(false);
        return;
      }

      const res = await http.get<{ response: any[] }>(
        `https://${RAPIDAPI_HOST}/games`,
        {
          params: { team: teamId, season: "2025", league },
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
          },
        }
      );

      const games = res.data.response || [];
      const completedGames = games.filter((g) =>
        ["ft", "aot"].includes((g.game?.status?.short ?? "").toLowerCase())
      );

      if (!completedGames.length) {
        cacheRef.current.set(cacheKey, null);
        setLastGame(null);
        return;
      }

      const sorted = completedGames.sort(
        (a, b) =>
          (b.game.date?.timestamp ?? 0) - (a.game.date?.timestamp ?? 0)
      );
      const last = sorted[0];

      const isNFL = league === "1";
      const teamList = isNFL ? nflTeams : cfbTeams;

      const mapTeam = (apiTeam: any, localTeam: any = {}) => ({
        id: apiTeam.id,
        espnID: localTeam?.espnID ?? "",
        oddsID: "",
        name: localTeam?.name ?? apiTeam.name ?? "Team",
        fullName: localTeam?.fullName ?? apiTeam.name ?? "Team",
        code: localTeam?.code ?? "",
        city: apiTeam.city ?? "",
        location: localTeam?.location ?? "",
        address: localTeam?.address,
        coach: apiTeam.coach ?? "",
        coachImage: localTeam?.coachImage,
        owner: localTeam?.owner,
        venue: apiTeam.venue ?? "",
        established: apiTeam.established ?? 0,
        logo: localTeam?.logo ?? require("assets/Placeholders/teamPlaceholder.png"),
        logoLight: localTeam?.logoLight,
        country: { name: "USA", code: "US", flag: "🇺🇸" },
        color: localTeam?.color ?? "#000",
        secondaryColor: localTeam?.secondaryColor ?? "#555",
        latitude: localTeam?.latitude ?? 0,
        longitude: localTeam?.longitude ?? 0,
        venueImage: localTeam?.venueImage,
        venueCapacity: localTeam?.venueCapacity ?? "",
        banner: localTeam?.banner,
      });

      const homeTeam = mapTeam(last.teams.home, teamList.find((t) => String(t.id) === String(last.teams.home.id)));
      const awayTeam = mapTeam(last.teams.away, teamList.find((t) => String(t.id) === String(last.teams.away.id)));

const enrichedGame = ({
  game: {
    id: String(last.game.id),
    league: isNFL ? "NFL" : "CFB",
    date: { timestamp: last.game.date?.timestamp ?? 0 },
    status: {
      long: last.game.status?.long ?? "",
      short: last.game.status?.short ?? "",
      timer: last.game.status?.clock ?? null,
    },
    venue: last.game.venue
      ? {
          name: last.game.venue.name ?? "",
          city: last.game.venue.city ?? "",
        }
      : undefined,
  },
  teams: { home: homeTeam, away: awayTeam },
  scores: {
    home: last.scores.home ?? {},
    away: last.scores.away ?? {},
  },
} as unknown) as GameType<L>;


      cacheRef.current.set(cacheKey, enrichedGame);
      setLastGame(enrichedGame);
    } catch (err: any) {
      console.error("Error fetching last game:", err.message);
      setError(err.message || "Failed to fetch last game");
    } finally {
      setLoading(false);
    }
  }, [teamId, league]);

  useEffect(() => {
    if (!teamId) return;
    fetchLastGame();
  }, [fetchLastGame]);

  return { lastGame, loading, error, refresh: fetchLastGame };
}
