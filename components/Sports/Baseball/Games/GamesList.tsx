import CountdownClock from "@/components/CountdownClock";
import { BaseballGame } from "@/types/baseball/baseball";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  Text,
  View,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import BaseballGamePreviewModal from "../GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "./BaseballGameCard";
import BaseballSquareGameCard from "./BaseballSquareGameCard";
import BaseballStackedGameCard from "./BaseballStackedGameCard";

type GamesListProps = {
  games: BaseballGame[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  showHeaders?: boolean;
  error: Error | null;
  isMLB?: boolean;
  isCB?: boolean;
  isSB?: boolean;
  showCountdown?: boolean;
  countdownGame?: BaseballGame | null;
  teamLogo?: any;
  teamName?: string;
  teamColor?: string;
  teamSecondaryColor?: string;
};

type GameSection = {
  title: string;
  data: BaseballGame[];
};

type PlaceholderGame = { _isPlaceholder: true; id: string };
type GameListItem = BaseballGame | PlaceholderGame;

function isPlaceholderGame(game: GameListItem): game is PlaceholderGame {
  return "_isPlaceholder" in game;
}

export default function GamesList({
  games,
  loading,
  refreshing,
  onRefresh,
  expectedCount,
  day,
  scrollEnabled = true,
  showHeaders = false,
  isMLB = false,
  isSB = false,
  isCB = false,
  showCountdown = false,
  countdownGame = null,
  teamLogo,
  teamName,
  teamColor,
  teamSecondaryColor,
}: GamesListProps) {
  const { viewMode } = usePreferences();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = gameListStyles;
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [previewGame, setPreviewGame] = useState<BaseballGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = useCallback((game: BaseballGame) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => setModalVisible(false), []);

  const renderGameCard = useCallback(
    (game: GameListItem) => {
      if (isPlaceholderGame(game)) {
        return <View style={{ flex: 1 }} />;
      }

      const cardContent =
        viewMode === "list" ? (
          <BaseballGameCard game={game} isMLB={isMLB} isCB={isCB} isSB={isSB} />
        ) : viewMode === "grid" ? (
          <BaseballSquareGameCard
            game={game}
            isMLB={isMLB}
            isCB={isCB}
            isSB={isSB}
          />
        ) : (
          <BaseballStackedGameCard
            game={game}
            isMLB={isMLB}
            isCB={isCB}
            isSB={isSB}
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
    [viewMode, isMLB, isCB, isSB, styles.gridItem, handleLongPress],
  );

  /* ----------------------------- Sections ----------------------------- */

  const sections: GameSection[] = useMemo(() => {
    if (!showHeaders) return [{ title: "All", data: games }];
    return [{ title: "Regular Season", data: games }];
  }, [games, showHeaders]);

  const gridData = useMemo<GameListItem[]>(
    () =>
      games.length % 2 === 1
        ? [...games, { _isPlaceholder: true, id: "placeholder" }]
        : games,
    [games],
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

  if (loading) {
    const count = games.length > 0 ? games.length : (expectedCount ?? 4);
    return renderSkeletons(count);
  }

  if (games.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyTitle}>
          {day === "todayTomorrow"
            ? "No games at the ballpark today."
            : "The bases were empty on this date."}
        </Text>
        <Text style={global.emptyText}>More first pitches are on deck.</Text>
      </View>
    );
  }

  return (
    <>
      {viewMode === "grid" ? (
        <FlatList
          data={gridData}
          keyExtractor={(item, index) =>
            isPlaceholderGame(item)
              ? `placeholder-${index}`
              : `game-${item.id ?? index}`
          }
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => renderGameCard(item)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEnabled={scrollEnabled}
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
            ) : null
          }
          contentContainerStyle={styles.gridListContainer}
          ListEmptyComponent={
            <View style={global.emptyContainer}>
              <Text style={global.emptyTitle}>
                {day === "todayTomorrow"
                  ? "No games hitting the hardwood today."
                  : "The court was quiet on this date."}
              </Text>
              <Text style={global.emptyText}>
                The next tipoff won’t be far away.
              </Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={sections as SectionListData<BaseballGame, GameSection>[]}
          keyExtractor={(item, index) => `${item.id ?? "game"}-${index}`}
          renderItem={({ item }) => renderGameCard(item)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          stickySectionHeadersEnabled={false}
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
            ) : null
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={scrollEnabled}
        />
      )}

      {modalVisible && previewGame && (
        <BaseballGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={handleCloseModal}
          isMLB={isMLB}
          isSB={isSB}
          isCB={isCB}
        />
      )}
    </>
  );
}
