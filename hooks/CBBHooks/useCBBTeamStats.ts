import { useEffect, useState } from "react";
import axios from "axios";

export interface SeasonAverages {
  avgPoints: string;
  avgRebounds: string;
  avgAssists: string;
  avgMinutes: string;
  gamesPlayed: string;
}

export interface Player {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  jersey_number: string;
  position: string;
  headshot_url: string;
  team: string;
  team_id: number;

  currentSeason?: {
    season: number;
    displaySeason: string;
    averages: SeasonAverages;
  };
}

export const useTeamStats = (teamId: number) => {
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchRoster = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:4000/api/players/cbb/roster/${teamId}`
        );

        const normalizedRoster: Player[] = response.data.map((player: any) => {
          const seasons = player.seasonStats || player.season_stats || [];

          // 🔥 Get most recent season
          const currentSeason =
            seasons.length > 0
              ? seasons.reduce((latest: any, season: any) =>
                  season.season > latest.season ? season : latest
                )
              : null;

          return {
            id: player.id,
            name: player.name,
            first_name: player.first_name,
            last_name: player.last_name,
            jersey_number: player.jersey_number,
            position: player.position,
            headshot_url: player.headshot_url,
            team: player.team,
            team_id: player.team_id,
            currentSeason: currentSeason
              ? {
                  season: currentSeason.season,
                  displaySeason: currentSeason.displaySeason,
                  averages: currentSeason.averages,
                }
              : undefined,
          };
        });

        setRoster(normalizedRoster);
      } catch (err: any) {
        setError("Failed to load roster");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [teamId]);

  return { roster, loading, error };
};
