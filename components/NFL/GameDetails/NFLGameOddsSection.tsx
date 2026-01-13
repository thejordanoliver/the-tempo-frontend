import { OddsCard } from "components/GameDetails/OddsCard";
import OddsSkeleton from "components/GameDetails/OddsSkeleton";
import { PlayerOddsCard } from "components/GameDetails/PlayerOddsCard";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useNFLEventOdds } from "hooks/NFLHooks/useNFLEventOdds";
import { useUpcomingNFLOdds } from "hooks/NFLHooks/useUpcomingNFLOdds";
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
  } = useNFLEventOdds({
    homeId,
    awayId,
    date,
  });

  // --- Upcoming odds ---
  const {
    data: upcomingOdds,
    loading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingNFLOdds({
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
