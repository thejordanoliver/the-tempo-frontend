import { useLocalSearchParams } from "expo-router";

import BaseballLeagueScreen from "app/league/baseball";
import BasketballLeagueScreen from "app/league/basketball";
import FootballLeagueScreen from "app/league/football";
import HockeyLeagueScreen from "app/league/hockey";
import MMALeagueScreen from "app/league/mma";
import RacingLeagueScreen from "app/league/racing";
import SoccerLeagueScreen from "app/league/soccer";
import TennisLeagueScreen from "app/league/tennis";

const LEAGUE_SCREENS = {
  baseball: BaseballLeagueScreen,
  basketball: BasketballLeagueScreen,
  football: FootballLeagueScreen,
  hockey: HockeyLeagueScreen,
  mma: MMALeagueScreen,
  racing: RacingLeagueScreen,
  soccer: SoccerLeagueScreen,
  tennis: TennisLeagueScreen,
} as const;

export default function LeagueRouteScreen() {
  const { sport } = useLocalSearchParams<{ sport?: string }>();
  const LeagueScreen =
    LEAGUE_SCREENS[sport as keyof typeof LEAGUE_SCREENS];

  if (!LeagueScreen) {
    return null;
  }

  return <LeagueScreen />;
}
