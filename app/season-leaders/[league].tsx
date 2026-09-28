import { CustomHeader } from "@/components/CustomHeader";
import SeasonLeadersTable from "@/components/League/SeasonLeadersTable";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useSeasonLeaders } from "@/hooks/LeagueHooks/useSeasonLeaders";
import { LeagueScreenStyles } from "@/styles/LeagueStyles/LeagueStyles";
import { SeasonLeaderCategory } from "@/types/stats";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
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
  const [limit, setLimit] = useState(PAGE_SIZE);
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const { categories, loading, error } = useSeasonLeaders(season, league, {
    enabled: Boolean(league),
    limit,
    category: requestedCategory,
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
  const hasMore = leaders.length >= limit && limit < MAX_LEADERS;

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLimit((currentLimit) => Math.min(currentLimit + PAGE_SIZE, MAX_LEADERS));
  }, [hasMore, loading]);

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
        isDark={isDark}
        loadingMore={loading && leaders.length > 0}
        onEndReached={loadMore}
        loading={loading}
        error={error}
      />
    </View>
  );
}
