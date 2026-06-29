import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type StatValue = number | string | null | undefined;

export type Player = {
  team_id: string | null;
  position: string | null;
};

export type StatsObject = Record<string, Record<string, StatValue>>;

export type ApiSeason = {
  id: string;
  player_id: string;
  player_name: string;
  season: number;
  display_season: string;
  team_id: string;
  team_slug: string | null;
  position?: string | null;
  season_type: string;
  season_type_value: string | null;
  season_type_label: string;
  stats: StatsObject;
  created_at: string;
  updated_at: string;
};

export type PlayerStatsResponse = {
  playerId: string;
  player: Player;
  seasons: ApiSeason[];
};

export type Stat = {
  name: string;
  label: string;
  value: number | null;
  displayValue: string;
  displayName: string;
  description?: string;
};

export type Category = {
  name: string;
  displayName: string;
  stats: Stat[];
};

export type FootballPlayerSeason = {
  id: string;
  playerId: string;
  playerName: string;
  year: string;
  season: number;
  displaySeason: string;
  teamId: string;
  teamSlug: string | null;
  position: string | null;
  seasonType: string;
  seasonTypeValue: string | null;
  seasonTypeLabel: string;
  categories: Category[];
  rawStats: StatsObject;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_ORDER = [
  "passing",
  "rushing",
  "receiving",
  "scoring",
  "defensive",
  "defensiveInterceptions",
  "returning",
  "kicking",
  "punting",
  "totals",
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

function toNumber(value: StatValue): number | null {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-"
  ) {
    return null;
  }

  const parsed = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function toDisplayValue(value: StatValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatStatLabel(statName: string): string {
  return statName
    .replace(/_/g, " ")
    .replace(/-/g, " - ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getOrderedCategoryNames(stats: StatsObject): string[] {
  const availableCategoryNames = Object.keys(stats || {});

  const orderedKnownCategories = CATEGORY_ORDER.filter((categoryName) =>
    availableCategoryNames.includes(categoryName),
  );

  const unknownCategories = availableCategoryNames.filter(
    (categoryName) =>
      !CATEGORY_ORDER.includes(categoryName as (typeof CATEGORY_ORDER)[number]),
  );

  return [...orderedKnownCategories, ...unknownCategories];
}

function buildCategories(season: ApiSeason): Category[] {
  const statsObject = season.stats || {};

  return getOrderedCategoryNames(statsObject)
    .map((categoryName) => {
      const categoryStats = statsObject[categoryName];

      if (!categoryStats || Object.keys(categoryStats).length === 0) {
        return null;
      }

      const stats: Stat[] = Object.entries(categoryStats)
        .filter(
          ([, value]) => value !== null && value !== undefined && value !== "",
        )
        .map(([statName, value]) => ({
          name: statName,
          label: formatStatLabel(statName),
          value: toNumber(value),
          displayValue: toDisplayValue(value),
          displayName: formatStatLabel(statName),
        }));

      if (stats.length === 0) return null;

      return {
        name: categoryName,
        displayName: CATEGORY_DISPLAY_NAMES[categoryName] || formatStatLabel(categoryName),
        stats,
      };
    })
    .filter(Boolean) as Category[];
}

function mapSeason(season: ApiSeason): FootballPlayerSeason {
  return {
    id: season.id,
    playerId: season.player_id,
    playerName: season.player_name,
    year: String(season.display_season || season.season),
    season: season.season,
    displaySeason: String(season.display_season || season.season),
    teamId: season.team_id,
    teamSlug: season.team_slug,
    position: season.position || null,
    seasonType: season.season_type,
    seasonTypeValue: season.season_type_value,
    seasonTypeLabel: season.season_type_label,
    categories: buildCategories(season),
    rawStats: season.stats || {},
    createdAt: season.created_at,
    updatedAt: season.updated_at,
  };
}

export function useFootballPlayerSeasons(
  playerId: number,
  league: "CFB" | "NFL" = "CFB",
) {
  const [data, setData] = useState<FootballPlayerSeason[]>([]);
  const [rawSeasons, setRawSeasons] = useState<ApiSeason[]>([]);
  const [player, setPlayer] = useState<{
    name: string;
    position: string | null;
    teamId?: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      setData([]);
      setRawSeasons([]);
      setPlayer(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchSeasons = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get<PlayerStatsResponse>(
          `api/player/stats/cfb/${playerId}`,
        );

        if (cancelled) return;

        const json = res.data;
        const seasons = Array.isArray(json.seasons) ? json.seasons : [];
        const firstSeason = seasons[0];

        setPlayer({
          name: firstSeason?.player_name || "",
          position: json.player?.position || firstSeason?.position || null,
          teamId: json.player?.team_id || firstSeason?.team_id || null,
        });

        setRawSeasons(seasons);

        const mappedSeasons = seasons
          .map(mapSeason)
          .sort((a, b) => {
            if (b.season !== a.season) {
              return b.season - a.season;
            }

            return String(a.seasonTypeLabel).localeCompare(
              String(b.seasonTypeLabel),
            );
          });

        setData(mappedSeasons);
      } catch (err: any) {
        if (cancelled) return;

        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch player seasons",
        );

        setData([]);
        setRawSeasons([]);
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
    rawSeasons,
    player,
    loading,
    error,
  };
}