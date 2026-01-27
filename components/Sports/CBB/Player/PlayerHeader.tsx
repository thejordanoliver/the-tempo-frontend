import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { CBBPlayer } from "types/types";

type PlayerHeaderProps = {
  player: CBBPlayer;
  avatarUrl?: string;
  isDark: boolean;
  teamColor?: string;
  teamSecondaryColor?: string;
  team_name?: string;
  isWomen?: boolean;
};

export default function PlayerHeader({
  player,
  isWomen,
  avatarUrl,
  isDark,
  teamColor,
  teamSecondaryColor,
  team_name,
}: PlayerHeaderProps) {
  const initial = player?.firstname?.[0]?.toUpperCase() || "?";
  const styles = playerHeaderStyles(isDark);

  return (
    <View style={styles.playerHeader}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            accessibilityLabel={`${player.firstname} ${player.lastname} photo`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        <View style={styles.jerseyNumber}>
          <Text style={styles.jersey}>
            {player.position?.charAt(0) ?? "N"} #{player.jersey ?? "?"}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{player.firstname}</Text>
        <Text style={styles.name}>{player.lastname}</Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Class: </Text>
          {player.experience?.displayValue || "Unknown"}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Height: </Text>
          {player.height ?? "?"}
        </Text>

        {!isWomen && (
          <Text style={[styles.playerInfo]}>
            <Text style={styles.playerInfoLabel}>Weight: </Text>
            {player.weight ?? "?"}
          </Text>
        )}
        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Birth Place: </Text>
          {player.birthPlace?.displayText ?? "?"}
        </Text>
      </View>
    </View>
  );
}
