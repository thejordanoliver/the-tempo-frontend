import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { DBPlayer } from "types/types";
type PlayerHeaderProps = {
  player: DBPlayer;
  avatarUrl?: string;
  isDark: boolean;
  isWomen?: boolean;
};

export default function PlayerHeader({
  player,
  isWomen,
  avatarUrl,
  isDark,
}: PlayerHeaderProps) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";
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
          <Text style={styles.jersey}>
            {player.position?.charAt(0) ?? "N"} #{player.jersey_number ?? "?"}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{player.first_name}</Text>
        <Text style={styles.name}>{player.last_name}</Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Class: </Text>
          {player.experience_display || "Unknown"}
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
          {player.birth_place_display_text ?? "?"}
        </Text>
      </View>
    </View>
  );
}
