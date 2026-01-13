import GameCardSkeleton from "components/Games/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Games/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Games/StackedGameCardSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import NFLGamePreviewModal from "components/NFL/GamePreview/NFLGamePreviewModal";
import NFLGameCard from "components/NFL/Games/NFLGameCard";
import NFLGameSquareCard from "components/NFL/Games/NFLGameSquareCard";
import NFLStackedGameCard from "components/NFL/Games/NFLStackedGameCard";
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
import { NFLGame } from "types/nfl";
type Props = {
  games: any[];
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
  data: any[];
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
  const styles = footballGamesListStyle;
  const { viewMode } = usePreferences();
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- Group games by seasonType ---
 const sections: NFLGameSection[] = useMemo(() => {
  if (!games || games.length === 0) return [];

  const grouped: { [season: string]: any[] } = {
    Preseason: [],
    "Regular Season": [],
    Postseason: [],
    Unknown: [],
  };

  games.forEach((g: NFLGame) => {
  const statusShort = g?.game?.status?.short ?? "";
const isLive = ["LIVE", "HT", "Q1", "Q2", "Q3", "Q4", "OT"].some((s) =>
  statusShort.toUpperCase().includes(s)
);


    let season = "Unknown";

    // Prefer the explicit 'stage' from the API
    if (g.game?.stage) {
      if (g.game.stage.toLowerCase().includes("pre")) season = "Preseason";
      else if (g.game.stage.toLowerCase().includes("regular")) season = "Regular Season";
      else if (g.game.stage.toLowerCase().includes("post")) season = "Postseason";
    } else if (g.game?.date?.timestamp) {
      // Fallback based on month
      const gameDate = new Date(g.game.date.timestamp);
      const month = gameDate.getMonth();
      const dayOfMonth = gameDate.getDate();

      if (month === 7) season = "Preseason";
      else if ((month >= 8 && month <= 11) || (month === 0 && dayOfMonth <= 8))
        season = "Regular Season";
      else season = "Postseason";
    }

    if (!grouped[season]) grouped[season] = [];

    if (isLive) grouped[season].unshift(g);
    else grouped[season].push(g);
  });

  // Merge all if no headers
  if (!showHeaders) {
    const all = Object.values(grouped).flat();
    return [{ title: "All", data: all }];
  }

  const order = ["Preseason", "Regular Season", "Postseason"];
  return order
    .filter((s) => grouped[s] && grouped[s].length > 0)
    .map((s) => ({ title: s, data: grouped[s] }));
}, [games, showHeaders]);


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
          <NFLGameCard game={game}/>
        </View>
      );
    if (viewMode === "grid")
      return wrapper(<NFLGameSquareCard game={game} isDark={isDark} />, index);
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

  if (error) return <Text style={styles.emptyText}>Error: {error}</Text>;

  return (
    <>
      <SectionList<any, NFLGameSection>
        sections={sections as SectionListData<any, NFLGameSection>[]}
        keyExtractor={(item, index) => `${item?.game?.id ?? "game"}-${index}`}
        renderItem={({ item, index }) =>
          viewMode === "grid" ? null : renderGameCard(item, index)
        }
        renderSectionHeader={({ section }) =>
          showHeaders && section.data.length > 0 ? (
            <View style={styles.headerWrapper}>
              <HeadingTwo>
                {section.title === "Live" ? "🏈 Live Games" : section.title}
              </HeadingTwo>
            </View>
          ) : null
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        stickySectionHeadersEnabled={false}
        scrollEnabled={scrollEnabled ?? true} // ✅ default to true
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ marginTop: 10 }}>
            <Text
              style={[styles.emptyText, { color: isDark ? "#aaa" : "#888" }]}
            >
              {day === "todayTomorrow"
                ? "No NFL games found for today or tomorrow."
                : "No NFL games found."}
            </Text>
          </View>
        }
        renderSectionFooter={({ section }) => {
          if (viewMode === "grid" && section.data.length > 0) {
            const dataWithPlaceholder =
              section.data.length % 2 === 1
                ? [...section.data, { _isPlaceholder: true } as any]
                : section.data;

            return (
              <FlatList
                data={dataWithPlaceholder}
                keyExtractor={(item, index) =>
                  (item as any)?._isPlaceholder
                    ? `placeholder-${index}`
                    : `game-${item?.game?.id ?? index}`
                }
                numColumns={2}
                renderItem={({ item, index }) => renderGameCard(item, index)}
                scrollEnabled={scrollEnabled ?? false} // ✅ grid scroll control
                contentContainerStyle={styles.gridListContainer}
              />
            );
          }
          return null;
        }}
      />

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
