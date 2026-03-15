import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";

type Props = {
  fighter: {
    id: number;
    espn_id: string | null;
    first_name: string;
    last_name: string;
    full_name: string;
    short_name: string | null;
    nickname: string | null;
    weight: string | null;
    height: string | null;
    reach: string | null;
    stance: string | null;
    weight_class: string | null;
    team_id: number | null;
    team_name: string | null;
    gender: "M" | "F" | null;
    date_of_birth: string | null;
    citizenship: string | null;
    country_code: string | null;
    flag_url: string | null;
    active: boolean;
    images: {
      rel: string[];
      href: string;
    }[];
  };
  calculateAge: (birthDateString?: string) => number | null;
  isDark: boolean;
};
export default function PlayerHeader({ fighter, isDark, calculateAge }: Props) {
  const firstName = fighter.first_name;
  const lastName = fighter.last_name;
  const nickname = fighter.nickname;
  const avatarUrl = fighter?.images[0]?.href;
  const height = fighter.height;
  const weight = fighter.weight;
  const weightClass = fighter.weight_class;
  const reach = fighter.reach
  const styles = playerHeaderStyles(isDark);
  const initial = firstName[0]?.toUpperCase() || "?";

  const birth = fighter.date_of_birth
    ? `${new Date(fighter.date_of_birth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} (${calculateAge(fighter.date_of_birth) ?? "?"} years old)`
    : "Unknown";

  return (
    <View style={styles.playerHeader}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            accessibilityLabel={`${firstName} ${lastName} photo`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>{weightClass}</Text>
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{firstName}</Text>
        <Text style={styles.name}>{lastName}</Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Nickname: </Text>
          {nickname || "Unknown"}
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Height: </Text>
          {height ?? "?"}
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Weight: </Text>
          {weight ?? "?"}
        </Text>
        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Reach: </Text>
          {reach ?? "?"}
        </Text>

        <Text style={styles.playerInfo}>
          <Text style={styles.playerInfoLabel}>Birth: </Text>
          {birth || "Unknown"}
        </Text>
      </View>
    </View>
  );
}
