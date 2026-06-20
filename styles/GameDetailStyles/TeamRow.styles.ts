// styles/GameDetailStyles/TeamRow.styles.ts
import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

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
  id?: number;
  headshot: string;
  name: string;
  flag: string | undefined;
  record: string | undefined;
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
  isTie?: boolean | undefined | null;
  isWinner?: boolean | undefined | null;
  hideRecord?: boolean;
  state: string;
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
  StyleSheet.create({
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

    logo: { width: 50, height: 50 },

    headshot: {
      width: 50,
      height: 50,
      paddingTop: 4,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    teamName: {
      fontSize: 12,
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
      fontSize: 12,
    },
    score: {
      fontSize: 36,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      marginHorizontal: 16,
      width: 60,
    },
    preGameRecord: {
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      marginHorizontal: 8,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 20,
      width: 80,
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
