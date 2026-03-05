import axios from "axios";
import { Colors } from "constants/Styles";
import { teamsCBBById, teamsWCBBById } from "constants/teamsCBB";
import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

type UseCBBTeamGamesOptions = {
  season?: string;
  isWomen?: boolean;
  fetchAll?: boolean;
};

export function useCBBTeamGames(
  teamId: string | number,
  {
    season = "2025-2026",
    isWomen = false,
    fetchAll = false,
  }: UseCBBTeamGamesOptions = {},
) {
  const [games, setGames] = useState<CBBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;
  const teamsMap = isWomen ? teamsWCBBById : teamsCBBById;

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/games/cbb/team/${teamId}`, {
        params: {
          season,
          league,
          all: fetchAll ? 1 : 0,
        },
      });

      const rawGames: CBBGame[] = res.data.response || [];

      // Enrich each game with full team info
      const enrichedGames = rawGames.map((game) => {
        // Use wid for women, id for men
        const homeKey = isWomen
          ? Number(game.teams.home.wid)
          : Number(game.teams.home.id);
        const awayKey = isWomen
          ? Number(game.teams.away.wid)
          : Number(game.teams.away.id);

        const homeTeamData = teamsMap[homeKey] || {};
        const awayTeamData = teamsMap[awayKey] || {};

        return {
          ...game,
          teams: {
            home: {
              ...game.teams.home,
              name: homeTeamData.name || game.teams.home.name,
              fullName: homeTeamData.fullName || game.teams.home.fullName,
              logo: homeTeamData.logo || game.teams.home.logo,
              color: homeTeamData.color || Colors.midTone,
              secondaryColor: homeTeamData.secondaryColor || Colors.midTone,
              location: homeTeamData.location,
              venueName: homeTeamData.venueName,
            },
            away: {
              ...game.teams.away,
              name: awayTeamData.name || game.teams.away.name,
              fullName: awayTeamData.fullName || game.teams.away.fullName,
              logo: awayTeamData.logo || game.teams.away.logo,
              color: awayTeamData.color || Colors.midTone,
              secondaryColor: awayTeamData.secondaryColor || Colors.midTone,
              location: awayTeamData.location,
              venueName: awayTeamData.venueName,
            },
          },
        };
      });

      setGames(enrichedGames);
    } catch (err: any) {
      console.error("Error fetching CBB team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league, fetchAll, teamsMap]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames };
}
