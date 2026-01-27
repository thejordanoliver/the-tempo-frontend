import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Skeletons/GameCards/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import GameSquareCard from "components/Sports/NBA//Games/GameSquareCard";
import StackedGameCard from "components/Sports/NBA//Games/StackedGameCard";
import GamePreviewModal from "components/Sports/NBA/GamePreview/GamePreviewModal";
import GameCard from "components/Sports/NBA/Games/GameCard";
import { globalStyles } from "constants/Styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { FlatList, Text, useColorScheme, View, ViewStyle } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import type { Game } from "types/types";
type GamesListProps = {
  games: Game[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  error: Error | null
};

export default function GamesList({
  games,
  loading,
  error,
  refreshing,
  onRefresh,
  expectedCount,
  day,
  scrollEnabled = true,
}: GamesListProps) {
  const { viewMode } = usePreferences();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = gameListStyles(isDark);
  const global = globalStyles(isDark);
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (game: Game) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  const renderGameCard = (game: Game, index?: number) => {
    if ((game as any)?._isPlaceholder) {
      return (
        <View
          style={[styles.itemContainer, { backgroundColor: "transparent" }]}
        />
      );
    }

    const wrapper = (child: React.ReactNode, indexInRow?: number) => {
      let gridStyle: ViewStyle = {};

      if (viewMode === "grid" && indexInRow !== undefined) {
        gridStyle = {
          flex: 1,
          marginLeft: indexInRow % 2 === 0 ? 12 : 6,
          marginRight: indexInRow % 2 === 0 ? 6 : 12,
        };
      }

      return (
        <LongPressGestureHandler
          key={game.id}
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
          <GameCard game={game} />
        </View>
      );
    if (viewMode === "grid")
      return wrapper(<GameSquareCard game={game} />, index);
    return wrapper(
      <View>
        <StackedGameCard game={game} />
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

      return (
        <FlatList
          data={skeletons}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item, index }) => {
            const itemStyle: ViewStyle = {
              width: "48%", // half width
              marginLeft: index % 2 === 0 ? 0 : 4,
              marginRight: index % 2 === 0 ? 4 : 0,
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
    const count = games.length > 0 ? games.length : expectedCount ?? 4;
    return renderSkeletons(count);
  }

  if (!loading && games.length === 0) {
    return (
      <View>
        <Text style={global.emptyText}>
          {day === "todayTomorrow"
            ? "No games found for today or tomorrow."
            : "No games found on this date."}
        </Text>
      </View>
    );
  }

  if (viewMode === "grid") {
    const dataWithPlaceholder =
      games.length % 2 === 1
        ? [...games, { _isPlaceholder: true } as any]
        : games;

    return (
      <>
        <FlatList
          data={dataWithPlaceholder}
          keyExtractor={(item, index) =>
            (item as any)?._isPlaceholder
              ? `placeholder-${index}`
              : `game-${item.id}`
          }
          numColumns={2}
          renderItem={({ item, index }) => renderGameCard(item, index)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.gridListContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        />
        {modalVisible && previewGame && (
          <GamePreviewModal
            game={previewGame}
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
        )}
      </>
    );
  }

  // list + stacked
  return (
    <>
      <FlatList
        data={games}
        keyExtractor={(item) => `game-${item.id}`}
        renderItem={({ item, index }) => renderGameCard(item, index)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />
      {modalVisible && previewGame && (
        <GamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
