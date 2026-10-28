import { MMAEvent } from "@/hooks/MMAHooks/useMMAEvents";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import { MMAFight } from "types/mma/mma";
import { getMMAGameId } from "utils/sports/mma/mmaEventUtils";
import MMAGamePreviewModal from "../GamePreview/MMAGamePreviewModal";
import MMAGameCard from "./MMAGameCard";
import MMASquareGameCard from "./MMASquareGameCard";
import MMAStackedGameCard from "./MMAStackedGameCard";

type MMAGameListItem = MMAFight | MMAEvent;

type GamesListProps = {
  games: MMAGameListItem[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  error: Error | null;
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
  const { viewMode, viewModeReady } = usePreferences();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = gameListStyles;
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [previewGame, setPreviewGame] = useState<MMAGameListItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (game: MMAGameListItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  const renderGameCard = (game: MMAGameListItem) => {
    if ((game as any)?._isPlaceholder) {
      return <View style={styles.gridItem} />;
    }

    const wrapper = (children: React.ReactNode) => (
      <LongPressGestureHandler
        key={String(getMMAGameId(game) ?? "mma-game")}
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
      return wrapper(<MMAGameCard game={game as MMAFight} />);
    }

    if (viewMode === "grid") {
      return wrapper(<MMASquareGameCard game={game as MMAFight} />);
    }

    return wrapper(<MMAStackedGameCard game={game as MMAFight} />);
  };

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

  // Wait for the saved layout before mounting cards in the wrong layout.
  if (!viewModeReady) return null;

  if (loading && !(refreshing && games.length > 0)) {
    const count = games.length > 0 ? games.length : (expectedCount ?? 4);
    return renderSkeletons(count);
  }

  if (error) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={navigationContentStyle(global.emptyContainer)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? Colors.white : Colors.black}
          />
        }
      >
        <Text style={global.errorText}>Couldn’t load fights</Text>
      </ScrollView>
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
              : `game-${String(getMMAGameId(item) ?? index)}`
          }
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => renderGameCard(item)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={navigationContentStyle(
            styles.gridListContainer,
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          ListEmptyComponent={
            <View style={global.emptyContainer}>
              <Text style={global.emptyTitle}>No fights scheduled</Text>
            </View>
          }
        />

        {modalVisible && previewGame && (
          <MMAGamePreviewModal
            game={previewGame as MMAFight}
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
        keyExtractor={(item, index) =>
          `game-${String(getMMAGameId(item) ?? index)}`
        }
        renderItem={({ item }) => renderGameCard(item)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={navigationContentStyle(styles.contentContainer)}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        ListEmptyComponent={
          <View style={global.emptyContainer}>
            <Text style={global.emptyTitle}>No fights scheduled</Text>
          </View>
        }
      />

      {modalVisible && previewGame && (
        <MMAGamePreviewModal
          game={previewGame as MMAFight}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
