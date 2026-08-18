import HeaderWithSeeAll from "@/components/Headings/HeaderWithSeeAll";
import { BADGE_TIER_COLORS } from "@/constants/badges";
import { Colors, Fonts } from "@/constants/styles";
import { BadgeProgress } from "@/types/badges";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BadgeEmblem from "./BadgeEmblem";

const BADGE_GRID_GAP = 8;
const BADGE_CARD_HEIGHT = 148;

type BadgePreviewSectionProps = {
  badges: BadgeProgress[];
  earnedCount: number;
  totalCount: number;
  isDark: boolean;
  itemWidth: number;
  onPressSeeAll: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

type BadgePreviewCardProps = {
  badge: BadgeProgress;
  isDark: boolean;
  itemWidth: number;
};

function BadgePreviewCard({ badge, isDark, itemWidth }: BadgePreviewCardProps) {
  const styles = badgePreviewSectionStyles(isDark, itemWidth);
  const primaryText = isDark ? Colors.white : Colors.black;
  const secondaryText = isDark ? Colors.lightGray : Colors.darkGray;
  const tierColor = BADGE_TIER_COLORS[badge.tier];
  const statusText = badge.isEarned
    ? "Earned"
    : `${Math.round(badge.progressPercent)}%`;
  const statusColor = badge.isEarned ? tierColor : secondaryText;
  const emblemSize = Math.min(64, Math.max(54, itemWidth * 0.55));

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${badge.name}, ${statusText}`}
      style={[
        styles.previewCard,
        {
          borderColor: badge.isEarned
            ? tierColor
            : isDark
              ? Colors.darkGray
              : Colors.lightGray,
        },
      ]}
    >
      <BadgeEmblem badge={badge} size={emblemSize} />

      <View style={styles.cardText}>
        <Text
          selectable
          numberOfLines={2}
          style={[
            styles.badgeName,
            {
              color: primaryText,
            },
          ]}
        >
          {badge.name}
        </Text>

        <Text
          selectable
          numberOfLines={1}
          style={[
            styles.badgeStatus,
            {
              color: statusColor,
            },
          ]}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
}

export default function BadgePreviewSection({
  badges,
  earnedCount,
  totalCount,
  isDark,
  itemWidth,
  onPressSeeAll,
  loading = false,
  error = null,
  onRetry,
}: BadgePreviewSectionProps) {
  const styles = badgePreviewSectionStyles(isDark, itemWidth);
  const earnedSummary = `${earnedCount} of ${totalCount} earned`;

  if (loading)
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator
          color={isDark ? Colors.white : Colors.black}
          size="small"
        />

        <Text selectable style={styles.statusText}>
          Loading badges
        </Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.statusContainer}>
        <Text selectable style={styles.errorText}>
          {error}
        </Text>

        {!!onRetry && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );

  if (badges.length < 0)
    return (
      <View style={styles.emptyContainer}>
        <Text selectable style={styles.emptyTitle}>
          No badges earned yet
        </Text>

        <Text selectable style={styles.emptyText}>
          Badges are earned through forum posts, comments, likes, and shares.
        </Text>
      </View>
    );

  return (
    <View>
      <HeaderWithSeeAll
        title="Badges"
        subtitle={earnedSummary}
        onPressSeeAll={onPressSeeAll}
      />
      <View style={styles.grid}>
        {badges.map((badge) => (
          <BadgePreviewCard
            key={badge.id}
            badge={badge}
            isDark={isDark}
            itemWidth={itemWidth}
          />
        ))}
      </View>
    </View>
  );
}

const badgePreviewSectionStyles = (isDark: boolean, itemWidth: number) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      columnGap: BADGE_GRID_GAP,
      rowGap: BADGE_GRID_GAP,
    },

    previewCard: {
      width: itemWidth,
      height: BADGE_CARD_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 8,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    cardText: {
      width: "100%",
      alignItems: "center",
      gap: 4,
    },

    badgeName: {
      minHeight: 36,
      textAlign: "center",
      fontSize: 13,
      fontFamily: Fonts.BOLD,
      lineHeight: 18,
    },

    badgeStatus: {
      textAlign: "center",
      fontSize: 12,
      fontFamily: Fonts.SEMIBOLD,
    },

    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 24,
    },

    emptyTitle: {
      textAlign: "center",
      fontSize: 20,
      fontFamily: Fonts.REGULAR,
      color: Colors.midTone,
    },

    emptyText: {
      marginTop: 6,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statusContainer: {
      minHeight: BADGE_CARD_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    statusText: {
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    errorText: {
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryText: {
      fontSize: 13,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.black : Colors.white,
    },
  });
