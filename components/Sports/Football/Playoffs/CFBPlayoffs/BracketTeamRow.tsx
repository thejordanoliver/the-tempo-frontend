import { getCFBTeamLogo } from "@/constants/teamsCFB";
import { Image, Pressable, Text, View } from "react-native";

import { CFPBracketStyles } from "styles/PlayoffStyles/CFPBracketStyles";
import type { FootballTeam } from "types/football/cfpBracketTypes";

/*
|--------------------------------------------------------------------------
| Team Row
|--------------------------------------------------------------------------
|
| Away = Top
| Home = Bottom
|--------------------------------------------------------------------------
*/

export function BracketTeamRow({
  team,
  onPress,
  isDark,
}: {
  team?: FootballTeam | null;

  onPress?: () => void;

  isDark: boolean;
}) {
  const styles = CFPBracketStyles(isDark);

  if (!team) {
    return (
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <View style={styles.seedPlaceholder} />

          <View style={styles.logoPlaceholder} />

          <Text style={styles.tbdText}>TBD</Text>
        </View>

        <Text style={styles.scorePlaceholder}>—</Text>
      </View>
    );
  }

  const teamLogo = getCFBTeamLogo(team.id, isDark);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.teamRow, pressed && styles.teamPressed]}
    >
      <View style={styles.teamInfo}>
        <View style={styles.seedContainer}>
          <Text style={[styles.seedText, team.winner && styles.winnerText]}>
            {team.rank ?? ""}
          </Text>
        </View>

        {teamLogo ? (
          <Image
            source={teamLogo}
            resizeMode="contain"
            style={styles.teamLogo}
          />
        ) : team.logo ? (
          <Image
            source={{
              uri: team.logo,
            }}
            resizeMode="contain"
            style={styles.teamLogo}
          />
        ) : (
          <View style={styles.logoPlaceholder} />
        )}

        <Text
          numberOfLines={1}
          style={[styles.teamName, team.winner && styles.winnerText]}
        >
          {team.code}
        </Text>
      </View>

      <Text style={[styles.score, team.winner && styles.winnerText]}>
        {team.score ?? "—"}
      </Text>
    </Pressable>
  );
}
