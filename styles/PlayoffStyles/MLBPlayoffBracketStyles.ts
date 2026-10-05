import { ROUND_HEADER_HEIGHT } from "@/components/Sports/Basketball/Playoffs/NBAPlayoffs/RoundHeader";
import { Colors, Fonts } from "constants/styles";
import { StyleSheet, type ViewStyle } from "react-native";
import { BYE_CARD_HEIGHT } from "./ByeTeamCardStyles";

export const MLB_BRACKET_COLUMN_WIDTH = 176;

const ROUND_HEADER_GAP = 14;
const MATCHUP_HEIGHT = 142;
const FINALS_HEIGHT = 178;
const MATCHUP_ROW_GAP = 150;
const COLUMN_GAP = 80;
const SECOND_MATCHUP_TOP = MATCHUP_HEIGHT + MATCHUP_ROW_GAP;
const CHAMPIONSHIP_TOP = SECOND_MATCHUP_TOP / 2;
const BYE_CARD_TOP = 0;
const WILD_CARD_TOP = BYE_CARD_HEIGHT + 24;
const ROUND_BODY_HEIGHT = SECOND_MATCHUP_TOP + WILD_CARD_TOP + MATCHUP_HEIGHT;
const BOTTOM_TEAM_CONNECTOR_OFFSET = 82;
const OPENING_MERGE_OFFSET =
  (BYE_CARD_TOP + BYE_CARD_HEIGHT / 2 + WILD_CARD_TOP + MATCHUP_HEIGHT / 2) / 2;
const DIVISION_SERIES_TOP = OPENING_MERGE_OFFSET - BOTTOM_TEAM_CONNECTOR_OFFSET;
const LEAGUE_BOARD_WIDTH = MLB_BRACKET_COLUMN_WIDTH * 3 + COLUMN_GAP * 2;

export function getMLBBracketLayoutStyles(
  league: "american" | "national",
  index = 0,
) {
  const headerOffset = ROUND_HEADER_HEIGHT + ROUND_HEADER_GAP;
  const connectorTop = headerOffset + OPENING_MERGE_OFFSET;
  const connectorBottom = connectorTop + SECOND_MATCHUP_TOP;
  const connectorMiddle = headerOffset + CHAMPIONSHIP_TOP + MATCHUP_HEIGHT / 2;
  const firstGapLeft = MLB_BRACKET_COLUMN_WIDTH;
  const secondGapLeft = MLB_BRACKET_COLUMN_WIDTH * 2 + COLUMN_GAP;
  const fromLeft = league === "american";
  const branchGapLeft = fromLeft ? secondGapLeft : firstGapLeft;
  const directGapLeft = fromLeft ? firstGapLeft : secondGapLeft;
  const halfGap = COLUMN_GAP / 2;
  const branchMidpoint = branchGapLeft + halfGap;
  const openingMidpoint = directGapLeft + halfGap;
  const openingLegLeft = fromLeft ? directGapLeft : openingMidpoint;
  const rowOffset = index * SECOND_MATCHUP_TOP;
  const mergeY = connectorTop + rowOffset;
  const wildCardY =
    headerOffset + rowOffset + WILD_CARD_TOP + MATCHUP_HEIGHT / 2;
  const byeY = headerOffset + rowOffset + BYE_CARD_TOP + BYE_CARD_HEIGHT / 2;
  const cardPosition: ViewStyle = { position: "absolute", left: 0, right: 0 };

  return StyleSheet.create({
    byeCard: { ...cardPosition, top: rowOffset + BYE_CARD_TOP },
    wildCardCard: { ...cardPosition, top: rowOffset + WILD_CARD_TOP },
    divisionCard: { ...cardPosition, top: rowOffset + DIVISION_SERIES_TOP },
    championshipCard: { ...cardPosition, top: CHAMPIONSHIP_TOP },
    worldSeriesCard: {
      ...cardPosition,
      top: CHAMPIONSHIP_TOP - (FINALS_HEIGHT - MATCHUP_HEIGHT) / 2,
    },
    byeBranch: { left: openingMidpoint, top: byeY, height: mergeY - byeY },
    wildCardBranch: {
      left: openingMidpoint,
      top: mergeY,
      height: wildCardY - mergeY,
    },
    byeLeg: { left: openingLegLeft, top: byeY, width: halfGap },
    wildCardLeg: { left: openingLegLeft, top: wildCardY, width: halfGap },
    openingOutput: {
      left: fromLeft ? openingMidpoint : directGapLeft,
      top: mergeY,
      width: halfGap,
    },
    divisionTopLeg: {
      left: fromLeft ? branchGapLeft : branchMidpoint,
      top: connectorTop,
      width: halfGap,
    },
    divisionBottomLeg: {
      left: fromLeft ? branchGapLeft : branchMidpoint,
      top: connectorBottom,
      width: halfGap,
    },
    divisionBranch: {
      left: branchMidpoint,
      top: connectorTop,
      height: connectorBottom - connectorTop,
    },
    championshipLeg: {
      left: fromLeft ? branchMidpoint : branchGapLeft,
      top: connectorMiddle,
      width: halfGap,
    },
    worldSeriesLeg: {
      left: fromLeft ? LEAGUE_BOARD_WIDTH : -COLUMN_GAP,
      top: connectorMiddle,
      width: COLUMN_GAP,
    },
  });
}

export const MLBPlayoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },
    sheetBackground: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    seriesGames: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
    seriesGame: { gap: 6 },
    section: { gap: 12 },
    roundHeader: { height: ROUND_HEADER_HEIGHT },
    roundBody: { height: ROUND_BODY_HEIGHT, position: "relative" },
    content: { paddingHorizontal: 40, paddingTop: 16, gap: COLUMN_GAP },
    leagueTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      textTransform: "uppercase",
    },
    leagueBoard: {
      position: "relative",
      flexDirection: "row",
      gap: COLUMN_GAP,
      alignItems: "flex-start",
    },
    column: {
      width: MLB_BRACKET_COLUMN_WIDTH,
      gap: ROUND_HEADER_GAP,
      zIndex: 1,
    },
    roundTitle: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.MEDIUM,
      fontSize: 15,
      textAlign: "center",
      textTransform: "uppercase",
    },
    matchups: { gap: COLUMN_GAP, height: ROUND_BODY_HEIGHT },
    connectorLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 0,
    },
    connectorHorizontal: {
      position: "absolute",
      height: 1,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    connectorVertical: {
      position: "absolute",
      width: 1,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    matchup: {
      height: MATCHUP_HEIGHT,
      justifyContent: "space-around",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      elevation: 5,
    },
    finalsMatchup: {
      height: FINALS_HEIGHT,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },
    seriesLabel: {
      color: Colors.midTone,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    seed: {
      width: 20,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      textAlign: "center",
    },
    logo: { width: 34, height: 34 },
    teamName: {
      flex: 1,
      marginLeft: 4,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
    },
    eliminatedText: {
      color: Colors.midTone,
    },
    winsBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },
    winnerBadge: {
      backgroundColor: Colors.light.gold,
    },
    wins: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
    },
    winnerWins: {
      color: Colors.black,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 8,
      backgroundColor: Colors.midTone,
    },
    empty: {
      padding: 24,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      textAlign: "center",
    },
  });
