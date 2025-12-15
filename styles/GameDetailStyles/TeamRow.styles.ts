// styles/GameDetailStyles/TeamRow.styles.ts
import { Fonts } from "constants/fonts";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

export type SizeType = "small" | "medium" | "large";

export type TeamRowTeam = {
  id?: string | number; // NFL
  espnID?: string | number; // CFB
  logo: any;
  code?: string; // NFL
  shortName?: string; // CFB
  name?: string; // CFB
  record?: string;
};

export type FootballTeamRowProps = {
  league: "nfl" | "cfb";
  team: TeamRowTeam;
  rank?: number;
  isDark: boolean;
  isHome?: boolean;
  score?: number | null;
  isWinner?: boolean;
  status?: string;
  colors: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
  size?: SizeType; // sizes for font scaling
  possessionTeamId?: string | number;
  timeouts?: number;
  opponentScore?: number | null;
};

export type NBAProps = {
  team: {
    name: string;
    record?: string;
    logo: any;
    code?: string;
    id?: number;
  };
  timeouts?: number;
  size?: SizeType;
  rank?: string;
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean;
  hideRecord?: boolean;
  colors: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
};

export type MLBProps = {
  team: {
    name: string;
    record?: string;
    logo: any;
    code?: string;
    id?: number;
  };
  size?: SizeType;
  rank?: string;
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean;
  hideRecord?: boolean;
  colors: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
};

// Main static styles
export const styles = StyleSheet.create<{
  row: ViewStyle;
  teamInfoContainer: ViewStyle;
  teamInfo: ViewStyle;
  nameRow: ViewStyle;
  teamName: TextStyle;
  record: TextStyle;
  rank: TextStyle;
  score: TextStyle;
  preGameRecord: TextStyle;
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  teamName: {
    fontFamily: Fonts.OSREGULAR,
    textAlign: "center",
  },
  rank: {
    fontSize: 10,
    fontFamily: Fonts.OSREGULAR,
  },

  record: {
    fontFamily: Fonts.OSREGULAR,
    textAlign: "center",
  },
  score: {
    fontFamily: Fonts.OSBOLD,
    textAlign: "center",
    marginHorizontal: 16,
  },
  preGameRecord: {
    fontFamily: Fonts.OSBOLD,
    textAlign: "center",
    marginHorizontal: 16,
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
    top: "54%",
    alignSelf: "center",
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
  },
  medium: {
    score: { fontSize: 36, width: 60 },
    preGameRecord: { fontSize: 24, width: 60 },
    logo: { width: 50, height: 50 },
    teamName: { fontSize: 12 },
    record: { fontSize: 12 },
  },
  large: {
    score: { fontSize: 28, width: 70 },
    preGameRecord: { fontSize: 18, width: 70 },
    logo: { width: 60, height: 60 },
    teamName: { fontSize: 12 },
    record: { fontSize: 14 },
  },
};
