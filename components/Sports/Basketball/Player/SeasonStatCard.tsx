import { PlayerSeason } from "@/hooks/BasketballHooks/usePlayerSeasons";
import CenteredHeader from "components/Headings/CenteredHeader";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";

type BasketballLeague = "NBA" | "WNBA" | "CBB" | "WCBB";

type Props = {
  seasons: PlayerSeason[];
  loading: boolean;
  error: string | null;
  league: BasketballLeague | string;
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

function StatItem({
  label,
  value,
  isDark,
  styles,
}: {
  label: string;
  value: number | string | null | undefined;
  isDark: boolean;
  styles: ReturnType<typeof seasonStatCardStyles>;
}) {
  return (
    <View style={styles.statItem}>
      <Text
        style={[
          styles.statValue,
          { color: isDark ? Colors.white : Colors.black },
        ]}
      >
        {value ?? "--"}
      </Text>

      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function SeasonStatCard({
  seasons,
  loading,
  error,
  league,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);

  const latestSeason = useMemo(() => {
    return getDisplaySeason({
      seasons,
      league,
    });
  }, [seasons, league]);

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

  const points = getStatValue(averages, [
    "avgPoints",
    "pointsPerGame",
    "points",
  ]);

  const assists = getStatValue(averages, [
    "avgAssists",
    "assistsPerGame",
    "assists",
  ]);

  const rebounds = getStatValue(averages, [
    "avgRebounds",
    "reboundsPerGame",
    "rebounds",
  ]);

  const fieldGoals = getStatValue(averages, [
    "avgFieldGoalsMade-avgFieldGoalsAttempted",
    "fieldGoalsMade-fieldGoalsAttempted",
    "fieldGoals",
  ]);

  const displaySeason =
    latestSeason.display_season || latestSeason.season || "Latest";

  return (
    <View>
      <CenteredHeader isDark={isDark}>{displaySeason} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem
            label="PTS"
            value={points}
            isDark={isDark}
            styles={styles}
          />

          <StatItem
            label="AST"
            value={assists}
            isDark={isDark}
            styles={styles}
          />

          <StatItem
            label="REB"
            value={rebounds}
            isDark={isDark}
            styles={styles}
          />

          <StatItem
            label="FG"
            value={fieldGoals}
            isDark={isDark}
            styles={styles}
          />
        </View>
      </View>
    </View>
  );
}
