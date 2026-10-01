export interface RosterPlayer {
  id: number;
  player_id: number;
  team_id: number;
  full_name: string;
  short_name: string;
  first_name: string;
  last_name: string;
  position: string | null;
  height: string | null;
  weight: number | null;
  birth_date: string | null;
  college: string | null;
  jersey_number: string;
  headshot_url: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  affiliation: string;
  experience?: number;
  experience_display?: string;
  experience_abbr?: string;
  birth_display?: string;
  draft_round: number | null;
  draft_year: number | null;
  draft_number: number | null;
  espn_id: number | null;
}

export type SupportedRosterLeague =
  | "mlb"
  | "nhl"
  | "nfl"
  | "cfb"
  
  // soccer
  | "afcon"
  | "aleague"
  | "aleaguewomen"
  | "argentina"
  | "asian"
  | "austria"
  | "belgium"
  | "bolivia"
  | "brasileirao"
  | "bundesliga"
  | "bundesliga2"
  | "carabao"
  | "championship"
  | "champions"
  | "chile"
  | "china"
  | "colombia"
  | "concacaf"
  | "conference"
  | "copaamerica"
  | "copadelrey"
  | "coppaitalia"
  | "costarica"
  | "denmark"
  | "dfbpokal"
  | "ecuador"
  | "elsalvador"
  | "epl"
  | "eredivisie"
  | "euro"
  | "europa"
  | "fa"
  | "fifa"
  | "fifaf"
  | "fifaw"
  | "friendlies"
  | "goldcup"
  | "greece"
  | "guatemala"
  | "honduras"
  | "india"
  | "jleague"
  | "laliga"
  | "laliga2"
  | "leaguescup"
  | "ligaf"
  | "ligamx"
  | "libertadores"
  | "ligue1"
  | "ligue2"
  | "mls"
  | "nations"
  | "norway"
  | "nwsl"
  | "paraguay"
  | "peru"
  | "portugal"
  | "premiereleague"
  | "russia"
  | "saudi"
  | "scotland"
  | "seriea"
  | "serieb"
  | "southafrica"
  | "sudamericana"
  | "supercup"
  | "sweden"
  | "turkey"
  | "uefa"
  | "uruguay"
  | "usopen"
  | "venezuela"
  | "womensfriendlies"
  | "wsl";

export type RosterSection = {
  title: string;
  data: RosterPlayer[];
};

export type RosterResponse = {
  players: RosterPlayer[];
  sections: RosterSection[];
};
