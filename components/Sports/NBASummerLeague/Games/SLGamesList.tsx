import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import SquareGameCardSkeleton from "components/Skeletons/GameCards/SquareGameCardSkeleton";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { FlatList, View, ViewStyle } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { gameListStyles } from "styles/GamecardStyles/GameListStyles";
import type { SummerGame } from "../../../../types/types";
import SLStackedGameCard from "./SLeagueStackedGameCard";
import SLGameCard from "./SLGameCard";
import SLSquareGameCard from "./SLSquareGameCard";
type Props = {
  games: SummerGame[];
  loading: boolean;
  refreshing?: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  scrollEnabled?: boolean; // new prop
};

const SLGamesList: React.FC<Props> = ({
  games,
  loading,
  refreshing,
  onRefresh,
  expectedCount,
  scrollEnabled = true, // default to true
}) => {
  const styles = gameListStyles;
  const [previewGame, setPreviewGame] = useState<SummerGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { viewMode } = usePreferences();

  const handleLongPress = (game: SummerGame) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setModalVisible(true);
  };
  const renderGameCard = (game: SummerGame) => {
    if ((game as any)?._isPlaceholder) {
      return <View style={styles.gridItem} />;
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

    if (viewMode === "list")
      return wrapper(
        <View>
          <SLGameCard game={game} />
        </View>,
      );
    if (viewMode === "grid") return wrapper(<SLSquareGameCard game={game} />);
    return wrapper(
      <View>
        <SLStackedGameCard game={game} />
      </View>,
    );
  };

  if (loading) {
    const skeletonCount =
      games.length > 0 ? games.length : (expectedCount ?? 4);
    return (
      <View style={styles.skeletonWrapper}>
        {Array.from({ length: skeletonCount }).map((_, index) =>
          viewMode === "list" ? (
            <GameCardSkeleton key={index} />
          ) : (
            <SquareGameCardSkeleton key={index} />
          ),
        )}
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={games}
        keyExtractor={(item, index) => `game-${item.id}-${index}`}
        renderItem={({ item }) => renderGameCard(item)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />
    </>
  );
};

export default SLGamesList;
