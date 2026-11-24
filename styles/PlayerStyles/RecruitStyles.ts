import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
import { sportsCardBackgroundStyles } from "../SportsCardBackgroundStyles";

export const RecruitListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 100,
    },
    headerLayer: {
      position: "relative",
      zIndex: 1000,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
      elevation: 1000,
    },
    list: {
      zIndex: 1,
      elevation: 1,
    },
    headerContainer: {
      position: "relative",
      zIndex: 1000,
      marginBottom: 12,
      paddingHorizontal: 12,
      overflow: "visible",
      elevation: 1000,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    dropdownGroup: {
      position: "relative",
      zIndex: 1001,
      flexDirection: "row",
      gap: 8,
      overflow: "visible",
      elevation: 1001,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
      paddingHorizontal: 20,
    },
    errorText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    emptyText: {
      marginTop: 20,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    helperText: {
      marginTop: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });

export const RecruitingTeamCardStyles = (isDark: boolean) => {
  const bgColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  return StyleSheet.create({
    cardWrapper: {
      position: "relative",
      minHeight: 116,
      marginHorizontal: 12,
      marginBottom: 10,
      borderRadius: 8,
      backgroundColor: bgColor,
      overflow: "hidden",
    },

    backgroundLogo: sportsCardBackgroundStyles.backgroundLogo,
    cardGradient: sportsCardBackgroundStyles.cardGradient,

    cardContent: {
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    rank: {
      fontFamily: Fonts.BOLD,
      fontSize: 30,
      lineHeight: 34,
      color: isDark ? Colors.white : Colors.black,
    },

    rankChangePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: bgColor,
    },

    rankChangePillUp: {
      backgroundColor: "rgba(34,197,94,0.14)",
    },

    rankChangePillDown: {
      backgroundColor: "rgba(239,68,68,0.14)",
    },

    rankChangeText: {
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    rankChangeTextUp: {
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },

    rankChangeTextDown: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    teamBlock: {
      flex: 1,
      minWidth: 0,
    },

    teamName: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      lineHeight: 26,
      color: isDark ? Colors.white : Colors.black,
    },

    points: {
      marginTop: 3,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? Colors.dark.transparentGray
        : Colors.light.transparentGray,
    },

    statItem: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    statLabelWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 2,
    },

    statValue: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    statLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 26,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
};
