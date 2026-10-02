import { Text, TouchableOpacity } from "react-native";
import { activeOpacity } from "constants/styles";
import { MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffTeam } from "types/baseball/baseball";
import type { Matchup } from "./mlbBracketUtils";
import { TeamRow, isKnownBracketTeam } from "./TeamRow";

export function MatchupCard({
  matchup,
  isDark,
  onPress,
}: {
  matchup: Matchup;
  isDark: boolean;
  onPress: () => void;
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
    <TouchableOpacity
      style={styles.matchup}
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={!matchup.games.length}
      accessibilityRole="button"
      accessibilityState={{ disabled: !matchup.games.length }}
      accessibilityLabel={`${matchup.label}. ${footer}${matchup.games.length ? ". View series games." : ""}`}
    >
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
    </TouchableOpacity>
  );
}

