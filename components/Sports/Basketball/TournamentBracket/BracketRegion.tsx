import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { BracketRound } from "./BracketRound";
import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketGame,
  BracketRegionLayout,
  TournamentBracketCompetition,
  TournamentRound,
} from "./tournamentBracket.types";
import {
  BRACKET_LAYOUT,
  getVisualRoundsForSide,
  groupGamesByRound,
} from "./tournamentBracket.utils";

type BracketRegionProps = {
  layout: BracketRegionLayout;
  isDark: boolean;
  competition: TournamentBracketCompetition;
  allGamesById?: ReadonlyMap<string, BracketGame>;
  onGamePress?: (game: BracketGame) => void;
};

function BracketRegionComponent({
  layout,
  isDark,
  competition,
  allGamesById,
  onGamePress,
}: BracketRegionProps) {
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const groupedGames = useMemo(
    () => groupGamesByRound(layout.region.games),
    [layout.region.games],
  );
  const visualRounds: readonly TournamentRound[] = getVisualRoundsForSide(
    layout.side,
  );

  return (
    <View style={[styles.regionContainer, { width: layout.width }]}>
      <View style={styles.regionHeader}>
        <Text numberOfLines={1} style={styles.regionTitle} selectable>
          {layout.region.name}
        </Text>
      </View>

      <View
        style={[
          styles.regionRounds,
          {
            height:
              layout.contentHeight + BRACKET_LAYOUT.roundTitleHeight,
          },
        ]}
      >
        {visualRounds.map((round) => (
          <BracketRound
            key={`${layout.region.id}-${round}`}
            round={round}
            games={groupedGames[round]}
            layouts={layout.roundLayouts[round] ?? []}
            side={layout.side}
            contentHeight={layout.contentHeight}
            isDark={isDark}
            competition={competition}
            allGamesById={allGamesById}
            onGamePress={onGamePress}
          />
        ))}
      </View>
    </View>
  );
}

export const BracketRegion = memo(BracketRegionComponent);
