import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";

type Props = {
  fighter: any;
  calculateAge: (birthDateString?: string) => number | null;
  isDark: boolean;
};

export default function PlayerHeader({ fighter, isDark, calculateAge }: Props) {
  const styles = playerHeaderStyles(isDark);

  const firstName = fighter.first_name;
  const lastName = fighter.last_name;
  const nickname = fighter.nickname;
  const avatarUrl = fighter?.images?.[0]?.href;

  const height = fighter.height;
  const weight = fighter.weight;
  const reach = fighter.reach;
  const weightClass = fighter.weight_class;
  const stance = fighter.stance;
  const team = fighter.team_name;

  const initial = firstName?.[0]?.toUpperCase() || "?";

  const birth = fighter.date_of_birth
    ? new Date(fighter.date_of_birth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
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
        </View>

        {/* Weight Class Badge */}
        {weightClass && (
          <View style={styles.badgeRow}>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{weightClass}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{height ?? "?"}</Text>
          <Text style={styles.statLabel}>HEIGHT</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statChip}>
          <Text style={styles.statValue}>{weight ?? "?"}</Text>
          <Text style={styles.statLabel}>WEIGHT</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statChip}>
          <Text style={styles.statValue}>{reach ?? "?"}</Text>
          <Text style={styles.statLabel}>REACH</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>
            {calculateAge(fighter.date_of_birth)}
          </Text>
          <Text style={styles.statLabel}>AGE</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NICKNAME</Text>
          <Text style={styles.infoValue}>{nickname || "Unknown"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BORN</Text>
          <Text style={styles.infoValue}>{birth}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>STANCE</Text>
          <Text style={styles.infoValue}>{stance}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>TEAM</Text>
          <Text style={styles.infoValue}>{team}</Text>
        </View>
      </View>
    </View>
  );
}
