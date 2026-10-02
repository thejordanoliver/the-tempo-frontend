import { getMLBTeam, getMLBTeamLogo } from "@/constants/teamsMLB";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffTeam } from "types/baseball/baseball";

export function ByeTeamCard({
  team,
  seed,
  isDark,
}: {
  team: MLBPlayoffTeam | undefined;
  seed: number;
  isDark: boolean;
}) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const teamId = team?.id ?? 0;
  const byeTeam = getMLBTeam(teamId);
  const teamName = byeTeam?.code ?? "TBD";
  const teamLogo = getMLBTeamLogo(teamId, isDark);

  return (
    <View style={styles.byeCard}>
      <Text style={styles.seed}>{seed}</Text>
      <Image source={teamLogo} style={styles.logo} contentFit="contain" />
      <Text numberOfLines={1} style={styles.teamName}>
        {teamName}
      </Text>
      <Text style={styles.byeLabel}>BYE</Text>
    </View>
  );
}
