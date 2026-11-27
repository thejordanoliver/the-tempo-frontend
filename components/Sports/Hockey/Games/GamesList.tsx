import CountdownClock from "@/components/CountdownClock";
import { HockeyGame } from "@/types/hockey/hockey";
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
import HockeyGamePreviewModal from "../GamePreview/HockeyGamePreviewModal";
import HockeyGameCard from "./HockeyGameCard";
import HockeySquareGameCard from "./HockeySqaureGameCard";
import HockeyStackedGameCard from "./HockeyStackedGameCard";

type GamesListProps = {
  games: HockeyGame[];
  error: Error | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  showHeaders: boolean;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  showCountdown?: boolean;
  countdownGame?: HockeyGame | null;
  teamLogo?: any;
  teamName?: string;
  teamColor?: string;
  teamSecondaryColor?: string;
};
type PlaceholderGame = { _isPlaceholder: true; id: string };
type GameListItem = HockeyGame | PlaceholderGame;
const ItemSeparator = () => <View style={{ height: 12 }} />;

function isPlaceholderGame(game: GameListItem): game is PlaceholderGame {
  return "_isPlaceholder" in game;
}

export default function GamesList({
  games,
  loading,
  refreshing,
  onRefresh,
  showHeaders,
  expectedCount,
  scrollEnabled = true,
  showCountdown = false,
  countdownGame = null,
  teamLogo,
  teamName,
  teamColor,
  teamSecondaryColor,
  error,
}: GamesListProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = gameListStyles;
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const { viewMode, viewModeReady } = usePreferences();

  const [previewGame, setPreviewGame] = useState<HockeyGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isNHLGame = (game: HockeyGame) => game?.league?.id === 90;
  const isMCHGame = (game: HockeyGame) => game?.league?.id === 91;
  const isWCHGame = (game: HockeyGame) => game?.league?.id === 92;

  const handleLongPress = useCallback((game: HockeyGame) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  }, []);

  const renderGameCard = useCallback(
    (game: GameListItem) => {
      if (isPlaceholderGame(game)) {
        return <View style={{ flex: 1 }} />;
      }

      const cardContent =
        viewMode === "list" ? (
          <HockeyGameCard
            game={game}
            isNHL={isNHLGame(game)}
            isMCH={isMCHGame(game)}
            isWCH={isWCHGame(game)}
          />
        ) : viewMode === "grid" ? (
          <HockeySquareGameCard
            game={game}
            isNHL={isNHLGame(game)}
            isMCH={isMCHGame(game)}
            isWCH={isWCHGame(game)}
          />
        ) : (
          <HockeyStackedGameCard
            game={game}
            isNHL={isNHLGame(game)}
            isMCH={isMCHGame(game)}
            isWCH={isWCHGame(game)}
          />
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
    ({ item }: { item: GameListItem }) => renderGameCard(item),
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

  const gridData = useMemo<GameListItem[]>(
    () =>
      viewMode === "grid" && games.length % 2 === 1
        ? [...games, { _isPlaceholder: true, id: "placeholder" }]
        : games,
    [games, viewMode],
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
        <Text style={global.errorText}>Couldn’t load games</Text>
      </ScrollView>
    );
  }

  return (
    <>
      <FlatList
        data={viewMode === "grid" ? gridData : games}
        keyExtractor={(item, index) =>
          isPlaceholderGame(item) ? `placeholder-${index}` : `game-${item.id}`
        }
        renderItem={renderItem}
        numColumns={viewMode === "grid" ? 2 : 1}
        key={viewMode}
        columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
        ItemSeparatorComponent={viewMode !== "grid" ? ItemSeparator : undefined}
        ListHeaderComponent={
          showHeaders && showCountdown && countdownGame ? (
            <CountdownClock
              game={countdownGame}
              loading={loading}
              teamLogo={teamLogo}
              teamName={teamName}
              teamColor={teamColor}
              teamSecondaryColor={teamSecondaryColor}
            />
          ) : undefined
        }
        contentContainerStyle={navigationContentStyle(
          viewMode === "grid"
            ? styles.gridListContainer
            : styles.contentContainer,
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        ListEmptyComponent={
          <View style={global.emptyContainer}>
            <Text style={global.emptyTitle}>No games scheduled</Text>
          </View>
        }
      />
      {modalVisible && previewGame && (
        <HockeyGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          isNHL={isNHLGame(previewGame)}
          isMCH={isMCHGame(previewGame)}
          isWCH={isWCHGame(previewGame)}
        />
      )}
    </>
  );
}
