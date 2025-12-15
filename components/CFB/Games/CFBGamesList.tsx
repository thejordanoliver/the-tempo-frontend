import GameCardSkeleton from "components/Games/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Games/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Games/StackedGameCardSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import CFBGamePreviewModal from "../GamePreview/CFBGamePreviewModal";
import CFBGameCard from "./CFBGameCard";
import CFBGameSquareCard from "./CFBGameSquareCard";
import CFBStackedGameCard from "./CFBStackedGameCard";

type Props = {
  games: any[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error?: string | null;
  expectedCount?: number;
  day?: "todayTomorrow";
  showHeaders?: boolean;
  scrollEnabled?: boolean;
};

type CFBGameSection = {
  title: string;
  data: any[];
};

export default function CFBGamesList({
  games,
  loading,
  refreshing,
  onRefresh,
  error,
  expectedCount,
  day,
  showHeaders,
  scrollEnabled,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { viewMode } = usePreferences();
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const styles = footballGamesListStyle;
  // --- Group all games as "Regular Season" only ---
  // Paginate base games first
  const paginatedGames = useMemo(() => {
    return games.slice(0, page * PAGE_SIZE);
  }, [games, page]);

  // Build sections AFTER pagination
  const sections: CFBGameSection[] = useMemo(() => {
    if (!showHeaders) {
      return [{ title: "All", data: paginatedGames }];
    }
    return [{ title: "Regular Season", data: paginatedGames }];
  }, [paginatedGames, showHeaders]);

  const loadMore = () => {
    if (paginatedGames.length >= games.length) return;
    setPage((prev) => prev + 1);
  };

  React.useEffect(() => {
    setPage(1);
  }, [games]);

  const handleLongPress = (game: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  const renderGameCard = (game: any, index?: number) => {
    if ((game as any)?._isPlaceholder) {
      return (
        <View style={[styles.gridItem, { backgroundColor: "transparent" }]} />
      );
    }

    const wrapper = (child: React.ReactNode, indexInRow?: number) => {
      let gridStyle: ViewStyle = styles.gridItem;
      if (viewMode === "grid" && indexInRow !== undefined) {
        gridStyle = {
          ...styles.gridItem,
          marginLeft: indexInRow % 2 === 0 ? 12 : 6,
          marginRight: indexInRow % 2 === 0 ? 6 : 12,
        };
      }

      return (
        <LongPressGestureHandler
          key={game?.id ?? index}
          minDurationMs={300}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) handleLongPress(game);
          }}
        >
          <View style={gridStyle}>{child}</View>
        </LongPressGestureHandler>
      );
    };

    if (viewMode === "list")
      return wrapper(
        <View>
          <CFBGameCard game={game} isDark={isDark} />
        </View>
      );
    if (viewMode === "grid")
      return wrapper(<CFBGameSquareCard game={game} isDark={isDark} />, index);

    return wrapper(
      <View>
        <CFBStackedGameCard game={game} isDark={isDark} />
      </View>
    );
  };

  const renderSkeletons = (count: number) => {
    if (viewMode === "list") {
      return (
        <View style={styles.skeletonWrapper}>
          {Array.from({ length: count }).map((_, i) => (
            <GameCardSkeleton key={`list-skel-${i}`} />
          ))}
        </View>
      );
    }

    if (viewMode === "grid") {
      const skeletons = Array.from({ length: count }).map((_, i) => ({
        _id: `grid-skel-${i}`,
      }));

      const dataWithPlaceholder =
        count % 2 === 1
          ? [...skeletons, { _id: `grid-skel-placeholder` }]
          : skeletons;

      return (
        <FlatList
          data={dataWithPlaceholder}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item, index }) => {
            if (item._id.includes("placeholder")) {
              return (
                <View
                  style={[styles.gridItem, { backgroundColor: "transparent" }]}
                />
              );
            }

            const isLastOdd = count % 2 === 1 && index === count - 1;

            const itemStyle: ViewStyle = {
              flex: 1,
              marginLeft: isLastOdd ? 12 : index % 2 === 0 ? 12 : 6,
              marginRight: isLastOdd ? 12 : index % 2 === 0 ? 6 : 12,
            };

            return <GameSquareCardSkeleton key={item._id} style={itemStyle} />;
          }}
          scrollEnabled={false}
          contentContainerStyle={styles.skeletonGridWrapper}
        />
      );
    }

    return (
      <View style={styles.skeletonWrapper}>
        {Array.from({ length: count }).map((_, i) => (
          <StackedGameCardSkeleton key={`stack-skel-${i}`} />
        ))}
      </View>
    );
  };

  if (loading) {
    const totalSkeletonCount =
      games.length > 0 ? games.length : expectedCount ?? 4;
    return (
      <View>
        {sections.map((section) => (
          <View
            key={`skel-section-${section.title}`}
            style={{ marginBottom: 16 }}
          >
            {showHeaders && (
              <View style={styles.headerWrapper}>
                <HeadingTwo>{section.title}</HeadingTwo>
              </View>
            )}
            {renderSkeletons(section.data.length || totalSkeletonCount)}
          </View>
        ))}
      </View>
    );
  }

  if (error) return <Text style={styles.emptyText}>Error: {error}</Text>;

  return (
    <>
      {viewMode === "grid" && showHeaders && sections.length > 0 && (
        <View style={styles.headerWrapper}>
          <HeadingTwo>{sections[0].title}</HeadingTwo>
        </View>
      )}

      {viewMode === "grid" ? (
        <FlatList
          data={
            paginatedGames.length % 2 === 1
              ? [...paginatedGames, { _isPlaceholder: true } as any]
              : paginatedGames
          }
          keyExtractor={(item, index) =>
            (item as any)?._isPlaceholder
              ? `placeholder-${index}`
              : `game-${item?.game?.id ?? index}`
          }
          numColumns={2}
          renderItem={({ item, index }) => renderGameCard(item, index)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEnabled={scrollEnabled ?? true}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            paginatedGames.length < games.length ? (
              <View style={{ paddingVertical: 20 }}>
                <GameSquareCardSkeleton />
              </View>
            ) : null
          }
          contentContainerStyle={styles.gridListContainer}
          ListEmptyComponent={
            <View style={{ marginTop: 10 }}>
              <Text
                style={[styles.emptyText, { color: isDark ? "#aaa" : "#888" }]}
              >
                {day === "todayTomorrow"
                  ? "No CFB games found for today or tomorrow."
                  : "No CFB games found."}
              </Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={sections as SectionListData<any, CFBGameSection>[]}
          keyExtractor={(item, index) => `${item?.game?.id ?? "game"}-${index}`}
          renderItem={({ item, index }) => renderGameCard(item, index)}
          renderSectionHeader={({ section }) =>
            showHeaders && section.data.length > 0 ? (
              <View style={styles.headerWrapper}>
                <HeadingTwo>{section.title}</HeadingTwo>
              </View>
            ) : null
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.contentContainer}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          scrollEnabled={scrollEnabled ?? true}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            paginatedGames.length < games.length ? (
              <View style={{ paddingVertical: 20 }}>
                <GameCardSkeleton />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View>
              <Text style={styles.emptyText}>
                {day === "todayTomorrow"
                  ? "No CFB games found for today or tomorrow."
                  : "No CFB games found."}
              </Text>
            </View>
          }
        />
      )}

      {modalVisible && previewGame && (
        <CFBGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}

export const footballGamesListStyle = StyleSheet.create({
  skeletonWrapper: {
    paddingHorizontal: 12,
    gap: 12,
  },
  skeletonGridWrapper: {
    paddingBottom: 20,
    gap: 12,
  },
  gridListContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  contentContainer: {},
  gridItem: {
    flex: 1,
    marginHorizontal: 12,
  },
  emptyText: {
    fontFamily: Fonts.OSLIGHT,
    fontSize: 16,
    textAlign: "center",
    color: Colors.midTone,
  },
  headerWrapper: {
    marginHorizontal: 12,
    marginBottom: 4,
  },
});
