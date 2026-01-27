import { Colors } from "constants/Colors";
import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
type Props = {
  player: {
    first_name: string;
    last_name: string;
    college?: string;
    height?: string;
    weight?: string;
    birth_date?: string;
    position?: string;
    jersey_number?: string;
    experience_display?: string;
    birth_display?: string;
  };
  avatarUrl?: string;
  isDark: boolean;
  teamColor?: string;
  team_name?: string;
  age?: number;
  isCollegePlayer?: boolean;
};

export default function PlayerHeader({
  player,
  avatarUrl,
  isDark,
  teamColor,
  team_name,
  age,
  isCollegePlayer,
}: Props) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";

  const getPrimaryTextColor = (
    isDark: boolean,
    teamName?: string,
    teamColor?: string
  ): string => {
    const normalizedTeamName = teamName?.trim().toLowerCase() ?? "";

    return teamColor ?? (isDark ? Colors.white : Colors.black);
  };

  const primaryTextColor = getPrimaryTextColor(isDark, team_name, teamColor);

  const styles = playerHeaderStyles(isDark);

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
          <Text style={[styles.jersey]}>
            {player.position ?? "N"} #{player.jersey_number ?? "?"}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{player.first_name}</Text>
        <Text style={styles.name}>{player.last_name}</Text>

          {isCollegePlayer && (
          <Text style={[styles.playerInfo]}>
            <Text style={styles.playerInfoLabel}>Hometown: </Text>
            {player.birth_display}
          </Text>
        )}
        {isCollegePlayer && (
          <Text style={[styles.playerInfo]}>
            <Text style={styles.playerInfoLabel}>Class: </Text>
            {player.experience_display}
          </Text>
        )}
        {!isCollegePlayer && (
          <Text style={[styles.playerInfo]}>
            <Text style={styles.playerInfoLabel}>School: </Text>
            {player.college || "Unknown"}
          </Text>
        )}
        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Height: </Text>
          {player.height ?? "?"}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Weight: </Text>
          {player.weight ?? "?"}
        </Text>

        {!isCollegePlayer && (
          <Text style={[styles.playerInfo]}>
            <Text style={styles.playerInfoLabel}>Age: </Text>
            {age != null ? `${age} years old` : "Unknown"}
          </Text>
        )}
      
      </View>
    </View>
  );
}
