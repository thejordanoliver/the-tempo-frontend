import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { CARD_HEIGHT, CARD_WIDTH, CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";
import { BracketMatchup } from "./BracketMatchup";
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
  width: number;
};

function OpeningRoundSectionComponent({
  label,
  games,
  isDark,
  competition,
  regions,
  allGamesById,
  onGamePress,
  width,
}: OpeningRoundSectionProps) {
  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);

  if (games.length === 0) return null;

  return (
    <View style={[styles.openingSection, { width }]}>
      <View style={styles.openingHeaderRow}>
        <Text style={styles.openingTitle} selectable>
          {label || "Opening Round"}
        </Text>
      </View>

      <View style={styles.openingGamesRow}>
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
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
              }}
            />
            <Text numberOfLines={2} style={styles.advanceText} selectable>
              {getOpeningRoundDestinationLabel(game, regions, allGamesById)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const OpeningRoundSection = memo(OpeningRoundSectionComponent);
