export type CBBTeam = {
  id: number;
  wid?: number;
  espnID?: number;
  name: string;
  shortName?: string;
  fullName?: string;
  code?: string;
  abbreviation?: string;
  city?: string;
  location?: string;
  address?: string;
  coach?: string;
  coachImage?: string;
  established?: number;
  country?: {
    name: string;
    code: string;
    flag: string;
  };
  latitude?: number;
  longitude?: number;
  venueImage?: any;
  venueCapacity?: string;
  wLogo?: any;
  logo: any;
  logoLight?: any;
  color?: string;
  secondaryColor?: string;
  venueName?: string; // ✅ Add this
  isAllStar: boolean;
  isActive: boolean;
};

export type BasketballGame = {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;

  stage: string | null;
  week: string | null;
  venue: string | null;

  status: {
    long: string;
    short: string;
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
  isWomen?: boolean;
};
export type Conference = {
  name: string;
  logo: any;
  teams: string[];
  color?: {
    primary: string;
    secondary: string;
  };
};
