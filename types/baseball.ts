export interface BaseballTeam {
  id: number;
  espnId?: number;
  name: string;
  shortName: string;
  fullName: string;
  code: string;
  color: string | null;
  secondaryColor: string;
  logo: any | null;
  logoLight: any | null;
  established: number;
  latitude: number;
  longitude: number;
  venueName: string;
  venueCapacity: string;
  venueImage: string;
  address: string;
  city: string;
  isAllStar: boolean;
  isActive: boolean;
}

export type MLBTeam = BaseballTeam;

export interface MLBScoreSide {
  total: number;
  hits: number;
  errors: number;
  innings: Record<string, number | null>;
}

export interface MLBGame {
  id: number;

  league: {
    id: number;
    name: string;
    type: string;
    season: number;
    logo: string;
  };

  country: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };

  date: string; // ISO string
  timestamp: number; // Unix timestamp (seconds)

  status: {
    long: string;
    short: string;
    clock: string | null;
  };

  venue?: {
    id?: number;
    name?: string;
    city?: string;
  };

  teams: {
    home: BaseballTeam;
    away: BaseballTeam;
  };

  scores: {
    home: MLBScoreSide;
    away: MLBScoreSide;
  };
}

export interface MLBPlayer {
  id: number;
  team_id: number;
  slug: string;
  first_name: string;
  last_name: string;
  full_name: string;
  short_name: string;
  height: string;
  weight: number;
  birth_date: string;
  debut_year: number;
  experience_years: number;
  birth_city: string;
  birth_country: string;
  birth_display: string;
  position: string;
  jersey_number: string;
  headshot_url: string;
  draft_round: number;
  draft_year: number;
  draft_number: number;
  active: true;
}

export type BaseballGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: string | number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: number;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
  };
  weather: {
    displayValue: string;
    temperature: number;
    highTemperature: number;
    conditionId: string;
    link: {
      language: string;
      rel: string[];
      href: string;
      text: string;
      shortText: string;
      isExternal: boolean;
      isPremium: boolean;
    };
  };
  broadcasts: string[];
  geoBroadcasts: unknown[];
  innings: number;
  home: {
    id: number;
    espnId: number;
    name: string;
    code: string;
    primaryColor: string;
    secondaryColor: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
    homeRank: number;
    winner: boolean;
  };
  away: {
    id: number;
    espnId: number;
    name: string;
    fullName: string;
    code: string;
    primaryColor: string;
    secondaryColor: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
    awayRank: number;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: true;
  wasSuspended: boolean;
  situation: {
    balls: number;
    strikes: number;
    outs: number;
    outsText: string;
    onFirst: boolean;
    onSecond: boolean;
    onThird: boolean;
    pitcher: {
      playerId: number;
      period: number;
      summary: string;
      athlete: {
        id: string;
        fullName: string;
        displayName: string;
        shortName: string;
        position: string;
      };
    };
    batter: {
      id: string;
      fullName: string | null;
      displayName: string | null;
      shortName: string | null;
      position: string | null;
    };
    lastPlay: {
      id: string;
      text: string;
      scoreValue: number;
      summaryType: string;
      atBatId: string;
      type: {
        id: string;
        text: string;
        abbreviation: string;
      };
      teamId: string;
      athletesInvolved: [
        {
          id: string;
          fullName: string;
          displayName: string;
          shortName: string;
          position: string;
        },
      ];
    };
  };
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type BaseballGameCardProps = {
  game: BaseballGame;
  isMLB?: boolean;
  isSB?: boolean;
  isCB?: boolean;
};
