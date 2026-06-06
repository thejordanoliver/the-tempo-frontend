import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type RawStatValue = string | number | null | undefined;

type StatMeta = {
  label?: string;
  description?: string;
  displayName?: string;
};

type Stat = {
  name: string;
  label: string;
  value: number | null;
  displayValue: string;
  displayName: string;
  description?: string;
};

type Category = {
  name: string;
  displayName: string;
  stats: Stat[];
};

type RawCareerSeason = {
  season: number;
  displaySeason?: string;
  teamId?: string;
  espnTeamId?: string;
  teamSlug?: string;
  position?: string;
  seasonType?: number;
  seasonTypeName?: string;

  totals?: Record<string, RawStatValue>;
  averages?: Record<string, RawStatValue>;
  general?: Record<string, RawStatValue>;
  passing?: Record<string, RawStatValue>;
  rushing?: Record<string, RawStatValue>;
  receiving?: Record<string, RawStatValue>;
  defensive?: Record<string, RawStatValue>;
  defensiveInterceptions?: Record<string, RawStatValue>;
  returning?: Record<string, RawStatValue>;
  scoring?: Record<string, RawStatValue>;
  kicking?: Record<string, RawStatValue>;
  punting?: Record<string, RawStatValue>;

  miscellaneous?: {
    statMeta?: Record<string, Record<string, StatMeta>>;
  };
};

type Season = {
  year: string;
  season: number;
  displaySeason: string;
  teamId?: string;
  espnTeamId?: string;
  teamSlug?: string;
  position?: string;
  seasonType?: number;
  seasonTypeName?: string;
  categories: Category[];
};

type PlayerSeasonsResponse = {
  teamId: number;
  jerseyNumber?: string;
  fullName: string;
  shortName?: string;
  firstName?: string;
  lastName?: string;
  position: string;
  careerStats: RawCareerSeason[];
  lastUpdated?: string;
};

const CATEGORY_ORDER = [
  "totals",
  "passing",
  "rushing",
  "receiving",
  "defensive",
  "defensiveInterceptions",
  "returning",
  "scoring",
  "kicking",
  "punting",
  "averages",
  "general",
] as const;

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  totals: "Totals",
  passing: "Passing",
  rushing: "Rushing",
  receiving: "Receiving",
  defensive: "Defense",
  defensiveInterceptions: "Defensive Interceptions",
  returning: "Returns",
  scoring: "Scoring",
  kicking: "Kicking",
  punting: "Punting",
  averages: "Averages",
  general: "General",
};

function toNumber(value: RawStatValue): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function toDisplayValue(value: RawStatValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function buildCategories(season: RawCareerSeason): Category[] {
  const statMeta = season.miscellaneous?.statMeta || {};

  return CATEGORY_ORDER.map((categoryName) => {
    const statsObject = season[categoryName];

    if (!statsObject || Object.keys(statsObject).length === 0) {
      return null;
    }

    const stats: Stat[] = Object.entries(statsObject)
      .filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      )
      .map(([statName, value]) => {
        const meta = statMeta[categoryName]?.[statName];

        return {
          name: statName,
          label: meta?.label || statName,
          value: toNumber(value),
          displayValue: toDisplayValue(value),
          displayName: meta?.displayName || statName,
          description: meta?.description,
        };
      });

    if (stats.length === 0) return null;

    return {
      name: categoryName,
      displayName: CATEGORY_DISPLAY_NAMES[categoryName] || categoryName,
      stats,
    };
  }).filter(Boolean) as Category[];
}

export function useFootballPlayerSeasons(
  playerId: number,
  league: "CFB" | "NFL" = "CFB",
) {
  const [data, setData] = useState<Season[]>([]);
  const [player, setPlayer] = useState<{
    name: string;
    position: string;
    jerseyNumber?: string;
    teamId?: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      setData([]);
      setPlayer(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSeasons = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get<PlayerSeasonsResponse>(
          `api/player/stats/${league.toLowerCase()}/${playerId}`,
        );

        if (cancelled) return;

        const json = res.data;

        setPlayer({
          name: json.fullName,
          position: json.position,
          jerseyNumber: json.jerseyNumber,
          teamId: json.teamId,
        });

        const seasons: Season[] = (json.careerStats || [])
          .map((seasonData) => ({
            year: String(seasonData.displaySeason || seasonData.season),
            season: seasonData.season,
            displaySeason: String(
              seasonData.displaySeason || seasonData.season,
            ),
            teamId: seasonData.teamId,
            espnTeamId: seasonData.espnTeamId,
            teamSlug: seasonData.teamSlug,
            position: seasonData.position,
            seasonType: seasonData.seasonType,
            seasonTypeName: seasonData.seasonTypeName,
            categories: buildCategories(seasonData),
          }))
          .sort((a, b) => b.season - a.season);

        setData(seasons);
      } catch (err: any) {
        if (cancelled) return;

        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch player seasons",
        );

        setData([]);
        setPlayer(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSeasons();

    return () => {
      cancelled = true;
    };
  }, [playerId, league]);

  return {
    data,
    player,
    loading,
    error,
  };
}
