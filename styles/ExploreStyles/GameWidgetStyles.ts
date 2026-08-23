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
    ? clamp(Math.min(w * 0.14, h * 0.2), 30, 30)
    : clamp(Math.min(w * 0.18, h * 0.22), 60, 60);
  const scoreFz = isSmallLayout
    ? clamp(Math.min(w * 0.12, h * 0.18), 20, 24)
    : clamp(unit * 5.5, 30, 60);
  const recordFz = isSmallLayout
    ? clamp(Math.min(w * 0.07, h * 0.11), 14, 18)
    : clamp(unit * 3.2, 18, 32);
  const nameFz = isSmallLayout
    ? clamp(Math.min(w * 0.12, h * 0.18), 16, 16)
    : clamp(unit * 5.5, 30, 60);
  const rankFz = isSmallLayout
    ? clamp(Math.min(w * 0.055, h * 0.08), 11, 14)
    : clamp(unit * 1.8, 9, 18);
  const infoFz = isSmallLayout
    ? clamp(Math.min(w * 0.065, h * 0.1), 12, 12)
    : clamp(unit * 20, 14, 18);
  const metaFz = isSmallLayout
    ? clamp(Math.min(w * 0.055, h * 0.085), 12, 12)
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
      justifyContent: isSmallLayout ? "flex-start" : "center",
      width: "100%",
      height,
      paddingVertical: paddingV,
      paddingHorizontal: paddingH,
      overflow: "hidden",
    },

    wrapper: {
      flex: isSmallLayout ? 1 : undefined,
      flexDirection: isSmallLayout ? "column" : "row",
      alignItems: isSmallLayout ? "stretch" : "center",
      justifyContent: "center",
      gap: isSmallLayout ? clamp(h * 0.018, 2, 5) : 0,
      width: "100%",
    },

    /* -------- TEAM SECTIONS -------- */

    awaySection: {
      flex: isSmallLayout ? 0 : 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      width: isSmallLayout ? "100%" : undefined,
      minWidth: 0,
      minHeight: isSmallLayout ? clamp(h * 0.22, 32, 42) : undefined,
    },

    homeSection: {
      flex: isSmallLayout ? 0 : 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      width: isSmallLayout ? "100%" : undefined,
      minWidth: 0,
      minHeight: isSmallLayout ? clamp(h * 0.22, 32, 42) : undefined,
    },

    teamWrapper: {
      flexShrink: isSmallLayout ? 1 : undefined,
      flexDirection: isSmallLayout ? "row" : "column",
      alignItems: "center",
      justifyContent: "center",
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
      flexShrink: isSmallLayout ? 1 : undefined,
      maxWidth: isSmallLayout ? teamNameMaxWidth : undefined,
      marginTop: isSmallLayout ? 0 : clamp(unit * 0.4, 2, 8),
      fontFamily: Fonts.REGULAR,
      fontSize: nameFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    teamRank: {
      marginTop: isSmallLayout ? 0 : clamp(unit * 0.3, 2, 6),
      fontFamily: Fonts.REGULAR,
      fontSize: rankFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    awayScore: {
      minWidth: isSmallLayout ? scoreFz * 1.25 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : gap * 1.5,
      fontFamily: Fonts.BOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "center",
    },

    homeScore: {
      minWidth: isSmallLayout ? scoreFz * 1.25 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : 0,
      marginRight: isSmallLayout ? 0 : gap * 1.5,
      fontFamily: Fonts.BOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "center",
    },

    awayRecord: {
      minWidth: isSmallLayout ? recordFz * 2.8 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : gap * 1.5,
      fontFamily: Fonts.BOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "right",
    },

    homeRecord: {
      minWidth: isSmallLayout ? recordFz * 2.8 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : 0,
      marginRight: isSmallLayout ? 0 : gap * 1.5,
      fontFamily: Fonts.BOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "right",
    },

    /* -------- CENTER INFO -------- */

    headlineContainer: {
      width: "100%",
      ...(isSmallLayout
        ? { marginBottom: clamp(h * 0.01, 2, 4) }
        : { top: 0, position: "absolute" as const }),
    },
    headline: {
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    gameInfo: {
      flex: isSmallLayout ? 0 : 1,
      flexShrink: 1,
      flexDirection: isSmallLayout ? "row" : "column",
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      width: isSmallLayout ? "100%" : undefined,
      minWidth: 0,
      minHeight: isSmallLayout ? clamp(h * 0.18, 26, 36) : undefined,
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
    },

    dateTime: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    period: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: infoFz,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    finalText: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: infoFz,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    clock: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: infoFz,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    downAndDistance: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    divider: {
      width: 1,
      height: divH,
      marginHorizontal: clamp(gap * 0.2, 3, 12),
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    finalDivder: {
      width: StyleSheet.hairlineWidth,
      height: divH,
      marginHorizontal: clamp(gap * 0.4, 3, 12),
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    broadcast: {
      flexShrink: 1,
      maxWidth: "100%",
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "right",
    },
    outsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    basesContainer: {
      position: "absolute",
      top: 12,
      right: 12,
    },
  });
};
