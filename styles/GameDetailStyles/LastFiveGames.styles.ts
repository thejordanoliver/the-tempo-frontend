import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";

export const getStyles = (isDark: boolean, lighter: boolean) => {
  const baseTextColor = lighter ? "#fff" : isDark ? "#fff" : "#1d1d1d";

  return {
    colors: {
      win: lighter ? "#71ff76ff" : "#4caf50",
      loss: lighter ? "#ff6363ff" : "#f44336",
      text: baseTextColor,
    },
    ...StyleSheet.create({
      container: {
        flex: 1,
      },
      tabWrapper: {
        alignSelf: "center",
      },
      tabLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      },
      tabLogo: {
        width: 28,
        height: 28,
        resizeMode: "contain",
      },
      tabText: {
        fontSize: 16,
        fontFamily: Fonts.OSMEDIUM,
      },
      tabTextSelected: {
        color: baseTextColor,
      },
      tabTextUnselected: {
        color: lighter
          ? "#ccc"
          : isDark
          ? "#888"
          : "rgba(0,0,0,0.5)",
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
      },
      headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderColor: "#aaa",
        marginBottom: 6,
      },
      cell: {
        fontSize: 14,
        flex: 1,
        textAlign: "center",
        fontFamily: Fonts.OSREGULAR,
        color: baseTextColor,
      },
      team: {
  flex: 1.5,
  flexDirection: "row",
  alignItems: "center",
},
      date: {
        flex: 1.2,
      },
      teamHeader: {
        flex: 2,
      },
      teamWithLogo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 2,
      },
      matchupText: {
        fontFamily: Fonts.OSREGULAR,
        color: baseTextColor,
      },
      opponentLogo: {
        width: 18,
        height: 18,
        resizeMode: "contain",
        marginRight: 6,
        marginTop: 1,
      },
      empty: {
        textAlign: "center",
        color: "#999",
        marginTop: 12,
        fontFamily: Fonts.OSREGULAR,
      },
    }),
  };
};
