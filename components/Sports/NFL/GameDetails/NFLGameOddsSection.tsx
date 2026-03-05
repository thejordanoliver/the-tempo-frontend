import HeadingTwo from "components/Headings/HeadingTwo";
import OddsSkeleton from "components/Skeletons/GameDetails/OddsSkeleton";
import { OddsCard } from "components/Sports/NBA/GameDetails/OddsCard";
import { PlayerOddsCard } from "components/Sports/NBA/GameDetails/PlayerOddsCard";
import { useNFLEventOdds } from "hooks/NFLHooks/useNFLEventOdds";
import { useOdds } from "hooks/NFLHooks/useOdds";
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
    loading: eventOddsLoading,
    error: eventsOddsError,
  } = useNFLEventOdds({
    homeId: homeId ?? 0,
    awayId: awayId ?? 0,
    date,
  });

  // --- Odds  ---
  const {
    data: OddsOdds,
    loading: oddsLoading,
    error: oddsError,
  } = useOdds({
    timestamp: date,
    team1: awayCode,
    team2: homeCode,
  });

  const loading = oddsLoading || eventOddsLoading;
  const error = oddsError || eventsOddsError;

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
        {/* Odds odds cards */}
        {Array.isArray(OddsOdds) &&
          OddsOdds.map((game) => (
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
