import { getMLBTeam, getMLBTeamLogo } from "@/constants/teamsMLB";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffTeam } from "types/baseball/baseball";

type Props = {
  team: MLBPlayoffTeam | null;
  isDark: boolean;
  isWinner: boolean;
  isEliminated: boolean;
  showDivider: boolean;
};

export function TeamRow({
  team,
  isDark,
  isWinner,
  isEliminated,
  showDivider,
}: Props) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const isKnownTeam = isKnownBracketTeam(team);
  const teamId = team?.id ?? 0;
  const byeTeam = getMLBTeam(teamId);
  const teamName = byeTeam?.code ?? "TBD";
  const teamLogo = getMLBTeamLogo(teamId, isDark);
  return (
    <View>
      {showDivider ? <View style={styles.divider} /> : null}
      <View style={styles.teamRow}>
        <Text style={[styles.seed, isEliminated && styles.eliminatedText]}>
          {isKnownTeam && team.seed > 0 ? team.seed : "-"}
        </Text>

        <Image source={teamLogo} style={styles.logo} contentFit="contain" />

        <Text
          numberOfLines={1}
          style={[styles.teamName, isEliminated && styles.eliminatedText]}
        >
          {teamName}
        </Text>
        <View style={[styles.winsBadge, isWinner && styles.winnerBadge]}>
          <Text style={[styles.wins, isWinner && styles.winnerWins]}>
            {isKnownTeam ? team?.wins : "-"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function isKnownBracketTeam(
  team: MLBPlayoffTeam | null,
): team is MLBPlayoffTeam {
  return Boolean(
    team &&
    !team.id.startsWith("placeholder:") &&
    team.abbreviation !== "TBD" &&
    !team.abbreviation.includes("/"),
  );
}
