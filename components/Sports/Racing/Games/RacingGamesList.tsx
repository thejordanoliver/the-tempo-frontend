import { RacingEvent } from "@/types/racing/racing";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { FlatList, Text, View, ViewStyle } from "react-native";
import {
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import RacingGameCard from "./RacingGameCard";
import RacingSquareGameCard from "./RacingSquareGameCard";
import RacingStackedGameCard from "./RacingStackedGameCard";

type GameListItem = RacingEvent;

type GridPlaceholder = {
  _isPlaceholder: true;
  placeholderId: string;
};

type GridListItem = GameListItem | GridPlaceholder;

type GamesListProps = {
  games?: GameListItem[] | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  scrollEnabled?: boolean;
  error: Error | null;
};

function isGridPlaceholder(item: GridListItem): item is GridPlaceholder {
  return "_isPlaceholder" in item && item._isPlaceholder === true;
}

function getGameKey(game: GameListItem, index: number) {
  return `racing-game-${String(game.uid ?? game.id ?? index)}`;
}

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
  const { viewMode, resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = gameListStyles;
  const global = globalStyles(isDark);

  /*
   * The hook or API can temporarily return null even though the prop is
   * intended to be an array. Always normalize it before reading .length,
   * mapping, or passing it to FlatList.
   */
  const safeGames = Array.isArray(games) ? games : [];

  const [previewGame, setPreviewGame] = useState<GameListItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (game: GameListItem) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setPreviewGame(game);
    setModalVisible(true);
  };

  const renderGameCard = (game: GameListItem) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <LongPressGestureHandler
        minDurationMs={300}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            handleLongPress(game);
          }
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
          <RacingGameCard game={game} />
        </Wrapper>
      );
    }

    if (viewMode === "grid") {
      return (
        <Wrapper>
          <RacingSquareGameCard game={game} />
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <RacingStackedGameCard game={game} />
      </Wrapper>
    );
  };

  const renderSkeletons = (count: number) => {
    if (viewMode === "list") {
      return (
        <View style={styles.skeletonWrapper}>
          {Array.from({ length: count }).map((_, index) => (
            <GameCardSkeleton key={`list-skeleton-${index}`} />
          ))}
        </View>
      );
    }

    if (viewMode === "grid") {
      const skeletons = Array.from({ length: count }).map((_, index) => ({
        id: `grid-skeleton-${index}`,
        isPlaceholder: false,
      }));

      const dataWithPlaceholder =
        count % 2 === 1
          ? [
              ...skeletons,
              {
                id: "grid-skeleton-placeholder",
                isPlaceholder: true,
              },
            ]
          : skeletons;

      return (
        <FlatList
          data={dataWithPlaceholder}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.skeletonGridWrapper}
          renderItem={({ item, index }) => {
            if (item.isPlaceholder) {
              return (
                <View
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: "transparent",
                    },
                  ]}
                />
              );
            }

            const isLastOddItem =
              count % 2 === 1 && index === count - 1;

            const itemStyle: ViewStyle = {
              flex: 1,
              marginLeft: isLastOddItem
                ? 12
                : index % 2 === 0
                  ? 12
                  : 6,
              marginRight: isLastOddItem
                ? 12
                : index % 2 === 0
                  ? 6
                  : 12,
            };

            return <SquareGameCardSkeleton style={itemStyle} />;
          }}
        />
      );
    }

    return (
      <View style={styles.skeletonWrapper}>
        {Array.from({ length: count }).map((_, index) => (
          <StackedGameCardSkeleton key={`stacked-skeleton-${index}`} />
        ))}
      </View>
    );
  };

  if (loading) {
    const skeletonCount =
      safeGames.length > 0 ? safeGames.length : (expectedCount ?? 4);

    return renderSkeletons(skeletonCount);
  }

  if (error && safeGames.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <Text style={global.emptyText}>
          Unable to load racing events. Pull down to try again.
        </Text>
      </View>
    );
  }

  if (safeGames.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyTitle}>
          {day === "todayTomorrow"
            ? "No engines firing up today."
            : "The track was quiet on this date."}
        </Text>
        <Text style={global.emptyText}>
          The next green flag is coming up.
        </Text>
      </View>
    );
  }

  if (viewMode === "grid") {
    const gridData: GridListItem[] =
      safeGames.length % 2 === 1
        ? [
            ...safeGames,
            {
              _isPlaceholder: true,
              placeholderId: "racing-grid-placeholder",
            },
          ]
        : safeGames;

    return (
      <FlatList
        data={gridData}
        keyExtractor={(item, index) =>
          isGridPlaceholder(item)
            ? item.placeholderId
            : getGameKey(item, index)
        }
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => {
          if (isGridPlaceholder(item)) {
            return <View style={styles.gridItem} />;
          }

          return renderGameCard(item);
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.gridListContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />
    );
  }

  return (
    <FlatList
      data={safeGames}
      keyExtractor={getGameKey}
      renderItem={({ item }) => renderGameCard(item)}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.contentContainer}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
    />
  );
}
