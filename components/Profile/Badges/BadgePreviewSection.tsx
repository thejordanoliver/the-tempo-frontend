import Button from "@/components/Buttons/Button";
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import HeadingTwo from "@/components/Headings/HeadingTwo";
import Subheading from "@/components/Headings/Subheading";
import { Colors, Fonts, globalStyles } from "@/constants/styles";
import { FavoritesSectionStyles } from "@/styles/FavoritesSectionStyles";
import { BadgeProgress } from "@/types/badges";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BadgePreviewCard from "./BadgePreviewCard";

const BADGE_GRID_COLUMNS = 3;

const chunkBadges = (badges: BadgeProgress[]) => {
  const rows: BadgeProgress[][] = [];

  for (let index = 0; index < badges.length; index += BADGE_GRID_COLUMNS) {
    rows.push(badges.slice(index, index + BADGE_GRID_COLUMNS));
  }

  return rows;
};

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
  const styles = badgePreviewSectionStyles(isDark);
  const cardGridStyles = FavoritesSectionStyles(isDark, itemWidth);
  const global = globalStyles(isDark);
  const earnedSummary = `${earnedCount} of ${totalCount} earned`;
  const badgeRows = chunkBadges(badges);

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
      {badgeRows.map((row) => (
        <View
          key={row.map((badge) => badge.id).join("|")}
          style={cardGridStyles.grid}
        >
          {row.map((badge) => (
            <BadgePreviewCard
              key={badge.id}
              badge={badge}
              isDark={isDark}
              itemWidth={itemWidth}
            />
          ))}
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <Button onPress={() => router.push("/badges")} isDark={isDark}>
          See All Badges
        </Button>
      </View>
    </View>
  );
}

const badgePreviewSectionStyles = (isDark: boolean) =>
  StyleSheet.create({
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
      color: isDark ? Colors.white : Colors.black,
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
