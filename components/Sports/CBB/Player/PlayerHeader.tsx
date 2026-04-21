import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { BasketballPlayer } from "types/basketball";
type PlayerHeaderProps = {
  player: BasketballPlayer;
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
  const birthFormatted = player.date_of_birth
    ? new Date(player.date_of_birth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const experience = player.experience_abbr
    ? player.experience_abbr
    : player.experience_years === 0
      ? "R"
      : player.experience_years;

  const college = player.college;
  const age = calculateAge(player.date_of_birth);
  const homeTown =
    `${player.birth_place_city}, ${player.birth_place_state}` || "Unknown";

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

        {age && (
          <>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{age}</Text>
              <Text style={styles.statLabel}>AGE</Text>
            </View>
            <View style={styles.statDivider} />
          </>
        )}
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{experience}</Text>
          <Text style={styles.statLabel}>
            {player.experience_abbr ? `CLASS` : `YRS EXP`}
          </Text>
        </View>
      </View>

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>HOMETOWN</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
            {homeTown}
          </Text>
        </View>
      </View>

      {college && (
        <>
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
        </>
      )}

      {birthFormatted ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BORN</Text>
          <Text style={styles.infoValue}>{birthFormatted}</Text>
        </View>
      ) : null}
    </View>
  );
}
