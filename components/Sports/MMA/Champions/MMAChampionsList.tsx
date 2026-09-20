import { MMAChampionListStyles } from "@/styles/MMAChampionsListStyles";
import type {
  MMAChampionship,
  MMAChampionsResponse,
  MMADivision,
} from "@/types/mma/mma";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import useMMAChampions from "hooks/MMAHooks/useMMAChampions";
import { useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import MMAChampionItem from "./MMAChampionItem";

const DIVISION_ORDER: MMADivision[] = [
  "Heavyweight",
  "Light Heavyweight",
  "Middleweight",
  "Welterweight",
  "Lightweight",
  "Featherweight",
  "Bantamweight",
  "Flyweight",
  "Women's Bantamweight",
  "Women's Flyweight",
  "Women's Strawweight",
];

type ChampionEntry = {
  division: string;
  champion: MMAChampionship;
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function isInterimChampion(champion: MMAChampionship): boolean {
  return champion.accolade_name.toLowerCase().includes("interim");
}

function getCurrentChampion(
  champions: MMAChampionship[] = [],
): MMAChampionship | null {
  return (
    champions.find((champion) => champion.is_current === true) ??
    champions.find((champion) => !isInterimChampion(champion)) ??
    champions[0] ??
    null
  );
}

function getChampionEntries(data: MMAChampionsResponse): ChampionEntry[] {
  const orderedEntries = DIVISION_ORDER.map((division) => ({
    division,
    champion: getCurrentChampion(data[division] ?? []),
  }));

  const orderedDivisionSet = new Set<string>(DIVISION_ORDER);

  const extraEntries = Object.entries(data)
    .filter(([division]) => !orderedDivisionSet.has(division))
    .map(([division, champions]) => ({
      division,
      champion: getCurrentChampion(champions ?? []),
    }));

  return [...orderedEntries, ...extraEntries].filter(
    (entry): entry is ChampionEntry => entry.champion !== null,
  );
}

/* -------------------------------------------------------------------------- */
/*                            MMA Champions List                              */
/* -------------------------------------------------------------------------- */

export default function MMAChampionsList() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const global = globalStyles(isDark);
  const styles = MMAChampionListStyles;

  const { data, loading, refreshing, error, refreshChampions } =
    useMMAChampions();

  const champions = useMemo(
    () => (data ? getChampionEntries(data) : []),
    [data],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChampionEntry>) => (
      <MMAChampionItem
        division={item.division}
        champion={item.champion}
        isDark={isDark}
      />
    ),
    [isDark],
  );

  const keyExtractor = useCallback(
    ({ division, champion }: ChampionEntry) =>
      `${division}-${champion.accolade_id}-${champion.fighter.id}`,
    [],
  );

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data || champions.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No champions available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={champions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshChampions}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
    />
  );
}
