// styles/GameDetailStyles/TeamRow.styles.ts
import { Colors, Fonts } from "constants/styles";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

export type SizeType = "small" | "medium" | "large";

export type TeamRowTeam = {
  id?: string | number;
  espnId?: string | number;
  logo: any;
  code?: string;
  shortName?: string;
  name?: string;
  record?: string;
};
export type FighterRow = {
  id?: string | number;
  espnId?: string | number;
  headshot: any;
  shortName?: string;
  name?: string;
  record?: string;
};

export type FootballTeamRowProps = {
  id: number | null;
  logo: any;
  name: string;
  record: string | null | undefined;
  timeouts: number | null;
  rank: number | null | undefined;
  isDark: boolean;
  isHome?: boolean;
  score?: number | null;
  isWinner: boolean | null;
  gameStatusDescription?: string;
  size?: SizeType;
  hasPossession: boolean | null;
  opponentScore?: number | null;
  league: string;
};

export type BasketballTeamRowProps = {
  id: number | null;
  logo: any;
  name: string;
  record: string;
  timeouts?: number;
  bonusState: string | undefined | null;
  size?: SizeType;
  rank?: number | null;
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean;
  hideRecord?: boolean;
  colors?: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
  gameStatusDescription?: string;
  league: string;
};

export type MMAProps = {
  fighter: FighterRow;
  size?: SizeType;
  rank?: string;
  isDark: boolean;
  isFirstFighter?: boolean;
  isWinner?: boolean;
  hideRecord?: boolean;
  gameStatusDescription?: string;
};

export type BaseballProps = {
  id: number;
  name: string;
  logo: any;
  record: string;
  size?: SizeType;
  rank: number | undefined | null;
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean | undefined | null;
  hideRecord?: boolean;
  gameStatusDescription?: string;
  league: string;
};

export type SoccerProps = {
  id: number;
  name: string;
  logo: any;
  record: string;
  size?: SizeType;
  rank: number | undefined | null;
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean | undefined | null;
  hideRecord?: boolean;
  gameStatusDescription?: string;
  league: string;
};

export type NHLProps = {
  id: number | null;
  logo: any;
  name: string;
  record: string;
  timeouts?: number;
  size?: SizeType;
  rank?: number | null;
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean;
  hideRecord?: boolean;
  colors?: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
  gameStatusDescription?: string;
  league: string;
};

// Main static styles
export const teamRowStyles = (isDark: boolean, isTie?: boolean) =>
  StyleSheet.create<{
    row: ViewStyle;
    teamInfoContainer: ViewStyle;
    headshotContainer: ViewStyle;
    timeoutsContainer: ViewStyle;
    teamInfo: ViewStyle;
    nameRow: ViewStyle;
    teamName: TextStyle;
    record: TextStyle;
    rank: TextStyle;
    score: TextStyle;
    preGameRecord: TextStyle;
    bonus: TextStyle;
    scoreWrapper: ViewStyle;
    possessionIcon: ImageStyle;
  }>({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    teamInfoContainer: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    teamInfo: {
      justifyContent: "center",
    },
    headshotContainer: {
      borderWidth: 1,
      borderRadius: 100,
      overflow: "hidden",
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    teamName: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    rank: {
      fontSize: 10,
      color: Colors.lightGray,
    },
    record: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isTie
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.white
          : Colors.black,
    },
    score: {
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      marginHorizontal: 16,
    },
    preGameRecord: {
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      marginHorizontal: 8,
      color: isDark ? Colors.white : Colors.black,
    },
    scoreWrapper: {
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    possessionIcon: {
      width: 25,
      height: 40,
      resizeMode: "contain",
      position: "absolute",
      top: "30%",
      alignSelf: "center",
    },
    timeoutsContainer: { alignItems: "center" },
    bonus: {
      marginTop: 2,
      position: "absolute",
      bottom: -10,
      fontSize: 8,
      fontFamily: Fonts.OSMEDIUM,
      letterSpacing: 0.5,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });

// Size-based dynamic styles
export const sizeStyles = {
  small: {
    score: { fontSize: 36, width: 60 },
    preGameRecord: { fontSize: 24, width: 60 },
    logo: { width: 40, height: 40 },
    teamName: { fontSize: 12 },
    record: { fontSize: 12 },
    bonus: { fontSize: 8 },
  },
  medium: {
    score: { fontSize: 36, width: 60 },
    preGameRecord: { fontSize: 20, width: 80 },
    logo: { width: 50, height: 50 },
    teamName: { fontSize: 12 },
    record: { fontSize: 12 },
    bonus: { fontSize: 8 },
  },
  large: {
    score: { fontSize: 28, width: 70 },
    preGameRecord: { fontSize: 18, width: 70 },
    logo: { width: 60, height: 60 },
    teamName: { fontSize: 12 },
    record: { fontSize: 14 },
    bonus: { fontSize: 8 },
  },
};
