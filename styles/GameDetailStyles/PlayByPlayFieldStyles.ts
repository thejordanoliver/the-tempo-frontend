import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.white : Colors.black;
  const subtleText = isDark ? Colors.lightGray : Colors.darkGray;
  const borderColor = isDark ? Colors.midTone : Colors.lightGray;
  const cardBackground = isDark ? Colors.black : Colors.white;
  const mutedBackground = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  return StyleSheet.create({
    wrapper: {
      gap: 12,
      padding: 12,
      borderWidth: 1,
      borderColor,
      borderRadius: 8,
      backgroundColor: cardBackground,
      overflow: "hidden",
    },
    scoringWrapper: {
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    turnoverWrapper: {
      borderColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 44,
    },
    titleGroup: {
      flex: 1,
      gap: 3,
      minWidth: 0,
    },
    liveRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 15,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    eyebrow: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      lineHeight: 14,
      color: subtleText,
      textTransform: "uppercase",
    },
    titleText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 18,
      lineHeight: 22,
      color: textColor,
    },
    headerLogo: {
      flexShrink: 0,
      width: 42,
      height: 42,
    },
    driveCard: {
      gap: 6,
      padding: 10,
      borderRadius: 8,
      backgroundColor: mutedBackground,
    },
    driveMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      minHeight: 18,
    },
    driveMetaLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      lineHeight: 16,
      color: subtleText,
      textTransform: "uppercase",
    },
    driveResult: {
      flexShrink: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 13,
      lineHeight: 17,
      color: textColor,
      textAlign: "right",
    },
    driveDescription: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      lineHeight: 18,
      color: textColor,
    },
    field: {
      height: 150,
      minHeight: 150,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.darkGray,
      borderRadius: 8,
      backgroundColor: isDark ? "#131313" : "#f6f6f6",
      overflow: "hidden",
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    infoPill: {
      flexGrow: 1,
      flexBasis: "47%",
      justifyContent: "center",
      gap: 2,
      minHeight: 48,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: mutedBackground,
    },
    infoLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      lineHeight: 14,
      color: subtleText,
      textTransform: "uppercase",
    },
    infoValue: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      lineHeight: 18,
      color: textColor,
    },
    errorText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    playTextCard: {
      gap: 5,
      paddingTop: 2,
    },
    playTextLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      lineHeight: 16,
      color: subtleText,
      textTransform: "uppercase",
    },
    playText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: textColor,
    },
    recentList: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: borderColor,
      overflow: "hidden",
    },
    recentPlayRow: {
      flexDirection: "row",
      gap: 10,
      minHeight: 58,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    lastRecentPlayRow: {
      borderBottomWidth: 0,
    },
    recentPlayMeta: {
      flexShrink: 0,
      width: 60,
    },
    recentPlayTime: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      fontVariant: ["tabular-nums"],
      lineHeight: 16,
      color: subtleText,
    },
    recentPlayText: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      lineHeight: 18,
      color: textColor,
    },
  });
};
