import { getWNBATeam } from "constants/teamsWNBA";
import { useEffect, useState } from "react";
import type { DBPlayer } from "types/types";
import { apiClient } from "utils/apiClient";
import { useLastTeamGame } from "./useLastTeamGame";

export function usePlayerDetail(playerId?: string, teamId?: string) {
  const parsedPlayerId = parseInt(playerId ?? "", 10);
  const sanitizedTeamId = String(teamId ?? "")
    .replace(/"/g, "")
    .trim();
  const teamNumericId = Number(sanitizedTeamId);

  const [player, setPlayer] = useState<DBPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const team = getWNBATeam(teamNumericId);

  const teamObj = team ? { ...team } : undefined;

  const { lastGame, loading: teamGameLoading } = useLastTeamGame({
    teamId: teamNumericId,
  });

  /* ---------------- Fetch player ---------------- */
  useEffect(() => {
    if (!parsedPlayerId || isNaN(parsedPlayerId)) {
      setError("Invalid player ID");
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<{ player: DBPlayer }>(
          `/api/wnba/players/player-id/${parsedPlayerId}`,
        );

        setPlayer(res.data.player);
      } catch (err: any) {
        setError(err.message || "Failed to load player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [parsedPlayerId]);

  /* ---------------- Enriched game ---------------- */
  const enrichedLastGame = lastGame;

  return {
    player,
    loading,
    error,
    team,
    teamObj,
    enrichedLastGame,
    teamGameLoading,
  };
}
