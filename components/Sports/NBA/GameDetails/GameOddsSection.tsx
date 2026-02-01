import HeadingTwo from "components/Headings/HeadingTwo";
import { useHistoricalOdds } from "hooks/useHistoricalOdds";
import { useUpcomingOdds } from "hooks/useUpcomingOdds";
import { useColorScheme, View } from "react-native";
import { gameOddsStyles } from "styles/GameDetailStyles/Odds.styles";
import { GameOddsSectionProps } from "types/odds";
import OddsSkeleton from "../../../Skeletons/GameDetails/OddsSkeleton";
import { OddsCard } from "./OddsCard";

export default function GameOddsSection({
  date,
  homeCode,
  awayCode,
}: GameOddsSectionProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameOddsStyles(isDark);

  // --- Upcoming odds ---
  const {
    data: upcomingOdds = [],
    loading: upcomingLoading,
    error,
  } = useUpcomingOdds({
    timestamp: date,
    team1: awayCode,
    team2: homeCode,
  });

  // --- Historical odds (fallback) ---
  const { data: historicalOdds = [], loading: historicalLoading } =
    useHistoricalOdds({
      timestamp: Number(date),
      team1: awayCode,
      team2: homeCode,
    });

  const loading = upcomingLoading || historicalLoading;

  // Prefer upcoming odds, fallback to historical
  const oddsToRender = upcomingOdds.length > 0 ? upcomingOdds : historicalOdds;

  // ❌ Nothing to show
  if (!loading && oddsToRender.length === 0) {
    return null;
  }

  // ⏳ Single skeleton
  if (loading) {
    return <OddsSkeleton />;
  }

  return (
    <View>
      <HeadingTwo>Betting Odds</HeadingTwo>

      <View style={styles.wrapper}>
        {oddsToRender.map((game) => (
          <OddsCard key={game.id} league="nba" game={game} error={error} />
        ))}
      </View>
    </View>
  );
}
