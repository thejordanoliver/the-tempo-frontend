import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";

import HeadingTwo from "components/Headings/HeadingTwo";
import OddsSkeleton from "components/Skeletons/GameDetails/OddsSkeleton";
import { GameOdds, useUpcomingOdds } from "hooks/OddsHooks/useUpcomingOdds";
import { gameOddsStyles } from "styles/GameDetailStyles/Odds.styles";
import { GameOddsSectionProps } from "types/odds";
import { OddsCard } from "./OddsCard";

export default function GameOddsSection({
  date,
  homeCode,
  awayCode,
  awayLogo,
  homeLogo,
  league = "nba",
  isDark = false,
  gameStatusDescription,
}: GameOddsSectionProps) {
  const styles = gameOddsStyles(isDark);

  const {
    data: upcomingOdds = [],
    loading,
    error,
  } = useUpcomingOdds({
    league,
    team1: awayCode,
    team2: homeCode,
    timestamp: date,
    includeTimestamp: false,
  });

  const isFinal =
    String(gameStatusDescription || "")
      .toLowerCase()
      .trim() === "final";

  const keyExtractor = useCallback((game: GameOdds) => String(game.id), []);

  const renderOddsCard: ListRenderItem<GameOdds> = useCallback(
    ({ item }) => (
      <OddsCard
        game={item}
        awayLogo={awayLogo}
        homeLogo={homeLogo}
        awayCode={awayCode}
        homeCode={homeCode}
        error={error}
        isDark={isDark}
      />
    ),
    [awayCode, awayLogo, error, homeCode, homeLogo, isDark],
  );

  if (isFinal) {
    return null;
  }

  if (loading) {
    return <OddsSkeleton />;
  }

  if (upcomingOdds.length === 0) {
    return null;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Betting Odds</HeadingTwo>

      <FlatList
        data={upcomingOdds}
        keyExtractor={keyExtractor}
        renderItem={renderOddsCard}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.wrapper}
        removeClippedSubviews={false}
      />
    </View>
  );
}
