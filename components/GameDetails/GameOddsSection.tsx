import OddsSkeleton from "components/GameDetails/OddsSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useUpcomingOdds } from "hooks/useUpcomingOdds";
import { useHistoricalOdds } from "hooks/useHistoricalOdds";
import { View } from "react-native";
import { OddsCard } from "./OddsCard";
import { GameOddsSectionProps } from "types/odds";



export default function GameOddsSection({
  date,
  homeCode,
  awayCode,
}: GameOddsSectionProps) {
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
  const {
    data: historicalOdds = [],
    loading: historicalLoading,
  } = useHistoricalOdds({
    timestamp: Number(date),
    team1: awayCode,
    team2: homeCode,
  });

  const loading = upcomingLoading || historicalLoading;

  // Prefer upcoming odds, fallback to historical
  const oddsToRender =
    upcomingOdds.length > 0 ? upcomingOdds : historicalOdds;

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

      <View>
        {oddsToRender.map((game) => (
          <OddsCard
            key={game.id}
            league="nba"
            game={game}
            error={error}
          />
        ))}
      </View>
    </View>
  );
}
