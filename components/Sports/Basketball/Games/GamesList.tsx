import CountdownClock from "@/components/CountdownClock";
import { BasketballGame } from "@/types/basketball/basketball";
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
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import BasketballGamePreviewModal from "../GamePreview/BasketballGamePreviewModal";
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
  showCountdown?: boolean;
  countdownGame?: BasketballGame | null;
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
  showHeaders = false,
  scrollEnabled = true,
  showCountdown = false,
  countdownGame = null,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { viewMode } = usePreferences();
  const styles = gameListStyles;
  const global = globalStyles(isDark);

  const [previewGame, setPreviewGame] = useState<BasketballGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isCBBGame = (game: BasketballGame) => String(game?.league?.id) === "10";
  const isWCBBGame = (game: BasketballGame) =>
    String(game?.league?.id) === "54";
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
            isCBB={isCBBGame(game)}
            isWNBA={isWNBAGame(game)}
            isWCBB={isWCBBGame(game)}
          />
        </Wrapper>
      );
    }

    if (viewMode === "grid") {
      return (
        <Wrapper>
          <BasketballSquareGameCard
            game={game}
            isCBB={isCBBGame(game)}
            isWNBA={isWNBAGame(game)}
            isWCBB={isWCBBGame(game)}
          />
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <BasketballStackedGameCard
          game={game}
          isCBB={isCBBGame(game)}
          isWNBA={isWNBAGame(game)}
          isWCBB={isWCBBGame(game)}
        />
      </Wrapper>
    );
  };

  /* --------------------------- Skeletons ------------------------------- */

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
          scrollEnabled={scrollEnabled}
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

  /* ----------------------------- LOADING ------------------------------ */

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
          contentContainerStyle={styles.gridListContainer}
          ListHeaderComponent={
            showHeaders && showCountdown && countdownGame ? (
              <CountdownClock game={countdownGame} loading={loading} />
            ) : null
          }
          ListEmptyComponent={
            <Text style={global.emptyText}>
              {day === "todayTomorrow"
                ? "No games found for today or tomorrow."
                : "No games found."}
            </Text>
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
              <CountdownClock game={countdownGame} loading={loading} />
            ) : null
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={scrollEnabled}
        />
      )}

      {modalVisible && previewGame && (
        <BasketballGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          isCBB={isCBBGame(previewGame)}
          isWCBB={isWCBBGame(previewGame)}
          isWNBA={isWNBAGame(previewGame)}
        />
      )}
    </>
  );
}
