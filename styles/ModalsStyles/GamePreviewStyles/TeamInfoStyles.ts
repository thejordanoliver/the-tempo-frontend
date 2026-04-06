import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const TeamInfoStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  teamContainer: {
    alignItems: "center",
    gap: 4,
  },

  teamName: {
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
    textAlign: "center",
  },

  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  scoreWrapper: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },

  possessionIcon: {
    position: "absolute",
    bottom: -20,
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  teamRecord: {
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
    opacity: 0.7,
  },

  teamValue: {
    fontFamily: Fonts.OSBOLD,
    color: Colors.white,
  },
  bonus: {
    marginTop: 2,
    position: "absolute",
    bottom: -10,
    fontSize: 8,
    fontFamily: Fonts.OSMEDIUM,
    letterSpacing: 0.5,
    color: Colors.white,
    textAlign: "center",
  },

  teamRank: {
    fontSize: 10,
    color: Colors.white,
  },

  timeoutsWrapper: {
    flexDirection: "row",
    marginTop: 4,
  },

  timeoutBar: {
    width: 5,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.white,
    marginHorizontal: 2,
  },
  fighterContainer: {
    alignItems: "center",
  },

  fighter: {
    width: 50,
    height: 50,
  },

  fighterImageContainer: {
    width: 50,
    height: 50,
    paddingTop: 2,
    borderWidth: 1,
    alignItems: "center",
    borderRadius: 100,
    borderColor: Colors.lightGray,
    overflow: "hidden",
  },
  fighterName: {
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
    textAlign: "center",
  },

  winnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
