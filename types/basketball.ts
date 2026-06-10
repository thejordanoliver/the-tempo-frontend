export type BasketballTeam = {
  id: number;
  wid: number;
  espnId: number | null;
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
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: string;
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
    clock: string;
    displayClock: string;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
  };
  broadcasts: [];
  geoBroadcasts: [
    {
      type: string;
      market: string;
      media: string;
      region: string;
    },
  ];
  periods: number;
  home: {
    id: number;
    wid: number | null;
    espnId: number;
    uid: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    state: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    nbaAPIID: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  away: {
    id: number;
    wid: number | null;
    espnId: number;
    uid: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    state: string;
    location: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    nbaAPIID: number;
    rank: number;
    score: number;
    record: string;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: 0;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type BasketballGameCardProps = {
  game: BasketballGame;
  isNBA?: boolean;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
};

export interface BasketballPlayer {
  id: number;
  league: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  short_name?: string;
  jersey_number?: string;
  position: string;
  height?: string;
  weight?: string;
  experience_years?: number;
  experience_display?: string;
  experience_abbr?: string;
  team?: string;
  team_id?: string;
  headshot_url?: string;
  college: string;
  birth_place_city: string;
  birth_place_state?: string;
  birth_place_country?: string;
  date_of_birth: string;
  status: boolean;
}

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

export interface CBBRecruit {
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
