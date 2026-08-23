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
    fontFamily: Fonts.REGULAR,
    fontSize: 14,
    color: Colors.white,
    textAlign: "center",
  },

  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  scoreWrapper: {
    alignItems: "center",
    justifyContent: "center",
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
    opacity: 0.7,
    fontFamily: Fonts.REGULAR,
    color: Colors.white,
  },

  teamValue: {
    fontFamily: Fonts.BOLD,
    color: Colors.white,
  },
  bonus: {
    position: "absolute",
    bottom: -10,
    marginTop: 2,
    fontFamily: Fonts.MEDIUM,
    fontSize: 8,
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
    marginHorizontal: 2,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  fighterContainer: {
    alignItems: "center",
  },

  fighter: {
    width: 50,
    height: 50,
  },

  fighterImageContainer: {
    alignItems: "center",
    width: 50,
    height: 50,
    paddingTop: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 100,
    overflow: "hidden",
  },
  fighterName: {
    fontFamily: Fonts.REGULAR,
    fontSize: 14,
    color: Colors.white,
    textAlign: "center",
  },

  winnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
