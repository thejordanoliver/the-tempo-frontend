import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";
import { Colors } from "constants/Colors";

export const gameOddsStyles = (isDark:  boolean) => StyleSheet.create({
   wrapper: {
    borderColor: Colors.midTone,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 12,
    textAlign: "center",
  },
  headerTeamText: {
    fontSize: 12,
    textAlign: "left",
    paddingLeft: 4,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamInfo: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 4,
  },
  teamLogo: {
    width: 28,
    height: 28,
  },
  teamName: {
    fontSize: 14,
  },
  oddsText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  bookmaker: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  bookmakerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtext: {
    color: Colors.midTone,
    fontSize: 12,
    fontFamily: Fonts.OSLIGHT,
  },
   errorText: {
        fontFamily: Fonts.OSREGULAR,
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
        color: isDark ? Colors.dark.lightRed : Colors.light.red,
      },
});