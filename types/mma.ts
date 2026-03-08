export type MMAFight = {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  slug: string;
  is_main: boolean;
  category: string;

  status: {
    long: string;
    short: string;
  };

  fighters: {
    first: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
      info: MMAFighter;
    };
    second: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
      info: MMAFighter;
    };
  };

  result: {
    wonType: string;
    round: number;
    minute: string;
    koType: string;
    target: string | null;
    subType: string | null;
    score: string[];
  };
};

export type MMAFighter = {
  id: number; // API Sports ID
  espn_id: string | null; // ESPN ID can be null
  first_name: string;
  last_name: string;
  full_name: string;
  short_name: string | null;
  nickname: string | null;
  weight: string | null;
  height: string | null;
  reach: string | null;
  stance: string | null;
  weight_class: string | null;
  team_id: number | null;
  team_name: string | null;
  gender: "M" | "F" | null;
  date_of_birth: string | null;
  citizenship: string | null;
  country_code: string | null;
  flag_url: string | null;
  active: boolean;
  slug: string | null;
  images: {
    rel: string[];
    href: string;
  }[];
  created_at: string | Date;
  updated_at: string | Date;
  record: string;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  no_contests: number | null;
};
