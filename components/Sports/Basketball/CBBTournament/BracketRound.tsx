import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";
import { BracketMatchup } from "./BracketMatchup";
import type {
  BracketCardLayout,
  BracketGame,
  TournamentBracketCompetition,
  TournamentRound,
} from "./tournamentBracket.types";
import { getRoundDisplayLabel } from "./tournamentBracket.utils";

type BracketRoundProps = {
  round: TournamentRound;
  games: readonly BracketGame[];
  layouts: readonly BracketCardLayout[];
  side: "left" | "right";
  contentHeight: number;
  isDark: boolean;
  competition: TournamentBracketCompetition;
  allGamesById?: ReadonlyMap<string, BracketGame>;
  onGamePress?: (game: BracketGame) => void;
};

function BracketRoundComponent({
  round,
  games,
  layouts,
  side,
  contentHeight,
  isDark,
  competition,
  allGamesById,
  onGamePress,
}: BracketRoundProps) {
  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);
  const orderedGames = useMemo(
    () =>
      games
        .map((game, index) => ({
          game,
          layout: layouts[index],
        }))
        .filter(
          (item): item is { game: BracketGame; layout: BracketCardLayout } =>
            Boolean(item.layout),
        )
        .sort((first, second) => first.layout.y - second.layout.y),
    [games, layouts],
  );
  const roundLabel = games[0]?.roundLabel ?? getRoundDisplayLabel(round);
  let previousBottom = 0;

  return (
    <View style={styles.roundColumn}>
      <Text numberOfLines={1} style={styles.roundLabel} selectable>
        {roundLabel}
      </Text>

      <View style={[styles.roundMatchups, { height: contentHeight }]}>
        {orderedGames.map(({ game, layout }) => {
          const spacerHeight = Math.max(0, layout.y - previousBottom);
          previousBottom = layout.y + layout.height;

          return (
            <React.Fragment key={game.id}>
              {spacerHeight > 0 ? (
                <View style={{ height: spacerHeight }} />
              ) : null}
              <BracketMatchup
                game={game}
                side={side}
                competition={competition}
                allGamesById={allGamesById}
                onPress={onGamePress}
                style={{
                  width: layout.width,
                  height: layout.height,
                }}
              />
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export const BracketRound = memo(BracketRoundComponent);
