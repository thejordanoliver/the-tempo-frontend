import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import { CollegeBaseballGame } from "types/baseball";
import CBGamePreviewModal from "../GamePreview/CBGamePreviewModal";
import CBGameCard from "./CBGameCard";
import CBSquareGameCard from "./CBSquareGameCard";
import CBStackedGameCard from "./CBStackedGameCard";

type GamesListProps = {
  games: CollegeBaseballGame[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  error: Error | null;
};

type GameWithPlaceholder = CollegeBaseballGame & { _isPlaceholder?: boolean };

const ItemSeparator = () => <View style={{ height: 12 }} />;

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
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = gameListStyles;
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [previewGame, setPreviewGame] = useState<CollegeBaseballGame | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = useCallback((game: CollegeBaseballGame) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => setModalVisible(false), []);

  const renderGameCard = useCallback(
    (game: GameWithPlaceholder) => {
      if (game._isPlaceholder) {
        return <View style={{ flex: 1 }} />;
      }

      const cardContent =
        viewMode === "list" ? (
          <CBGameCard game={game} />
        ) : viewMode === "grid" ? (
          <CBSquareGameCard game={game} />
        ) : (
          <CBStackedGameCard game={game} />
        );

      return (
        <LongPressGestureHandler
          minDurationMs={300}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) handleLongPress(game);
          }}
        >
          <View style={viewMode === "grid" ? styles.gridItem : undefined}>
            {cardContent}
          </View>
        </LongPressGestureHandler>
      );
    },
    [viewMode, handleLongPress, styles.gridItem],
  );

  const renderItem = useCallback(
    ({ item }: { item: GameWithPlaceholder }) => renderGameCard(item),
    [renderGameCard],
  );

  const renderSkeletons = useCallback(
    (count: number) => {
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
        const pairs: number[][] = [];
        for (let i = 0; i < count; i += 2) {
          pairs.push(i + 1 < count ? [i, i + 1] : [i]);
        }

        return (
          <View style={styles.skeletonGridWrapper}>
            {pairs.map((pair, rowIndex) => (
              <View key={`skel-row-${rowIndex}`} style={styles.gridRow}>
                <SquareGameCardSkeleton style={{ flex: 1 }} />
                {pair.length === 2 ? (
                  <SquareGameCardSkeleton style={{ flex: 1 }} />
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            ))}
          </View>
        );
      }

      return (
        <View style={styles.skeletonWrapper}>
          {Array.from({ length: count }).map((_, i) => (
            <StackedGameCardSkeleton key={`stack-skel-${i}`} />
          ))}
        </View>
      );
    },
    [viewMode, styles],
  );

  const gridData = useMemo<GameWithPlaceholder[]>(
    () =>
      viewMode === "grid" && games.length % 2 === 1
        ? [...games, { _isPlaceholder: true } as any]
        : games,
    [games, viewMode],
  );

  if (loading) {
    const count = games.length > 0 ? games.length : (expectedCount ?? 4);
    return renderSkeletons(count);
  }

  if (games.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <Text style={global.emptyText}>
          {day === "todayTomorrow"
            ? "No games found for today or tomorrow."
            : "No games found on this date."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={viewMode === "grid" ? gridData : games}
        keyExtractor={(item, index) =>
          (item as any)?._isPlaceholder
            ? `placeholder-${index}`
            : `game-${item.id}`
        }
        renderItem={renderItem}
        numColumns={viewMode === "grid" ? 2 : 1}
        key={viewMode}
        columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
        ItemSeparatorComponent={viewMode !== "grid" ? ItemSeparator : undefined}
        contentContainerStyle={
          viewMode === "grid"
            ? styles.gridListContainer
            : styles.contentContainer
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />

      {modalVisible && previewGame && (
        <CBGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
