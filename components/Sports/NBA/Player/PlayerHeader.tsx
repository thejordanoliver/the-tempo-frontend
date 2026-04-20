import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { calculateAge, calculateExperience } from "utils/dateUtils";

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
    draft_round?: number | null;
    draft_year?: number | null;
    draft_number?: number | null;
  };
  avatarUrl?: string;
  isDark: boolean;
  team_name?: string;
};

export default function PlayerHeader({
  player,
  avatarUrl,
  isDark,
}: Props) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";

  const styles = playerHeaderStyles(isDark);
  const age = calculateAge(player.birth_date);
  const experience = calculateExperience(player.draft_year ?? 0);

  const birthFormatted = player.birth_date
    ? new Date(player.birth_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const draftInfo =
    player.draft_round && player.draft_number && player.draft_year
      ? `Rd ${player.draft_round}, Pick ${player.draft_number} · ${player.draft_year}`
      : "Undrafted";

  return (
    <View style={styles.container}>
      {/* Avatar overlapping banner */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
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
        </View>

        {/* Position + jersey badge */}
        <View style={styles.badgeRow}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>
              {player.position ?? "?"} #{player.jersey_number ?? "?"}
            </Text>
          </View>
        </View>
      </View>

      {/* Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {player.first_name} {player.last_name}
        </Text>
      </View>

      {/* Stats row: height / weight / age / experience */}
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

        {experience != null && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{experience}</Text>
              <Text style={styles.statLabel}>YRS EXP</Text>
            </View>
          </>
        )}
      </View>

      {/* Info grid */}
      <View style={styles.infoGrid}>
        {player.college ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>COLLEGE</Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {player.college}
            </Text>
          </View>
        ) : null}

        {birthFormatted ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>BORN</Text>
            <Text style={styles.infoValue}>{birthFormatted}</Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>DRAFT</Text>
          <Text style={styles.infoValue}>{draftInfo}</Text>
        </View>
      </View>
    </View>
  );
}
