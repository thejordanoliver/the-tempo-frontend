import { BADGE_CATEGORY_COLORS, BADGE_TIER_COLORS } from "@/constants/badges";
import { Colors } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { BadgeProgress } from "@/types/badges";
import { StyleSheet, Text, View } from "react-native";

type BadgeEmblemProps = {
  badge: BadgeProgress;
  size?: number;
  showLockedState?: boolean;
};

export default function BadgeEmblem({
  badge,
  size = 72,
  showLockedState = true,
}: BadgeEmblemProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const isLocked = showLockedState && !badge.isEarned;
  const tierColor = BADGE_TIER_COLORS[badge.tier] ?? BADGE_TIER_COLORS.bronze;
  const categoryColor =
    BADGE_CATEGORY_COLORS[badge.category] ?? BADGE_CATEGORY_COLORS.community;

  const outerBorderWidth = Math.max(size * 0.07, 3);
  const innerSize = size - outerBorderWidth * 2 - 6;

  return (
    <View
      style={[
        styles.outerBadge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: outerBorderWidth,
          borderColor:
            isLocked && isDark
              ? Colors.darkGray
              : isLocked
                ? Colors.lightGray
                : tierColor,
          opacity: isLocked ? 0.55 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.innerBadge,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor:
              isLocked && isDark
                ? Colors.darkGray
                : isLocked
                  ? Colors.lightGray
                  : categoryColor,
          },
        ]}
      >
        <Text
          selectable
          style={[
            styles.symbol,
            {
              fontSize: size * 0.35,
            },
          ]}
        >
          {isLocked ? "🔒" : badge.symbol || "🏆"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },

  innerBadge: {
    alignItems: "center",
    justifyContent: "center",
  },

  symbol: {
    textAlign: "center",
  },
});
