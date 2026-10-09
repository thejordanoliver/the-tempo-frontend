import { globalStyles } from "@/constants/styles";
import { BaseballGame } from "@/types/baseball/baseball";
import { BasketballGame } from "@/types/basketball/basketball";
import { FootballGame } from "@/types/football/football";
import { HockeyGame } from "@/types/hockey/hockey";
import type { MMAFight } from "types/mma/mma";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import BaseballGamePreviewModal from "components/Sports/Baseball/GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "components/Sports/Baseball/Games/BaseballGameCard";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import BasketballGamePreviewModal from "../Sports/Basketball/GamePreview/BasketballGamePreviewModal";
import BasketballGameCard from "../Sports/Basketball/Games/BasketballGameCard";
import FootballGamePreviewModal from "../Sports/Football/GamePreview/FootballGamePreviewModal";
import FootballGameCard from "../Sports/Football/Games/FootballGameCard";
import HockeyGamePreviewModal from "../Sports/Hockey/GamePreview/HockeyGamePreviewModal";
import HockeyGameCard from "../Sports/Hockey/Games/HockeyGameCard";
import MMAGameCard from "../Sports/MMA/Games/MMAGameCard";
import MMAGamePreviewModal from "../Sports/MMA/GamePreview/MMAGamePreviewModal";

type BaseProps = {
  error: string | null;
  loading?: boolean;

  isNBA?: boolean;
  isMCBB?: boolean;
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
  league: "nba" | "mcbb" | "wcbb" | "wnba";
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
type MMAProps = BaseProps & {
  league: "mma" | "ufc";
  game: MMAFight | null;
};

type Props =
  | BasketballProps
  | BaseballProps
  | HockeyProps
  | FootballProps
  | MMAProps;

export default function LatestGame(props: Props) {
  const {
    error,
    loading = false,
    isDark,
    isNBA = false,
    isMCBB = false,
    isWNBA = false,
    isWCBB = false,
    isNFL = false,
    isCFB = false,
  } = props;
  const { league, game } = props;
  const global = useMemo(() => globalStyles(isDark), [isDark]);
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

      case "mcbb":
        return <BasketballGameCard game={game} isMCBB={isMCBB} />;

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

      case "mma":
      case "ufc":
        return <MMAGameCard game={game} />;
    }
  };

  const renderPreviewModal = () => {
    if (!modalVisible) {
      return null;
    }

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
            isMCBB={false}
            isWCBB={false}
            isWNBA={false}
          />
        );

      case "mcbb":
        return (
          <BasketballGamePreviewModal
            game={game}
            visible={modalVisible}
            onClose={handleCloseModal}
            isSL={false}
            isMCBB={isMCBB}
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
            isMCBB={false}
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
            isMCBB={false}
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

      case "mma":
      case "ufc":
        return <MMAGamePreviewModal game={game} visible={modalVisible} onClose={handleCloseModal} />;
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
        <HeadingTwo isDark={isDark}>{league === "mma" || league === "ufc" ? "Latest Fight" : "Latest Game"}</HeadingTwo>

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
