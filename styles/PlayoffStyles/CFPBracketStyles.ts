import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 1140;

export const CARD_WIDTH = 176;
export const CARD_HEIGHT = 150;

export const LABEL_WIDTH = 200;
export const LABEL_TOP = 28;

export const BYE_CARD_WIDTH = CARD_WIDTH;
export const BYE_CARD_HEIGHT = 60;

export const CHAMPIONSHIP_CARD_WIDTH = 250;
export const CHAMPIONSHIP_CARD_HEIGHT = 280;

export const FIRST_ROUND_X = 40;
export const QUARTERFINAL_X = 430;
export const SEMIFINAL_X = 825;
export const CHAMPIONSHIP_X = 1220;

export const FIRST_ROUND_Y = [90, 350, 610, 870];
export const BYE_Y = [245, 505, 765, 1025];
export const QUARTERFINAL_Y = [165, 425, 685, 945];
export const SEMIFINAL_Y = [300, 820];
export const CHAMPIONSHIP_Y = 510;

const HORIZONTAL_SNAP_OFFSET = 20;

export const snapBracketOffsets = [
  FIRST_ROUND_X,
  QUARTERFINAL_X,
  SEMIFINAL_X,
  CHAMPIONSHIP_X,
].map((x) => Math.max(0, x - HORIZONTAL_SNAP_OFFSET));

export function getGameCardCenterY(y: number) {
  return y + CARD_HEIGHT / 2;
}

export function getByeCardCenterY(y: number) {
  return y + BYE_CARD_HEIGHT / 2;
}

export function buildMergeConnectorPath(
  topStartX: number,
  topStartY: number,
  bottomStartX: number,
  bottomStartY: number,
  endX: number,
  endY: number,
) {
  const furthestStartX = Math.max(topStartX, bottomStartX);
  const mergeX = furthestStartX + (endX - furthestStartX) * 0.5;

  return `
    M ${topStartX} ${topStartY}
    H ${mergeX}
    M ${bottomStartX} ${bottomStartY}
    H ${mergeX}
    M ${mergeX} ${topStartY}
    V ${bottomStartY}
    M ${mergeX} ${endY}
    H ${endX}
  `;
}

export const CFPBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    canvas: {
      position: "relative",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },
    retryButton: {
      width: "50%",
    },
    refreshingBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    refreshingText: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
    },
    roundHeader: {
      position: "absolute",
      top: 0,
      alignItems: "center",
    },
    roundTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      textAlign: "center",
    },
    championshipRoundTitle: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
    },

    gameCard: {
      position: "absolute",
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      justifyContent: "space-around",
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      elevation: 5,
    },
    pressedCard: {
      opacity: 0.72,
    },
    teamRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    seedText: {
      width: 20,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    teamLogo: {
      width: 34,
      height: 34,
    },
    teamCode: {
      flex: 1,
      marginLeft: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },
    seedPlaceholder: {
      width: 20,
    },
    winsBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    record: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },
    score: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },
    winnerText: {
      color: isDark ? Colors.light.gold : Colors.dark.gold,
      fontFamily: Fonts.BOLD,
    },

    headlineContainer: {
      position: "absolute",
      top: -20,
      left: 0,
      right: 0,
    },

    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statusWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    statusText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      textTransform: "uppercase",
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    headline: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
      textAlign: "center",
    },
    broadcast: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },
    period: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },
    date: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },
    clock: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },
    statusDivider: {
      width: 1,
      height: 10,
      marginHorizontal: 3,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    finalStatusDivider: {
      width: 1,
      height: 10,
      marginHorizontal: 3,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    downDistance: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },
    finalText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 8,
      backgroundColor: Colors.midTone,
    },
    byeCard: {
      position: "absolute",
      width: BYE_CARD_WIDTH,
      height: BYE_CARD_HEIGHT,
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      elevation: 5,
    },
    byeTeamContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    byeSeedContainer: {
      width: 22,
      alignItems: "center",
    },
    byeSeed: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
      textAlign: "center",
    },
    byeLogo: {
      width: 30,
      height: 30,
      marginRight: 8,
    },
    byeTeamName: {
      flex: 1,
      marginRight: 8,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },
    byeLabel: {
      marginLeft: 4,
      color: Colors.midTone,
      fontSize: 14,
      fontFamily: Fonts.BOLD,
    },

    championshipCard: {
      position: "absolute",
      width: CHAMPIONSHIP_CARD_WIDTH,
      height: CHAMPIONSHIP_CARD_HEIGHT,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark ? Colors.dark.gold : Colors.light.gold,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cfpLogo: {
      width: 62,
      height: 70,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    championshipLabel: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
      fontSize: 13,
      fontFamily: Fonts.BOLD,
      letterSpacing: 0.8,
    },
    championshipDivider: {
      width: "100%",
      height: StyleSheet.hairlineWidth,
      marginVertical: 16,
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },
    championshipTeams: {
      width: "100%",
      flex: 1,
    },
    championTeam: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    championLogo: {
      width: 42,
      height: 42,
    },
    championName: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
      fontSize: 16,
      fontFamily: Fonts.BOLD,
    },
    championSubtext: {
      marginTop: 3,
      color: isDark ? Colors.light.gold : Colors.dark.gold,
      fontSize: 8,
      fontFamily: Fonts.BOLD,
      letterSpacing: 0.7,
    },
  });
