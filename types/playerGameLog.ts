export type PlayerGameLogSport = "basketball" | "football" | "baseball" | "hockey";

export interface GameLogColumn { key: string; label: string; description: string }
export interface GameLogOption { value: string; label: string }
export interface PlayerGameLog {
  playerId: string;
  league: string;
  season: number;
  displaySeason: string;
  category: string | null;
  categories: GameLogOption[];
  columns: GameLogColumn[];
  seasons: GameLogOption[];
  sections: { key: string; label: string }[];
  games: {
    eventId: string; date: string | null; section: string;
    team: { providerId: string | null; abbreviation: string };
    opponent: { providerId: string | null; abbreviation: string };
    location: string; result: string; score: string;
    stats: Record<string, string | null>;
  }[];
  summaries: { section: string; label: string; type: string; stats: Record<string, string | null> }[];
  fetchedAt: string;
  stale: boolean;
}
