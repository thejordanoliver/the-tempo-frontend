import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type TeamPlayer = {
  id: number;
  player_id?: number;
  espn_id?: number | null;

  name: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  short_name?: string | null;

  position?: string | null;
  jersey_number?: number | null;
  avatarUrl?: string | null;

  team_id: number;
  team?: string | null;

  experience_display?: string | null;
  experience_abbr?: string | null;
  experience_years?: number | null;

  birth_display?: string | null;

  active: boolean;
  affiliation: "NFL" | "MLB" | "NBA" | "CBB" | "WCBB";
};

function getLeagueRoute(league: string) {
  switch (league) {
    case "NFL":
      return "nfl/players";
    case "CFB":
      return "cfb/players";
    case "MLB":
      return "mlb/players";
    case "CBB":
      return "cbb/players";
    case "WCBB":
      return "wcbb/players";
    case "NBA":
    default:
      return "players"; // NBA has no prefix
  }
}

export function useTeamRosters(
  teamId?: number | string,
  league?: "NFL" | "CFB" | "MLB" | "NBA" | "CBB" | "WCBB",
) {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(
    async (isRefresh = false) => {
      if (!teamId || !league) return;

      const route = getLeagueRoute(league);
      const url = `/api/${route}/team/${teamId}`;

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const res = await apiClient.get(url);

        const normalized: TeamPlayer[] = (res.data.players ?? []).map(
          (p: any) => ({
            ...p,

            // ✅ Normalize name across all leagues
            name:
              p.name ||
              p.full_name ||
              `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),

            // ✅ Normalize avatar
            avatarUrl: p.avatarUrl || p.headshot || p.headshot_url || null,

            // ✅ Ensure affiliation exists
            affiliation: p.affiliation || league,

            // ✅ Ensure active flag exists
            active: typeof p.active === "boolean" ? p.active : true,
          }),
        );

        setPlayers(normalized);
      } catch (err) {
        console.error("❌ useTeamPlayers error:", err);
        setError("Failed to load team players");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [teamId, league],
  );

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    refreshing,
    error,
    refetch: () => fetchPlayers(true),
  };
}
