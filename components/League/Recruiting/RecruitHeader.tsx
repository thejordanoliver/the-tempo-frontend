import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { Fragment } from "react";
import { Image, Text, View } from "react-native";
import { PlayerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { RecruitProfileStyles } from "styles/PlayerStyles/RecruitProfileStyles";
import type { Recruit } from "types/recruiting/recruits";
import {
  formatRecruitRating,
  getRecruitRanking,
} from "utils/recruiting/recruits";

type Props = { player: Recruit; isDark: boolean };

export default function RecruitHeader({ player, isDark }: Props) {
  const styles = PlayerHeaderStyles(isDark);
  const profile = RecruitProfileStyles(isDark);
  const rank = getRecruitRanking(player, "industry");
  const stats = [
    ["HEIGHT", player.height],
    ["LBS", player.weight],
    ["CLASS", player.year],
    ["RATING", formatRecruitRating(rank.rating)],
  ] as const;

  return (
    <View style={[styles.container, profile.headerContainer]}>
      <View style={styles.identityRow}>
        <View style={styles.avatarContainer}>
          {player.image_url ? (
            <Image
              source={{ uri: player.image_url }}
              style={styles.avatar}
              accessibilityLabel={`${player.name} photo`}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initial}>
                {player.name?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.identityContent}>
          <View style={styles.nameContainer}>
            <Text
              style={styles.name}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.05}
            >
              {player.name}
            </Text>
          </View>
          <View style={[styles.positionBadge, styles.positionRow]}>
            <Text style={styles.positionText}>{player.position ?? "—"}</Text>
            <View style={styles.positionDivider} />
            <View
              style={profile.headerStars}
              accessible
              accessibilityLabel={`Industry stars: ${rank.stars ?? "Unavailable"}${player.five_star_plus ? " plus" : ""}`}
            >
              {rank.stars == null ? (
                <Text style={styles.positionText}>—</Text>
              ) : (
                Array.from(
                  { length: Math.max(0, Math.min(5, Math.floor(rank.stars))) },
                  (_, index) => (
                    <Ionicons
                      key={index}
                      name="star"
                      size={14}
                      color={isDark ? Colors.dark.gold : Colors.light.gold}
                      accessible={false}
                    />
                  ),
                )
              )}
              {player.five_star_plus && (
                <Ionicons
                  name="add"
                  size={14}
                  color={isDark ? Colors.dark.gold : Colors.light.gold}
                  accessible={false}
                />
              )}
            </View>
          </View>
        </View>
      </View>
      <View style={[styles.statsRow, profile.headerStatsRow]}>
        {stats.map(([label, value], index) => (
          <Fragment key={label}>
            {index > 0 && <View style={styles.statDivider} />}
            <View
              style={profile.headerStatChip}
              accessible
              accessibilityLabel={`${label === "RATING" ? "Industry rating" : label}: ${value ?? "Unavailable"}`}
            >
              <View style={profile.headerStarValue}>
                <Text
                  style={[styles.statValue, profile.headerStatValue]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {value ?? "—"}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[styles.statLabel, profile.headerStatLabel]}
              >
                {label}
              </Text>
            </View>
          </Fragment>
        ))}
      </View>
      <View style={styles.infoGrid}>
        {[
          ["SCHOOL", player.high_school],
          ["HOMETOWN", player.hometown],
        ].map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {value ?? "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
