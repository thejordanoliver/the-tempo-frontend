import axios from "axios";
import { getNBATeam, teams } from "constants/teams";
import { useLastTeamGame } from "hooks/NBAHooks/useLastTeamGame";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { DBPlayer } from "types/types";
import { apiClient } from "utils/apiClient";
import { getNBASeason } from "utils/dateUtils";

type TeamWithRecord = (typeof teams)[number] & { record?: string };


export function usePlayerDetail(playerId?: string, teamId?: string) {
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

  /* ---------------- Helpers ---------------- */
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const d = new Date(birthDate);
    if (isNaN(d.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const calculateExperience = (draftYear?: number | string) => {
    if (!draftYear) return null;
    const year = typeof draftYear === "string" ? Number(draftYear) : draftYear;
    if (isNaN(year)) return null;
    return new Date().getFullYear() - year;
  };

  return {
    player,
    loading,
    error,
    team,
    teamObj,
    lastGame,
    teamGameLoading,
    calculateAge,
    calculateExperience,
  };
}
