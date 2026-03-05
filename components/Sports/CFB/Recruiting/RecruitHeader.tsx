import { FootballRecruit } from "hooks/CFBHooks/useFootballRecruits";
import { Image, Text, View } from "react-native";
import { recruitHeaderStyles } from "styles/PlayerStyles/RecruitHeaderStyles";
type Props = {
  player: FootballRecruit;
  avatarUrl?: string;
  isDark: boolean;
  teamColor?: string;
  team_name?: string;
  age?: number;
  isCollegePlayer?: boolean;
};

export default function RecruitHeader({ player, avatarUrl, isDark }: Props) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";

  const styles = recruitHeaderStyles(isDark);

  return (
    <View style={styles.playerHeader}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            accessibilityLabel={`${player.first_name} ${player.last_name} photo`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        <View style={styles.jerseyNumber}>
          <Text style={styles.jersey}>{player.position ?? "N"}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{player.first_name}</Text>
        <Text style={styles.name}>{player.last_name}</Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>School: </Text>
          {player.high_school}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Hometown: </Text>
          {player.hometown}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Height: </Text>
          {player.height ?? "?"}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Weight: </Text>
          {player.weight ?? "?"} lbs
        </Text>
      </View>
    </View>
  );
}
