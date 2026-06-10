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
import GamePreviewModal from "../GamePreview/GamePreviewModal";
import GameCard from "./GameCard";
import SquareGameCard from "./SquareGameCard";
import StackedGameCard from "./StackedGameCard";

type Props = {
  games: any[];
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
};

type GameSection = {
  title: string;
  data: any[];
};

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
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { viewMode } = usePreferences();
  const styles = gameListStyles;
  const global = globalStyles(isDark);

  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isCBBGame = (game: any) => String(game?.league?.id) === "10";
  const isWCBBGame = (game: any) => String(game?.league?.id) === "54";
  const isWNBAGame = (game: any) => String(game?.league?.id) === "59";

  /* ----------------------------- Sections ----------------------------- */

  const sections: GameSection[] = useMemo(() => {
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

  const renderGameCard = (game: any) => {
    if ((game as any)?._isPlaceholder) {
      return <View style={styles.gridItem} />;
    }

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <LongPressGestureHandler
        key={game?.game?.id ?? game?.id}
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
          <GameCard
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
          <SquareGameCard
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
        <StackedGameCard
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
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => renderGameCard(item)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={styles.gridListContainer}
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
          sections={sections as SectionListData<any, GameSection>[]}
          keyExtractor={(item, index) => `${item?.game?.id ?? "game"}-${index}`}
          renderItem={({ item }) => renderGameCard(item)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          stickySectionHeadersEnabled={false}
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
        />
      )}
    </>
  );
}
