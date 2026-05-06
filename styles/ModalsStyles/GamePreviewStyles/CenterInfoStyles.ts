import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const CenterInfoStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.dark.white,
  },
  time: {
    fontFamily: Fonts.OSREGULAR,
    color: Colors.dark.white,
    fontSize: 14,
  },
  period: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 18,
    color: Colors.dark.white,
  },
  clock: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 18,
    color: Colors.dark.white,
    textAlign: "center",
  },
  downAndDistance: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 10,
    color: Colors.dark.white,
    marginTop: 2,
    textAlign: "center",
  },
  finalText: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 14,
    color: Colors.dark.lightRed,
    textAlign: "center",
  },
  headlineText: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 10,
    color: Colors.midTone,
    textAlign: "center",
    width: 140,
    position: "absolute",
    top: -50,
  },
  logoWrapper: {
    width: 100,
    height: 60,
    position: "relative",
  },
  logo: {
    width: 100,
    height: 60,
    resizeMode: "contain",
    position: "absolute",
    top: 0,
    left: 0,
  },
  gameInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  headline: {
    fontSize: 12,
    fontFamily: Fonts.OSLIGHT,
    color: Colors.dark.white,
    position: "absolute",
    top: -48,
  },
  broadcast: {
    fontSize: 12,
    fontFamily: Fonts.OSREGULAR,
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
    height: 18,
    width: 1,
    alignSelf: "center",
    backgroundColor: Colors.dark.white,
  },
  finalStatusDivider: {
    height: 18,
    width: 1,
    backgroundColor: Colors.dark.lightRed,
  },
});
