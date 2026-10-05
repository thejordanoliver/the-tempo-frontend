import type { NFLPlayoffGame } from "types/football/football";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { ByeTeamCardStyles } from "styles/PlayoffStyles/ByeTeamCardStyles";
import { Image } from "expo-image";
import { Text, View } from "react-native";

export function ByeTeamCard({ team, layout, isDark }: {
  team?: NFLPlayoffGame["home"];
  layout: { x: number; y: number; width: number; height: number };
  isDark: boolean;
}) {
  const styles = ByeTeamCardStyles(isDark);
  const logo = getNFLTeamLogo(team?.id, isDark);
  return (
    <View style={[styles.card, {
      position: "absolute", left: layout.x, top: layout.y, width: layout.width,
    }]}>
      <Text style={styles.seed}>1</Text>
      <Image source={logo} style={styles.logo} contentFit="contain" />
      <Text style={styles.teamName} numberOfLines={1}>{team?.code || "TBD"}</Text>
      <Text style={styles.byeLabel}>BYE</Text>
    </View>
  );
}
