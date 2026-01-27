import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Skeletons/GameCards/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
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
  const styles = gameListStyles(isDark);
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
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <GameSquareCardSkeleton />
            </View>
          )}
          columnWrapperStyle={styles.gridRow}
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

  /* --------------------------- LOADING ------------------------------- */

  if (loading) {
    const count = games.length > 0 ? games.length : expectedCount ?? 4;
    return renderSkeletons(count);
  }

  if (!loading && games.length === 0) {
    return (
      <View>
        <Text style={styles.emptyText}>
          {day === "todayTomorrow"
            ? "No games found for today or tomorrow."
            : "No games found on this date."}
        </Text>
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
