import { getNBATeam, teams } from "constants/teams";
import { useLastTeamGame } from "hooks/NBAHooks/useLastTeamGame";
import { useEffect, useState } from "react";
import type { DBPlayer } from "types/types";
import { apiClient } from "utils/apiClient";
import { getNBASeason } from "utils/dateUtils";

type TeamWithRecord = (typeof teams)[number] & { record?: string };

export function usePlayerById(playerId?: string, teamId?: string) {
  const parsedPlayerId = parseInt(playerId ?? "", 10);
  const sanitizedTeamId = String(teamId ?? "")
    .replace(/"/g, "")
    .trim();
  const teamNumericId = Number(sanitizedTeamId);

  const [player, setPlayer] = useState<DBPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const team = getNBATeam(String(teamId));
  const teamObj = teams.find((t) => String(t.id) === sanitizedTeamId) as
    | TeamWithRecord
    | undefined;

  const { lastGame, loading: teamGameLoading } = useLastTeamGame(
    teamNumericId,
    getNBASeason(),
  );

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
          `api/players/player-id/${parsedPlayerId}`,
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

  return {
    player,
    loading,
    error,
    team,
    teamObj,
    lastGame,
    teamGameLoading,
  };
}
