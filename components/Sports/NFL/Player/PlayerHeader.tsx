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
    experience?: string;
    birth_display?: string;
    experience_years: number;
    experience_display?: string;
    experience_abbr?: string;
    draft_round?: number | null;
    draft_year?: number | null;
    draft_number?: number | null;
  };
  avatarUrl?: string;
  isDark: boolean;
  teamColor?: string;
  team_name?: string;
  age?: number;
  isCollegePlayer?: boolean;
};

export default function PlayerHeader({
  player,
  avatarUrl,
  isDark,
  teamColor,
  team_name,
  isCollegePlayer,
}: Props) {
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

        <View style={styles.statChip}>
          <Text style={styles.statValue}>{player.weight ?? "—"}</Text>
          <Text style={styles.statLabel}>LBS</Text>
        </View>

        {!isCollegePlayer && age != null && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{age}</Text>
              <Text style={styles.statLabel}>AGE</Text>
            </View>
          </>
        )}

        {isCollegePlayer && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{player.experience_abbr}</Text>
              <Text style={styles.statLabel}>CLASS</Text>
            </View>
          </>
        )}

        {isCollegePlayer && player.experience && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {player.experience}
              </Text>
              <Text style={styles.statLabel}>CLASS</Text>
            </View>
          </>
        )}

        {player.experience != null && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{player.experience}</Text>
              <Text style={styles.statLabel}>YRS EXP</Text>
            </View>
          </>
        )}
      </View>

      {/* Info grid */}
      <View style={styles.infoGrid}>
        {isCollegePlayer ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>HOMETOWN</Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {player.birth_display ?? "Unknown"}
            </Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>COLLEGE</Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {player.college ?? "Unknown"}
            </Text>
          </View>
        )}
        {birthFormatted ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>BORN</Text>
            <Text style={styles.infoValue}>{birthFormatted}</Text>
          </View>
        ) : null}
        {!isCollegePlayer && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DRAFT</Text>
            <Text style={styles.infoValue}>{draftInfo}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
