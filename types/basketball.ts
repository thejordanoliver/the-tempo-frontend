export type BasketballGame = {
  id: number;
  date: string; // "2025-12-16T21:00:00+00:00"
  time: string; // "21:00"
  timestamp: number; // 1765918800
  timezone: string; // "UTC"

  stage: string | null;
  week: string | null;
  venue: string | null;

  status: {
    long: string; // "Not Started"
    short: string; // "NS"
    timer: string | null;
  };

  league: {
    id: number;
    name: string;
    type: string;
    season: string;
    logo: string;
    country: {
      id: number;
      name: string;
      code: string;
      flag: string;
    };
    isWomen?: boolean;
  };

  // ✅ Use shared CBBTeam type here
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };

  scores: {
    home: {
      quarter_1: number | null;
      quarter_2: number | null;
      quarter_3: number | null;
      quarter_4: number | null;
      over_time: number | null;
      total: number | null;
    };
    away: {
      quarter_1: number | null;
      quarter_2: number | null;
      quarter_3: number | null;
      quarter_4: number | null;
      over_time: number | null;
      total: number | null;
    };
  };
};
export type BasketballGameCardProps = {
  game: BasketballGame;
  isWomen?: boolean; // 👈 NEW
};
