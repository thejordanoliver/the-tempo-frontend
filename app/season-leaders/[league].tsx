import { CustomHeader } from "@/components/CustomHeader";
import SeasonLeadersTable from "@/components/League/SeasonLeadersTable";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useSeasonLeaders } from "@/hooks/LeagueHooks/useSeasonLeaders";
import { LeagueScreenStyles } from "@/styles/LeagueStyles/LeagueStyles";
import { SeasonLeaderCategory } from "@/types/stats";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/router";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { View } from "react-native";

const PAGE_SIZE = 25;
const MAX_LEADERS = 100;

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const matchesCategory = (
  category: SeasonLeaderCategory,
  requestedCategory: string | undefined,
) =>
  requestedCategory === undefined ||
  category.shortName === requestedCategory ||
  category.categoryName === requestedCategory ||
  category.abbreviation === requestedCategory;

const normalizedStatName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function SeasonLeadersScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    season?: string | string[];
    category?: string | string[];
  }>();
  const league = firstParam(params.league)?.trim().toLowerCase() ?? "";
  const requestedCategory = firstParam(params.category);
  const parsedSeason = Number(firstParam(params.season));
  const season = Number.isInteger(parsedSeason)
    ? parsedSeason
    : new Date().getFullYear();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const {
    categories,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  } = useSeasonLeaders(season, league, {
    enabled: Boolean(league),
    limit: PAGE_SIZE,
    category: requestedCategory,
    paginated: true,
  });

  const category = useMemo(
    () =>
      categories.find((item) => matchesCategory(item, requestedCategory)) ??
      categories[0],
    [categories, requestedCategory],
  );
  const leaders = category?.leaders ?? [];
  const columns = category?.columns?.length
    ? category.columns
    : [
        {
          key: "stat_value",
          label: category?.categoryName ?? "Stat",
          abbreviation: category?.abbreviation ?? "Stat",
        },
      ];
  const primaryStatKey =
    columns.find(
      (column) =>
        normalizedStatName(column.label) ===
        normalizedStatName(category?.categoryName ?? ""),
    )?.key ?? columns[0]?.key;
  const loadNextPage = useCallback(() => {
    if (leaders.length >= MAX_LEADERS || !hasMore) return;
    loadMore();
  }, [hasMore, leaders.length, loadMore]);

  const title = category
    ? `${category.categoryName} Leaders`
    : "Season Leaders";

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader tabName={title} onBack={goBack} />,
    });
  }, [title, navigation]);

  return (
    <View style={styles.container}>
      <SeasonLeadersTable
        leaders={leaders}
        league={league}
        columns={columns}
        primaryStatKey={category?.primaryStatKey ?? primaryStatKey}
        isDark={isDark}
        loadingMore={loadingMore}
        onEndReached={loadNextPage}
        loading={loading}
        error={error}
      />
    </View>
  );
}
