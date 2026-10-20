import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import type { TournamentGame } from "hooks/BasketballHooks/useTournamentBracket";
import { getGameTimestamp } from "utils/brackets/tournamentBracketGames";
import { MatchupCard } from "./MatchupCard";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

type FirstFourProps = {
  games: TournamentGame[];
  isDark: boolean;
  league: string;
};
export function FirstFour({ games, isDark, league }: FirstFourProps) {
  const styles = MCBBTournamentBracketStyles(isDark);

  const orderedGames = useMemo(
    () =>
      [...games].sort((firstGame, secondGame) => {
        const firstRegion = firstGame.regionName ?? "";
        const secondRegion = secondGame.regionName ?? "";

        if (firstRegion !== secondRegion) {
          return firstRegion.localeCompare(secondRegion);
        }

        const firstSeed =
          firstGame.homeTeam?.seed ??
          firstGame.awayTeam?.seed ??
          Number.MAX_SAFE_INTEGER;
        const secondSeed =
          secondGame.homeTeam?.seed ??
          secondGame.awayTeam?.seed ??
          Number.MAX_SAFE_INTEGER;

        if (firstSeed !== secondSeed) {
          return firstSeed - secondSeed;
        }

        return getGameTimestamp(firstGame) - getGameTimestamp(secondGame);
      }),
    [games],
  );

  if (orderedGames.length === 0) {
    return null;
  }

  return (
    <View style={styles.openingSection}>
      <View style={styles.openingHeaderRow}>
        <Text style={styles.openingTitle}>First Four</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.openingGamesRow,
          { gap: 16, paddingHorizontal: 2 },
        ]}
      >
        {orderedGames.map((game) => {
          const seed = game.homeTeam?.seed ?? game.awayTeam?.seed ?? null;

          return (
            <View key={game.id} style={styles.openingCardWrap}>
              <MatchupCard game={game} isDark={isDark} league={league} />

              <Text style={styles.advanceText}>
                {game.regionName ?? "First Four"}
                {seed !== null ? ` • No. ${seed} seed` : ""}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
