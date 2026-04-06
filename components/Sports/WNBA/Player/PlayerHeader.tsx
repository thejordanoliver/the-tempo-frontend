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
  avatarUrl,
  isDark,
  isWomen,
}: PlayerHeaderProps) {
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";

  const styles = playerHeaderStyles(isDark);
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

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const d = new Date(birthDate);
    if (isNaN(d.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const age = calculateAge(player.birth_date);
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
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>
            {player.position ?? "?"} · #{player.jersey_number ?? "?"}
          </Text>
        </View>
      </View>

      {/* Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {player.first_name} {player.last_name}
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{player.height ?? "—"}</Text>
          <Text style={styles.statLabel}>HEIGHT</Text>
        </View>

        <View style={styles.statDivider} />

        {!isWomen && (
          <>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{player.weight ?? "—"}</Text>
              <Text style={styles.statLabel}>LBS</Text>
            </View>
            <View style={styles.statDivider} />
          </>
        )}
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{player.experience_abbr}</Text>
          <Text style={styles.statLabel}>CLASS</Text>
        </View>

        {player.experience_years != null && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{player.experience_years}</Text>
              <Text style={styles.statLabel}>YRS EXP</Text>
            </View>
          </>
        )}
      </View>

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>HOMETOWN</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
            {player.birth_place_display_text ?? "Unknown"}
          </Text>
        </View>

        {birthFormatted ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>BORN</Text>
            <Text style={styles.infoValue}>{birthFormatted}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
