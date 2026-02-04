import axios from "axios";
import { Platform } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { getTeamInfo, teams } from "constants/teams";
import { useLastTeamGame } from "hooks/useLastTeamGame";
import type { Game, DBPlayer } from "types/types";

type TeamWithRecord = (typeof teams)[number] & { record?: string };

const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL;

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === "android") {
    return "http://localhost:4000";
  }

  return BASE_API_URL;
}

export function usePlayerDetail(
  playerId?: string,
  teamId?: string
) {
  const parsedPlayerId = parseInt(playerId ?? "", 10);
  const sanitizedTeamId = String(teamId ?? "").replace(/"/g, "").trim();
  const teamNumericId = Number(sanitizedTeamId);

  const API_URL = getApiBaseUrl();

  const [player, setPlayer] = useState<DBPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const team = getTeamInfo(String(teamId));
  const teamObj = teams.find(
    (t) => String(t.id) === sanitizedTeamId
  ) as TeamWithRecord | undefined;

  const { lastGame, loading: teamGameLoading } =
    useLastTeamGame(teamNumericId);

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
          `${API_URL}/api/players/player-id/${parsedPlayerId}`
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
  const enrichedLastGame: Game | null = useMemo(() => {
    if (!lastGame) return null;

    const awayTeamObj = teams.find(
      (t) => t.id === lastGame.away.id
    ) as TeamWithRecord | undefined;

    return {
      ...lastGame,
      home: {
        ...lastGame.home,
        logo: teamObj?.logo || "",
        record: teamObj?.record || "",
      },
      away: {
        ...lastGame.away,
        logo: awayTeamObj?.logo || "",
        record: awayTeamObj?.record || "",
      },
    };
  }, [lastGame, teamObj]);

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
    const year =
      typeof draftYear === "string" ? Number(draftYear) : draftYear;
    if (isNaN(year)) return null;
    return new Date().getFullYear() - year;
  };

  return {
    player,
    loading,
    error,
    team,
    teamObj,
    enrichedLastGame,
    teamGameLoading,
    calculateAge,
    calculateExperience,
  };
}
