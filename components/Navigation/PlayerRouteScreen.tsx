import { useLocalSearchParams } from "expo-router";

import BaseballPlayerScreen from "app/(tabs)/(home)/player/baseball/[id]";
import BasketballPlayerScreen from "app/(tabs)/(home)/player/basketball/[id]";
import FootballPlayerScreen from "app/(tabs)/(home)/player/football/[id]";
import HockeyPlayerScreen from "app/(tabs)/(home)/player/hockey/[id]";
import MMAPlayerScreen from "app/(tabs)/(home)/player/mma/[id]";
import RacingPlayerScreen from "app/(tabs)/(home)/player/racing/[id]";
import SoccerPlayerScreen from "app/(tabs)/(home)/player/soccer/[id]";

const PLAYER_SCREENS = {
  baseball: BaseballPlayerScreen,
  basketball: BasketballPlayerScreen,
  football: FootballPlayerScreen,
  hockey: HockeyPlayerScreen,
  mma: MMAPlayerScreen,
  racing: RacingPlayerScreen,
  soccer: SoccerPlayerScreen,
} as const;

export default function PlayerRouteScreen() {
  const { sport } = useLocalSearchParams<{ sport?: string }>();
  const PlayerScreen = PLAYER_SCREENS[sport as keyof typeof PLAYER_SCREENS];

  if (!PlayerScreen) {
    return null;
  }

  return <PlayerScreen />;
}
