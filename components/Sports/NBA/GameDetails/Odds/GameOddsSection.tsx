import HeadingTwo from "components/Headings/HeadingTwo";
import { useUpcomingOdds } from "hooks/OddsHooks/useUpcomingOdds";
import { View } from "react-native";
import { gameOddsStyles } from "styles/GameDetailStyles/Odds.styles";
import { GameOddsSectionProps } from "types/odds";
import { OddsSkeleton } from "../../../../Skeletons/GameDetails/OddsSkeleton";
import { OddsCard } from "./OddsCard";

export default function GameOddsSection({
  date,
  homeCode,
  awayCode,
  awayLogo,
  homeLogo,
  league,
  isDark = false,
  gameStatusDescription,
}: GameOddsSectionProps) {
  const styles = gameOddsStyles(isDark);

  const {
    data: upcomingOdds = [],
    loading,
    error,
  } = useUpcomingOdds({
    league,
    team1: awayCode,
    team2: homeCode,
    timestamp: date,
    includeTimestamp: false,
  });

  if (!loading && upcomingOdds.length === 0) {
    return null;
  }

  if (loading) {
    return <OddsSkeleton />;
  }

  if (gameStatusDescription === "Final") return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Betting Odds</HeadingTwo>

      <View style={styles.wrapper}>
        {upcomingOdds.map((game) => (
          <OddsCard
            key={game.id}
            game={game}
            awayLogo={awayLogo}
            homeLogo={homeLogo}
            awayCode={awayCode}
            homeCode={homeCode}
            error={error}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  );
}
