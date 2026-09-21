import HeadingTwo from "@/components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  View,
} from "react-native";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import type { TennisMatch } from "types/tennis/tennis";
import TennisGameCard from "./TennisGameCard";
import TennisSquareGameCard from "./TennisSquareGameCard";
import TennisStackedGameCard from "./TennisStackedGameCard";

type Props = {
  matches: TennisMatch[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error: Error | null;
  scrollEnabled?: boolean;
};

type MatchSection = {
  title: string;
  tournamentId: string;
  data: TennisMatch[];
};

type TennisGridPlaceholder = { _isPlaceholder: true; id: string };
type TennisGridItem = TennisMatch | TennisGridPlaceholder;

const isGridPlaceholder = (
  item: TennisGridItem,
): item is TennisGridPlaceholder => "_isPlaceholder" in item;

export default function TennisGamesList({
  matches,
  loading,
  refreshing,
  onRefresh,
  error,
  scrollEnabled = true,
}: Props) {
  const { viewMode, resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const global = globalStyles(isDark);
  const styles = gameListStyles;

  const sections = useMemo<MatchSection[]>(() => {
    const sectionMap = new Map<string, MatchSection>();

    matches.forEach((match) => {
      const tournamentId = String(match.tournamentId ?? "unknown");

      const existing = sectionMap.get(tournamentId);

      if (existing) {
        existing.data.push(match);
        return;
      }

      sectionMap.set(tournamentId, {
        tournamentId,
        title: match.tournamentName || "Tennis",
        data: [match],
      });
    });

    return Array.from(sectionMap.values());
  }, [matches]);

  const renderGameCard = useCallback(
    (match: TennisMatch) => {
      if (viewMode === "grid") {
        return <TennisSquareGameCard match={match} />;
      }

      if (viewMode === "stacked") {
        return <TennisStackedGameCard match={match} />;
      }

      return <TennisGameCard match={match} />;
    },
    [viewMode],
  );

  const gridMatches = useMemo<TennisGridItem[]>(
    () =>
      matches.length % 2 === 1
        ? [...matches, { _isPlaceholder: true, id: "tennis-grid-placeholder" }]
        : matches,
    [matches],
  );

  const keyExtractor = useCallback((item: TennisMatch, index: number) => {
    return `${item.id ?? "tennis-match"}-${index}`;
  }, []);

  if (loading && matches.length === 0) {
    if (viewMode === "grid") {
      return (
        <View style={styles.skeletonGridWrapper}>
          {[0, 1].map((row) => (
            <View key={`tennis-skeleton-row-${row}`} style={styles.gridRow}>
              <SquareGameCardSkeleton style={styles.gridItem} />
              <SquareGameCardSkeleton style={styles.gridItem} />
            </View>
          ))}
        </View>
      );
    }

    const Skeleton =
      viewMode === "stacked" ? StackedGameCardSkeleton : GameCardSkeleton;

    return (
      <View style={styles.skeletonWrapper}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`tennis-skeleton-${index}`} />
        ))}
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={global.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? Colors.white : Colors.black}
          />
        }
      >
        <Text selectable style={global.errorText}>
          Unable to load tennis matches.
        </Text>

        <Text selectable style={global.emptySubText}>
          Pull down to try again.
        </Text>
      </ScrollView>
    );
  }

  if (!matches.length) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={global.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? Colors.white : Colors.black}
          />
        }
      >
        <Text selectable style={global.emptyTitle}>
          No matches on court today.
        </Text>

        <Text selectable style={global.emptyText}>
          Comeback later to see the next serve.
        </Text>
      </ScrollView>
    );
  }

  if (viewMode === "grid") {
    return (
      <FlatList
        key="tennis-grid"
        data={gridMatches}
        keyExtractor={(item, index) =>
          isGridPlaceholder(item) ? item.id : keyExtractor(item, index)
        }
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            {!isGridPlaceholder(item) && renderGameCard(item)}
          </View>
        )}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridListContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <SectionList<TennisMatch, MatchSection>
      key={`tennis-${viewMode}`}
      sections={sections}
      keyExtractor={keyExtractor}
      renderSectionHeader={({ section }) => (
        <HeadingTwo isDark>{section.title}</HeadingTwo>
      )}
      renderSectionFooter={() => <View style={{ height: 24 }} />}
      renderItem={({ item }) => renderGameCard(item)}
      refreshing={refreshing}
      onRefresh={onRefresh}
      stickySectionHeadersEnabled={false}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
    />
  );
}
