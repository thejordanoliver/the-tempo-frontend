import HeadingTwo from "components/Headings/HeadingTwo";
import { useUpcomingOdds } from "hooks/useUpcomingOdds";
import { View } from "react-native";
import { gameOddsStyles } from "styles/GameDetailStyles/Odds.styles";
import { GameOddsSectionProps } from "types/odds";
import OddsSkeleton from "../../../Skeletons/GameDetails/OddsSkeleton";
import { OddsCard } from "./OddsCard";
import { usePreferences } from "contexts/PreferencesContext";

export default function GameOddsSection({
  date,
  homeCode,
  awayCode,
}: GameOddsSectionProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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

  const loading = upcomingLoading;

  // Prefer upcoming odds, fallback to historical
  const oddsToRender = upcomingOdds;

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
      <HeadingTwo isDark={isDark}>Betting Odds</HeadingTwo>

      <View style={styles.wrapper}>
        {oddsToRender.map((game) => (
          <OddsCard key={game.id} league="nba" game={game} error={error} />
        ))}
      </View>
    </View>
  );
}
