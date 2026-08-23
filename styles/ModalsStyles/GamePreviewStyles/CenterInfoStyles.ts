import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const centerInfoStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    fontFamily: Fonts.REGULAR,
    fontSize: 16,
    color: Colors.dark.white,
  },
  period: {
    fontFamily: Fonts.MEDIUM,
    fontSize: 18,
    color: Colors.dark.white,
  },
  clock: {
    fontFamily: Fonts.MEDIUM,
    fontSize: 18,
    color: Colors.dark.white,
    textAlign: "center",
  },
  downAndDistance: {
    marginTop: 2,
    fontFamily: Fonts.MEDIUM,
    fontSize: 10,
    color: Colors.dark.white,
    textAlign: "center",
  },
  finalText: {
    fontFamily: Fonts.MEDIUM,
    fontSize: 18,
    color: Colors.dark.lightRed,
    textAlign: "center",
  },
  headlineText: {
    position: "absolute",
    top: -50,
    width: 140,
    fontFamily: Fonts.REGULAR,
    fontSize: 10,
    color: Colors.midTone,
    textAlign: "center",
  },
  logoWrapper: {
    position: "relative",
    width: 100,
    height: 60,
  },
  logo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 60,
    resizeMode: "contain",
  },
  gameInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  headline: {
    position: "absolute",
    top: -48,
    fontFamily: Fonts.LIGHT,
    fontSize: 12,
    color: Colors.dark.white,
  },
  broadcast: {
    fontFamily: Fonts.REGULAR,
    fontSize: 12,
    color: Colors.dark.white,
    textAlign: "center",
  },
  infoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statusDivider: {
    alignSelf: "center",
    width: 1,
    height: 18,
    backgroundColor: Colors.dark.white,
  },
  finalStatusDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.dark.lightRed,
  },
});
