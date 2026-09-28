import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const FanPredictionStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      height: 112,
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-evenly",
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: Colors.midTone,
    },
    totalVotesText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: Colors.midTone,
      fontVariant: ["tabular-nums"],
    },
    skeletonRow: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      padding: 12,
      minHeight: 100,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 12,
      overflow: "hidden",
    },

    skeletonBadgeLogo: {
      width: 36,
      height: 36,
    },

    skeletonTeamName: {
      width: 60,
      height: 15,
      borderRadius: 6,
    },

    skeletonSubtitle: {
      width: 180,
      height: 14,
      marginTop: 4,
      marginBottom: 2,
      borderRadius: 6,
    },

    predictionCard: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 12,
      gap: 10,
      height: 112,
      overflow: "hidden",
    },

    predictionCardSelected: {
      borderColor: isDark ? Colors.white : Colors.black,
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
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      zIndex: 1,
    },
    teamLogo: {
      width: 32,
      height: 32,
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
