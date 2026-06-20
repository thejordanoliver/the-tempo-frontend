// Logos
import { Team } from "@/types/football";
import SixersLogo from "../assets/Logos/76ers.png";
import SixersLogoLight from "../assets/Logos/76ersLight.png";
import BucksLogo from "../assets/Logos/Bucks.png";
import BullsLogo from "../assets/Logos/Bulls.png";
import CavaliersLogo from "../assets/Logos/Cavaliers.png";
import CelticsLogo from "../assets/Logos/Celtics.png";
import ClippersLogo from "../assets/Logos/Clippers.png";
import GrizzliesLogo from "../assets/Logos/Grizzlies.png";
import HawksLogo from "../assets/Logos/Hawks.png";
import HeatLogo from "../assets/Logos/Heat.png";
import HornetsLogo from "../assets/Logos/Hornets.png";
import JazzLogo from "../assets/Logos/Jazz.png";
import JazzLogoLight from "../assets/Logos/JazzLight.png";
import KingsLogo from "../assets/Logos/Kings.png";
import KnicksLogo from "../assets/Logos/Knicks.png";
import LakersLogo from "../assets/Logos/Lakers.png";
import MagicLogo from "../assets/Logos/Magic.png";
import MavericksLogo from "../assets/Logos/Mavericks.png";
import NetsLogo from "../assets/Logos/Nets.png";
import NuggetsLogo from "../assets/Logos/Nuggets.png";
import PacersLogo from "../assets/Logos/Pacers.png";
import PelicansLogo from "../assets/Logos/Pelicans.png";
import PistonsLogo from "../assets/Logos/Pistons.png";
import RaptorsLogo from "../assets/Logos/Raptors.png";
import RaptorsLogoLight from "../assets/Logos/RaptorsLight.png";
import RocketsLogo from "../assets/Logos/Rockets.png";
import RocketsLogoLight from "../assets/Logos/RocketsLight.png";
import SpursLogo from "../assets/Logos/Spurs.png";
import SunsLogo from "../assets/Logos/Suns.png";
import ThunderLogo from "../assets/Logos/Thunder.png";
import TimberwolvesLogo from "../assets/Logos/Timberwolves.png";
import TrailBlazersLogo from "../assets/Logos/TrailBlazers.png";
import WarriorsLogo from "../assets/Logos/Warriors.png";
import WizardsLogo from "../assets/Logos/Wizards.png";

const placeholderLogo =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781619331/placeholder/team.png";

