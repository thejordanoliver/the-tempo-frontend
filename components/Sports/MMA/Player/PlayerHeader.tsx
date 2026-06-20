import { Fighter } from "@/hooks/MMAHooks/useMMAFighter";
import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { calculateAge, formatBirth } from "utils/dateUtils";

type Props = {
  player: Fighter | null;
  isDark: boolean;
  isCollegePlayer?: boolean;
};

export default function PlayerHeader({ player, isDark }: Props) {
  const styles = playerHeaderStyles(isDark);
  const birthDate = formatBirth(player?.birth_date ?? "");
  const age = calculateAge(player?.birth_date ?? "N/A");
  const headshot = player?.headshot_url;
  const playerName = player?.full_name;
  const firstName = player?.first_name;
  const lastName = player?.last_name;
  const nickname = player?.nickname;
  const initial = firstName?.[0]?.toUpperCase() || "?";
  const height = player?.height;
  const weight = player?.weight;
  const weightClass = player?.weight_class_short_name;
  const association = player?.association_name;
  const stance = player?.stance_text;
  const fightStyle = player?.style_text;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {headshot ? (
          <Image
            source={{ uri: headshot }}
            style={styles.avatar}
            accessibilityLabel={`${playerName} photo`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{weightClass ?? "UNK"}</Text>
        </View>
      </View>

      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {firstName}{" "}
          {nickname && `"${nickname}" `}
          {lastName}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{height ?? "—"}</Text>
          <Text style={styles.statLabel}>HEIGHT</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statChip}>
          <Text style={styles.statValue}>{weight ?? "—"}</Text>
          <Text style={styles.statLabel}>LBS</Text>
        </View>

        <View style={styles.statDivider} />
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{age}</Text>
          <Text style={styles.statLabel}>AGE</Text>
        </View>
      </View>
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BORN</Text>
          <Text style={styles.infoValue}>{birthDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ASSOCIATION</Text>
          <Text style={styles.infoValue}>{association}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stance</Text>
          <Text style={styles.infoValue}>{stance}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>FIGHT STYLE</Text>
          <Text style={styles.infoValue}>{fightStyle}</Text>
        </View>
      </View>
    </View>
  );
}
