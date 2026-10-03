import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const FanPredictionStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    wrapper: {
      padding: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    cardsRow: {
      width: "100%",
      minHeight: 128,
      flexDirection: "row",
      gap: 8,
      alignItems: "stretch",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    subtitle: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    totalVotesText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: Colors.midTone,
      fontVariant: ["tabular-nums"],
    },
    footer: {
      gap: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    rankingHint: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: Colors.midTone,
    },
    rankingsButton: {
      alignSelf: "flex-start",
      paddingHorizontal: 0,
      paddingVertical: 8,
      borderRadius: 8,
    },
    skeletonStatusCopy: {
      flex: 1,
      minWidth: 0,
    },

    predictionCard: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 12,
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: 8,
      gap: 10,
      minHeight: 128,
      overflow: "hidden",
    },

    predictionCardSelected: {
      borderColor: isDark ? Colors.dark.green : Colors.light.green,
    },
    selectedBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.dark.green : Colors.light.green,
      zIndex: 2,
    },
    teamGradient: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.2,
    },
    teamGradientSelected: {
      opacity: 0.35,
    },
    gradientFill: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },

    voteFill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      opacity: 0.26,
      transformOrigin: "bottom",
      zIndex: 0,
    },
    cardContent: {
      position: "relative",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      zIndex: 1,
    },
    teamLogo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
      zIndex: 1,
    },

    teamLabel: {
      width: "100%",
      height: 18,
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      lineHeight: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 0,
      zIndex: 1,
    },

    votePercentage: {
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      lineHeight: 18,
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 0,
      zIndex: 1,
    },
  });
