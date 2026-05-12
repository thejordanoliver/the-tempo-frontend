import HeadingTwo from "components/Headings/HeadingTwo";
import OddsSkeleton from "components/Skeletons/GameDetails/OddsSkeleton";
import { OddsCard } from "components/Sports/Odds/OddsCard";
import { useOdds } from "hooks/CBBHooks/useOdds";
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
    data: odds,
    loading: oddsLoading,
    error: oddsError,
  } = useOdds({
    timestamp: date,
    team1: awayCode,
    team2: homeCode,
  });

  const isLoading = oddsLoading;
  const error = oddsError;

  // ✅ If both odds arrays are empty (and not loading), return null
  if (!isLoading && !odds?.length) {
    return null;
  }

  // ✅ Single skeleton
  if (isLoading) {
    return <OddsSkeleton />;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Betting Odds</HeadingTwo>
      <View>
        {odds.map((game) => (
          <OddsCard key={game.id} league="cbb" game={game} error={error} />
        ))}
      </View>
    </View>
  );
}
