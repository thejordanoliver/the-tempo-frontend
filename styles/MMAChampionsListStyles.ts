import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const MMAChampionListStyles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 80,
  },

  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  itemSeparator: {
    height: 0,
  },
});

export const MMAChampionItemStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
      overflow: "hidden",
    },

    cardGradient: {
      position: "relative",
      gap: 18,
      padding: 18,
    },

    accentBar: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: 4,
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },

    divisionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      paddingLeft: 4,
    },

    divisionEyebrow: {
      marginBottom: 2,
      fontFamily: Fonts.BOLD,
      fontSize: 9,
      letterSpacing: 2,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    divisionLabel: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      letterSpacing: 0.4,
      color: isDark ? Colors.white : Colors.black,
      textTransform: "uppercase",
    },

    titleType: {
      marginTop: 2,
      fontFamily: Fonts.MEDIUM,
      fontSize: 9,
      letterSpacing: 1.1,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    fighterSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingLeft: 4,
    },

    headshotContainer: {
      width: 86,
      height: 86,
      flexShrink: 0,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.midTone : Colors.midTone,
    },

    headshot: {
      width: "100%",
      height: "100%",
    },

    headshotFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    headshotInitial: {
      fontFamily: Fonts.BOLD,
      fontSize: 34,
      color: isDark ? Colors.white : Colors.black,
    },

    fighterInfo: {
      flex: 1,
      minWidth: 0,
      gap: 8,
    },

    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    nameContainer: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },

    fighterName: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.4,
      color: isDark ? Colors.white : Colors.black,
    },

    nickname: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    flagContainer: {
      width: 42,
      height: 28,
      overflow: "hidden",
    },

    flag: {
      width: "100%",
      height: "100%",
    },

    countryRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    countryText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statsContainer: {
      flexDirection: "row",
      alignItems: "stretch",
      marginLeft: 4,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.045)",
    },

    statItem: {
      flex: 1,
      minWidth: 0,
      gap: 3,
      paddingHorizontal: 8,
    },

    statLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 9,
      letterSpacing: 0.9,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },

    statDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
    },
  });
