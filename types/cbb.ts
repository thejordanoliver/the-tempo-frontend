import { CBBTeam } from "./types";

export type BracketTeam = CBBTeam;

export interface BracketBroadcast {
  name: string;
  type: string;
}
export type Round =
  | "Round of 64"
  | "Round of 32"
  | "Sweet 16"
  | "Elite Eight"
  | "Final Four"
  | "National Championship";

export interface BracketGame {
  id: string;

  top: BracketTeam | null;
  bottom: BracketTeam | null;
  round: Round;

  status: "scheduled" | "live" | "final";
  startTime?: string;

  topScore?: number | null;
  bottomScore?: number | null;
  broadcasts?: BracketBroadcast[];
}

export interface BracketRound {
  title: string;
  games: BracketGame[];
}

export interface BracketData {
  first: BracketRound;
  quarterfinal: BracketRound;
  semifinal: BracketRound;
  championship: BracketRound;
  isDark: boolean;
}
