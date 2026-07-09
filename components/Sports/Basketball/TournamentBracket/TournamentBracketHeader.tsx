import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type { TournamentBracketData } from "./tournamentBracket.types";
import {
  getBracketTeamDisplayName,
  getWinningBracketTeam,
} from "./tournamentBracket.utils";

type TournamentBracketHeaderProps = {
  tournament: TournamentBracketData;
  isDark: boolean;
};

function TournamentBracketHeaderComponent({
  tournament,
  isDark,
}: TournamentBracketHeaderProps) {
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const champion = getWinningBracketTeam(tournament.championshipGame);
  const totalGames = tournament.metadata.totalGames;

  return (
    <View style={styles.header}>
      <Text numberOfLines={1} style={styles.tournamentName} selectable>
        {tournament.tournamentName}
      </Text>
      <Text style={styles.tournamentMeta} selectable>
        {tournament.season} {tournament.competition} bracket
        {totalGames ? ` | ${totalGames} games` : ""}
        {champion ? ` | ${getBracketTeamDisplayName(champion)} champion` : ""}
      </Text>
    </View>
  );
}

export const TournamentBracketHeader = memo(TournamentBracketHeaderComponent);
