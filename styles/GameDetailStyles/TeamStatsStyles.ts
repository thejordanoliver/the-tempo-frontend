import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 80;

export const GameTeamStatsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
    },
    logosRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
    },
    teamContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 32,
      height: 32,
      resizeMode: "contain",
    },
    teamLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    statSection: {
      height: ROW_HEIGHT,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },

    statLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
      paddingHorizontal: 12,
    },

    barContainerLeft: {
      flex: 1,
      alignItems: "flex-start",
      marginLeft: 12,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    barContainerRight: {
      flex: 1,
      alignItems: "flex-end",
      marginRight: 12,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    bar: {
      justifyContent: "center",
      height: 8,
      borderRadius: 100,
    },

    barText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    showMoreLessContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },
    showMoreLess: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