export const teams: Team[] = [
  {
    id: 1,
    espnId: 1,
    summerLeagueId: 132,
    name: "Hawks",
    shortName: "Hawks",
    fullName: "Atlanta Hawks",
    code: "ATL",
    location: "Atlanta, GA",
    city: "Atlanta",
    logo: HawksLogo,
    logoLight: HawksLogo,
    color: "rgba(224, 58, 62, 1)",
    secondaryColor: "rgba(193, 211, 47, 1)",
    established: 1949,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 2,
    espnId: 2,
    summerLeagueId: 133,
    name: "Celtics",
    shortName: "Celtics",
    fullName: "Boston Celtics",
    code: "BOS",
    location: "Boston, MA",
    city: "Boston",
    logo: CelticsLogo,
    logoLight: CelticsLogo,
    color: "rgba(0, 122, 51, 1)",
    secondaryColor: "rgba(255, 255, 255, 1)",
    established: 1949,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 4,
    espnId: 17,
    summerLeagueId: 134,
    name: "Nets",
    shortName: "Nets",
    fullName: "Brooklyn Nets",
    code: "BKN",
    location: "Brooklyn, NY",
    city: "Brooklyn",
    logo: NetsLogo,
    logoLight: NetsLogo,
    color: "rgba(0, 0, 0, 1)",
    secondaryColor: "rgba(255, 255, 255, 1)",
    established: 1976,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 5,
    espnId: 30,
    summerLeagueId: 135,
    name: "Hornets",
    shortName: "Hornets",
    fullName: "Charlotte Hornets",
    code: "CHA",
    location: "Charlotte, NC",
    city: "Charlotte",
    logo: HornetsLogo,
    logoLight: HornetsLogo,
    color: "rgba(29, 17, 96, 1)",
    secondaryColor: "rgba(0, 120, 140, 1)",
    established: 1988,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 6,
    espnId: 4,
    summerLeagueId: 136,
    name: "Bulls",
    shortName: "Bulls",
    fullName: "Chicago Bulls",
    code: "CHI",
    location: "Chicago, IL",
    city: "Chicago",
    logo: BullsLogo,
    logoLight: BullsLogo,
    color: "rgba(206, 17, 65, 1)",
    secondaryColor: "rgba(0, 0, 0, 1)",
    established: 1966,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 7,
    espnId: 5,
    summerLeagueId: 137,
    name: "Cavaliers",
    shortName: "Cavaliers",
    fullName: "Cleveland Cavaliers",
    code: "CLE",
    location: "Cleveland, OH",
    city: "Cleveland",
    logo: CavaliersLogo,
    logoLight: CavaliersLogo,
    color: "#860038",
    secondaryColor: "rgba(253, 187, 48, 1)",
    established: 1970,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 8,
    espnId: 6,
    summerLeagueId: 138,
    name: "Mavericks",
    shortName: "Mavericks",
    fullName: "Dallas Mavericks",
    code: "DAL",
    location: "Dallas, TX",
    city: "Dallas",
    logo: MavericksLogo,
    logoLight: MavericksLogo,
    color: "rgb(0, 83, 188)",
    secondaryColor: "rgb(255, 255, 255)",
    established: 1980,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 9,
    espnId: 7,
    summerLeagueId: 139,
    name: "Nuggets",
    shortName: "Nuggets",
    fullName: "Denver Nuggets",
    code: "DEN",
    location: "Denver, CO",
    city: "Denver",
    logo: NuggetsLogo,
    logoLight: NuggetsLogo,
    color: "rgba(13, 34, 64, 1)",
    secondaryColor: "rgba(255, 198, 39, 1)",
    established: 1976,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 10,
    espnId: 8,
    summerLeagueId: 140,
    name: "Pistons",
    shortName: "Pistons",
    fullName: "Detroit Pistons",
    code: "DET",
    location: "Detroit, MI",
    city: "Detroit",
    logo: PistonsLogo,
    logoLight: PistonsLogo,
    color: "rgba(200, 16, 46, 1)",
    secondaryColor: "rgba(29, 66, 138, 1)",
    established: 1948,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 11,
    espnId: 9,
    summerLeagueId: 141,
    name: "Warriors",
    shortName: "Warriors",
    fullName: "Golden State Warriors",
    code: "GSW",
    location: "San Francisco, CA",
    city: "San Francisco",
    logo: WarriorsLogo,
    logoLight: WarriorsLogo,
    color: "rgba(29, 66, 138, 1)",
    secondaryColor: "rgba(255, 199, 44, 1)",
    established: 1946,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 14,
    espnId: 10,
    summerLeagueId: 142,
    name: "Rockets",
    shortName: "Rockets",
    fullName: "Houston Rockets",
    code: "HOU",
    location: "Houston, TX",
    city: "Houston",
    logo: RocketsLogo,
    logoLight: RocketsLogoLight,
    color: "rgba(206, 17, 65, 1)",
    secondaryColor: "rgb(0, 0, 0)",
    established: 1967,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 15,
    espnId: 11,
    summerLeagueId: 143,
    name: "Pacers",
    shortName: "Pacers",
    fullName: "Indiana Pacers",
    code: "IND",
    location: "Indianapolis, IN",
    city: "Indianapolis",
    logo: PacersLogo,
    logoLight: PacersLogo,
    color: "rgba(0, 45, 98, 1)",
    secondaryColor: "rgba(255, 198, 39, 1)",
    established: 1976,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 16,
    espnId: 12,
    summerLeagueId: 144,
    name: "Clippers",
    shortName: "Clippers",
    fullName: "Los Angeles Clippers",
    code: "LAC",
    location: "Los Angeles, CA",
    city: "Los Angeles",
    logo: ClippersLogo,
    logoLight: ClippersLogo,
    color: "rgba(200, 16, 46, 1)",
    secondaryColor: "rgba(29, 66, 148, 1)",
    established: 1970,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 17,
    espnId: 13,
    summerLeagueId: 145,
    name: "Lakers",
    shortName: "Lakers",
    fullName: "Los Angeles Lakers",
    code: "LAL",
    location: "Los Angeles, CA",
    city: "Los Angeles",
    logo: LakersLogo,
    logoLight: LakersLogo,
    color: "#552582",
    secondaryColor: "rgba(253, 185, 39, 1)",
    established: 1948,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 19,
    espnId: 29,
    summerLeagueId: 146,
    name: "Grizzlies",
    shortName: "Grizzlies",
    fullName: "Memphis Grizzlies",
    code: "MEM",
    location: "Memphis, TN",
    city: "Memphis",
    logo: GrizzliesLogo,
    logoLight: GrizzliesLogo,
    color: "rgba(18, 23, 63, 1)",
    secondaryColor: "#5d76a9",
    established: 1995,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 20,
    espnId: 14,
    summerLeagueId: 147,
    name: "Heat",
    shortName: "Heat",
    fullName: "Miami Heat",
    code: "MIA",
    location: "Miami, FL",
    city: "Miami",
    logo: HeatLogo,
    logoLight: HeatLogo,
    color: "#98002e",
    secondaryColor: "rgba(0, 0, 0, 1)",
    established: 1988,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 21,
    espnId: 15,
    summerLeagueId: 148,
    name: "Bucks",
    shortName: "Bucks",
    fullName: "Milwaukee Bucks",
    code: "MIL",
    location: "Milwaukee, WI",
    city: "Milwaukee",
    logo: BucksLogo,
    logoLight: BucksLogo,
    color: "#00471b",
    secondaryColor: "rgba(240, 235, 210, 1)",
    established: 1968,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 22,
    espnId: 16,
    summerLeagueId: 149,
    name: "Timberwolves",
    shortName: "Timberwolves",
    fullName: "Minnesota Timberwolves",
    code: "MIN",
    location: "Minneapolis, MN",
    city: "Minneapolis",
    logo: TimberwolvesLogo,
    logoLight: TimberwolvesLogo,
    color: "#0c2340",
    secondaryColor: "rgba(120, 190, 32, 1)",
    established: 1989,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },

  {
    id: 23,
    espnId: 3,
    summerLeagueId: 150,
    name: "Pelicans",
    shortName: "Pelicans",
    fullName: "New Orleans Pelicans",
    code: "NOP",
    location: "New Orleans, LA",
    city: "New Orleans",
    logo: PelicansLogo,
    logoLight: PelicansLogo,
    color: "#001641",
    secondaryColor: "rgba(227, 24, 55, 1)",
    established: 2002,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 24,
    espnId: 18,
    summerLeagueId: 151,
    name: "Knicks",
    shortName: "Knicks",
    fullName: "New York Knicks",
    code: "NYK",
    location: "New York, NY",
    city: "New York",
    logo: KnicksLogo,
    logoLight: KnicksLogo,
    color: "rgba(0, 114, 206, 1)",
    secondaryColor: "rgba(245, 132, 38, 1)",
    established: 1946,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 25,
    espnId: 25,
    summerLeagueId: 152,
    name: "Thunder",
    shortName: "Thunder",
    fullName: "Oklahoma City Thunder",
    code: "OKC",
    location: "Oklahoma City, OK",
    city: "Oklahoma City",
    logo: ThunderLogo,
    logoLight: ThunderLogo,
    color: "rgba(0, 124, 195, 1)",
    secondaryColor: "rgba(239, 59, 36, 1)",
    established: 1967,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },

  {
    id: 26,
    espnId: 19,
    summerLeagueId: 153,
    name: "Magic",
    shortName: "Magic",
    fullName: "Orlando Magic",
    code: "ORL",
    location: "Orlando, FL",
    city: "Orlando",
    logo: MagicLogo,
    logoLight: MagicLogo,
    color: "rgba(32, 80, 175, 1)",
    secondaryColor: "rgb(255, 255, 255)",
    established: 1989,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 27,
    espnId: 20,
    summerLeagueId: 154,
    name: "76ers",
    shortName: "76ers",
    fullName: "Philadelphia 76ers",
    code: "PHI",
    location: "Philadelphia, PA",
    city: "Philadelphia",
    logo: SixersLogo,
    logoLight: SixersLogoLight,
    color: "rgba(0, 107, 182, 1)",
    secondaryColor: "rgb(255, 255, 255)",
    established: 1949,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 28,
    espnId: 21,
    summerLeagueId: 155,
    name: "Suns",
    shortName: "Suns",
    fullName: "Phoenix Suns",
    code: "PHX",
    location: "Phoenix, AZ",
    city: "Phoenix",
    logo: SunsLogo,
    logoLight: SunsLogo,
    color: "rgba(29, 17, 96, 1)",
    secondaryColor: "rgba(229, 96, 32, 1)",
    established: 1968,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 29,
    espnId: 22,
    summerLeagueId: 156,
    name: "Trail Blazers",
    shortName: "Trail Blazers",
    fullName: "Portland Trail Blazers",
    code: "POR",
    location: "Portland, OR",
    city: "Portland",
    logo: TrailBlazersLogo,
    logoLight: TrailBlazersLogo,
    color: "#e03a3e",
    secondaryColor: "rgba(0, 0, 0, 1)",
    established: 1970,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 30,
    espnId: 23,
    summerLeagueId: 157,
    name: "Kings",
    shortName: "Kings",
    fullName: "Sacramento Kings",
    code: "SAC",
    location: "Sacramento, CA",
    city: "Sacramento",
    logo: KingsLogo,
    logoLight: KingsLogo,
    color: "#5b2b82",
    secondaryColor: "rgba(99, 113, 122, 1)",
    established: 1948,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 31,
    espnId: 24,
    summerLeagueId: 158,
    name: "Spurs",
    shortName: "Spurs",
    fullName: "San Antonio Spurs",
    code: "SAS",
    location: "San Antonio, TX",
    city: "San Antonio",
    logo: SpursLogo,
    logoLight: SpursLogo,
    color: "rgba(0, 0, 0, 1)",
    secondaryColor: "rgba(196,206,211, 1)",
    established: 1976,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 38,
    espnId: 28,
    summerLeagueId: 159,
    name: "Raptors",
    shortName: "Raptors",
    fullName: "Toronto Raptors",
    code: "TOR",
    location: "Toronto, ON",
    city: "Toronto",
    logo: RaptorsLogo,
    logoLight: RaptorsLogoLight,
    color: "rgba(206, 17, 64, 1)",
    secondaryColor: "rgb(255, 255, 255)",
    established: 1995,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 40,
    espnId: 26,
    summerLeagueId: 160,
    name: "Jazz",
    shortName: "Jazz",
    fullName: "Utah Jazz",
    code: "UTA",
    location: "Salt Lake City, UT",
    city: "Salt Lake City",
    logo: JazzLogo,
    logoLight: JazzLogoLight,
    color: "#3e2680",
    secondaryColor: "rgb(255, 255, 255)",
    established: 1974,
    conference: "Western",
    isAllStar: false,
    isActive: true,
  },
  {
    id: 41,
    espnId: 27,
    summerLeagueId: 161,
    name: "Wizards",
    shortName: "Wizards",
    fullName: "Washington Wizards",
    code: "WAS",
    location: "Washington, DC",
    city: "Washington DC",
    logo: WizardsLogo,
    logoLight: WizardsLogo,
    color: "rgb(0, 43, 92)",
    secondaryColor: "rgba(227, 24, 55, 1)",
    established: 1961,
    conference: "Eastern",
    isAllStar: false,
    isActive: true,
  },
];

