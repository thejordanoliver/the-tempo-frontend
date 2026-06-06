import { Player } from "@/hooks/LeagueHooks/useRoster";
import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { calculateAge, formatBirth } from "utils/dateUtils";

type Props = {
  player: Player;
  isDark: boolean;
};

export default function PlayerHeader({ player, isDark }: Props) {
  const styles = playerHeaderStyles(isDark);

  const age = calculateAge(player.birth_date ?? "N/A");
  const experience = player.experience === 0 ? "R" : player.experience;
  const birthDate = formatBirth(player.birth_date);
  const draftInfo =
    player.draft_round && player.draft_number && player.draft_year
      ? `Rd ${player.draft_round}, Pick ${player.draft_number} · ${player.draft_year}`
      : "Undrafted";

  return (
    <View style={styles.container}>
      {/* Avatar overlapping banner */}
      <View style={styles.avatarContainer}>
        {player.headshot_url && (
          <Image
            source={{ uri: player.headshot_url }}
            style={styles.avatar}
            accessibilityLabel={`${player.first_name} ${player.last_name} photo`}
          />
        )}
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>
            {player.position ?? "?"} #{player.jersey_number ?? "?"}
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

        <View style={styles.statDivider} />
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{age}</Text>
          <Text style={styles.statLabel}>AGE</Text>
        </View>

        {player != null && (
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
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>COLLEGE</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
            {player.college ?? "Unknown"}
          </Text>
        </View>

        {birthDate ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>BORN</Text>
            <Text style={styles.infoValue}>{birthDate}</Text>
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
