import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const gameWidgetStyles = (
  isDark: boolean,
  height: number,
  width: number,
) => {
  const w = width;
  const h = height;

  // When height > width (tall widget), height becomes the dominant scale driver.
  // When width >= height (wide/square widget), width drives layout as before.
  // Using the larger dimension means content grows proportionally in both axes.
  const dominant = Math.max(w, h);

  // 1% of the dominant dimension, clamped generously so tall widgets fill space.
  const unit = clamp(dominant / 100, 1.5, 9);

  // Logo scales with the shorter of the two so it never overflows horizontally,
  // but the envelope is wider to allow filling vertical space.
  const logo = clamp(Math.min(w * 0.18, h * 0.22), 36, 110);
  const scoreFz = clamp(unit * 5.5, 20, 60);
  const recordFz = clamp(unit * 3.2, 18, 32);
  const nameFz = clamp(unit * 2.4, 10, 24);
  const rankFz = clamp(unit * 1.8, 9, 18);
  const infoFz = clamp(unit * 2.8, 11, 28);
  const metaFz = clamp(unit * 1.8, 14, 18);
  const gap = clamp(w * 0.04, 8, 28);
  const divH = clamp(unit * 3.5, 14, 44);

  // Vertical padding scales with height so content isn't a tiny island on tall
  // widgets — a larger h fraction gives natural breathing room at the edges.
  const paddingV = clamp(h * 0.08, 8, h * 0.15);
  const paddingH = clamp(w * 0.04, 8, 32);

  return StyleSheet.create({
    container: {
      width: "100%",
      height,
      justifyContent: "center",
      paddingHorizontal: paddingH,
      paddingVertical: paddingV,
    },

    wrapper: {
      flexDirection: "row",
      alignItems: "center",
    },

    /* -------- TEAM SECTIONS -------- */

    awaySection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    homeSection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    teamWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },

    teamLogo: {
      width: logo,
      height: logo,
      resizeMode: "contain",
    },

    awayPossession: {
      position: "absolute",
      bottom: -(logo * 0.32),
      width: logo * 0.52,
      height: logo * 0.52,
      marginLeft: logo * 0.45,
      resizeMode: "contain",
    },

    homePossession: {
      position: "absolute",
      bottom: -(logo * 0.32),
      width: logo * 0.52,
      height: logo * 0.52,
      marginRight: logo * 0.45,
      resizeMode: "contain",
    },

    scorePossession: {
      alignItems: "center",
      justifyContent: "center",
    },

    teamName: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: nameFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginTop: clamp(unit * 0.4, 2, 8),
    },
    teamRank: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: rankFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: clamp(unit * 0.3, 2, 6),
    },

    awayScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: gap,
      minWidth: scoreFz * 1.2,
      textAlign: "center",
    },

    homeScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginRight: gap,
      minWidth: scoreFz * 1.2,
      textAlign: "center",
    },

    awayRecord: {
      fontFamily: Fonts.OSBOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: gap * 1,
      minWidth: recordFz * 2.5,
      textAlign: "center",
    },

    homeRecord: {
      fontFamily: Fonts.OSBOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginRight: gap * 1,
      minWidth: recordFz * 2.5,
      textAlign: "center",
    },

    /* -------- CENTER INFO -------- */

    headlineContainer: {
      width: "100%",
    },
    headline: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    gameInfo: {
      flex: 1,
      flexShrink: 1,
      alignItems: "center",
      justifyContent: "center",
      minWidth: infoFz * 4,
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    dateTime: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: metaFz,
      textAlign: "center",
    },

    period: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: infoFz,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: infoFz,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: infoFz,
      textAlign: "center",
    },
    downAndDistance: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: metaFz,
      textAlign: "center",
    },

    divider: {
      marginHorizontal: clamp(gap * 0.2, 3, 12),
      height: divH,
      width: 1,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    finalDivder: {
      marginHorizontal: clamp(gap * 0.4, 3, 12),
      height: divH,
      width: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
};
