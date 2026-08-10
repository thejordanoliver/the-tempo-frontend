import { Team } from "@/types/football/football";
import {
  default as AngelsLogo,
  default as AngelsLogoLight,
} from "assets/Baseball/MLB_Logos/Angels.png";
import {
  default as AstrosLogo,
  default as AstrosLogoLight,
} from "assets/Baseball/MLB_Logos/Astros.png";
import AthleticsLogo from "assets/Baseball/MLB_Logos/Athletics.png";
import AthleticsLogoLight from "assets/Baseball/MLB_Logos/AthleticsLight.png";
import {
  default as BlueJaysLogo,
  default as BlueJaysLogoLight,
} from "assets/Baseball/MLB_Logos/BlueJays.png";
import BravesLogo from "assets/Baseball/MLB_Logos/Braves.png";
import BravesLogoLight from "assets/Baseball/MLB_Logos/BravesLight.png";
import {
  default as BrewersLogo,
  default as BrewersLogoLight,
} from "assets/Baseball/MLB_Logos/Brewers.png";
import CardinalsLogo from "assets/Baseball/MLB_Logos/Cardinals.png";
import CardinalsLogoLight from "assets/Baseball/MLB_Logos/CardinalsLight.png";
import {
  default as CubsLogo,
  default as CubsLogoLight,
} from "assets/Baseball/MLB_Logos/Cubs.png";
import {
  default as DiamondbacksLogo,
  default as DiamondbacksLogoLight,
} from "assets/Baseball/MLB_Logos/Diamondbacks.png";
import DodgersLogo from "assets/Baseball/MLB_Logos/Dodgers.png";
import DodgersLogoLight from "assets/Baseball/MLB_Logos/DodgersLight.png";
import {
  default as GiantsLogo,
  default as GiantsLogoLight,
} from "assets/Baseball/MLB_Logos/Giants.png";
import GuardiansLogo from "assets/Baseball/MLB_Logos/Guardians.png";
import GuardiansLogoLight from "assets/Baseball/MLB_Logos/GuardiansLight.png";
import {
  default as MarinersLogo,
  default as MarinersLogoLight,
} from "assets/Baseball/MLB_Logos/Mariners.png";
import {
  default as MarlinsLogo,
  default as MarlinsLogoLight,
} from "assets/Baseball/MLB_Logos/Marlins.png";
import {
  default as MetsLogo,
  default as MetsLogoLight,
} from "assets/Baseball/MLB_Logos/Mets.png";
import NationalsLogo from "assets/Baseball/MLB_Logos/Nationals.png";
import NationalsLogoLight from "assets/Baseball/MLB_Logos/NationalsLight.png";
import {
  default as OriolesLogo,
  default as OriolesLogoLight,
} from "assets/Baseball/MLB_Logos/Orioles.png";
import PadresLogo from "assets/Baseball/MLB_Logos/Padres.png";
import PadresLogoLight from "assets/Baseball/MLB_Logos/PadresLight.png";
import PhilliesLogo from "assets/Baseball/MLB_Logos/Phillies.png";
import PhilliesLogoLight from "assets/Baseball/MLB_Logos/PhilliesLight.png";
import {
  default as PiratesLogo,
  default as PiratesLogoLight,
} from "assets/Baseball/MLB_Logos/Pirates.png";
import RangersLogo from "assets/Baseball/MLB_Logos/Rangers.png";
import RangersLogoLight from "assets/Baseball/MLB_Logos/RangersLight.png";
import RaysLogo from "assets/Baseball/MLB_Logos/Rays.png";
import RaysLogoLight from "assets/Baseball/MLB_Logos/RaysLight.png";
import RedsLogo from "assets/Baseball/MLB_Logos/Reds.png";
import RedsLogoLight from "assets/Baseball/MLB_Logos/RedsLight.png";
import RedSoxLogo from "assets/Baseball/MLB_Logos/RedSox.png";
import RedSoxLogoLight from "assets/Baseball/MLB_Logos/RedSoxLight.png";
import RockiesLogo from "assets/Baseball/MLB_Logos/Rockies.png";
import RockiesLogoLight from "assets/Baseball/MLB_Logos/RockiesLight.png";
import RoyalsLogo from "assets/Baseball/MLB_Logos/Royals.png";
import RoyalsLogoLight from "assets/Baseball/MLB_Logos/RoyalsLight.png";
import TigersLogo from "assets/Baseball/MLB_Logos/Tigers.png";
import TigersLogoLight from "assets/Baseball/MLB_Logos/TigersLight.png";
import TwinsLogo from "assets/Baseball/MLB_Logos/Twins.png";
import TwinsLogoLight from "assets/Baseball/MLB_Logos/TwinsLight.png";
import WhiteSoxLogo from "assets/Baseball/MLB_Logos/WhiteSox.png";
import WhiteSoxLogoLight from "assets/Baseball/MLB_Logos/WhiteSoxLight.png";
import YankeesLogo from "assets/Baseball/MLB_Logos/Yankees.png";
import YankeesLogoLight from "assets/Baseball/MLB_Logos/YankeesLight.png";
import PlaceholderLogo from "../assets/Placeholders/teamPlaceholder.png";

