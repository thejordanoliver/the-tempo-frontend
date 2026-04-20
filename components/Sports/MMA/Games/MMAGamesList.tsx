import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { FlatList, Text, View, ViewStyle } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import MMAGameCard from "./MMAGameCard";

import { MMAFight } from "types/mma";
import MMAGamePreviewModal from "../GamePreview/MMAGamePreviewModal";
import MMASquareGameCard from "./MMASquareGameCard";
import MMAStackedGameCard from "./MMAStackedGameCard";

type GamesListProps = {
  games: MMAFight[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  error: Error | null;
};

export default function MMAGamesList({
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
  const global = globalStyles(isDark);

  const [previewGame, setPreviewGame] = useState<MMAFight | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (game: MMAFight) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  const renderGameCard = (game: MMAFight) => {
    if ((game as any)?._isPlaceholder) {
      return <View style={styles.gridItem} />;
    }

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <LongPressGestureHandler
        key={game.id}
        minDurationMs={300}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) handleLongPress(game);
        }}
      >
        <View style={viewMode === "grid" ? styles.gridItem : undefined}>
          {children}
        </View>
      </LongPressGestureHandler>
    );

    if (viewMode === "list") {
      return (
        <Wrapper>
          <MMAGameCard game={game} />
        </Wrapper>
      );
    }

    if (viewMode === "grid") {
      return (
        <Wrapper>
          <MMASquareGameCard game={game} />
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <MMAStackedGameCard game={game} />
      </Wrapper>
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
    const count = games.length > 0 ? games.length : (expectedCount ?? 4);
    return renderSkeletons(count);
  }

  if (!loading && games.length === 0) {
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
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => renderGameCard(item)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.gridListContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        />

        {modalVisible && previewGame && (
          <MMAGamePreviewModal
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
        renderItem={({ item }) => renderGameCard(item)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />

      {modalVisible && previewGame && (
        <MMAGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
