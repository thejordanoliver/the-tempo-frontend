import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import CFBGameCard from "components/Sports/CFB/Games/CFBGameCard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import type { Game } from "types/nfl";
import NFLGamePreviewModal from "../GamePreview/NFLGamePreviewModal";
import NFLGameCard from "../Games/NFLGameCard";
type Props = {
  game: Game | null;
  loading?: boolean;
  isDark: boolean;
  league: "NFL" | "CFB";
};

export default function LatestGame({
  game,
  loading = false,
  isDark,
  league,
}: Props) {
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isNFL = league === "NFL";

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
            {isNFL && <NFLGameCard game={game} />}
            {!isNFL && <CFBGameCard game={game} />}
          </View>
        </LongPressGestureHandler>
      </View>

      {/* ✅ Modal */}
      {isNFL && modalVisible && previewGame && (
        <NFLGamePreviewModal
          game={previewGame}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
