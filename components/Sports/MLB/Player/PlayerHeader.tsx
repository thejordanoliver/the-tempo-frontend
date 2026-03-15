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
    birth_display?: string;
    position?: string;
    jersey_number?: string;
    draft_round?: number | null;
    debut_year?: number | null;
    draft_number?: number | null;
  };
  avatarUrl?: string;
  isDark: boolean;
  teamColor?: string;
  teamSecondaryColor?: string;
  team_name?: string;
  calculateAge: (birthDateString?: string) => number | null;
  calculateExperience: (draftDateString?: string) => number | null;
};

export default function PlayerHeader({
  player,
  avatarUrl,
  isDark,
  calculateAge,
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
            {player.position ?? "N"} #{player.jersey_number ?? "?"}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{player.first_name}</Text>
        <Text style={styles.name}>{player.last_name}</Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Hometown: </Text>
          {player.birth_display || "Unknown"}
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Height: </Text>
          {player.height ?? "?"}
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Weight: </Text>
          {player.weight ?? "?"} lbs
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Birth: </Text>
          {playerBirth}
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Debut Year: </Text>
          {player.debut_year ? player.debut_year : "Unknown"}
        </Text>
      </View>
    </View>
  );
}
