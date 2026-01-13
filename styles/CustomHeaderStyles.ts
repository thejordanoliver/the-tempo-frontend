import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";


// ---------- STYLES ----------
export const customHeaderStyles = StyleSheet.create({
  bgImage: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
    opacity: 0.25,
    position: "absolute",
    top: -70,
    zIndex: 0,
  },
  teamHalfWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  teamHalfContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  bgLogo: {
    position: "absolute",
    width: "100%",
    height: 180,
    opacity: 0.25,
    alignSelf: "center",
    marginTop: 10,
  },
  teamCode: {
    color: Colors.white,
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
    zIndex: 2,
  },
  dividerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  dividerText: {
    color: Colors.white,
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
  },
});
