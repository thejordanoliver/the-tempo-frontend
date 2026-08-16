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
      overflow: "hidden",
      gap: 12,
      padding: 12,
      borderWidth: 1,
      borderColor,
      borderRadius: 8,
      backgroundColor: cardBackground,
    },
    scoringWrapper: {
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    turnoverWrapper: {
      borderColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    headerRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    titleGroup: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    liveRow: {
      minHeight: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    eyebrow: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      color: subtleText,
    },
    titleText: {
      fontSize: 18,
      lineHeight: 22,
      fontFamily: Fonts.MEDIUM,
      color: textColor,
    },
    headerLogo: {
      width: 42,
      height: 42,
      flexShrink: 0,
    },
    driveCard: {
      gap: 6,
      padding: 10,
      borderRadius: 8,
      backgroundColor: mutedBackground,
    },
    driveMetaRow: {
      minHeight: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    driveMetaLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.MEDIUM,
      color: subtleText,
      textTransform: "uppercase",
    },
    driveResult: {
      flexShrink: 1,
      fontSize: 13,
      lineHeight: 17,
      textAlign: "right",
      fontFamily: Fonts.MEDIUM,
      color: textColor,
    },
    driveDescription: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.REGULAR,
      color: textColor,
    },
    field: {
      height: 150,
      minHeight: 150,
      overflow: "hidden",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.darkGray,
      backgroundColor: isDark ? "#131313" : "#f6f6f6",
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    infoPill: {
      minHeight: 48,
      flexGrow: 1,
      flexBasis: "47%",
      justifyContent: "center",
      gap: 2,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: mutedBackground,
    },
    infoLabel: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: Fonts.MEDIUM,
      color: subtleText,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: Fonts.MEDIUM,
      color: textColor,
    },
    errorText: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    playTextCard: {
      gap: 5,
      paddingTop: 2,
    },
    playTextLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      color: subtleText,
    },
    playText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.REGULAR,
      color: textColor,
    },
    recentList: {
      overflow: "hidden",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: borderColor,
    },
    recentPlayRow: {
      minHeight: 58,
      flexDirection: "row",
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    lastRecentPlayRow: {
      borderBottomWidth: 0,
    },
    recentPlayMeta: {
      width: 60,
      flexShrink: 0,
    },
    recentPlayTime: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.MEDIUM,
      color: subtleText,
      fontVariant: ["tabular-nums"],
    },
    recentPlayText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.REGULAR,
      color: textColor,
    },
  });
};
