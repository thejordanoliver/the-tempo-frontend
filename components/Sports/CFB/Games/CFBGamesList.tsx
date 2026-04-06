import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { globalStyles } from "constants/styles";
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
import CFBGamePreviewModal from "../GamePreview/CFBGamePreviewModal";
import CFBGameCard from "./CFBGameCard";
import CFBSquareGameCard from "./CFBSquareGameCard";
import CFBStackedGameCard from "./CFBStackedGameCard";
type Props = {
  games: Game[];
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
  data: Game[];
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
  const styles = footballGamesListStyle;
  const global = globalStyles(isDark);
  const { viewMode } = usePreferences();
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
  const sections: CFBGameSection[] = useMemo(() => {
    if (!showHeaders) {
      return [{ title: "All", data: paginatedGames }];
    }

    const postseasonGames = paginatedGames.filter(
      (game) => game?.game.week === "Bowls",
    );

    const regularSeasonGames = paginatedGames.filter(
      (game) => game?.game.week !== "Bowls",
    );

    const builtSections: CFBGameSection[] = [];

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
            return <View key={`empty-${index}`} style={styles.gridItem} />;
          }

          return (
            <View key={game.game.id} style={styles.gridItem}>
              <CFBSquareGameCard game={game} />
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

  React.useEffect(() => {
    setPage(1);
  }, [games]);

  const handleLongPress = (game: Game) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  const renderGameCard = (game: Game, index?: number) => {
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
          key={game?.game.id ?? index}
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
          <CFBGameCard game={game} />
        </View>,
      );
    if (viewMode === "grid")
      return wrapper(<CFBSquareGameCard game={game} />, index);

    return wrapper(
      <View>
        <CFBStackedGameCard game={game} />
      </View>,
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

            return <SquareGameCardSkeleton key={item._id} style={itemStyle} />;
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
    return (
      <View>
        {sections.map((section) => {
          const count =
            section.data.length > 0
              ? section.data.length
              : (expectedCount ?? 4);

          return (
            <View
              key={`skel-section-${section.title}`}
              style={{ marginBottom: 16 }}
            >
              {showHeaders && (
                <HeadingTwo isDark={isDark} style={{ marginHorizontal: 12 }}>
                  {section.title}
                </HeadingTwo>
              )}
              {renderSkeletons(count)}
            </View>
          );
        })}
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
              <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
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
              <View
                style={[section.title === "Postseason" && { marginTop: 12 }]}
              >
                <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
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
              <Text style={global.emptyText}>
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
