import { getCFBTeamLogo } from "@/constants/teamsCFB";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Image, Pressable, Text, View } from "react-native";
import { CFPBracketStyles } from "styles/PlayoffStyles/CFPBracketStyles";
import type { FootballTeam } from "types/football/cfpBracketTypes";

/*
|--------------------------------------------------------------------------
| Bye Team Card
|--------------------------------------------------------------------------
*/

export function CFPByeTeamCard({
  team,
  x,
  y,
  onPress,
  isDark,
}: {
  team?: FootballTeam | null;

  x: number;

  y: number;

  onPress?: () => void;

  isDark: boolean;
}) {
  const styles = CFPBracketStyles(isDark);

  const teamLogo = team ? getCFBTeamLogo(team.id, isDark) : PlaceholderLogo;

  return (
    <Pressable
      disabled={!team || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.byeCard,

        {
          left: x,
          top: y,
        },

        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.byeTeamContent}>
        <View style={styles.byeSeedContainer}>
          <Text style={styles.byeSeed}>{team?.rank ?? ""}</Text>
        </View>

        {teamLogo && (
          <Image
            source={teamLogo}
            resizeMode="contain"
            style={styles.byeLogo}
          />
        )}
        <Text numberOfLines={1} style={styles.byeTeamName}>
          {team?.code ?? "TBD"}
        </Text>

        <Text style={styles.byeLabel}>BYE</Text>
      </View>
    </Pressable>
  );
}
