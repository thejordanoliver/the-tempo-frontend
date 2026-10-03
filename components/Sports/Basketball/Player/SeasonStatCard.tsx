import SeasonStatCardLayout, {
  type SeasonStatItem,
} from "@/components/Player/SeasonStatCardLayout";
import SeasonStatCardSkeleton from "@/components/Skeletons/SeasonStatCardSkeleton";
import type { PlayerSeason } from "@/hooks/BasketballHooks/usePlayerSeasons";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { Text, View } from "react-native";
import type { PlayerSeasonRankings } from "types/playerSeasonRankings";

type BasketballLeague = "NBA" | "WNBA" | "MCBB" | "WCBB";

type Props = {
  seasons: PlayerSeason[];
  loading: boolean;
  error: string | null;
  league: BasketballLeague | string;
  isActive: boolean;
  rankings?: PlayerSeasonRankings;
  teamColor?: string;
};

function normalizeLeague(league: Props["league"]) {
  return String(league ?? "").toUpperCase();
}

function isProBasketballLeague(league: Props["league"]) {
  const normalizedLeague = normalizeLeague(league);
  return normalizedLeague === "NBA" || normalizedLeague === "WNBA";
}

function getSeasonNumber(season: PlayerSeason) {
  const rawSeason = season.season;
  const parsed = Number(rawSeason);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const match = String(rawSeason ?? "").match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function sortLatestSeasonRows(a: PlayerSeason, b: PlayerSeason) {
  const seasonCompare = getSeasonNumber(b) - getSeasonNumber(a);

  if (seasonCompare !== 0) {
    return seasonCompare;
  }

  return String(a.team_id).localeCompare(String(b.team_id));
}

function getLatestSeason(seasons: PlayerSeason[]) {
  if (!seasons.length) {
    return null;
  }

  return [...seasons].sort(sortLatestSeasonRows)[0];
}

function getLatestProPlayerSeason(seasons: PlayerSeason[]) {
  if (!seasons.length) {
    return null;
  }

  const regularSeasonRows = seasons.filter((season) => {
    const seasonType = String(season.season_type ?? "").toLowerCase();
    return seasonType !== "postseason";
  });

  const rowsToUse = regularSeasonRows.length ? regularSeasonRows : seasons;

  return [...rowsToUse].sort(sortLatestSeasonRows)[0];
}

function getDisplaySeason({
  seasons,
  league,
}: {
  seasons: PlayerSeason[];
  league: Props["league"];
}) {
  if (isProBasketballLeague(league)) {
    return getLatestProPlayerSeason(seasons);
  }

  return getLatestSeason(seasons);
}

function getStatValue(
  stats: Record<string, any>,
  keys: string[],
  fallback: string = "--",
) {
  for (const key of keys) {
    const value = stats?.[key];

    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return fallback;
}

export default function SeasonStatCard({
  seasons,
  loading,
  error,
  isActive,
  league,
  rankings = {},
  teamColor,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const latestSeason = useMemo(() => {
    return getDisplaySeason({
      seasons,
      league,
    });
  }, [seasons, league]);

  if (!isActive) return null;

  if (loading) {
    return <SeasonStatCardSkeleton />;
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load stats</Text>
      </View>
    );
  }

  if (!latestSeason) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No season stats available</Text>
      </View>
    );
  }

  const averages = latestSeason.averages ?? {};

  const stats: SeasonStatItem[] = [
    {
      label: "PTS",
      ranking: rankings.PTS,
      value: getStatValue(averages, ["avgPoints", "pointsPerGame", "points"]),
    },
    {
      label: "AST",
      ranking: rankings.AST,
      value: getStatValue(averages, [
        "avgAssists",
        "assistsPerGame",
        "assists",
      ]),
    },
    {
      label: "REB",
      ranking: rankings.REB,
      value: getStatValue(averages, [
        "avgRebounds",
        "reboundsPerGame",
        "rebounds",
      ]),
    },
    {
      label: "FG",
      ranking: rankings.FG,
      value: getStatValue(averages, [
        "avgFieldGoalsMade-avgFieldGoalsAttempted",
        "fieldGoalsMade-fieldGoalsAttempted",
        "fieldGoals",
      ]),
    },
  ];

  const displaySeason =
    latestSeason.display_season || latestSeason.season || "Latest";

  return (
    <SeasonStatCardLayout
      isDark={isDark}
      seasonLabel={String(displaySeason)}
      stats={stats}
      teamColor={teamColor}
    />
  );
}
