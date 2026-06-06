// types/nfl.ts

import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";
import { ImageSourcePropType } from "react-native";

export interface NFLPlayer {
  id: number;
  player_id: number;
  espn_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  height: string;
  weight: string;
  birth_date: string;
  birth_city: string;
  birth_state: string;
  birth_country: string;
  college: string;
  position: string;
  jersey_number: string;
  experience: number;
  group_name: string;
  team_id: number;
  headshot_url: string;
  draft_round: number;
  draft_year: number;
  draft_number: number;
}

export interface CFBPlayer {
  id: number;
  player_id: number;
  espn_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  height: string;
  weight: string;
  position: string;
  jersey_number: string;
  experience_years: number;
  experience_display: string;
  experience_abbr: string;
  birth_city: string;
  birth_state: string;
  birth_country: string;
  birth_display: string;
  team_id: number;
  headshot_url: string;
}

export type FootballTeam = {
  id: number;
  espnID: number;
  oddsID?: string;
  name: string;
  shortName?: string;
  fullName: string;
  code: string;
  city: string;
  location: string;
  address?: string;
  coach?: string;
  conference?: string;
  conferenceShortName?: string;
  owner?: string;
  venue: string;
  established: number;
  logo: any;
  logoLight?: any;
  color: string;
  secondaryColor: string;
  latitude: number;
  longitude: number;
  venueImage: any;
  venueCapacity: string;
  championships?: number[];
  isAllStar: boolean;
  isActive: boolean;
};

// export type FootballGame = {
//   game: {
//     id: string; // ✅
//     stage: string;
//     week: string;
//     date: {
//       timezone: string;
//       date: string;
//       time: string;
//       timestamp: number;
//       utc?: string;
//       local?: string;
//     };
//     venue: {
//       name: string;
//       city: string;
//     };
//     status: {
//       short: string;
//       long: string;
//       timer?: string | null; // allow null too
//     };
//   };
//   league: {
//     id: number;
//     name: string;
//     season: string;
//     logo: string;
//   };
//   teams: {
//     home: FootballTeam;
//     away: FootballTeam;
//   };
//   scores: {
//     home: {
//       total: number;
//       quarter_1: number;
//       quarter_2: number;
//       quarter_3: number;
//       quarter_4: number;
//       overtime: number;
//     };
//     away: {
//       total: number;
//       quarter_1: number;
//       quarter_2: number;
//       quarter_3: number;
//       quarter_4: number;
//       overtime: number;
//     };
//   };
// };

