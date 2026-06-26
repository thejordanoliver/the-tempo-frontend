import { CFBRecruit } from "@/types/football/football";
import { Colors } from "constants/styles";
import { Image, Text, View } from "react-native";
import { recruitHeaderStyles } from "styles/PlayerStyles/RecruitHeaderStyles";

type Props = {
  player: CFBRecruit;
  isDark: boolean;
  teamColor?: string;
  team_name?: string;
  age?: number;
  isCollegePlayer?: boolean;
};

export default function RecruitHeader({
  player,
  isDark,
  teamColor,
  team_name,
  age,
}: Props) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";
  const accent = isDark ? Colors.white : Colors.black;
  const styles = recruitHeaderStyles(isDark, accent);

  return (
    <View style={styles.container}>
      {/* Avatar overlapping banner */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          {player.image_url ? (
            <Image
              source={{ uri: player.image_url }}
              style={styles.avatar}
              accessibilityLabel={`${player.first_name} ${player.last_name} photo`}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initial}>{initial}</Text>
            </View>
          )}
        </View>

        {/* Position badge below avatar */}
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{player.position ?? "?"}</Text>
        </View>
      </View>

      {/* Name block */}
      <View style={styles.nameContainer}>
        <Text style={styles.firstName}>
          {player.first_name?.toUpperCase()} {player.last_name?.toUpperCase()}
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{player.height ?? "—"}</Text>
          <Text style={styles.statLabel}>HEIGHT</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statChip}>
          <Text style={styles.statValue}>{player.weight ?? "—"}</Text>
          <Text style={styles.statLabel}>LBS</Text>
        </View>

        {age != null && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{age}</Text>
              <Text style={styles.statLabel}>AGE</Text>
            </View>
          </>
        )}
      </View>

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SCHOOL</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
            {player.high_school}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>HOMETOWN</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
            {player.hometown}
          </Text>
        </View>
      </View>
    </View>
  );
}
