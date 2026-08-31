import CountdownClock from "@/components/CountdownClock";
import { BasketballGame } from "@/types/basketball/basketball";
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
import GamePreviewModal from "../GamePreview/BasketballGamePreviewModal";
import BasketballGameCard from "./BasketballGameCard";
import BasketballSquareGameCard from "./BasketballSquareGameCard";
import BasketballStackedGameCard from "./BasketballStackedGameCard";

type Props = {
  games: BasketballGame[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error: Error | null;
  expectedCount?: number;
  day?: "todayTomorrow";
  showHeaders?: boolean;
  scrollEnabled?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isGLEAGUE?: boolean;
  showCountdown?: boolean;
  countdownGame?: BasketballGame | null;
  teamLogo?: any;
  teamName?: string;
  teamColor?: string;
  teamSecondaryColor?: string;
};

type GameSection = {
  title: string;
  data: BasketballGame[];
};

type PlaceholderGame = { _isPlaceholder: true; id: string };
type GameListItem = BasketballGame | PlaceholderGame;

function isPlaceholderGame(game: GameListItem): game is PlaceholderGame {
  return "_isPlaceholder" in game;
}

export default function GamesList({
  games,
  loading,
  refreshing,
  onRefresh,
  error,
  expectedCount,
  day,
  showHeaders,
  scrollEnabled = true,
  showCountdown = false,
  countdownGame = null,
  teamLogo,
  teamName,
  teamColor,
  teamSecondaryColor,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { viewMode } = usePreferences();
  const styles = gameListStyles;
  const global = globalStyles(isDark);

  const [previewGame, setPreviewGame] = useState<BasketballGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isSLGame = (game: BasketballGame) =>
    String(game?.league?.id) === "23170" ||
    String(game?.league?.id) === "64" ||
    String(game?.league?.id) === "63";
  const isCBBGame = (game: BasketballGame) => String(game?.league?.id) === "10";
  const isWCBBGame = (game: BasketballGame) =>
    String(game?.league?.id) === "54";
  const isGLEAGUEGame = (game: BasketballGame) =>
    String(game?.league?.id) === "69";
  const isWNBAGame = (game: BasketballGame) =>
    String(game?.league?.id) === "59";

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

  /* --------------------------- Interactions ---------------------------- */

  const handleLongPress = (game: BasketballGame) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };

  /* -------------------------- Game Renderer ---------------------------- */

  const renderGameCard = (game: GameListItem) => {
    if (isPlaceholderGame(game)) {
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
          <BasketballGameCard
            game={game}
            isSL={isSLGame(game)}
            isCBB={isCBBGame(game)}
            isWNBA={isWNBAGame(game)}
            isWCBB={isWCBBGame(game)}
            isGLEAGUE={isGLEAGUEGame(game)}
          />
        </Wrapper>
      );
    }

    if (viewMode === "grid") {
      return (
        <Wrapper>
          <BasketballSquareGameCard
            game={game}
            isSL={isSLGame(game)}
            isCBB={isCBBGame(game)}
            isWNBA={isWNBAGame(game)}
            isWCBB={isWCBBGame(game)}
            isGLEAGUE={isGLEAGUEGame(game)}
          />
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <BasketballStackedGameCard
          game={game}
          isSL={isSLGame(game)}
          isCBB={isCBBGame(game)}
          isWNBA={isWNBAGame(game)}
          isWCBB={isWCBBGame(game)}
          isGLEAGUE={isGLEAGUEGame(game)}
        />
      </Wrapper>
    );
  };

  /* --------------------------- Skeletons ------------------------------- */

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

  /* ----------------------------- LOADING ------------------------------ */

  if (loading) {
    const count = games.length > 0 ? games.length : (expectedCount ?? 4);
    return renderSkeletons(count);
  }

  if (!loading && games.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyTitle}>The court is quiet...</Text>
        <Text style={global.emptyText}>The next tipoff won’t be far away.</Text>
      </View>
    );
  }

  /* ----------------------------- CONTENT ------------------------------ */

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
                No games hitting the hardwood today..
              </Text>
              <Text style={global.emptyText}>
                The next tipoff won’t be far away.
              </Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={sections as SectionListData<BasketballGame, GameSection>[]}
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
        <GamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          isSL={isSLGame(previewGame)}
          isCBB={isCBBGame(previewGame)}
          isWCBB={isWCBBGame(previewGame)}
          isWNBA={isWNBAGame(previewGame)}
          isGLEAGUE={isGLEAGUEGame(previewGame)}
        />
      )}
    </>
  );
}
