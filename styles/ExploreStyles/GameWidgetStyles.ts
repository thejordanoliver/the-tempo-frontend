import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const isSmallGameWidgetLayout = (height: number, width: number) =>
  width < 260;

export const gameWidgetStyles = (
  isDark: boolean,
  height: number,
  width: number,
) => {
  const w = width;
  const h = height;
  const isSmallLayout = isSmallGameWidgetLayout(height, width);
  const isLargeLayout = width >= 260 && height >= 320;

  // Scale from the constrained axis. Using the taller axis made narrow/tall
  // widgets grow past their available width, while using width alone made
  // wide/short widgets overflow vertically.
  const constrained = Math.min(w, h);
  const unit = clamp(constrained / 100, 1.5, 5);

  // Logo scales with the shorter of the two so it never overflows horizontally,
  // but the envelope is wider to allow filling vertical space.
  const logo = isSmallLayout
    ? clamp(Math.min(w * 0.14, h * 0.2), 26, 34)
    : isLargeLayout
      ? clamp(Math.min(w * 0.15, h * 0.14), 50, 56)
      : clamp(Math.min(w * 0.14, h * 0.2), 40, 54);
  const scoreFz = isSmallLayout
    ? clamp(Math.min(w * 0.12, h * 0.18), 20, 26)
    : isLargeLayout
      ? clamp(w * 0.115, 28, 34)
      : clamp(constrained * 0.13, 36, 46);
  const recordFz = isSmallLayout
    ? clamp(Math.min(w * 0.07, h * 0.11), 13, 18)
    : isLargeLayout
      ? clamp(w * 0.06, 20, 24)
      : clamp(constrained * 0.08, 16, 26);
  const nameFz = isSmallLayout
    ? clamp(Math.min(w * 0.09, h * 0.12), 14, 18)
    : isLargeLayout
      ? clamp(w * 0.045, 16, 18)
      : clamp(constrained * 0.065, 16, 20);
  const rankFz = isSmallLayout
    ? clamp(Math.min(w * 0.055, h * 0.08), 10, 13)
    : isLargeLayout
      ? clamp(w * 0.04, 13, 17)
      : clamp(constrained * 0.04, 10, 16);
  const infoFz = isSmallLayout
    ? clamp(Math.min(w * 0.065, h * 0.1), 11, 14)
    : isLargeLayout
      ? clamp(w * 0.04, 14, 16)
      : clamp(constrained * 0.055, 12, 16);
  const metaFz = isSmallLayout
    ? clamp(Math.min(w * 0.055, h * 0.085), 10, 13)
    : isLargeLayout
      ? clamp(w * 0.034, 12, 14)
      : clamp(constrained * 0.045, 10, 15);
  const gap = isSmallLayout
    ? clamp(w * 0.035, 6, 10)
    : isLargeLayout
      ? clamp(w * 0.035, 10, 14)
      : clamp(w * 0.04, 10, 28);
  const divH = isSmallLayout
    ? clamp(unit * 2.8, 12, 18)
    : clamp(unit * 3.5, 16, 44);

  // Vertical padding scales with height so content isn't a tiny island on tall
  // widgets — a larger h fraction gives natural breathing room at the edges.
  const paddingV = isSmallLayout
    ? clamp(h * 0.035, 5, 8)
    : clamp(h * 0.08, 8, h * 0.15);
  const paddingH = isSmallLayout
    ? clamp(w * 0.045, 8, 12)
    : clamp(w * 0.035, 12, 24);
  const teamNameMaxWidth = Math.max(w - logo - scoreFz * 3 - paddingH * 2, 64);
  const wideTeamNameMaxWidth = Math.max(
    (w - paddingH * 2) * 0.3 - gap - recordFz * 2.5,
    48,
  );

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
      flex: 1,
      flexDirection: isSmallLayout ? "column" : "row",
      alignItems: isSmallLayout ? "stretch" : "center",
      justifyContent: isSmallLayout ? "space-evenly" : "center",
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
      flexShrink: 1,
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
      flexShrink: 1,
      maxWidth: isSmallLayout ? teamNameMaxWidth : wideTeamNameMaxWidth,
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
      marginLeft: isSmallLayout ? gap : gap * (isLargeLayout ? 1.2 : 1.5),
      fontFamily: Fonts.BOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "center",
    },

    homeScore: {
      minWidth: isSmallLayout ? scoreFz * 1.25 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : 0,
      marginRight: isSmallLayout ? 0 : gap * (isLargeLayout ? 1.2 : 1.5),
      fontFamily: Fonts.BOLD,
      fontSize: scoreFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "center",
    },

    awayRecord: {
      minWidth: isSmallLayout ? recordFz * 2.8 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : gap * (isLargeLayout ? 1.2 : 1.5),
      fontFamily: Fonts.BOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "right",
    },

    homeRecord: {
      minWidth: isSmallLayout ? recordFz * 2.8 : recordFz * 2.5,
      marginLeft: isSmallLayout ? gap : 0,
      marginRight: isSmallLayout ? 0 : gap * (isLargeLayout ? 1.2 : 1.5),
      fontFamily: Fonts.BOLD,
      fontSize: recordFz,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "right",
    },

    /* -------- CENTER INFO -------- */

    headlineContainer: {
      ...(isSmallLayout
        ? { marginBottom: clamp(h * 0.01, 2, 4) }
        : { top: 0, left: 0, right: 0, position: "absolute" as const }),
    },
    headline: {
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    gameInfo: {
      flex: isSmallLayout ? 0 : 0.9,
      flexShrink: 1,
      flexDirection: isSmallLayout ? "row" : "column",
      alignItems: "center",
      justifyContent: isSmallLayout ? "space-between" : "center",
      width: isSmallLayout ? "100%" : undefined,
      minWidth: 0,
      minHeight: isSmallLayout ? clamp(h * 0.18, 26, 36) : undefined,
    },

    infoWrapper: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
    },

    dateTime: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
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
      width: 0.5,
      height: divH,
      marginHorizontal: clamp(gap * 0.2, 3, 12),
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    finalDivder: {
      width: StyleSheet.hairlineWidth,
      height: divH,
      marginHorizontal: clamp(gap * 0.1, 3, 12),
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    broadcast: {
      flexShrink: 1,
      maxWidth: "100%",
      fontFamily: Fonts.REGULAR,
      fontSize: metaFz,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    outsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    basesContainer: {
      position: "absolute",
      top: clamp(paddingV, 8, 16),
      right: paddingH,
    },
  });
};
