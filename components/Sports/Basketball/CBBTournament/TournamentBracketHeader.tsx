import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";
import type { TournamentBracketData } from "./tournamentBracket.types";
import { getTeamCode, getWinningBracketTeam } from "./tournamentBracket.utils";

type TournamentBracketHeaderProps = {
  tournament: TournamentBracketData;
  isDark: boolean;
};

function TournamentBracketHeaderComponent({
  tournament,
  isDark,
}: TournamentBracketHeaderProps) {
  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);
  const champion = getWinningBracketTeam(tournament.championshipGame);
  const totalGames = tournament.metadata.totalGames;
  const warnings = tournament.metadata.warnings;

  return (
    <>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.tournamentName} selectable>
          {tournament.tournamentName}
        </Text>
        <Text style={styles.tournamentMeta} selectable>
          {tournament.season} {tournament.competition} bracket
          {totalGames ? ` | ${totalGames} games` : ""}
          {champion ? ` | ${getTeamCode(champion)} champion` : ""}
        </Text>
      </View>
      {warnings.length > 0 ? (
        <View style={styles.warningBanner}>
          <Text numberOfLines={2} style={styles.warningText} selectable>
            {warnings[0]}
            {warnings.length > 1 ? ` (+${warnings.length - 1} more)` : ""}
          </Text>
        </View>
      ) : null}
    </>
  );
}

export const TournamentBracketHeader = memo(TournamentBracketHeaderComponent);
