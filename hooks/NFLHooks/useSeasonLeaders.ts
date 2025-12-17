import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

/* ----------------------------- Types ----------------------------- */

export interface Leader {
  value: number;
  displayValue: string;
  athleteId: string | number;
  name: string;
  position?: string;
  headshot?: string;

  teamId?: string | number;
  teamName?: string;
  teamAbbrev?: string;
  teamLogo?: string;

  /** 🔥 NFL only */
  playerId?: number;
}

export interface LeaderCategory {
  categoryName: string;
  shortName: string;
  abbreviation: string;
  leaders: Leader[];
}

interface SeasonLeaderResult {
  categories: LeaderCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/* ----------------------- Helpers ------------------------ */

const matchRosterPlayer = (roster: any[], athleteId: string | number) => {
  const id = Number(athleteId);
  return roster.find((p) => Number(p.espn_id) === id) ?? null;
};

/* ----------------------------- Hook ------------------------------ */

export function useSeasonLeaders(
  season: number,
  league: "NFL" | "CFB" | "MLB" | "CBB" = "NFL"
): SeasonLeaderResult {
  const [categories, setCategories] = useState<LeaderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Partial<Record<string, LeaderCategory[]>>>({});
  const cacheKey = `${league}:${season}`;

  const fetchLeaders = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && cacheRef.current[cacheKey]) {
        setCategories(cacheRef.current[cacheKey]!);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const leaguePath = league.toLowerCase();

        /* ✅ CORRECT ENDPOINT */
        const leadersRes = await axios.get(
          `${API_BASE}/api/${leaguePath}/leaders`,
          { params: { season } }
        );

        const rawCategories: LeaderCategory[] =
          leadersRes.data.categories ?? [];

        /* 🚫 NON-NFL: return immediately */
        if (league !== "NFL") {
          cacheRef.current[cacheKey] = rawCategories;
          setCategories(rawCategories);
          return;
        }

        /* ✅ NFL ONLY: roster enrichment */
        const teamIds = Array.from(
          new Set(
            rawCategories.flatMap((cat) =>
              cat.leaders
                .map((l) => l.teamId)
                .filter(Boolean)
                .map(String)
            )
          )
        );

        const rosterResponses = await Promise.all(
          teamIds.map(async (teamId) => {
            const res = await axios.get(
              `${API_BASE}/api/nfl/players/team/${teamId}`
            );
            return {
              teamId,
              players: res.data.players ?? [],
            };
          })
        );

        const rosterMap: Record<string, any[]> = Object.fromEntries(
          rosterResponses.map((r) => [r.teamId, r.players])
        );

        const enrichedCategories = rawCategories.map((cat) => ({
          ...cat,
          leaders: cat.leaders.map((leader) => {
            const roster =
              leader.teamId != null
                ? rosterMap[String(leader.teamId)]
                : null;

            if (!roster) return leader;

            const matched = matchRosterPlayer(
              roster,
              leader.athleteId
            );

            if (!matched) return leader;

            return {
              ...leader,
              playerId: matched.id,
              name: matched.name,
              position: matched.position ?? leader.position,
              headshot: matched.avatarUrl ?? leader.headshot,
            };
          }),
        }));

        cacheRef.current[cacheKey] = enrichedCategories;
        setCategories(enrichedCategories);
      } catch (err: any) {
        console.error(`❌ [${league}] Season Leaders Error:`, err);
        setError(err.message || "Failed to fetch leaders");
      } finally {
        setLoading(false);
      }
    },
    [season, league]
  );

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  return {
    categories,
    loading,
    error,
    refresh: () => fetchLeaders(true),
  };
}
