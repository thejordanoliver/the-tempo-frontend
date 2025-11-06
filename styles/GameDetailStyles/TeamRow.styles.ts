// styles/GameDetailStyles/TeamRow.styles.ts
import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from "react-native";
import { Fonts } from "constants/fonts";

export type SizeType = "small" | "medium" | "large";


export type CFBProps = {
  team: {
    id: string;
    espnID: string;
    name: string;
    shortName: string;
    logo: any;
    record?: string;
  };
  isDark: boolean;
  isHome?: boolean;
  score?: number | null;
  isWinner?: boolean;
  status?: string; // "Scheduled", "In Progress", "Final", etc.
  colors: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
  possessionTeamId?: string;
  size?: SizeType; // sizes for font scaling
  timeouts: number;
  opponentScore?: number | null; // 👈 needed to detect ties
};


export type NFLProps = {
  team: {
    id: string;
    name: string;
    code: string;
    logo: any;
    record?: string;
  };
  isDark: boolean;
  isHome?: boolean;
  score?: number | null;
  isWinner?: boolean;
  status?: string; // "Scheduled", "In Progress", "Final", etc.
  colors: {
    text: string;
    record: string;
    score: string;
    winnerScore: string;
  };
  possessionTeamId?: string;
  size?: SizeType; // sizes for font scaling
  timeouts: number;
  opponentScore?: number | null; // 👈 NEW: needed to detect ties
};

export type NBAProps = {
  team: {
    name: string;
    record?: string;
    logo: any;
    code?: string;
    id?: number;
  };
  size?: SizeType
  isDark: boolean;
  isHome?: boolean;
  score?: number;
  isWinner?: boolean;
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
  score: TextStyle;
  preGameRecord: TextStyle;
  scoreWrapper: ViewStyle;
  possessionIcon: ImageStyle;
}>({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
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
    score: { fontSize: 16, width: 50 },
    preGameRecord: { fontSize: 12, width: 50 },
    logo: { width: 40, height: 40 },
    teamName: { fontSize: 12 },
    record: { fontSize: 10 },
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
