import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const isSmallGameWidgetLayout = (height: number, width: number) =>
  width < 260 || height < 180;

export const gameWidgetStyles = (
  isDark: boolean,
  height: number,
  width: number,
) => {
  const w = width;
  const h = height;
  const isSmallLayout = isSmallGameWidgetLayout(height, width);

  // When height > width (tall widget), height becomes the dominant scale driver.
  // When width >= height (wide/square widget), width drives layout as before.
  // Using the larger dimension means content grows proportionally in both axes.
  const dominant = Math.max(w, h);

  // 1% of the dominant dimension, clamped generously so tall widgets fill space.
  const unit = clamp(dominant / 100, 1.5, 9);

  // Logo scales with the shorter of the two so it never overflows horizontally,
  // but the envelope is wider to allow filling vertical space.
  const logo = isSmallLayout
    ? clamp(Math.min(w * 0.14, h * 0.2), 26, 34)
    : clamp(Math.min(w * 0.18, h * 0.22), 40, 50);
  const scoreFz = isSmallLayout
    ? clamp(Math.min(w * 0.12, h * 0.18), 22, 30)
    : clamp(unit * 5.5, 30, 60);
  const recordFz = isSmallLayout
    ? clamp(Math.min(w * 0.07, h * 0.11), 14, 18)
    : clamp(unit * 3.2, 18, 32);
  const nameFz = isSmallLayout
    ? clamp(Math.min(w * 0.065, h * 0.1), 13, 16)
    : clamp(unit * 2.4, 10, 24);
  const rankFz = isSmallLayout
    ? clamp(Math.min(w * 0.055, h * 0.08), 11, 14)
    : clamp(unit * 1.8, 9, 18);
  const infoFz = isSmallLayout
    ? clamp(Math.min(w * 0.065, h * 0.1), 13, 16)
    : clamp(unit * 20, 14, 18);
  const metaFz = isSmallLayout
    ? clamp(Math.min(w * 0.055, h * 0.085), 12, 15)
    : clamp(unit * 2.8, 11, 28);
  const gap = isSmallLayout ? clamp(w * 0.035, 6, 10) : clamp(w * 0.04, 10, 28);
  const divH = isSmallLayout
    ? clamp(unit * 2.8, 12, 18)
    : clamp(unit * 3.5, 14, 44);

  // Vertical padding scales with height so content isn't a tiny island on tall
  // widgets — a larger h fraction gives natural breathing room at the edges.
  const paddingV = isSmallLayout
    ? clamp(h * 0.035, 5, 8)
    : clamp(h * 0.08, 8, h * 0.15);
  const paddingH = isSmallLayout ? clamp(w * 0.045, 8, 12) : 0;
  const teamNameMaxWidth = Math.max(w - logo - scoreFz * 3 - paddingH * 2, 64);

  return StyleSheet.create({
    container: {
      width: "100%",
      height,
      justifyContent: isSmallLayout ? "flex-start" : "center",
      paddingVertical: paddingV,
      paddingHorizontal: paddingH,
      overflow: "hidden",
    },

    wrapper: {
      flex: isSmallLayout ? 1 : undefined,
      width: "100%",
      flexDirection: isSmallLayout ? "column" : "row",
      alignItems: isSmallLayout ? "stretch" : "center",
      justifyContent: "center",
      gap: isSmallLayout ? clamp(h * 0.018, 2, 5) : 0,
    },

    /* -------- TEAM SECTIONS -------- */

    awaySection: {
      flex: isSmallLayout ? 0 : 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      minHeight: isSmallLayout ? clamp(h * 0.22, 32, 42) : undefined,
      minWidth: 0,
      width: isSmallLayout ? "100%" : undefined,
    },

    homeSection: {
      flex: isSmallLayout ? 0 : 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      minHeight: isSmallLayout ? clamp(h * 0.22, 32, 42) : undefined,
      minWidth: 0,
      width: isSmallLayout ? "100%" : undefined,
    },

    teamWrapper: {
      flexDirection: isSmallLayout ? "row" : "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: isSmallLayout ? 1 : undefined,
      minWidth: 0,
    },

    teamLogo: {
      width: logo,
      height: logo,
      marginRight: isSmallLayout ? clamp(w * 0.025, 4, 8) : 0,
      resizeMode: "contain",
    },

    awayPossession: {
      ...(isSmallLayout
        ? { position: "relative" as const }
        : { position: "absolute" as const, bottom: -(logo * 0.4) }),
      width: logo * 0.52,
      height: logo * 0.52,
      marginTop: isSmallLayout ? 2 : 0,
      marginLeft: logo * 0.2,
      resizeMode: "contain",
    },

    homePossession: {
      ...(isSmallLayout
        ? { position: "relative" as const }
        : { position: "absolute" as const, bottom: -(logo * 0.4) }),
      width: logo * 0.52,
      height: logo * 0.52,
      marginTop: isSmallLayout ? 2 : 0,
      marginRight: isSmallLayout ? 0 : logo * 0.2,
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
      marginTop: isSmallLayout ? 0 : clamp(unit * 0.4, 2, 8),
      flexShrink: isSmallLayout ? 1 : undefined,
      maxWidth: isSmallLayout ? teamNameMaxWidth : undefined,
    },
    teamRank: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: rankFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: isSmallLayout ? 0 : clamp(unit * 0.3, 2, 6),
    },

    awayScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: isSmallLayout ? gap : gap * 1.5,
      minWidth: isSmallLayout ? scoreFz * 1.25 : recordFz * 2.5,
      textAlign: "center",
    },

    homeScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: isSmallLayout ? gap : 0,
      marginRight: isSmallLayout ? 0 : gap * 1.5,
      minWidth: isSmallLayout ? scoreFz * 1.25 : recordFz * 2.5,
      textAlign: "center",
    },

    awayRecord: {
      fontFamily: Fonts.OSBOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: isSmallLayout ? gap : gap * 1.5,
      minWidth: isSmallLayout ? recordFz * 2.8 : recordFz * 2.5,
      textAlign: "center",
    },

    homeRecord: {
      fontFamily: Fonts.OSBOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: isSmallLayout ? gap : 0,
      marginRight: isSmallLayout ? 0 : gap * 1.5,
      minWidth: isSmallLayout ? recordFz * 2.8 : recordFz * 2.5,
      textAlign: "center",
    },

    /* -------- CENTER INFO -------- */

    headlineContainer: {
      width: "100%",
      ...(isSmallLayout
        ? { marginBottom: clamp(h * 0.01, 2, 4) }
        : { top: 0, position: "absolute" as const }),
    },
    headline: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    gameInfo: {
      flex: isSmallLayout ? 0 : 1,
      flexShrink: 1,
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      minHeight: isSmallLayout ? clamp(h * 0.18, 26, 36) : undefined,
      minWidth: 0,
      width: isSmallLayout ? "100%" : undefined,
      flexDirection: isSmallLayout ? "row" : "column",
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
    },

    dateTime: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: metaFz,
      textAlign: "center",
      flexShrink: 1,
    },

    period: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: infoFz,
      textAlign: "center",
      flexShrink: 1,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: infoFz,
      textAlign: "center",
      flexShrink: 1,
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: infoFz,
      textAlign: "center",
      flexShrink: 1,
    },
    downAndDistance: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: metaFz,
      textAlign: "center",
      flexShrink: 1,
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
      flexShrink: 1,
      maxWidth: "100%",
    },
    leadersContainer: {
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
  });
};
