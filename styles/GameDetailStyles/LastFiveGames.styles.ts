import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
export const getStyles = (isDark: boolean, lighter: boolean) => {
  const baseTextColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;

  return {
    colors: {
      win: lighter
        ? Colors.dark.limeGreen
        : isDark
        ? Colors.dark.limeGreen
        : Colors.light.green,
      loss: lighter
        ? Colors.dark.lightRed
        : isDark
        ? Colors.dark.lightRed
        : Colors.light.red,
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
          ? Colors.midTone
          : isDark
          ? Colors.midTone
          : Colors.midTone,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomColor: lighter
          ? Colors.lightGray
          : isDark
          ? Colors.darkGray
          : Colors.lightGray,
      },
      headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderColor: Colors.midTone,
        marginVertical: 6,
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
        marginLeft: 4,
      },
      empty: {
        textAlign: "center",
        color: Colors.midTone,
        marginTop: 12,
        fontFamily: Fonts.OSREGULAR,
      },
    }),
  };
};
