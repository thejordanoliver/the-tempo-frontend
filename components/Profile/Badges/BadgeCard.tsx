import {
  BADGE_CATEGORY_COLORS,
  BADGE_CATEGORY_LABELS,
  BADGE_TIER_COLORS,
} from "@/constants/badges";
import { Colors } from "@/constants/styles";
import { badgeCardStyles } from "@/styles/ProfileStyles/BadgeStyles";
import { BadgeProgress } from "@/types/badges";
import { capitalizeBadgeTier, formatBadgeNumber } from "@/utils/badgeUtils";
import { Text, View } from "react-native";
import BadgeEmblem from "./BadgeEmblem";

type BadgeCardProps = {
  badge: BadgeProgress;
  isDark: boolean;
};

export default function BadgeCard({ badge, isDark }: BadgeCardProps) {
  const categoryColor = BADGE_CATEGORY_COLORS[badge.category];

  const tierColor = BADGE_TIER_COLORS[badge.tier];

  const styles = badgeCardStyles(isDark, badge.isEarned, tierColor);

  const cardBackground = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  const primaryText = isDark ? Colors.white : Colors.black;

  const progressBackground = isDark
    ? Colors.transparentDarkGray
    : Colors.transparentLightGray;

  const statusText = badge.isEarned
    ? "Earned"
    : `${formatBadgeNumber(badge.remaining)} remaining`;

  const date = new Date(badge.earnedAt ?? "");
  const formattedDate = date.toLocaleDateString("en-us", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          borderColor: badge.isEarned
            ? tierColor
            : isDark
              ? Colors.darkGray
              : Colors.lightGray,
        },
      ]}
    >
      <BadgeEmblem badge={badge} size={74} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text
              selectable
              numberOfLines={1}
              style={[
                styles.name,
                {
                  color: primaryText,
                },
              ]}
            >
              {badge.name}
            </Text>

            <Text
              selectable
              style={[
                styles.tier,
                {
                  color: tierColor,
                },
              ]}
            >
              {capitalizeBadgeTier(badge.tier)}
            </Text>
          </View>

          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: `${categoryColor}20`,
              },
            ]}
          >
            <Text
              selectable
              style={[
                styles.categoryText,
                {
                  color: categoryColor,
                },
              ]}
            >
              {BADGE_CATEGORY_LABELS[badge.category]}
            </Text>
          </View>
        </View>

        {badge.isEarned && (
          <Text selectable style={styles.description}>
            Earned On: {formattedDate}
          </Text>
        )}
        <Text selectable style={styles.description}>
          {badge.description}
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text selectable style={styles.progressText}>
              {formatBadgeNumber(badge.currentValue)} /{" "}
              {formatBadgeNumber(badge.threshold)}
            </Text>

            <Text selectable style={styles.statusText}>
              {statusText}
            </Text>
          </View>

          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: progressBackground,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: badge.isEarned ? tierColor : categoryColor,
                  width: `${badge.progressPercent}%` as `${number}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
