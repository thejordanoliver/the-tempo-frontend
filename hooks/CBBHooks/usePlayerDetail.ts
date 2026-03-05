import axios from "axios";
import { teamsCBBById, teamsWCBBById } from "constants/teamsCBB";
import { useLastTeamGame } from "./useLastTeamGame";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import type { CBBGame, DBPlayer, Game } from "types/types";

const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL;

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000"; // Android emulator fix
  }

  return BASE_API_URL;
}

export function usePlayerDetail(
  playerId?: string,
  teamId?: string,
  isWomen?: boolean,
) {
  const parsedPlayerId = parseInt(playerId ?? "", 10);
  const sanitizedTeamId = String(teamId ?? "")
    .replace(/"/g, "")
    .trim();
  const teamNumericId = Number(sanitizedTeamId);

  const API_URL = getApiBaseUrl();

  const leaguePath = isWomen ? "wcbb" : "cbb";
  const teamsSource = isWomen ? teamsWCBBById : teamsCBBById;

  const [player, setPlayer] = useState<DBPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const team = teamsSource[teamNumericId];

  const teamObj = team ? { ...team } : undefined;

const { lastGame, loading: teamGameLoading } = useLastTeamGame({
  teamId: teamNumericId,
  isWomen,
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
        const res = await axios.get<{ player: DBPlayer }>(
          `${API_URL}/api/${leaguePath}/players/player-id/${parsedPlayerId}`,
        );

        setPlayer(res.data.player);
      } catch (err: any) {
        setError(err.message || "Failed to load player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [parsedPlayerId, leaguePath]);

  /* ---------------- Enriched game ---------------- */
const enrichedLastGame = lastGame

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
