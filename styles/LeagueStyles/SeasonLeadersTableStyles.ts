import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const SeasonLeadersTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainer: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 32,
    },
    table: {
      flexDirection: "row",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.midTone,
      overflow: "hidden",
    },
    fixedPane: { width: 200, zIndex: 1 },
    fixedHeader: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    fixedRow: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
    alternateRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    fixedLastRow: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 8,
    },
    rankColumn: { width: 34, textAlign: "center" },
    playerHeader: { flex: 1 },
    playerDetails: { flex: 1, gap: 3, paddingRight: 8 },
    playerName: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
    },
    teamIdentity: { flexDirection: "row", alignItems: "center", gap: 5 },
    teamLogo: { width: 17, height: 17 },
    teamCode: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
    },
    headshot: {
      width: 38,
      height: 38,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 100,
    },
    statsScroller: { flex: 1 },
    statsContent: { minWidth: "100%" },
    statsHeader: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    statsRow: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
    statsLastRow: {
      borderBottomWidth: 0,
    },

    statColumn: { width: 72, textAlign: "center" },
    headerText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 13,
    },
    cellText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      fontVariant: ["tabular-nums"],
    },
    statText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      fontVariant: ["tabular-nums"],
    },
    loadingFooter: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 60,
    },
    emptyRow: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 80,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: Colors.midTone,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    emptyText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
    },
  });
