import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const DriverHeaderStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const divider = isDark
    ? Colors.transparentLightGray
    : Colors.light.itemBackground;

  return StyleSheet.create({
    section: {
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    panel: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: divider,
      borderRadius: 12,
      backgroundColor: theme.background,
      overflow: "hidden",
    },
    header: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: theme.itemBackground,
    },
    headerTitle: {
      flex: 1,
      gap: 2,
    },
    status: {
      flexDirection: "row",
      flexShrink: 1,
      alignItems: "center",
      gap: 6,
      maxWidth: "42%",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.background,
    },
    statusText: {
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontFamily: Fonts.MEDIUM,
      color: theme.text,
    },
    finalText: {
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.dark.lightRed: Colors.light.red,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.green,
    },
    columnHeader: {
      paddingVertical: 7,
      backgroundColor: theme.itemBackground,
    },
    line: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: divider,
    },
    row: {
      minHeight: 62,
      paddingVertical: 8,
    },
    winner: {
      backgroundColor: theme.itemBackground,
    },
    position: {
      width: 36,
      alignItems: "center",
    },
    positionNumber: {
      minWidth: 28,
      paddingHorizontal: 3,
      paddingVertical: 2,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: theme.itemBackground,
      textAlign: "center",
      fontVariant: ["tabular-nums"],
    },
    winnerPosition: {
      backgroundColor: theme.text,
      color: theme.background,
    },
    identity: {
      flex: 1,
      minWidth: 0,
    },
    profile: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 40,
    },
    headshot: {
      width: 40,
      height: 40,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },
    driverInfo: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      color: theme.text,
      fontFamily: Fonts.SEMIBOLD,
    },
    metadata: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metadataText: {
      flexShrink: 1,
      color: theme.secondaryText,
    },
    flag: {
      width: 16,
      height: 12,
      borderRadius: 2,
    },
    laps: {
      width: 38,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    time: {
      width: 80,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    inlineStats: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: 12,
      paddingTop: 4,
    },
    empty: {
      paddingHorizontal: 12,
      paddingVertical: 16,
    },
  });
};
