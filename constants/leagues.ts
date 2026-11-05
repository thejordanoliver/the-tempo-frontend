import type { ImageSourcePropType } from "react-native";

import MLBLogo from "assets/Baseball/MLB_Logos/MLB.png";
import CBLogo from "assets/College_Logos/Conference_Logos/CB.png";
import CFBLogo from "assets/College_Logos/Conference_Logos/CFB.png";
import MCBBLogo from "assets/College_Logos/Conference_Logos/MCBB.png";
import MCSLogo from "assets/College_Logos/Conference_Logos/MCS.png";
import MCVBLogo from "assets/College_Logos/Conference_Logos/MCVB.png";
import SBLogo from "assets/College_Logos/Conference_Logos/SB.png";
import WCBBLogo from "assets/College_Logos/Conference_Logos/WCBB.png";
import WCSLogo from "assets/College_Logos/Conference_Logos/WCS.png";
import WCVBLogo from "assets/College_Logos/Conference_Logos/WCVB.png";
import NFLLogo from "assets/Football/NFL_Logos/NFL.png";
import UFLLogo from "assets/Football/UFL_Logos/UFL.png";
import UFLLightLogo from "assets/Football/UFL_Logos/UFLLight.png";
import NHLLogo from "assets/Hockey/NHL_Logos/NHL.png";
import UFCLogo from "assets/MMA/MMA_Logos/UFC.png";
import UFCLogoLight from "assets/MMA/MMA_Logos/UFCLight.png";
import GLeagueLogo from "assets/NBA/Logos/GLeague.png";
import GLeagueLogoLight from "assets/NBA/Logos/GLeagueLight.png";
import NBALogo from "assets/NBA/Logos/NBA.png";
import F1Logo from "assets/Racing/Logos/f1.png";
import F1LogoLight from "assets/Racing/Logos/f1Light.png";
import NascarLogo from "assets/Racing/Logos/Nascar.png";
import NascarLightLogo from "assets/Racing/Logos/NascarLight.png";
import BundesligaLogo from "assets/Soccer/Logos/Bundesliga.png";
import BundesligaLightLogo from "assets/Soccer/Logos/BundesligaLight.png";
import EPLLogo from "assets/Soccer/Logos/EPL.png";
import LaLigaLogo from "assets/Soccer/Logos/LaLiga.png";
import LaLigaLightLogo from "assets/Soccer/Logos/LaLigaLight.png";
import LeaguesCupLogo from "assets/Soccer/Logos/LeaguesCup.png";
import LeaguesCupLogoLight from "assets/Soccer/Logos/LeaguesCupLight.png";
import Ligue1Logo from "assets/Soccer/Logos/Ligue1.png";
import Ligue1LightLogo from "assets/Soccer/Logos/Ligue1Light.png";
import Ligue2Logo from "assets/Soccer/Logos/Ligue2.png";
import Ligue2LightLogo from "assets/Soccer/Logos/Ligue2Light.png";
import MLSLogo from "assets/Soccer/Logos/MLS.png";
import UEFAChampionsLogo from "assets/Soccer/Logos/UEFAChampions.png";
import UEFAChampionsLightLogo from "assets/Soccer/Logos/UEFAChampionsLight.png";
import UEFAEuropaLogo from "assets/Soccer/Logos/UEFAEuropa.png";
import UEFAEuropaLightLogo from "assets/Soccer/Logos/UEFAEuropaLight.png";
import WorldCupLogo from "assets/Soccer/Logos/WorldCup.png";
import WorldCupLightLogo from "assets/Soccer/Logos/WorldCupLight.png";
import ATPLogo from "assets/Tennis/Logos/ATP.png";
import WTALogo from "assets/Tennis/Logos/WTA.png";
import WTALogoLight from "assets/Tennis/Logos/WTALight.png";
import WNBALogo from "assets/WNBA/Logos/WNBA.png";
import WNBALogoLight from "assets/WNBA/Logos/WNBALight.png";
import type { LeagueType } from "types/types";

