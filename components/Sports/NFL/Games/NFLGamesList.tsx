import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Skeletons/GameCards/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import NFLGamePreviewModal from "components/Sports/NFL/GamePreview/NFLGamePreviewModal";
import NFLGameCard from "components/Sports/NFL/Games/NFLGameCard";
import NFLGameSquareCard from "components/Sports/NFL/Games/NFLGameSquareCard";
import NFLStackedGameCard from "components/Sports/NFL/Games/NFLStackedGameCard";
import { globalStyles } from "constants/Styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { footballGamesListStyle } from "styles/GamecardStyles/FootballGamesListStyles";
import { Game } from "types/nfl";

type Props = {
  games: Game[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error?: string | null;
  expectedCount?: number;
  day?: "todayTomorrow";
  showHeaders?: boolean;
  scrollEnabled?: boolean; // ✅ new prop
};

type NFLGameSection = {
  title: string;
  data: Game[];
};

export default function NFLGamesList({
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
  const styles = footballGamesListStyle(isDark);
  const global = globalStyles(isDark)
  const { viewMode } = usePreferences();
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const chunkIntoRows = (data: Game[], size = 2): (Game | null)[][] => {
    const rows: (Game | null)[][] = [];

    for (let i = 0; i < data.length; i += size) {
      const row: (Game | null)[] = data.slice(i, i + size);

      if (row.length < size) {
        row.push(null);
      }

      rows.push(row);
    }

    return rows;
  };

  // --- Group all games as "Regular Season" only ---
  const paginatedGames = useMemo(() => {
    return games.slice(0, page * PAGE_SIZE);
  }, [games, page]);

  // Build sections AFTER pagination
  const sections: NFLGameSection[] = useMemo(() => {
    if (!showHeaders) {
      return [{ title: "All", data: paginatedGames }];
    }

    const preseasonGames = paginatedGames.filter(
      (game) => game?.game.stage === "Pre Season"
    );
    const postseasonGames = paginatedGames.filter(
      (game) => game?.game.stage === "Post Season"
    );

    const regularSeasonGames = paginatedGames.filter(
      (game) => game?.game.stage === "Regular Season"  
    );

    const builtSections: NFLGameSection[] = [];

    if (preseasonGames.length > 0) {
      builtSections.push({
        title: "Pre Season",
        data: preseasonGames,
      });
    }
    if (regularSeasonGames.length > 0) {
      builtSections.push({
        title: "Regular Season",
        data: regularSeasonGames,
      });
    }

    if (postseasonGames.length > 0) {
      builtSections.push({
        title: "Postseason",
        data: postseasonGames,
      });
    }

    return builtSections;
  }, [paginatedGames, showHeaders]);

  const gridSections = useMemo(() => {
    return sections.map((section) => ({
      title: section.title,
      data: chunkIntoRows(section.data),
    }));
  }, [sections]);

  const renderGridRow = ({ item }: { item: (Game | null)[] }) => {
    return (
      <View style={styles.gridRow}>
        {item.map((game, index) => {
          if (!game) {
            return (
              <View
                key={`empty-${index}`}
                style={[styles.gridItem, { backgroundColor: "transparent" }]}
              />
            );
          }

          return (
            <View
              key={game.game.id}
              style={[
                styles.gridItem,
                {
                  marginLeft: index === 0 ? 12 : 6,
                  marginRight: index === 0 ? 6 : 12,
                },
              ]}
            >
              <NFLGameSquareCard game={game} />
            </View>
          );
        })}
      </View>
    );
  };
  const loadMore = () => {
    if (paginatedGames.length >= games.length) return;
    setPage((prev) => prev + 1);
  };

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
      // Apply marginLeft/marginRight for grid columns
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
          <NFLGameCard game={game} />
        </View>
      );
    if (viewMode === "grid")
      return wrapper(<NFLGameSquareCard game={game} />, index);
    return wrapper(
      <View>
        <NFLStackedGameCard game={game} />
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

      // Add placeholder if odd count
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

  // --- Inside the loading check ---
  if (loading) {
    return (
      <View>
        {sections.map((section) => {
          const count =
            section.data.length > 0 ? section.data.length : expectedCount ?? 4;

          return (
            <View
              key={`skel-section-${section.title}`}
              style={{ marginBottom: 16 }}
            >
              {showHeaders && (
                <View style={styles.headerWrapper}>
                  <HeadingTwo>{section.title}</HeadingTwo>
                </View>
              )}
              {renderSkeletons(count)}
            </View>
          );
        })}
      </View>
    );
  }

  if (loading) {
    const totalSkeletonCount =
      games.length > 0 ? games.length : expectedCount ?? 4;
    return (
      <View>
        {sections.map((section) => (
          <View key={`skel-section-${section.title}`}>
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

  if (error) return <Text style={global.errorText}>Error: {error}</Text>;

  return (
    <>
      {viewMode === "grid" ? (
        <SectionList
          sections={gridSections}
          keyExtractor={(item, index) => `row-${index}`}
          renderItem={renderGridRow}
          renderSectionHeader={({ section }) =>
            showHeaders ? (
              <View style={styles.headerWrapper}>
                <HeadingTwo>{section.title}</HeadingTwo>
              </View>
            ) : null
          }
          stickySectionHeadersEnabled={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEnabled={scrollEnabled ?? true}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.gridListContainer}
          ListEmptyComponent={
            <View style={{ marginTop: 10 }}>
              <Text style={global.emptyText}>
                {day === "todayTomorrow"
                  ? "No NFL games found for today or tomorrow."
                  : "No NFL games found."}
              </Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={sections as SectionListData<any, NFLGameSection>[]}
          keyExtractor={(item, index) => `${item?.game?.id ?? "game"}-${index}`}
          renderItem={({ item, index }) => renderGameCard(item, index)}
          renderSectionHeader={({ section }) =>
            showHeaders && section.data.length > 0 ? (
              <View
                style={[
                  styles.headerWrapper,
                  section.title === "Postseason" && { marginTop: 12 },
                ]}
              >
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
                  ? "No NFL games found for today or tomorrow."
                  : "No NFL games found."}
              </Text>
            </View>
          }
        />
      )}

      {modalVisible && previewGame && (
        <NFLGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
