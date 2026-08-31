import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const SelectionCardStyles = StyleSheet.create({
  selectionCard: {
    borderRadius: 8,
    overflow: "hidden",
  },
  teamName: {
    fontFamily: Fonts.REGULAR,
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
    zIndex: 2,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 100,
  },
  sportTagText: {
    textTransform: "uppercase",
    fontFamily: Fonts.BOLD,
    fontSize: 10,
    color: Colors.white,
  },
});
