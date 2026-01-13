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
import CBBGamePreviewModal from "../GamePreview/CBBGamePreviewModal";
import CBBGameCard from "./CBBGameCard";
import CBBGameSquareCard from "./CBBGameSquareCard";
import CBBStackedGameCard from "./CBBStackedGameCard";

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
  isWomen?: boolean;
};

type CBBGameSection = {
  title: string;
  data: any[];
};

export default function CBBGamesList({
  games,
  loading,
  refreshing,
  onRefresh,
  error,
  expectedCount,
  day,
  showHeaders,
  scrollEnabled,
  isWomen = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const { viewMode } = usePreferences();
  const isWomenGame = (game: any) => String(game?.league?.id) === "423";

  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  /* ----------------------------- Sections ----------------------------- */

  const sections: CBBGameSection[] = useMemo(() => {
    if (!showHeaders) return [{ title: "All", data: games }];
    return [{ title: "Regular Season", data: games }];
  }, [games, showHeaders]);

  /* --------------------------- Interactions ---------------------------- */

  const handleLongPress = (game: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  /* -------------------------- Game Renderer ---------------------------- */

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

    if (viewMode === "list") {
      return wrapper(<CBBGameCard game={game} isWomen={isWomenGame(game)} />);
    }

    if (viewMode === "grid") {
      return wrapper(
        <CBBGameSquareCard game={game} isWomen={isWomenGame(game)} />,
        index
      );
    }

    return wrapper(
      <CBBStackedGameCard game={game} isWomen={isWomenGame(game)} />
    );
  };
  /* --------------------------- Skeletons ------------------------------- */

  const renderSkeletons = (count: number) => {
    /* LIST */
    if (viewMode === "list") {
      return (
        <FlatList
          data={Array.from({ length: count })}
          keyExtractor={(_, i) => `list-skel-${i}`}
          renderItem={() => <GameCardSkeleton />}
          scrollEnabled={false}
          contentContainerStyle={styles.skeletonWrapper}
        />
      );
    }

    /* GRID */
    if (viewMode === "grid") {
      const data =
        count % 2 === 1
          ? [...Array.from({ length: count }), "_placeholder"]
          : Array.from({ length: count });

      return (
        <FlatList
          data={data}
          keyExtractor={(_, i) => `grid-skel-${i}`}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.skeletonGridWrapper}
          renderItem={({ item, index }) => {
            if (item === "_placeholder") {
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

            return <GameSquareCardSkeleton style={itemStyle} />;
          }}
        />
      );
    }

    /* STACKED */
    return (
      <FlatList
        data={Array.from({ length: count })}
        keyExtractor={(_, i) => `stack-skel-${i}`}
        renderItem={() => <StackedGameCardSkeleton />}
        scrollEnabled={false}
        contentContainerStyle={styles.skeletonWrapper}
      />
    );
  };

  /* --------------------------- LOADING ------------------------------- */

  if (loading && games.length === 0) {
    const totalSkeletons = expectedCount ?? 4;

    return (
      <View>
        {sections.map((section) => (
          <View key={`skel-${section.title}`} style={{ marginBottom: 16 }}>
            {showHeaders && (
              <View style={styles.headerWrapper}>
                <HeadingTwo>{section.title}</HeadingTwo>
              </View>
            )}
            {renderSkeletons(totalSkeletons)}
          </View>
        ))}
      </View>
    );
  }

  /* ----------------------------- ERROR -------------------------------- */

  if (error) {
    return <Text style={styles.emptyText}>Error: {error}</Text>;
  }

  /* ----------------------------- CONTENT ------------------------------ */

  return (
    <>
      {viewMode === "grid" ? (
        <FlatList
          data={
            games.length % 2 === 1
              ? [...games, { _isPlaceholder: true } as any]
              : games
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
          contentContainerStyle={styles.gridListContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {day === "todayTomorrow"
                ? "No CBB games found for today or tomorrow."
                : "No CBB games found."}
            </Text>
          }
        />
      ) : (
        <SectionList
          sections={sections as SectionListData<any, CBBGameSection>[]}
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
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.contentContainer}
        />
      )}

      {modalVisible && previewGame && (
        <CBBGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
             isWomen={isWomenGame(previewGame)}
        />
      )}
    </>
  );
}

/* -------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
  skeletonWrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 12,
  },
  skeletonGridWrapper: {
    paddingBottom: 20,
    gap: 12,
  },
  gridListContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 12,
  },
  emptyText: {
    fontFamily: Fonts.OSLIGHT,
    fontSize: 16,
    textAlign: "center",
    color: Colors.midTone,
    marginTop: 20,
  },
  headerWrapper: {
    marginHorizontal: 12,
    marginBottom: 6,
  },
});