export type FootballGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: string;
  season: {
    year: 2026;
    type: 2;
    slug: "pre-season" | "regular-season" | "post-season";
  };
  week: {
    number: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    quarter: number;
    clock: number;
    displayClock: string;
    completed: false;
  };
  venue: {
    id: number;
    name: string;
    city: string;
    state: string;
    country: string;
    indoor: string;
  };
  broadcasts: string[];
  geoBroadcasts: [
    {
      type: string;
      market: string;
      media: string;
      region: string;
    },
  ];
  odds: {
    provider: string;
    details: string;
    spread: number;
    overUnder: number;
    homeMoneyline: null;
    awayMoneyline: null;
  };
  periods: number;
  period: number;
  quarter: number;
  clock: number;
  displayClock: string;
  down: null;
  distance: null;
  yardLine: null;
  possession: null;
  possessionText: null;
  redZone: boolean;
  drive: null;
  lastPlay: null;
  teamWithPossession: null;
  home: {
    id: number;
    espnId: number;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    conferenceId: number | null;
    record: string;
    rank: number | null;
    score: number;
    winner: boolean | null;
  };
  away: {
    id: number;
    espnId: number;
    uid: string;
    name: string;
    code: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    conferenceId: number | null;
    record: string;
    rank: number | null;
    score: number;
    winner: boolean | null;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  situation: {
    down: null;
    distance: null;
    downDistanceText: string | null;
    shortDownDistanceText: string | null;
    yardLine: null;
    possession: null;
    possessionText: null;
    isRedZone: false;
    drive: null;
    lastPlay: null;
    teamWithPossession: null;
  };
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type FootballGameCardProps = {
  game: FootballGame;
  isNFL?: boolean;
  isCFB?: boolean;
};

export const emptyTeam: FootballTeam = {
  id: 0,
  espnID: 0,
  oddsID: "0",
  name: "Unknown",
  fullName: "Unknown",
  code: "UNK",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
  address: "Unknown",
  established: 0,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  color: Colors.white,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export const emptyAwayTeam: FootballTeam = {
  id: 0,
  espnID: -2,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
  established: 0,
  color: Colors.darkGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export const emptyHomeTeam: FootballTeam = {
  id: 0,
  espnID: -1,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venue: "Unknown",
  established: 0,
  color: Colors.lightGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export type Conference = {
  name: string;
  logo: ImageSourcePropType | null;
  teams: string[];
  color?: {
    primary: string;
    secondary: string;
  };
};

export interface CFBPlayoffBracketTeam {
  id: number | string;
  espnID?: string | number;
  oddsID?: string;
  name: string;
  shortName?: string;
  fullName?: string;
  code: string;
  logo: ImageSourcePropType;
  logoLight?: ImageSourcePropType;
  abbreviation?: string;
  city?: string;
  location?: string;
  address?: string;
  coach?: string;
  coachImage?: string;
  venue?: string;
  established?: number;
  seed?: number | null;
  score?: number;
  record?: string | null; // "12-1"
}

export interface CFBPlayoffBracketBroadcast {
  name: string;
  type: string;
}

export type Round = "first" | "quarterfinal" | "semifinal" | "championship";

export interface CFBPlayoffBracketGame {
  id: string;
  top: CFBPlayoffBracketTeam | null;
  bottom: CFBPlayoffBracketTeam | null;
  round: Round;
  status: "scheduled" | "live" | "final";
  startTime?: string;
  topScore?: number | null;
  bottomScore?: number | null;
  broadcasts?: CFBPlayoffBracketBroadcast[];
}

export interface CFBPlayoffBracketRound {
  title: string;
  games: CFBPlayoffBracketGame[];
}

export type BracketTeam = CFBPlayoffBracketTeam;
export type BracketGame = CFBPlayoffBracketGame;
export type BracketRound = CFBPlayoffBracketRound;
export type Game = FootballGame;

export interface BracketData {
  first: CFBPlayoffBracketRound;
  quarterfinal: CFBPlayoffBracketRound;
  semifinal: CFBPlayoffBracketRound;
  championship: CFBPlayoffBracketRound;
}

export type NFLPlayoffTeam = {
  id: number;
  name: string;
  logo: string;
  conference: "AFC" | "NFC";
  seed: number;
};

export type NFLPlayoffScoreBreakdown = {
  quarter_1: number;
  quarter_2: number;
  quarter_3: number;
  quarter_4: number;
  overtime: number | null;
  total: number;
};

export type NFLPlayoffGameMeta = {
  id: number;
  stage: string;
  week: string;
  date: {
    timezone: string;
    date: string;
    time: string;
    timestamp: number;
  };
  venue: {
    name: string;
    city: string;
  };
  status: {
    short: string;
    long: string;
    timer: string | null;
  };
};

export type NFLPlayoffGame = {
  game: NFLPlayoffGameMeta;
  league: {
    id: number;
    name: string;
    season: string;
    logo: string;
    country: {
      name: string;
      code: string;
      flag: string;
    };
  };
  teams: {
    home: NFLPlayoffTeam;
    away: NFLPlayoffTeam;
  };
  scores: {
    home: NFLPlayoffScoreBreakdown;
    away: NFLPlayoffScoreBreakdown;
  };
};

export type Matchup = {
  round: string;
  conference: "AFC" | "NFC";
  teams: {
    top: NFLPlayoffTeam;
    bottom: NFLPlayoffTeam;
  };
  winner: number | null;
  games: NFLPlayoffGame[];
};

export type ConferenceBracket = {
  wildCard: Matchup[];
  divisional: Matchup[];
  conference: Matchup[];
};

export type SuperBowl = Matchup[];

export type NFLPlayoffBracket = {
  afc: ConferenceBracket;
  nfc: ConferenceBracket;
  superBowl: SuperBowl;
};

export type BracketApiResponse = {
  success: boolean;
  season: number;
  bracket: NFLPlayoffBracket;
};

export interface RecruitOffer {
  visit: string | null;
  school: string;
  status: string | null;
  hasOffer: boolean;
  signedDate: string | null;
}

export interface RecruitPredictedSchool {
  team_id: number | null;
  team_name: string;
  team_title: string | null;
  percentage: number | null;
  confidence_score: number | null;
  confidence_text: string | null;
  matched_by?: string | null;
  href?: string | null;
  image_url?: string | null;
}

export interface CFBRecruit {
  id: number;
  year?: number;
  name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  profile_url: string;
  high_school: string;
  hometown: string;
  position: string;
  height: string | null;
  weight: string | null;
  score: string;
  stars: number;
  national_rank: string;
  position_rank: string;
  state_rank: string;
  committed: boolean;
  signed: boolean;
  predicted: boolean;

  projected_school: string | null;
  predicted_school: string | null;
  prediction_percentage: string | null;

  predicted_schools: RecruitPredictedSchool[];

  image_url: string | null;

  committed_team_id: number | null;
  predicted_team_id: number | null;
  projected_team_id: number | null;

  offers: RecruitOffer[];
}
