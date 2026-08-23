import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const lastFiveGameStyles = (isDark: boolean) => {
  const baseTextColor = isDark ? Colors.white : Colors.black;

  return {
    colors: {
      win: isDark ? Colors.dark.leafGreen : Colors.light.green,
      loss: isDark ? Colors.dark.lightRed : Colors.light.red,
      tie: Colors.midTone,
      text: baseTextColor,
    },
    ...StyleSheet.create({
      container: {
        flex: 1,
      },
      wrapper: {
        borderWidth: 1,
        borderColor: Colors.midTone,
        borderRadius: 8,
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
        fontFamily: Fonts.MEDIUM,
        fontSize: 16,
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
        marginTop: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderColor: Colors.midTone,
      },
      emptyContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      },
      empty: {
        fontFamily: Fonts.REGULAR,
        fontSize: 20,
        color: Colors.midTone,
        textAlign: "center",
      },
      cell: {
        flex: 1,
        fontFamily: Fonts.REGULAR,
        fontSize: 14,
        color: baseTextColor,
        textAlign: "center",
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
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      matchupText: {
        fontFamily: Fonts.REGULAR,
        color: baseTextColor,
      },
      opponentLogo: {
        width: 18,
        height: 18,
        marginLeft: 4,
        resizeMode: "contain",
      },
    }),
  };
};
