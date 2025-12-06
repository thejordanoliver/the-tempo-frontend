import OddsSkeleton from "components/GameDetails/OddsSkeleton";
import { Text, View } from "react-native";
import HistoricalOddsCard from "./HistoricalOddsCard";
import UpcomingOddsCard from "./UpcomingOddsCard";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useCFBUpcomingOdds } from "hooks/CFBHooks/useCFBUpcomingOdds";
import { useHistoricalCFBOdds } from "hooks/CFBHooks/useCFBHistoricalOdds";
type GameOddsSectionProps = {
  date: string; // ISO date-time string of the game (for upcoming odds)
  gameDate: string; // YYYY-MM-DD (for historical odds)
  homeCode: string;
  awayCode: string;
};

export default function CFBGameOddsSection({
  date,
  gameDate,
  homeCode,
  awayCode,
}: GameOddsSectionProps) {
  const gameDateObj = new Date(gameDate);
  const now = new Date();
  const isFutureGame = gameDateObj.getTime() > now.getTime();

  // --- Upcoming odds (only fetch params if future game) ---
  const upcomingOptions = isFutureGame
    ? { timestamp: date, team1: awayCode, team2: homeCode }
    : { timestamp: "", team1: "", team2: "" }; // empty values for type safety

  const {
    data: upcomingOdds,
    loading: upcomingLoading,
    error: upcomingError,
  } = useCFBUpcomingOdds(upcomingOptions);

  const historicalOptions = {
    date: gameDate.split("T")[0], // "YYYY-MM-DD"
    team1: awayCode,
    team2: homeCode,
  };

  const {
    data: historicalOdds,
    loading: oddsLoading,
    error: oddsError,
  } = useHistoricalCFBOdds(historicalOptions);

  // ✅ Return null if no odds exist
  if (
    (!isFutureGame && !oddsLoading && (!historicalOdds || historicalOdds.length === 0)) ||
    (isFutureGame && !upcomingLoading && (!upcomingOdds || upcomingOdds.length === 0))
  ) {
    return null;
  }

  return (
    <View>
      <HeadingTwo>Betting Odds</HeadingTwo>
      {/* --- Upcoming Odds --- */}
      {isFutureGame && (
        <>
          {upcomingLoading ? (
            <OddsSkeleton />
          ) : upcomingError ? (
            <Text style={{ color: "red" }}>
              Error loading upcoming odds: {upcomingError}
            </Text>
          ) : (
            <View>
              {upcomingOdds.map((game) => (
                <UpcomingOddsCard key={game.id} game={game} />
              ))}
            </View>
          )}
        </>
      )}

      {/* --- Historical Odds --- */}
      {!isFutureGame && (
        <>
          {oddsLoading ? (
            <OddsSkeleton />
          ) : oddsError ? (
            <Text style={{ color: "red" }}>{oddsError}</Text>
          ) : (
            <View>
              {historicalOdds.map((game) => (
                <HistoricalOddsCard key={game.id} game={game} />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
