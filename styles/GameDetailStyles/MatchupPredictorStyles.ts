import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const MatchupPredictorStyles = (isDark: boolean) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      justifyContent: "center",
    },
    wrapper: {
      justifyContent: "center",
      gap: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    teamHeader: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
    },
    homeHeader: {
      justifyContent: "flex-end",
    },
    teamCopy: {
      flex: 1,
      minWidth: 0,
    },
    homeCopy: {
      alignItems: "flex-end",
    },
    logoBadge: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: "hidden",
    },
    logo: {
      width: 32,
      height: 32,
      resizeMode: "contain",
    },
    teamCode: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 16,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    trackArea: {
      position: "relative",
      justifyContent: "center",
      height: 58,
    },
    logoMarker: {
      position: "absolute",
      top: 10,
      zIndex: 2,
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 23,
      overflow: "hidden",
      transform: [{ translateX: -10 }],
    },
    homeLogoMarker: {
      borderColor: Colors.white,
    },
    markerLogo: {
      width: 28,
      height: 28,
    },
    track: {
      position: "relative",
      height: 8,
      borderRadius: 999,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
      overflow: "hidden",
    },
    awayMeter: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
    },
    awayStripeRow: {
      flexDirection: "row",
      gap: 3,
      height: "100%",
      minWidth: 360,
    },
    awayStripe: {
      width: 2,
      height: "100%",
      backgroundColor: isDark ? Colors.white : Colors.black,
      opacity: 0.75,
      transform: [{ skewX: "-18deg" }],
    },
    homeMeter: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.white : "transparent",
      opacity: 0.92,
    },
    percentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    homePercent: {
      alignItems: "flex-end",
    },
    chanceText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 22,
      lineHeight: 27,
      color: isDark ? Colors.white : Colors.black,
    },
    percentLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 15,
      color: Colors.midTone,
    },
    edgeLabel: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderRadius: 999,
      borderColor: isDark ? Colors.white : Colors.black,
      overflow: "hidden",
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 11,
      lineHeight: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
