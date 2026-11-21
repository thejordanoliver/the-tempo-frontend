import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const ChampionshipBannerStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginVertical: 16,
  },

  bannerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 165,
  },

  bannerFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  bannerOutline: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  contentOverlay: {
    position: "absolute",
    top: 16,
    alignItems: "center",
    width: "100%",
  },

  yearText: {
    marginTop: 4,
    fontFamily: Fonts.BOLD,
    fontSize: 22,
    color: Colors.white,
  },

  teamLogo: {
    width: 40,
    height: 40,
    marginTop: 8,
    resizeMode: "contain",
  },

  leagueLabel: {
    width: 100,
    fontFamily: Fonts.BOLD,
    fontSize: 12,
    color: Colors.white,
    textAlign: "center",
  },
});
