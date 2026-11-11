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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    prompt: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 18,
      lineHeight: 24,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    headerHint: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
    },
    pointsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    bonusPointsBadge: {
      backgroundColor: isDark
        ? Colors.dark.transparentGreen
        : Colors.light.transparentGreen,
    },
    pointsText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    bonusText: {
      color: isDark ? Colors.dark.green : Colors.light.green,
    },
    pointsRetry: {
      minHeight: 36,
      justifyContent: "center",
    },
    pointsRetryText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    cardsRow: {
      width: "100%",
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
    statusCopy: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
      gap: 5,
    },
    subtitle: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
    },
    selectedStatus: {
      color: isDark ? Colors.dark.green : Colors.light.green,
    },
    totalVotesText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: Colors.midTone,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    rankingHint: {
      flex: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: Colors.midTone,
    },
    rankingsButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 0,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    textLink: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    matchupCard: {
      minWidth: 0,
      minHeight: 132,
      justifyContent: "flex-start",
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    matchupCardContent: {
      flex: 1,
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 16,
    },
    matchupIdentity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 40,
    },
    matchupTeamLabel: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 18,
      lineHeight: 24,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    matchupAction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 36,
      paddingHorizontal: 6,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.gray : Colors.light.gray,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.transparentBackground
        : Colors.light.transparentBackground,
    },
    matchupActionText: {
      flexShrink: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    selectionRing: {
      width: 14,
      height: 14,
      borderWidth: 1,
      borderColor: isDark
        ? Colors.dark.secondaryText
        : Colors.light.secondaryText,
      borderRadius: 7,
    },
    matchupPercentage: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 30,
      lineHeight: 34,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    matchupPercentageLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      lineHeight: 16,
      color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
    },
    matchupSelectedBadge: {
      top: "auto",
      bottom: 12,
      right: 12,
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
