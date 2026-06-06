import { Player } from "@/hooks/LeagueHooks/useRoster";
import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { calculateAge, formatBirth } from "utils/dateUtils";

type Props = {
  player: Player;
  isDark: boolean;
  isCollegePlayer?: boolean;
};

export default function PlayerHeader({
  player,
  isDark,
  isCollegePlayer = false,
}: Props) {
  const styles = playerHeaderStyles(isDark);
  const initial = player?.first_name?.[0]?.toUpperCase() || "?";
  const age = calculateAge(player.birth_date ?? "N/A");
  const experience =
    player.experience === 0
      ? "R"
      : isCollegePlayer
        ? player.experience_abbr
        : player.experience;
  const birthDate = formatBirth(player.birth_date);
  const draftInfo =
    player.draft_round && player.draft_number && player.draft_year
      ? `Rd ${player.draft_round}, Pick ${player.draft_number} · ${player.draft_year}`
      : "Undrafted";

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {player.headshot_url ? (
          <Image
            source={{ uri: player.headshot_url }}
            style={styles.avatar}
            accessibilityLabel={`${player.first_name} ${player.last_name} photo`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>
            {player.position ?? "?"} #{player.jersey_number ?? "?"}
          </Text>
        </View>
      </View>

      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {player.first_name} {player.last_name}
        </Text>
      </View>

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

        {age != null && !isCollegePlayer && (
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
              <Text style={styles.statLabel}>
                {isCollegePlayer ? `CLASS` : `YRS EXP`}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.infoGrid}>
        {isCollegePlayer && (
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
        )}

        {!isCollegePlayer && (
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
        )}

        {!isCollegePlayer && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>BORN</Text>
            <Text style={styles.infoValue}>{birthDate}</Text>
          </View>
        )}

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