export type LeagueRoute =
  | "/league/basketball"
  | "/league/football"
  | "/league/baseball"
  | "/league/hockey"
  | "/league/volleyball"
  | "/league/mma"
  | "/league/racing"
  | "/league/tennis"
  | "/league/soccer";

type LeagueDefinition = {
  id: string;
  shortName: string;
  name: string;
  color: string;
  secondaryColor?: string;
  logo: ImageSourcePropType;
  logoLight: ImageSourcePropType;
  route: LeagueRoute;
};

export const BROWSEABLE_LEAGUES = [
  "atp",
  "bundesliga",
  "ligue1",
  "ligue2",
  "laliga",
  "cb",
  "mcbb",
  "cfb",
  "champions",
  "epl",
  "europa",
  "f1",
  "fifa",
  "fifaw",
  "gleague",
  "leaguescup",
  "mlb",
  "mls",
  "msoc",
  "wsoc",
  "nascarpremier",
  "nba",
  "nfl",
  "nhl",
  "sb",
  "mcvb",
  "wcvb",
  "ufc",
  "ufl",
  "wcbb",
  "wnba",
  "wta",
] as const satisfies readonly LeagueType[];

export type BrowseableLeague = (typeof BROWSEABLE_LEAGUES)[number];

export const LEAGUE_CONFIG = {
  atp: {
    id: "atp",
    shortName: "ATP Tennis",
    name: "ATP Tour",
    color: "#002865",
    secondaryColor: "#00AFF0",
    logo: ATPLogo,
    logoLight: ATPLogo,
    route: "/league/tennis",
  },

  bundesliga: {
    id: "bundesliga",
    shortName: "German Bundesliga",
    name: "German Bundesliga",
    color: "#D20515",
    secondaryColor: "#000000",
    logo: BundesligaLogo,
    logoLight: BundesligaLightLogo,
    route: "/league/soccer",
  },

  cb: {
    id: "cb",
    shortName: "College Baseball",
    name: "College Baseball",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: CBLogo,
    logoLight: CBLogo,
    route: "/league/baseball",
  },

  mcvb: {
    id: "mcvb",
    shortName: "M. College Volleyball",
    name: "Men's College Volleyball",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: MCVBLogo,
    logoLight: MCVBLogo,
    route: "/league/volleyball",
  },
  wcvb: {
    id: "wcvb",
    shortName: "W. College Volleyball",
    name: "Women's College Volleyball",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: WCVBLogo,
    logoLight: WCVBLogo,
    route: "/league/volleyball",
  },
  mcbb: {
    id: "mcbb",
    shortName: "M. College Basketball",
    name: "Men's College Basketball",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: MCBBLogo,
    logoLight: MCBBLogo,
    route: "/league/basketball",
  },

  cfb: {
    id: "cfb",
    shortName: "College Football",
    name: "College Football",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: CFBLogo,
    logoLight: CFBLogo,
    route: "/league/football",
  },

  champions: {
    id: "champions",
    shortName: "UEFA Champions League",
    name: "UEFA Champions League",
    color: "#0E1E5B",
    secondaryColor: "#FFFFFF",
    logo: UEFAChampionsLogo,
    logoLight: UEFAChampionsLightLogo,
    route: "/league/soccer",
  },

  epl: {
    id: "epl",
    shortName: "English Premier League",
    name: "English Premier League",
    color: "#37003C",
    secondaryColor: "#00FF85",
    logo: EPLLogo,
    logoLight: EPLLogo,
    route: "/league/soccer",
  },

  europa: {
    id: "europa",
    shortName: "UEFA Europa League",
    name: "UEFA Europa League",
    color: "#F57C00",
    secondaryColor: "#000000",
    logo: UEFAEuropaLogo,
    logoLight: UEFAEuropaLightLogo,
    route: "/league/soccer",
  },

  f1: {
    id: "f1",
    shortName: "F1",
    name: "Formula 1",
    color: "#E10600",
    secondaryColor: "#15151E",
    logo: F1Logo,
    logoLight: F1LogoLight,
    route: "/league/racing",
  },

  fifa: {
    id: "fifa",
    shortName: "FIFA World Cup",
    name: "FIFA World Cup",
    color: "#326295",
    secondaryColor: "#8A1538",
    logo: WorldCupLogo,
    logoLight: WorldCupLightLogo,
    route: "/league/soccer",
  },

  fifaw: {
    id: "fifaw",
    shortName: "FIFA Women's World Cup",
    name: "FIFA Women's World Cup",
    color: "#A50064",
    secondaryColor: "#FFB81C",
    logo: WorldCupLogo,
    logoLight: WorldCupLightLogo,
    route: "/league/soccer",
  },

  gleague: {
    id: "gleague",
    shortName: "NBA G League",
    name: "NBA G League",
    color: "#000000",
    secondaryColor: "#C8102E",
    logo: GLeagueLogo,
    logoLight: GLeagueLogoLight,
    route: "/league/basketball",
  },

  laliga: {
    id: "laliga",
    shortName: "Spanish LALIGA",
    name: "Spanish LALIGA",
    color: "#FF4B44",
    secondaryColor: "#ffffff",
    logo: LaLigaLogo,
    logoLight: LaLigaLightLogo,
    route: "/league/soccer",
  },

  leaguescup: {
    id: "leaguescup",
    shortName: "Leagues Cup",
    name: "Leagues Cup",
    color: "#6A1B9A",
    secondaryColor: "#00C2FF",
    logo: LeaguesCupLogo,
    logoLight: LeaguesCupLogoLight,
    route: "/league/soccer",
  },

  ligue1: {
    id: "ligue1",
    shortName: "French Ligue",
    name: "French Ligue 1",
    color: "#FF4B44",
    secondaryColor: "#ffffff",
    logo: Ligue1Logo,
    logoLight: Ligue1LightLogo,
    route: "/league/soccer",
  },

  ligue2: {
    id: "ligue2",
    shortName: "French Ligue 2",
    name: "French Ligue 2",
    color: "#FF4B44",
    secondaryColor: "#ffffff",
    logo: Ligue2Logo,
    logoLight: Ligue2LightLogo,
    route: "/league/soccer",
  },

  mlb: {
    id: "mlb",
    shortName: "MLB",
    name: "Major League Baseball",
    color: "#002D72",
    secondaryColor: "#D50032",
    logo: MLBLogo,
    logoLight: MLBLogo,
    route: "/league/baseball",
  },

  mls: {
    id: "mls",
    shortName: "MLS",
    name: "Major League Soccer",
    color: "#111111",
    secondaryColor: "#E2231A",
    logo: MLSLogo,
    logoLight: MLSLogo,
    route: "/league/soccer",
  },

  msoc: {
    id: "msoc",
    shortName: "Men's College Soccer",
    name: "Men's College Soccer",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: MCSLogo,
    logoLight: MCSLogo,
    route: "/league/soccer",
  },

  wsoc: {
    id: "wsoc",
    shortName: "Women's College Soccer",
    name: "Women's College Soccer",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: WCSLogo,
    logoLight: WCSLogo,
    route: "/league/soccer",
  },

  nascarpremier: {
    id: "nascarpremier",
    shortName: "NASCAR Premier",
    name: "NASCAR Cup Series",
    color: "#007AC2",
    secondaryColor: "#FFD659",
    logo: NascarLogo,
    logoLight: NascarLightLogo,
    route: "/league/racing",
  },

  nba: {
    id: "nba",
    shortName: "NBA",
    name: "National Basketball Association",
    color: "#1D428A",
    secondaryColor: "#C8102E",
    logo: NBALogo,
    logoLight: NBALogo,
    route: "/league/basketball",
  },

  nfl: {
    id: "nfl",
    shortName: "NFL",
    name: "National Football League",
    color: "#013369",
    secondaryColor: "#D50A0A",
    logo: NFLLogo,
    logoLight: NFLLogo,
    route: "/league/football",
  },

  nhl: {
    id: "nhl",
    shortName: "NHL",
    name: "National Hockey League",
    color: "#000000",
    secondaryColor: "#FFFFFF",
    logo: NHLLogo,
    logoLight: NHLLogo,
    route: "/league/hockey",
  },

  sb: {
    id: "sb",
    shortName: "College Softball",
    name: "College Softball",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: SBLogo,
    logoLight: SBLogo,
    route: "/league/baseball",
  },

  ufc: {
    id: "ufc",
    shortName: "UFC",
    name: "Ultimate Fighting Championship",
    color: "#D20A0A",
    secondaryColor: "#000000",
    logo: UFCLogo,
    logoLight: UFCLogoLight,
    route: "/league/mma",
  },

  ufl: {
    id: "ufl",
    shortName: "UFL",
    name: "United Football League",
    color: "#003B71",
    secondaryColor: "#D71920",
    logo: UFLLogo,
    logoLight: UFLLightLogo,
    route: "/league/football",
  },

  wcbb: {
    id: "wcbb",
    shortName: "W. College Basketball",
    name: "Women's College Basketball",
    color: "#009CDE",
    secondaryColor: "#000000",
    logo: WCBBLogo,
    logoLight: WCBBLogo,
    route: "/league/basketball",
  },

  wnba: {
    id: "wnba",
    shortName: "WNBA",
    name: "Women's National Basketball Association",
    color: "#FF6B00",
    secondaryColor: "#FFFFFF",
    logo: WNBALogo,
    logoLight: WNBALogoLight,
    route: "/league/basketball",
  },

  wta: {
    id: "wta",
    shortName: "WTA Tennis",
    name: "WTA Tour",
    color: "#3B1C56",
    secondaryColor: "#C6ED2C",
    logo: WTALogo,
    logoLight: WTALogoLight,
    route: "/league/tennis",
  },
} as const satisfies {
  [League in LeagueType]: LeagueDefinition & { id: League };
};

