import { Text, View } from "react-native";
import UpcomingOddsCard from "./UpcomingOddsCard";
import HistoricalOddsCard from "components/GameDetails/HistoricalOddsCard";
import OddsSkeleton from "components/GameDetails/OddsSkeleton";
import { useUpcomingOdds } from "hooks/CBBHooks/useUpcomingOdds";
import { useHistoricalOdds } from "hooks/useHistoricalOdds";

type GameOddsSectionProps = {
  date: string; // ISO date-time string
  gameDate: string; // YYYY-MM-DD
  homeCode: string;
  awayCode: string;
  gameId: string;
  lighter?: boolean
};

export default function GameOddsSection({
  date,
  gameDate,
  homeCode,
  awayCode,
  gameId,
  lighter,
}: GameOddsSectionProps) {
  // --- Upcoming odds ---
  const {
    data: upcomingOdds,
    loading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingOdds({
    timestamp: date,
    team2: awayCode,
    team1: homeCode,
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
    team2: awayCode,
    team1: homeCode,
    gameId,
    skip: hasUpcomingOdds, // ✅ don't fetch if upcoming exists
  });

  const isLoading = upcomingLoading || oddsLoading;

  // ✅ If both odds arrays are empty (and not loading), return null
  if (!isLoading && (!upcomingOdds?.length && !historicalOdds?.length)) {
    return null;
  }

  // ✅ Single skeleton
  if (isLoading) {
    return <OddsSkeleton />;
  }

  return (
    <View>
      {/* --- Upcoming Odds --- */}
      {upcomingError ? (
        <Text style={{ color: "red" }}>
          Error loading upcoming odds: {upcomingError}
        </Text>
      ) : hasUpcomingOdds ? (
        <View>
          {upcomingOdds.map((game) => (
            <UpcomingOddsCard key={game.id} game={game} lighter={lighter} />
          ))}
        </View>
      ) : null}

      {/* --- Historical Odds (only if no upcoming) --- */}
      {!hasUpcomingOdds &&
        (oddsError ? (
          <Text style={{ color: "red" }}>{oddsError}</Text>
        ) : historicalOdds.length > 0 ? (
          <View>
            {historicalOdds.map((game) => (
              <HistoricalOddsCard key={game.id} game={game} />
            ))}
          </View>
        ) : null)}
    </View>
  );
}
