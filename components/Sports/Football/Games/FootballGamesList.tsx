import FootballGamePreviewModal from "@/components/Sports/Football/GamePreview/FootballGamePreviewModal";
import FootballGameCard from "@/components/Sports/Football/Games/FootballGameCard";
import FootballSquareGameCard from "@/components/Sports/Football/Games/FootballSquareGameCard";
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
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { footballGamesListStyle } from "styles/GamecardStyles/FootballGamesListStyles";
import { FootballGame } from "types/football";
import FootballStackedGameCard from "./FootballStackedGameCard";

type Props = {
  games: FootballGame[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error?: string | null;
  expectedCount?: number;
  day?: "todayTomorrow";
  showHeaders?: boolean;
  scrollEnabled?: boolean; // ✅ new prop
  isNFL?: boolean;
  isCFB?: boolean;
};

type FootballGameSection = {
  title: string;
  data: FootballGame[];
};

export default function FootballGamesList({
  games,
  loading,
  refreshing,
  onRefresh,
  error,
  expectedCount,
  day,
  showHeaders,
  scrollEnabled,
  isNFL = false,
  isCFB = false,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = footballGamesListStyle;
  const global = globalStyles(isDark);
  const { viewMode } = usePreferences();
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const league = isNFL ? "NFL" : isCFB ? "CFB" : "UFL";

  const chunkIntoRows = (
    data: FootballGame[],
    size = 2,
  ): (FootballGame | null)[][] => {
    const rows: (FootballGame | null)[][] = [];

    for (let i = 0; i < data.length; i += size) {
      const row: (FootballGame | null)[] = data.slice(i, i + size);

      if (row.length < size) {
        row.push(null);
      }

      rows.push(row);
    }

    return rows;
  };

  const paginatedGames = useMemo(() => {
    return games.slice(0, page * PAGE_SIZE);
  }, [games, page]);

  // Build sections AFTER pagination
  const sections: FootballGameSection[] = useMemo(() => {
    if (!showHeaders) {
      return [{ title: "All", data: paginatedGames }];
    }

    const preseasonGames = paginatedGames.filter(
      (game) => game?.season.slug === "pre-season",
    );
    const postseasonGames = paginatedGames.filter(
      (game) => game?.season.slug === "post-season",
    );

    const regularSeasonGames = paginatedGames.filter(
      (game) => game?.season.slug === "regular-season",
    );

    const builtSections: FootballGameSection[] = [];

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

  const renderGridRow = ({ item }: { item: (FootballGame | null)[] }) => {
    return (
      <View style={styles.gridRow}>
        {item.map((game, index) => {
          if (!game) {
            return <View key={`empty-${index}`} style={styles.gridItem} />;
          }

          return (
            <View key={game.id} style={styles.gridItem}>
              <FootballSquareGameCard game={game} isNFL={isNFL} isCFB={isCFB} />
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
      let wrapperStyle: ViewStyle = {};

      // ✅ ONLY apply grid styles in grid mode
      if (viewMode === "grid" && indexInRow !== undefined) {
        wrapperStyle = {
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
          <View style={wrapperStyle}>{child}</View>
        </LongPressGestureHandler>
      );
    };

    if (viewMode === "list")
      return wrapper(
        <View>
          <FootballGameCard game={game} isNFL={isNFL} isCFB={isCFB} />
        </View>,
      );
    if (viewMode === "grid")
      return wrapper(
        <FootballSquareGameCard game={game} isNFL={isNFL} isCFB={isCFB} />,
        index,
      );
    return wrapper(
      <View>
        <FootballStackedGameCard game={game} isNFL={isNFL} isCFB={isCFB} />
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

  // --- Inside the loading check ---
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

  if (loading) {
    const totalSkeletonCount =
      games.length > 0 ? games.length : (expectedCount ?? 4);
    return (
      <View>
        {sections.map((section) => (
          <View key={`skel-section-${section.title}`}>
            {showHeaders && (
              <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
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
                  ? `No ${league}  games found for today or tomorrow.`
                  : `No ${league} games found.`}
              </Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={sections as SectionListData<any, FootballGameSection>[]}
          keyExtractor={(item, index) => `${item?.game?.id ?? "game"}-${index}`}
          renderItem={({ item, index }) => renderGameCard(item, index)}
          renderSectionHeader={({ section }) => {
            if (!showHeaders) return null;

            const sectionIndex = gridSections.findIndex(
              (s) => s.title === section.title,
            );

            return (
              <View style={{ marginTop: sectionIndex > 0 ? 12 : 0 }}>
                <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
              </View>
            );
          }}
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
                  ? `No ${league}  games found for today or tomorrow.`
                  : `No ${league} games found.`}
              </Text>
            </View>
          }
        />
      )}

      {modalVisible && previewGame && (
        <FootballGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          isNFL={isNFL}
          isCFB={isCFB}
        />
      )}
    </>
  );
}
