import { useLocalSearchParams } from "expo-router";

import BaseballGameScreen from "app/(tabs)/(home)/game/baseball/[game]";
import BasketballGameScreen from "app/(tabs)/(home)/game/basketball/[game]";
import FootballGameScreen from "app/(tabs)/(home)/game/football/[game]";
import HockeyGameScreen from "app/(tabs)/(home)/game/hockey/[game]";
import MMAGameScreen from "app/(tabs)/(home)/game/mma/[game]";
import RacingGameScreen from "app/(tabs)/(home)/game/racing/[game]";
import SoccerGameScreen from "app/(tabs)/(home)/game/soccer/[game]";
import TennisGameScreen from "app/(tabs)/(home)/game/tennis/[game]";

const GAME_SCREENS = {
  baseball: BaseballGameScreen,
  basketball: BasketballGameScreen,
  football: FootballGameScreen,
  hockey: HockeyGameScreen,
  mma: MMAGameScreen,
  racing: RacingGameScreen,
  soccer: SoccerGameScreen,
  tennis: TennisGameScreen,
} as const;

export default function GameRouteScreen() {
  const { sport } = useLocalSearchParams<{ sport?: string }>();
  const GameScreen = GAME_SCREENS[sport as keyof typeof GAME_SCREENS];

  if (!GameScreen) {
    return null;
  }

  return <GameScreen />;
}
