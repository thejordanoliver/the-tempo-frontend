import { OddsCard } from "components/GameDetails/OddsCard";
import OddsSkeleton from "components/GameDetails/OddsSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useHistoricalOdds } from "hooks/CBBHooks/useHistoricalOdds";
import { useUpcomingOdds } from "hooks/CBBHooks/useUpcomingOdds";
import { View } from "react-native";

type GameOddsSectionProps = {
  date: string; // ISO date-time string
  gameDate: string; // YYYY-MM-DD
  homeCode: string;
  awayCode: string;
  gameId: string;
};

export default function GameOddsSection({
  date,
  gameDate,
  homeCode,
  awayCode,
  gameId,
}: GameOddsSectionProps) {
  // --- Upcoming odds ---
  const {
    data: upcomingOdds,
    loading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingOdds({
    timestamp: date,
    team1: awayCode,
    team2: homeCode,
  });

  const hasUpcomingOdds =
    !upcomingLoading && !upcomingError && upcomingOdds.length > 0;

  // --- Historical odds ---
  const {
    data: historicalOdds,
    loading: oddsLoading,
    error: oddsError,
  } = useHistoricalOdds({
    date: gameDate,
    team1: awayCode,
    team2: homeCode,
    gameId,
    skip: hasUpcomingOdds, // ✅ don't fetch if upcoming exists
  });

  const isLoading = upcomingLoading || oddsLoading;
  const error = upcomingError || oddsError;

  // ✅ If both odds arrays are empty (and not loading), return null
  if (!isLoading && !upcomingOdds?.length && !historicalOdds?.length) {
    return null;
  }

  // ✅ Single skeleton
  if (isLoading) {
    return <OddsSkeleton />;
  }

  return (
    <View>
      <HeadingTwo>Betting Odds</HeadingTwo>
      <View>
        {upcomingOdds.map((game) => (
          <OddsCard key={game.id} league="cbb" game={game} error={error} />
        ))}
      </View>
    </View>
  );
}
