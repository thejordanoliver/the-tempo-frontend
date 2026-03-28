import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import GameCard from "components/Sports/NBA/Games/GameCard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { View } from "react-native";
import type { Game } from "types/types";
import GamePreviewModal from "../GamePreview/GamePreviewModal";
import {
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";

type Props = {
  game: Game | null;
  loading?: boolean;
  isDark: boolean;
};

export default function LatestGame({
  game,
  loading = false,
  isDark,
}: Props) {
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE && game) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPreviewGame(game);
      setModalVisible(true);
    }
  };

  if (loading) {
    return <GameCardSkeleton />;
  }

  if (!game) {
    return null;
  }

  return (
    <>
      <View>
        <HeadingTwo isDark={isDark}>Latest Game</HeadingTwo>

        {/* ✅ Long Press Wrapper */}
        <LongPressGestureHandler
          onHandlerStateChange={handleLongPress}
          minDurationMs={400} // adjust sensitivity
        >
          <View>
            <GameCard game={game} />
          </View>
        </LongPressGestureHandler>
      </View>

      {/* ✅ Modal */}
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