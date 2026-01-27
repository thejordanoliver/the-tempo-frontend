import { create, StateCreator } from "zustand";
import { GameDetails } from "hooks/useGameDetails";
export interface Score {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
  status: "canceled" | "scheduled" | "in_play" | "final";
  gameStatusDescription: string;
  gameStatusDetail: string;
  displayClock?: string;
  period?: number;
  lastUpdated?: number;
  plays: any[];
  teamStats: any[];
  playerStats: any[];
  leaders: any[];
  timeouts: { home: number | null; away: number | null };
  fouls: any;

  // Optional fields from GameDetails
  homeRank?: number | null;
  awayRank?: number | null;
  headline?: string;
  venue?: GameDetails["venue"];
  neutralSite?: boolean;

  // New optional fields
  records?: GameDetails["records"];
  broadcasts?: GameDetails["broadcasts"];
  highlights?: any[];
  injuries?: any[];
  officials?: any[];
}



export interface NBAStore {
  chatOpen: boolean;
  liveScores: Record<string, Score>;
  gameStats: Record<string, Score>;
  lastFiveGames: Record<number, Score[]>;
  setChatOpen: (open: boolean) => void;
  setLiveScore: (gameId: string, score: Score) => void;
  setGameStats: (gameId: string, stats: Score) => void;
  setLastFiveGames: (teamId: number, games: Score[]) => void;
}

const nbaStoreCreator: StateCreator<NBAStore> = (set) => ({
  chatOpen: false,
  liveScores: {},
  gameStats: {},
  lastFiveGames: {},
  setChatOpen: (open: boolean) => set({ chatOpen: open }),
  setLiveScore: (gameId: string, score: Score) =>
    set((state: NBAStore) => ({
      liveScores: { ...state.liveScores, [gameId]: score },
    })),
  setGameStats: (gameId: string, stats: Score) =>
    set((state: NBAStore) => ({
      gameStats: { ...state.gameStats, [gameId]: stats },
    })),
  setLastFiveGames: (teamId: number, games: Score[]) =>
    set((state: NBAStore) => ({
      lastFiveGames: { ...state.lastFiveGames, [teamId]: games },
    })),
});

export const useNBAStore = create<NBAStore>(nbaStoreCreator);
