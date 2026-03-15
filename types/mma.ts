import placeholderImage from "assets/Placeholders/playerPlaceholder.png";

export interface MMAEvent {
  slug: string;
  date: string;
  timestamp: number;
  timezone: string;
  mainCard: MMAFight[];
  prelims: MMAFight[];
}

export type MMAFight = {
  id: number;
  date: string | null;
  time: string | null;
  timestamp: number;
  timezone: string | null;
  slug: string | null;
  is_main: boolean;
  category: string | null;

  status: {
    long: string | null;
    short: string | null;
  };

  fighters: {
    first: {
      id: number;
      name: string | null;
      logo: string | null;
      winner: boolean | null;
      info: MMAFighter;
    };
    second: {
      id: number;
      name: string | null;
      logo: string | null;
      winner: boolean | null;
      info: MMAFighter;
    };
  };

  result: {
    wonType: string | null;
    round: number;
    minute: string | null;
    koType: string | null;
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
  color: string | null;
  alternate_color: string | null;
};

export const emptyFighter: MMAFighter = {
  id: 0,
  espn_id: null,
  first_name: "Unknown",
  last_name: "Fighter",
  full_name: "Unknown Fighter",
  short_name: "UNK",
  nickname: null,
  weight: null,
  height: null,
  reach: null,
  stance: null,
  weight_class: null,
  team_id: null,
  team_name: null,
  gender: null,
  date_of_birth: null,
  citizenship: null,
  country_code: null,
  flag_url: null,
  active: false,
  slug: null,

  images: [
    {
      rel: ["player", "default"],
      href: placeholderImage,
    },
  ],

  created_at: new Date(),
  updated_at: new Date(),

  record: "0-0-0",
  wins: 0,
  losses: 0,
  draws: 0,
  no_contests: 0,
  color: null,
  alternate_color: null,
};
