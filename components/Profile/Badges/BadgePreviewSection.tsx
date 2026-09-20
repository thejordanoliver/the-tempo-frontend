import Button from "@/components/Buttons/Button";
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import HeadingTwo from "@/components/Headings/HeadingTwo";
import Subheading from "@/components/Headings/Subheading";
import { BADGE_TIER_COLORS } from "@/constants/badges";
import { Colors, Fonts, globalStyles } from "@/constants/styles";
import { BadgeProgress } from "@/types/badges";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BadgeEmblem from "./BadgeEmblem";

const BADGE_GRID_GAP = 8;
const CARD_HEIGHT = 130;

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
        styles.gridItem,
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
  loading = false,
  error = null,
  onRetry,
}: BadgePreviewSectionProps) {
  const styles = badgePreviewSectionStyles(isDark, itemWidth);
  const global = globalStyles(isDark);
  const earnedSummary = `${earnedCount} of ${totalCount} earned`;

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
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
      <View style={global.emptyContainer}>
        <Text selectable style={styles.emptyTitle}>
          No badges earned yet
        </Text>

        <Text selectable style={global.emptyText}>
          Badges are earned through forum posts, comments, likes, and shares.
        </Text>
      </View>
    );

  return (
    <View>
      <HeadingTwo isDark={isDark}>Badges</HeadingTwo>
      <Subheading>{earnedSummary}</Subheading>
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

      <View style={styles.buttonContainer}>
        <Button onPress={() => router.push("/badges")} isDark={isDark}>
          See All Badges
        </Button>
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
      rowGap: BADGE_GRID_GAP,
      columnGap: BADGE_GRID_GAP,
    },
    gridItem: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 20,
      width: itemWidth,
      height: CARD_HEIGHT,
      paddingHorizontal: 8,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    cardText: {
      alignItems: "center",
      gap: 4,
      width: "100%",
    },

    badgeName: {
      minHeight: 36,
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },

    badgeStatus: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      textAlign: "center",
    },

    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 24,
    },

    emptyTitle: {
      fontFamily: Fonts.REGULAR,
      fontSize: 20,
      color: Colors.midTone,
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    statusText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    errorText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
    buttonContainer: {
      width: "100%",
      marginVertical: 12,
    },
  });
