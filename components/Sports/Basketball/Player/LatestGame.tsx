import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import { globalStyles } from "constants/styles";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { BasketballGame } from "types/basketball";
import CBBGamePreviewModal from "../GamePreview/BasketballGamePreviewModal";
import CBBGameCard from "../Games/BasketballGameCard";
type Props = {
  game: BasketballGame | null;
  loading?: boolean;
  error: string | null;
  isDark: boolean;
};

export default function LatestGame({
  game,
  loading = false,
  error,
  isDark,
}: Props) {
  const global = globalStyles(isDark);
  const [previewGame, setPreviewGame] = useState<BasketballGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isWomen = game?.league.name === "NCAA Women";
  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE && game) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPreviewGame(game);
      setModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View>
        <HeaderSkeleton />
        <GameCardSkeleton />
      </View>
    );
  }

  if (!game) {
    return null;
  }

  if (error) return <Text style={global.errorText}>{error}</Text>;

  return (
    <>
      <View>
        <HeadingTwo isDark={isDark}>Latest Game</HeadingTwo>

        <LongPressGestureHandler
          onHandlerStateChange={handleLongPress}
          minDurationMs={400}
        >
          <View>
            <CBBGameCard game={game} isWomen={isWomen} />
          </View>
        </LongPressGestureHandler>
      </View>

      {modalVisible && previewGame && (
        <CBBGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