export const mlbTeams: Team[] = [
  {
    id: 2,
    espnId: 29,
    name: "Diamondbacks",
    shortName: "Diamondbacks",
    fullName: "Arizona Diamondbacks",
    code: "ARI",
    color: "#aa182c",
    secondaryColor: "#000000",
    logo: DiamondbacksLogo,
    logoLight: DiamondbacksLogoLight,
    established: 1998,
    city: "Phoenix, AZ",
    location: "Phoenix",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 963,
    espnId: 11,
    name: "Athletics",
    shortName: "Athletics",
    fullName: "Oakland Athletics",
    code: "ATH",
    color: "#003831",
    secondaryColor: "#efb21e",
    logo: AthleticsLogo,
    logoLight: AthleticsLogoLight,
    established: 1901,
    city: "Oakland, CA",
    location: "Oakland",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 3,
    espnId: 15,
    name: "Braves",
    shortName: "Braves",
    fullName: "Atlanta Braves",
    code: "ATL",
    color: "#0c2340",
    secondaryColor: "#ba0c2f",
    logo: BravesLogo,
    logoLight: BravesLogoLight,
    established: 1876,
    city: "Atlanta, GA",
    location: "Atlanta",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 4,
    espnId: 1,
    name: "Orioles",
    shortName: "Orioles",
    fullName: "Baltimore Orioles",
    code: "BAL",
    color: "#df4601",
    secondaryColor: "#000000",
    logo: OriolesLogo,
    logoLight: OriolesLogoLight,
    established: 1901,
    city: "Baltimore, MD",
    location: "Baltimore",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 5,
    espnId: 2,
    name: "Red Sox",
    shortName: "Red Sox",
    fullName: "Boston Red Sox",
    code: "BOS",
    color: "#0d2b56",
    secondaryColor: "#bd3039",
    logo: RedSoxLogo,
    logoLight: RedSoxLogoLight,
    established: 1901,
    city: "Boston, MA",
    location: "Boston",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 6,
    espnId: 16,
    name: "Cubs",
    shortName: "Cubs",
    fullName: "Chicago Cubs",
    code: "CHC",
    color: "#0e3386",
    secondaryColor: "#cc3433",
    logo: CubsLogo,
    logoLight: CubsLogoLight,
    established: 1876,
    city: "Chicago, IL",
    location: "Chicago",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 7,
    espnId: 4,
    name: "White Sox",
    shortName: "White Sox",
    fullName: "Chicago White Sox",
    code: "CHW",
    color: "#000000",
    secondaryColor: "#c4ced4",
    logo: WhiteSoxLogo,
    logoLight: WhiteSoxLogoLight,
    established: 1901,
    city: "Chicago, IL",
    location: "Chicago",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 8,
    espnId: 17,
    name: "Reds",
    shortName: "Reds",
    fullName: "Cincinnati Reds",
    code: "CIN",
    color: "#c6011f",
    secondaryColor: "#ffffff",
    logo: RedsLogo,
    logoLight: RedsLogoLight,
    established: 1882,
    city: "Cincinnati, OH",
    location: "Cincinnati",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 9,
    espnId: 5,
    name: "Guardians",
    shortName: "Guardians",
    fullName: "Cleveland Guardians",
    code: "CLE",
    color: "#002b5c",
    secondaryColor: "#e31937",
    logo: GuardiansLogo,
    logoLight: GuardiansLogoLight,
    established: 1901,
    city: "Cleveland, OH",
    location: "Cleveland",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 10,
    espnId: 27,
    name: "Rockies",
    shortName: "Rockies",
    fullName: "Colorado Rockies",
    code: "COL",
    color: "#33006f",
    secondaryColor: "#000000",
    logo: RockiesLogo,
    logoLight: RockiesLogoLight,
    established: 1993,
    city: "Denver, CO",
    location: "Denver",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 12,
    espnId: 6,
    name: "Tigers",
    shortName: "Tigers",
    fullName: "Detroit Tigers",
    code: "DET",
    color: "#0a2240",
    secondaryColor: "#ff4713",
    logo: TigersLogo,
    logoLight: TigersLogoLight,
    established: 1901,
    city: "Detroit, MI",
    location: "Detroit",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 15,
    espnId: 18,
    name: "Astros",
    shortName: "Astros",
    fullName: "Houston Astros",
    code: "HOU",
    color: "#002d62",
    secondaryColor: "#eb6e1f",
    logo: AstrosLogo,
    logoLight: AstrosLogoLight,
    established: 1962,
    city: "Houston, TX",
    location: "Houston",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 16,
    espnId: 7,
    name: "Royals",
    shortName: "Royals",
    fullName: "Kansas City Royals",
    code: "KC",
    color: "#004687",
    secondaryColor: "#7ab2dd",
    logo: RoyalsLogo,
    logoLight: RoyalsLogoLight,
    established: 1969,
    city: "Kansas City, MO",
    location: "Kansas",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 17,
    espnId: 3,
    name: "Angels",
    shortName: "Angels",
    fullName: "Los Angeles Angels",
    code: "LAA",
    color: "#ba0021",
    secondaryColor: "#c4ced4",
    logo: AngelsLogo,
    logoLight: AngelsLogoLight,
    established: 1961,
    city: "Anaheim, CA",
    location: "Anaheim",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 18,
    espnId: 19,
    name: "Dodgers",
    shortName: "Dodgers",
    fullName: "Los Angeles Dodgers",
    code: "LAD",
    color: "#005a9c",
    secondaryColor: "#ffffff",
    logo: DodgersLogo,
    logoLight: DodgersLogoLight,
    established: 1884,
    city: "Los Angeles, CA",
    location: "Los Angeles",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 19,
    espnId: 28,
    name: "Marlins",
    shortName: "Marlins",
    fullName: "Miami Marlins",
    code: "MIA",
    color: "#00a3e0",
    secondaryColor: "#000000",
    logo: MarlinsLogo,
    logoLight: MarlinsLogoLight,
    established: 1993,
    city: "Miami, FL",
    location: "Miami",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 20,
    espnId: 8,
    name: "Brewers",
    shortName: "Brewers",
    fullName: "Milwaukee Brewers",
    code: "MIL",
    color: "#13294b",
    secondaryColor: "#ffc72c",
    logo: BrewersLogo,
    logoLight: BrewersLogoLight,
    established: 1969,
    city: "Milwaukee, WI",
    location: "Milwaukee",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 22,
    espnId: 9,
    name: "Twins",
    shortName: "Twins",
    fullName: "Minnesota Twins",
    code: "MIN",
    color: "#031f40",
    secondaryColor: "#e20e32",
    logo: TwinsLogo,
    logoLight: TwinsLogoLight,
    established: 1901,
    city: "Minneapolis, MN",
    location: "Minneapolis",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 24,
    espnId: 21,
    name: "Mets",
    shortName: "Mets",
    fullName: "New York Mets",
    code: "NYM",
    color: "#002d72",
    secondaryColor: "#ff5910",
    logo: MetsLogo,
    logoLight: MetsLogoLight,
    established: 1962,
    city: "Queens, NY",
    location: "Queens",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 25,
    espnId: 10,
    name: "Yankees",
    shortName: "Yankees",
    fullName: "New York Yankees",
    code: "NYY",
    color: "#132448",
    secondaryColor: "#c4ced4",
    logo: YankeesLogo,
    logoLight: YankeesLogoLight,
    established: 1901,
    city: "Bronx, NY",
    location: "Bronx",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 27,
    espnId: 22,
    name: "Phillies",
    shortName: "Phillies",
    fullName: "Philadelphia Phillies",
    code: "PHI",
    color: "#e81828",
    secondaryColor: "#003278",
    logo: PhilliesLogo,
    logoLight: PhilliesLogoLight,
    established: 1883,
    city: "Philadelphia, PA",
    location: "Philadelphia",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 28,
    espnId: 23,
    name: "Pirates",
    shortName: "Pirates",
    fullName: "Pittsburgh Pirates",
    code: "PIT",
    color: "#000000",
    secondaryColor: "#fdb827",
    logo: PiratesLogo,
    logoLight: PiratesLogoLight,
    established: 1882,
    city: "Pittsburgh, PA",
    location: "Pittsburgh",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 30,
    espnId: 25,
    name: "Padres",
    shortName: "Padres",
    fullName: "San Diego Padres",
    code: "SD",
    color: "#2f241d",
    secondaryColor: "#ffc425",
    logo: PadresLogo,
    logoLight: PadresLogoLight,
    established: 1969,
    city: "San Diego, CA",
    location: "San Diego",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 31,
    espnId: 26,
    name: "Giants",
    shortName: "Giants",
    fullName: "San Francisco Giants",
    code: "SF",
    color: "#000000",
    secondaryColor: "#fd5a1e",
    logo: GiantsLogo,
    logoLight: GiantsLogoLight,
    established: 1883,
    city: "San Francisco, CA",
    location: "San Francisco",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 32,
    espnId: 12,
    name: "Mariners",
    shortName: "Mariners",
    fullName: "Seattle Mariners",
    code: "SEA",
    color: "#005c5c",
    secondaryColor: "#0c2c56",
    logo: MarinersLogo,
    logoLight: MarinersLogoLight,
    established: 1977,
    city: "Seattle, WA",
    location: "Seattle",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 33,
    espnId: 24,
    name: "Cardinals",
    shortName: "Cardinals",
    fullName: "St. Louis Cardinals",
    code: "STL",
    color: "#be0a14",
    secondaryColor: "#001541",
    logo: CardinalsLogo,
    logoLight: CardinalsLogoLight,
    established: 1882,
    city: "St. Louis, MO",
    location: "St. Louis",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 34,
    espnId: 30,
    name: "Rays",
    shortName: "Rays",
    fullName: "Tampa Bay Rays",
    code: "TB",
    color: "#092c5c",
    secondaryColor: "#8fbce6",
    logo: RaysLogo,
    logoLight: RaysLogoLight,
    established: 1998,
    city: "St. Petersburg, FL",
    location: "St. Petersburg",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 35,
    espnId: 13,
    name: "Rangers",
    shortName: "Rangers",
    fullName: "Texas Rangers",
    code: "TEX",
    color: "#003278",
    secondaryColor: "#c0111f",
    logo: RangersLogo,
    logoLight: RangersLogoLight,
    established: 1961,
    city: "Arlington, TX",
    location: "Arlington",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 36,
    espnId: 14,
    name: "Blue Jays",
    shortName: "Blue Jays",
    fullName: "Toronto Blue Jays",
    code: "TOR",
    color: "#134a8e",
    secondaryColor: "#6cace5",
    logo: BlueJaysLogo,
    logoLight: BlueJaysLogoLight,
    established: 1977,
    city: "Toronto, Ontario",
    location: "Toronto",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
  {
    id: 37,
    espnId: 20,
    name: "Nationals",
    shortName: "Nationals",
    fullName: "Washington Nationals",
    code: "WSH",
    color: "#ab0003",
    secondaryColor: "#11225b",
    logo: NationalsLogo,
    logoLight: NationalsLogoLight,
    established: 1969,
    city: "Washington, DC",
    location: "Washington",
    isAllStar: false,
    isActive: true,
    isNational: false,
    league: "MLB"
  },
];

export const getMLBTeam = (id: number | string) =>
  mlbTeams.find((t) => String(t.id) === String(id));

export const getMLBTeamLogo = (
  id: number | string | undefined,
  isDark: boolean,
) => {
  const team = mlbTeams.find((t) => String(t.id) === String(id));
  if (!team) return PlaceholderLogo;

  return isDark ? team.logoLight || team.logo : team.logo;
};

export const getMLBTeamByEspnId = (id: number | string) =>
  mlbTeams.find((t) => String(t.espnId) === String(id));
