import { globalStyles } from "@/constants/styles";
import { BaseballGame } from "@/types/baseball";
import { BasketballGame } from "@/types/basketball";
import { FootballGame } from "@/types/football";
import { HockeyGame } from "@/types/hockey";
import { LeagueType } from "@/types/types";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import BaseballGamePreviewModal from "components/Sports/Baseball/GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "components/Sports/Baseball/Games/BaseballGameCard";
import GamePreviewModal from "components/Sports/NBA/GamePreview/GamePreviewModal";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import BasketballGamePreviewModal from "../../Basketball/GamePreview/BasketballGamePreviewModal";
import BasketballGameCard from "../../Basketball/Games/BasketballGameCard";
import FootballGamePreviewModal from "../../NFL/GamePreview/FootballGamePreviewModal";
import FootballGameCard from "../../NFL/Games/FootballGameCard";
import HockeyGamePreviewModal from "../../NHL/GamePreview/HockeyGamePreviewModal";
import HockeyGameCard from "../../NHL/Games/HockeyGameCard";

type BaseProps = {
  error: string | null;
  loading?: boolean;
  isCBB?: boolean;
  isWNBA?: boolean;
  isWCBB?: boolean;
  isSB?: boolean;
  isNFL?: boolean;
  isCFB?: boolean;
  isCB?: boolean;
  isDark: boolean;
};

type Props =
  | ({
      league: "NBA";
      game: BasketballGame | null;
    } & BaseProps)
  | ({
      league: "MLB";
      game: BaseballGame | null;
    } & BaseProps)
  | ({
      league: "NHL";
      game: HockeyGame | null;
    } & BaseProps)
  | ({
      league: "CBB" | "WCBB" | "WNBA";
      game: BasketballGame | null;
    } & BaseProps)
  | ({
      league: "NFL" | "CFB";
      game: FootballGame | null;
    } & BaseProps)
  | ({
      league: Exclude<
        LeagueType,
        "NBA" | "CBB" | "WCBB" | "WNBA" | "MLB" | "NHL"
      >;
      game: FootballGame | null;
    } & BaseProps);

export default function LatestGame({
  game,
  error,
  league,
  loading = false,
  isCBB = false,
  isNFL = false,
  isCFB = false,
  isWNBA = false,
  isWCBB = false,
  isDark,
}: Props) {
  const global = globalStyles(isDark);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (event: { nativeEvent: { state: State } }) => {
    if (event.nativeEvent.state !== State.ACTIVE || !game) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View>
        <HeaderSkeleton />
        <GameCardSkeleton />
      </View>
    );
  }

  if (error) return <Text style={global.errorText}>{error}</Text>;

  if (!game) {
    return null;
  }

  return (
    <>
      <View>
        <HeadingTwo isDark={isDark}>Latest Game</HeadingTwo>

        <LongPressGestureHandler
          onHandlerStateChange={handleLongPress}
          minDurationMs={400}
        >
          <View>
            {league === "NBA" && <BasketballGameCard game={game} />}

            {league === "MLB" && (
              <BaseballGameCard
                game={game}
                isMLB={true}
                isCB={false}
                isSB={false}
              />
            )}
            {league === "NFL" && (
              <FootballGameCard game={game} isNFL={isNFL} isCFB={isCFB} />
            )}
            {league === "CFB" && (
              <FootballGameCard game={game} isNFL={isNFL} isCFB={isCFB} />
            )}
            {league === "NHL" && (
              <HockeyGameCard game={game} isNHL={true} isMCH={false} />
            )}
            {league === "CBB" && (
              <BasketballGameCard game={game} isCBB={isCBB} />
            )}
            {league === "WCBB" && (
              <BasketballGameCard game={game} isWCBB={isWCBB} />
            )}
            {league === "WNBA" && (
              <BasketballGameCard game={game} isWNBA={isWNBA} />
            )}

            {league !== "NBA" && league !== "MLB" && null}
          </View>
        </LongPressGestureHandler>
      </View>

      {league === "NBA" && modalVisible && (
        <GamePreviewModal
          game={game}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}

      {(league === "CBB" || league === "WCBB" || league === "WNBA") &&
        modalVisible && (
          <BasketballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isCBB={isCBB}
            isWCBB={isWCBB}
            isWNBA={isWNBA}
          />
        )}

      {league === "MLB" && modalVisible && (
        <BaseballGamePreviewModal
          game={game}
          visible={modalVisible}
          onClose={handleCloseModal}
          isMLB={true}
          isCB={false}
          isSB={false}
        />
      )}
      {league === "NHL" && modalVisible && (
        <HockeyGamePreviewModal
          game={game}
          visible={modalVisible}
          onClose={handleCloseModal}
          isNHL={true}
          isMCH={false}
        />
      )}
      {league === "NFL" ||
        (league === "CFB" && modalVisible && (
          <FootballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isNFL={isNFL}
            isCFB={isCFB}
          />
        ))}
    </>
  );
}