export const getTeamByESPNId = (espnId: number | string) => {
  return teams.find((t) => t.espnId?.toString() === espnId?.toString());
};

export const getTeamBySummerId = (id?: number | string) =>
  teams.find((t) => String(t.summerLeagueId) === String(id));

export const getNBATeam = (id: number | string) => {
  if (id == null) return undefined;
  return teams.find((t) => String(t.id) === String(id));
};

export function getTeamLogo(id: number | string | undefined, isDark: boolean) {
  if (!id) return placeholderLogo;

  const team = teams.find((t) => String(t.id) === String(id));

  return team
    ? isDark
      ? team.logoLight || team.logo
      : team.logo
    : placeholderLogo;
}

export const nbaDivisionsById = {
  Atlantic: [
    2, // Boston Celtics
    17, // Brooklyn Nets
    18, // New York Knicks
    20, // Philadelphia 76ers
    28, // Toronto Raptors
  ],
  Central: [
    4, // Chicago Bulls
    5, // Cleveland Cavaliers
    8, // Detroit Pistons
    11, // Indiana Pacers
    15, // Milwaukee Bucks
  ],
  Southeast: [
    1, // Atlanta Hawks
    30, // Charlotte Hornets
    14, // Miami Heat
    19, // Orlando Magic
    27, // Washington Wizards
  ],
  Northwest: [
    7, // Denver Nuggets
    16, // Minnesota Timberwolves
    25, // Oklahoma City Thunder
    22, // Portland Trail Blazers
    26, // Utah Jazz
  ],
  Pacific: [
    9, // Golden State Warriors
    12, // LA Clippers
    13, // Los Angeles Lakers
    21, // Phoenix Suns
    23, // Sacramento Kings
  ],
  Southwest: [
    6, // Dallas Mavericks
    10, // Houston Rockets
    29, // Memphis Grizzlies
    3, // New Orleans Pelicans
    24, // San Antonio Spurs
  ],
};
