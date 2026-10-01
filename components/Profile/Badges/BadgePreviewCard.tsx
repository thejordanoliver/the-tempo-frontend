import { BADGE_TIER_COLORS } from "@/constants/badges";
import { Colors, Fonts } from "@/constants/styles";
import { BadgeProgress } from "@/types/badges";
import { StyleSheet, Text, View } from "react-native";
import BadgeEmblem from "./BadgeEmblem";

const BADGE_PREVIEW_EMBLEM_SIZE = 50;
const CARD_HEIGHT = 130;

type BadgePreviewCardProps = {
  badge: BadgeProgress;
  isDark: boolean;
  itemWidth: number;
};

export default function BadgePreviewCard({
  badge,
  isDark,
  itemWidth,
}: BadgePreviewCardProps) {
  const secondaryText = isDark ? Colors.lightGray : Colors.darkGray;
  const tierColor = BADGE_TIER_COLORS[badge.tier];
  const statusText = badge.isEarned
    ? "Earned"
    : `${Math.round(badge.progressPercent)}%`;
  const statusColor = badge.isEarned ? tierColor : secondaryText;
  const styles = BadgePreviewCardStyles(isDark, itemWidth);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${badge.name}, ${statusText}`}
      style={styles.gridItem}
    >
      <BadgeEmblem badge={badge} size={BADGE_PREVIEW_EMBLEM_SIZE} />
      <View style={styles.cardText}>
        <Text
          selectable
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.05}
          style={styles.badgeName}
        >
          {badge.name}
        </Text>

        <Text
          selectable
          numberOfLines={1}
          style={[styles.badgeStatus, { color: statusColor }]}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
}

const BadgePreviewCardStyles = (isDark: boolean, itemWidth: number) =>
  StyleSheet.create({
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
      width: "100%",
    },

    badgeName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    badgeStatus: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      textAlign: "center",
      marginTop: 4,
    },
  });
