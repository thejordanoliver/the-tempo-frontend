import HeadingTwo from "components/Headings/HeadingTwo";
import OddsSkeleton from "components/Skeletons/GameDetails/OddsSkeleton";
import { OddsCard } from "components/Sports/NBA/GameDetails/OddsCard";
import { PlayerOddsCard } from "components/Sports/NBA/GameDetails/PlayerOddsCard";
import { useCFBEventOdds } from "hooks/CFBHooks/useCFBEventOdds";
import { useCFBUpcomingOdds } from "hooks/CFBHooks/useCFBUpcomingOdds";
import { useColorScheme, View } from "react-native";
import { gameOddsStyles } from "styles/GameDetailStyles/Odds.styles";
import { GameOddsSectionProps } from "types/odds";

export default function NFLGameOddsSection({
  date,
  homeCode,
  awayCode,
  homeId,
  awayId,
  neutralSite,
}: GameOddsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = gameOddsStyles(isDark);
  // --- Event odds ---
  const {
    odds,
    loading: oddsLoading,
    error: oddsError,
  } = useCFBEventOdds({
    homeId: homeId ?? 0,
    awayId: awayId ?? 0,
    date,
  });

  // --- Upcoming odds ---
  const {
    data: upcomingOdds,
    loading: upcomingLoading,
    error: upcomingError,
  } = useCFBUpcomingOdds({
    timestamp: date,
    team1: awayCode,
    team2: homeCode,
  });

  const loading = oddsLoading || upcomingLoading;
  const error = oddsError || upcomingError;

  // If nothing to show and not loading, render nothing
  if (
    !loading &&
    !(Array.isArray(loading) && loading.length) &&
    !(Array.isArray(odds) && odds.length)
  ) {
    return null;
  }

  // Show skeleton while loading
  if (loading) {
    return <OddsSkeleton />;
  }

  return (
    <View>
      <HeadingTwo>Betting Odds</HeadingTwo>
      <View style={styles.wrapper}>
        {/* Upcoming odds cards */}
        {Array.isArray(upcomingOdds) &&
          upcomingOdds.map((game) => (
            <OddsCard key={game.id} league="nfl" game={game} error={error} />
          ))}

        {/* Event odds cards */}
        {Array.isArray(odds) &&
          odds.map((game) => (
            <PlayerOddsCard
              key={game.id}
              game={{
                ...game,
                home_team_id: homeId,
                away_team_id: awayId,
                neutral: neutralSite,
              }}
            />
          ))}
      </View>
    </View>
  );
}
