export type BasketballTeam = {
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
