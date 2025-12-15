// utils/NFLUtils/transformSeriesGame.ts

export interface RawNFLSeriesGame {
  id: number;
  year: number;
  week: string;
  day: string;
  date: string;
  time: string;

  winner: string;
  loser: string;

  homeTeam: string;
  awayTeam: string;

  pts_w: number | null;
  pts_l: number | null;

  locationType?: string; // "home" | "away" | "" from PFR API
}

// utils/NFLUtils/transformSeriesGame.ts

export interface RawNFLSeriesGame {
  id: number;
  year: number;
  week: string;
  day: string;
  date: string;
  time: string;

  winner: string;
  loser: string;

  homeTeam: string;
  awayTeam: string;

  pts_w: number | null;
  pts_l: number | null;

  locationType?: string; // "home" | "away" | "" from PFR API
}

export interface TransformedNFLSeriesGame {
  id: number;
  year: number;
  week: string;
  day: string;
  date: string;
  time: string;

  homeTeam: string;
  awayTeam: string;

  homeScore: number | null;
  awayScore: number | null;

  winner: string;
  loser: string;

  locationType?: string;
}


export function transformNFLSeriesGames(
  games: RawNFLSeriesGame[],
): TransformedNFLSeriesGame[] {

  return games.map((g) => {
    const winnerScore = g.pts_w ?? null;
    const loserScore = g.pts_l ?? null;

    return {
      id: g.id,
      year: g.year,
      week: g.week,
      day: g.day,
      date: g.date,
      time: g.time,

      homeTeam: g.homeTeam,
      awayTeam: g.awayTeam,

      // 🔥 Determine home & away scores based ONLY on whether winner = home
      homeScore:
        g.homeTeam === g.winner ? winnerScore :
        g.homeTeam === g.loser ? loserScore : null,

      awayScore:
        g.awayTeam === g.winner ? winnerScore :
        g.awayTeam === g.loser ? loserScore : null,

      winner: g.winner,
      loser: g.loser,

      locationType: g.locationType || "",
    };
  });
}
