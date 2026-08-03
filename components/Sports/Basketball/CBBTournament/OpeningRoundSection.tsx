import React, { memo, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import { BracketMatchup } from "./BracketMatchup";
import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketGame,
  BracketRegion,
  TournamentBracketCompetition,
} from "./tournamentBracket.types";
import {
  BRACKET_LAYOUT,
  getOpeningRoundDestinationLabel,
} from "./tournamentBracket.utils";

type OpeningRoundSectionProps = {
  label?: string | null;
  games: readonly BracketGame[];
  isDark: boolean;
  competition: TournamentBracketCompetition;
  regions: readonly BracketRegion[];
  allGamesById?: ReadonlyMap<string, BracketGame>;
  onGamePress?: (game: BracketGame) => void;
};

function OpeningRoundSectionComponent({
  label,
  games,
  isDark,
  competition,
  regions,
  allGamesById,
  onGamePress,
}: OpeningRoundSectionProps) {
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);

  if (games.length === 0) return null;

  return (
    <View style={styles.openingSection}>
      <View style={styles.openingHeaderRow}>
        <Text style={styles.openingTitle} selectable>
          {label || "Opening Round"}
        </Text>
        <Text style={styles.openingCount} selectable>
          {games.length} {games.length === 1 ? "game" : "games"}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.openingScrollContent}
      >
        {games.map((game) => (
          <View key={game.id} style={styles.openingCardWrap}>
            <BracketMatchup
              game={game}
              compact
              side="center"
              competition={competition}
              allGamesById={allGamesById}
              onPress={onGamePress}
              style={{
                width: BRACKET_LAYOUT.gameCardWidth,
                height: BRACKET_LAYOUT.gameCardHeight,
              }}
            />
            <Text numberOfLines={2} style={styles.advanceText} selectable>
              {getOpeningRoundDestinationLabel(game, regions)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export const OpeningRoundSection = memo(OpeningRoundSectionComponent);
