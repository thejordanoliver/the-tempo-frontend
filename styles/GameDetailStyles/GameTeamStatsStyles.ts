import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 80;

export const gameTeamStatsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
    },
    logosRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
      alignItems: "center",
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
    teamContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    teamLabel: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    statSection: {
      height: ROW_HEIGHT,
      paddingVertical: 8, // space between label and bars
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },

    statLabel: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    row: {
      flexDirection: "row",
      alignItems: "center", // center bars & values vertically
      justifyContent: "space-between", // optional: distribute left and right
      flex: 1, // take remaining vertical space
      paddingHorizontal: 12,
    },

    barContainerLeft: {
      flex: 1,
      alignItems: "flex-start",
      marginLeft: 12,
    },
    barContainerRight: {
      flex: 1,
      alignItems: "flex-end",
      marginRight: 12,
    },
    bar: {
      height: 8,
      justifyContent: "center",
      borderRadius: 100,
    },

    barText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    showMoreLessContainer: {
      paddingVertical: 12,
      justifyContent: "center",
      alignItems: "center",
      borderColor: Colors.midTone,
      borderTopWidth: StyleSheet.hairlineWidth,
      width: "100%",
    },
    showMoreLess: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
    },
  });
