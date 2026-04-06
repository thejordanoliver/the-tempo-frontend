import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const lastFiveGameStyles = (isDark: boolean) => {
  const baseTextColor = isDark ? Colors.white : Colors.black;

  return {
    colors: {
      win: isDark ? Colors.dark.leafGreen : Colors.light.green,
      loss: isDark ? Colors.dark.lightRed : Colors.light.red,
      text: baseTextColor,
    },
    ...StyleSheet.create({
      container: {
        flex: 1,
      },
      wrapper: {
        borderColor: Colors.midTone,
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 12,
        overflow: "hidden",
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
        color: isDark ? Colors.midTone : Colors.midTone,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      },
      headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderColor: Colors.midTone,
        marginTop: 8,
      },
      emptyContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      },
      empty: {
        textAlign: "center",
        fontSize: 20,
        fontFamily: Fonts.OSREGULAR,
        color: Colors.midTone,
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
    }),
  };
};
