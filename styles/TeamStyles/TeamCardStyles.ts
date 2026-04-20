import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const teamCardStyles = StyleSheet.create({
  teamCard: {
    borderRadius: 8,
    overflow: "hidden",
  },
  teamName: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 12,
    textAlign: "center",
  },
  logoWrapper: {
    position: "relative",
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  sportTag: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 100,
    zIndex: 2,
  },
  sportTagText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.OSBOLD,
  },
});
