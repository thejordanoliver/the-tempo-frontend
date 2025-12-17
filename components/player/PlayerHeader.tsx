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
  };
  avatarUrl?: string;
  isDark: boolean;
  teamColor?: string;
  teamSecondaryColor?: string; // new optional prop for secondary color

  team_name?: string;

  calculateAge: (birthDateString?: string) => number | null;
};

export default function PlayerHeader({
  player,
  avatarUrl,
  isDark,
  teamColor,
  teamSecondaryColor,
  calculateAge,
  team_name,
}: Props) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";
  const styles = playerHeaderStyles(isDark);

  const playerBirth = player.birth_date
    ? `${new Date(player.birth_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} (${calculateAge(player.birth_date) ?? "?"} years old)`
    : "Unknown";

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
          <Text style={styles.playerInfoLabel}>School: </Text>
          {player.college || "Unknown"}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Height: </Text>
          {player.height ?? "?"}
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Weight: </Text>
          {player.weight ?? "?"} lbs
        </Text>

        <Text style={[styles.playerInfo]}>
          <Text style={styles.playerInfoLabel}>Birth: </Text>
          {playerBirth}
        </Text>
      </View>
    </View>
  );
}
