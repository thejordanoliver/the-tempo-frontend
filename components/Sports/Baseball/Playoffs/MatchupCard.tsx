import { Text, View } from "react-native";
import { MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffTeam } from "types/baseball/baseball";
import type { Matchup } from "../../../../utils/mlbBracketUtils";
import { TeamRow, isKnownBracketTeam } from "./TeamRow";

export function MatchupCard({
  matchup,
  isDark,
  finals = false,
}: {
  matchup: Matchup;
  isDark: boolean;
  finals?: boolean;
}) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const rows: (MLBPlayoffTeam | null)[] = [
    matchup.teams[0] ?? null,
    matchup.teams[1] ?? null,
  ];
  const winsNeeded = Math.floor(matchup.bestOf / 2) + 1;
  const knownTeams = rows.filter(isKnownBracketTeam);
  const leadingTeam = [...knownTeams].sort((a, b) => b.wins - a.wins)[0];
  const trailingTeam = [...knownTeams].sort((a, b) => a.wins - b.wins)[0];
  const seriesTied =
    knownTeams.length === 2 && knownTeams[0].wins === knownTeams[1].wins;
  const winner =
    knownTeams.find((team) => team.id === matchup.winnerTeamId) ??
    knownTeams.find((team) => team.wins >= winsNeeded);
  const footer = winner
    ? `${winner.abbreviation} won series ${winner.wins}-${trailingTeam?.wins ?? 0}`
    : seriesTied && knownTeams[0].wins > 0
      ? `Series tied ${knownTeams[0].wins}-${knownTeams[1].wins}`
      : leadingTeam && trailingTeam && leadingTeam.wins > trailingTeam.wins
        ? `${leadingTeam.abbreviation} leads ${leadingTeam.wins}-${trailingTeam.wins}`
        : `Best of ${matchup.bestOf}`;

  return (
    <View style={[styles.matchup, finals && styles.finalsMatchup]}>
      {rows.map((team, index) => {
        const isKnownTeam = isKnownBracketTeam(team);
        const isWinner = isKnownTeam && team?.id === winner?.id;
        const isEliminated = Boolean(winner && isKnownTeam && !isWinner);
        return (
          <TeamRow
            key={team?.id ?? `tbd-${index}`}
            team={team}
            isDark={isDark}
            isWinner={isWinner}
            isEliminated={isEliminated}
            showDivider={index > 0}
          />
        );
      })}
      <Text numberOfLines={1} style={styles.seriesLabel}>
        {footer}
      </Text>
    </View>
  );
}
