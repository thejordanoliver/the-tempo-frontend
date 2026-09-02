import { globalStyles } from "@/constants/styles";
import { BaseballGame } from "@/types/baseball/baseball";
import { BasketballGame } from "@/types/basketball/basketball";
import { FootballGame } from "@/types/football/football";
import { HockeyGame } from "@/types/hockey/hockey";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import BaseballGamePreviewModal from "components/Sports/Baseball/GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "components/Sports/Baseball/Games/BaseballGameCard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import FootballGamePreviewModal from "../../Football/GamePreview/FootballGamePreviewModal";
import FootballGameCard from "../../Football/Games/FootballGameCard";
import HockeyGamePreviewModal from "../../Hockey/GamePreview/HockeyGamePreviewModal";
import HockeyGameCard from "../../Hockey/Games/HockeyGameCard";
import BasketballGamePreviewModal from "../GamePreview/BasketballGamePreviewModal";
import BasketballGameCard from "../Games/BasketballGameCard";

type BaseProps = {
  error: string | null;
  loading?: boolean;

  isNBA?: boolean;
  isCBB?: boolean;
  isWNBA?: boolean;
  isWCBB?: boolean;

  isMLB?: boolean;
  isCB?: boolean;
  isSB?: boolean;

  isNFL?: boolean;
  isCFB?: boolean;

  isNHL?: boolean;
  isMCH?: boolean;

  isDark: boolean;
};

type BasketballProps = BaseProps & {
  league: "nba" | "cbb" | "wcbb" | "wnba";
  game: BasketballGame | null;
};

type BaseballProps = BaseProps & {
  league: "mlb";
  game: BaseballGame | null;
};

type HockeyProps = BaseProps & {
  league: "nhl";
  game: HockeyGame | null;
};

type FootballProps = BaseProps & {
  league: "nfl" | "cfb";
  game: FootballGame | null;
};

type Props = BasketballProps | BaseballProps | HockeyProps | FootballProps;

export default function LatestGame(props: Props) {
  const {
    error,
    loading = false,
    isDark,
    isNBA = false,
    isCBB = false,
    isWNBA = false,
    isWCBB = false,
    isNFL = false,
    isCFB = false,
  } = props;

  const global = globalStyles(isDark);

  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (event: {
    nativeEvent: {
      state: State;
    };
  }) => {
    if (event.nativeEvent.state !== State.ACTIVE || !props.game) {
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderGameCard = () => {
    /*
     * Destructure both values together.
     *
     * This preserves the discriminated-union relationship between
     * league and game.
     */
    const { league, game } = props;

    if (!game) {
      return null;
    }

    switch (league) {
      case "nba":
        return <BasketballGameCard game={game} isNBA={isNBA} />;

      case "cbb":
        return <BasketballGameCard game={game} isCBB={isCBB} />;

      case "wcbb":
        return <BasketballGameCard game={game} isWCBB={isWCBB} />;

      case "wnba":
        return <BasketballGameCard game={game} isWNBA={isWNBA} />;

      case "mlb":
        return (
          <BaseballGameCard
            game={game}
            isMLB={true}
            isCB={false}
            isSB={false}
          />
        );

      case "nfl":
        return <FootballGameCard game={game} isNFL={isNFL} isCFB={false} />;

      case "cfb":
        return <FootballGameCard game={game} isNFL={false} isCFB={isCFB} />;

      case "nhl":
        return <HockeyGameCard game={game} isNHL={true} isMCH={false} />;
    }
  };

  const renderPreviewModal = () => {
    if (!modalVisible) {
      return null;
    }

    /*
     * Narrow game again inside this function.
     *
     * The earlier component-level check does not reliably carry
     * into a nested function.
     */
    const { league, game } = props;

    if (!game) {
      return null;
    }

    switch (league) {
      case "nba":
        return (
          <BasketballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isSL={false}
            isCBB={false}
            isWCBB={false}
            isWNBA={false}
          />
        );

      case "cbb":
        return (
          <BasketballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isSL={false}
            isCBB={isCBB}
            isWCBB={false}
            isWNBA={false}
          />
        );

      case "wcbb":
        return (
          <BasketballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isSL={false}
            isCBB={false}
            isWCBB={isWCBB}
            isWNBA={false}
          />
        );

      case "wnba":
        return (
          <BasketballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isSL={false}
            isCBB={false}
            isWCBB={false}
            isWNBA={isWNBA}
          />
        );

      case "mlb":
        return (
          <BaseballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isMLB={true}
            isCB={false}
            isSB={false}
          />
        );

      case "nfl":
        return (
          <FootballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isNFL={isNFL}
            isCFB={false}
          />
        );

      case "cfb":
        return (
          <FootballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isNFL={false}
            isCFB={isCFB}
          />
        );

      case "nhl":
        return (
          <HockeyGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isNHL={true}
            isMCH={false}
          />
        );
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

  if (error) {
    return <Text style={global.errorText}>{error}</Text>;
  }

  if (!props.game) {
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
          <View>{renderGameCard()}</View>
        </LongPressGestureHandler>
      </View>

      {renderPreviewModal()}
    </>
  );
}