export type LeagueConfig = (typeof LEAGUE_CONFIG)[LeagueType];

export function resolveLeagueConfig(
  value?: string | null,
): LeagueConfig | null {
  if (!value) return null;

  const normalizedValue = value.trim().toLowerCase();
  const leagueEntry = Object.entries(LEAGUE_CONFIG).find(
    ([leagueId, config]) =>
      leagueId === normalizedValue ||
      config.id.toLowerCase() === normalizedValue ||
      config.shortName.toLowerCase() === normalizedValue ||
      config.name.toLowerCase() === normalizedValue,
  );

  return leagueEntry?.[1] ?? null;
}

export type FavoriteSportId = (typeof LEAGUE_CONFIG)[BrowseableLeague]["id"];
export const HOME_SCORE_LEAGUES = [
  "nba",
  "nfl",
  "cb",
  "sb",
  "ufl",
  "mlb",
  "nhl",
  "cfb",
  "mls",
  "msoc",
  "wsoc",
  "leaguescup",
  "fifa",
  "europa",
  "champions",
  "epl",
  "bundesliga",
  "laliga",
  "ligue1",
  "ligue2",
  "mcbb",
  "wcbb",
  "mcvb",
  "wcvb",
  "wnba",
  "ufc",
  "atp",
  "wta",
] as const satisfies readonly FavoriteSportId[];

export type HomeLeagueId = (typeof HOME_SCORE_LEAGUES)[number];

export const MY_TEAMS_SECTION_ID = "my-teams" as const;
export const MY_TEAMS_SECTION_TITLE = "My Teams";

export const FAVORITE_SPORT_OPTIONS = BROWSEABLE_LEAGUES.map((league) => ({
  league,
  ...LEAGUE_CONFIG[league],
}));

const FAVORITE_SPORT_IDS = new Set<string>(
  FAVORITE_SPORT_OPTIONS.map((option) => option.id),
);

export function isFavoriteSportId(value: unknown): value is FavoriteSportId {
  return typeof value === "string" && FAVORITE_SPORT_IDS.has(value);
}
