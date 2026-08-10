import { Team } from "@/types/team";
import AvalancheLogo from "../assets/Hockey/NHL_Logos/Avalanche.png";
import AvalancheLogoLight from "../assets/Hockey/NHL_Logos/AvalancheLight.png";
import BlackhawksLogo from "../assets/Hockey/NHL_Logos/Blackhawks.png";
import BlackhawksLogoLight from "../assets/Hockey/NHL_Logos/BlackhawksLight.png";
import BlueJacketsLogo from "../assets/Hockey/NHL_Logos/BlueJackets.png";
import BlueJacketsLogoLight from "../assets/Hockey/NHL_Logos/BlueJacketsLight.png";
import BluesLogo from "../assets/Hockey/NHL_Logos/Blues.png";
import BluesLogoLight from "../assets/Hockey/NHL_Logos/BluesLight.png";
import BruinsLogo from "../assets/Hockey/NHL_Logos/Bruins.png";
import BruinsLogoLight from "../assets/Hockey/NHL_Logos/BruinsLight.png";
import CanadiensLogo from "../assets/Hockey/NHL_Logos/Canadiens.png";
import CanadiensLogoLight from "../assets/Hockey/NHL_Logos/CanadiensLight.png";
import CanucksLogo from "../assets/Hockey/NHL_Logos/Canucks.png";
import CanucksLogoLight from "../assets/Hockey/NHL_Logos/CanucksLight.png";
import CapitalsLogo from "../assets/Hockey/NHL_Logos/Capitals.png";
import CapitalsLogoLight from "../assets/Hockey/NHL_Logos/CapitalsLight.png";
import DevilsLogo from "../assets/Hockey/NHL_Logos/Devils.png";
import DevilsLogoLight from "../assets/Hockey/NHL_Logos/DevilsLight.png";
import DucksLogo from "../assets/Hockey/NHL_Logos/Ducks.png";
import DucksLogoLight from "../assets/Hockey/NHL_Logos/DucksLight.png";
import FlamesLogo from "../assets/Hockey/NHL_Logos/Flames.png";
import FlamesLogoLight from "../assets/Hockey/NHL_Logos/FlamesLight.png";
import FlyersLogo from "../assets/Hockey/NHL_Logos/Flyers.png";
import FlyersLogoLight from "../assets/Hockey/NHL_Logos/FlyersLight.png";
import GoldenKnightsLogo from "../assets/Hockey/NHL_Logos/GoldenKnights.png";
import GoldenKnightsLogoLight from "../assets/Hockey/NHL_Logos/GoldenKnightsLight.png";
import HurricanesLogo from "../assets/Hockey/NHL_Logos/Hurricanes.png";
import HurricanesLogoLight from "../assets/Hockey/NHL_Logos/HurricanesLight.png";
import IslandersLogo from "../assets/Hockey/NHL_Logos/Islanders.png";
import IslandersLogoLight from "../assets/Hockey/NHL_Logos/IslandersLight.png";
import JetsLogo from "../assets/Hockey/NHL_Logos/Jets.png";
import JetsLogoLight from "../assets/Hockey/NHL_Logos/JetsLight.png";
import KingsLogo from "../assets/Hockey/NHL_Logos/Kings.png";
import KingsLogoLight from "../assets/Hockey/NHL_Logos/KingsLight.png";
import KrakenLogo from "../assets/Hockey/NHL_Logos/Kraken.png";
import KrakenLogoLight from "../assets/Hockey/NHL_Logos/KrakenLight.png";
import LightningLogo from "../assets/Hockey/NHL_Logos/Lightning.png";
import LightningLogoLight from "../assets/Hockey/NHL_Logos/LightningLight.png";
import MammothLogo from "../assets/Hockey/NHL_Logos/Mammoth.png";
import MammothLogoLight from "../assets/Hockey/NHL_Logos/MammothLight.png";
import MapleLeafsLogo from "../assets/Hockey/NHL_Logos/MapleLeafs.png";
import MapleLeafsLogoLight from "../assets/Hockey/NHL_Logos/MapleLeafsLight.png";
import OilersLogo from "../assets/Hockey/NHL_Logos/Oilers.png";
import OilersLogoLight from "../assets/Hockey/NHL_Logos/OilersLight.png";
import PanthersLogo from "../assets/Hockey/NHL_Logos/Panthers.png";
import PanthersLogoLight from "../assets/Hockey/NHL_Logos/PanthersLight.png";
import PenguinsLogo from "../assets/Hockey/NHL_Logos/Penguins.png";
import PenguinsLogoLight from "../assets/Hockey/NHL_Logos/PenguinsLight.png";
import PredatorsLogo from "../assets/Hockey/NHL_Logos/Predators.png";
import PredatorsLogoLight from "../assets/Hockey/NHL_Logos/PredatorsLight.png";
import RangersLogo from "../assets/Hockey/NHL_Logos/Rangers.png";
import RangersLogoLight from "../assets/Hockey/NHL_Logos/RangersLight.png";
import RedWingsLogo from "../assets/Hockey/NHL_Logos/RedWings.png";
import RedWingsLogoLight from "../assets/Hockey/NHL_Logos/RedWingsLight.png";
import SabresLogo from "../assets/Hockey/NHL_Logos/Sabres.png";
import SabresLogoLight from "../assets/Hockey/NHL_Logos/SabresLight.png";
import SenatorsLogo from "../assets/Hockey/NHL_Logos/Senators.png";
import SenatorsLogoLight from "../assets/Hockey/NHL_Logos/SenatorsLight.png";
import SharksLogo from "../assets/Hockey/NHL_Logos/Sharks.png";
import SharksLogoLight from "../assets/Hockey/NHL_Logos/SharksLight.png";
import StarsLogo from "../assets/Hockey/NHL_Logos/Stars.png";
import StarsLogoLight from "../assets/Hockey/NHL_Logos/StarsLight.png";
import WildLogo from "../assets/Hockey/NHL_Logos/Wild.png";
import WildLogoLight from "../assets/Hockey/NHL_Logos/WildLight.png";
import PlaceholderLogo from "../assets/Placeholders/teamPlaceholder.png";

export const nhlTeams: Team[] = [
  {
    id: 670,
    espnId: 25,
    code: "ANA",
    name: "Ducks",
    fullName: "Anaheim Ducks",
    location: "Anaheim, CA",
    city: "Anaheim",
    color: "#fc4c02",
    secondaryColor: "#000000",
    logo: DucksLogo,
    logoLight: DucksLogoLight,
    established: 1993,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 673,
    espnId: 1,
    code: "BOS",
    name: "Bruins",
    fullName: "Boston Bruins",
    location: "Boston, MA",
    city: "Boston",
    color: "#231f20",
    secondaryColor: "#fdb71a",
    logo: BruinsLogo,
    logoLight: BruinsLogoLight,
    established: 1924,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 674,
    espnId: 2,
    code: "BUF",
    name: "Sabres",
    fullName: "Buffalo Sabres",
    location: "Buffalo, NY",
    city: "Buffalo",
    color: "#00468b",
    secondaryColor: "#fdb71a",
    logo: SabresLogo,
    logoLight: SabresLogoLight,
    established: 1970,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 675,
    espnId: 3,
    code: "CGY",
    name: "Flames",
    fullName: "Calgary Flames",
    location: "Calgary, AB",
    city: "Calgary",
    color: "#dd1a32",
    secondaryColor: "#000000",
    logo: FlamesLogo,
    logoLight: FlamesLogoLight,
    established: 1972,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 676,
    espnId: 7,
    code: "CAR",
    name: "Hurricanes",
    fullName: "Carolina Hurricanes",
    location: "Raleigh, NC",
    city: "Raleigh",
    color: "#e30426",
    secondaryColor: "#000000",
    logo: HurricanesLogo,
    logoLight: HurricanesLogoLight,
    established: 1972,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 678,
    espnId: 4,
    code: "CHI",
    name: "Blackhawks",
    fullName: "Chicago Blackhawks",
    location: "Chicago, IL",
    city: "Chicago",
    color: "#e31937",
    secondaryColor: "#000000",
    logo: BlackhawksLogo,
    logoLight: BlackhawksLogoLight,
    established: 1926,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 679,
    espnId: 17,
    code: "COL",
    name: "Avalanche",
    fullName: "Colorado Avalanche",
    location: "Denver, CO",
    city: "Denver",
    color: "#860038",
    secondaryColor: "#005ea3",
    logo: AvalancheLogo,
    logoLight: AvalancheLogoLight,
    established: 1972,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 680,
    espnId: 29,
    code: "CBJ",
    name: "Blue Jackets",
    fullName: "Columbus Blue Jackets",
    location: "Columbus, OH",
    city: "Columbus",
    color: "#002d62",
    secondaryColor: "#e31937",
    logo: BlueJacketsLogo,
    logoLight: BlueJacketsLogoLight,
    established: 2000,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 681,
    espnId: 9,
    code: "DAL",
    name: "Stars",
    fullName: "Dallas Stars",
    location: "Dallas, TX",
    city: "Dallas",
    color: "#20864c",
    secondaryColor: "#000000",
    logo: StarsLogo,
    logoLight: StarsLogoLight,
    established: 1967,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 682,
    espnId: 5,
    code: "DET",
    name: "Red Wings",
    fullName: "Detroit Red Wings",
    location: "Detroit, MI",
    city: "Detroit",
    color: "#e30526",
    secondaryColor: "#ffffff",
    logo: RedWingsLogo,
    logoLight: RedWingsLogoLight,
    established: 1926,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 683,
    espnId: 6,
    code: "EDM",
    name: "Oilers",
    fullName: "Edmonton Oilers",
    location: "Edmonton, AB",
    city: "Edmonton",
    color: "#00205b",
    secondaryColor: "#ff4c00",
    logo: OilersLogo,
    logoLight: OilersLogoLight,
    established: 1972,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 684,
    espnId: 26,
    code: "FLA",
    name: "Panthers",
    fullName: "Florida Panthers",
    location: "Sunrise, FL",
    city: "Sunrise",
    color: "#e51937",
    secondaryColor: "#002d62",
    logo: PanthersLogo,
    logoLight: PanthersLogoLight,
    established: 1993,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 685,
    espnId: 8,
    code: "LA",
    name: "Kings",
    fullName: "Los Angeles Kings",
    location: "Los Angeles, CA",
    city: "Los Angeles",
    color: "#121212",
    secondaryColor: "#a2aaad",
    logo: KingsLogo,
    logoLight: KingsLogoLight,
    established: 1967,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 687,
    espnId: 30,
    code: "MIN",
    name: "Wild",
    fullName: "Minnesota Wild",
    location: "St. Paul, MN",
    city: "St. Paul",
    color: "#124734",
    secondaryColor: "#ae122a",
    logo: WildLogo,
    logoLight: WildLogoLight,
    established: 2000,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 688,
    espnId: 10,
    code: "MTL",
    name: "Canadiens",
    fullName: "Montreal Canadiens",
    location: "Montreal, QC",
    city: "Montreal",
    color: "#c41230",
    secondaryColor: "#013a81",
    logo: CanadiensLogo,
    logoLight: CanadiensLogoLight,
    established: 1909,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 689,
    espnId: 27,
    code: "NSH",
    name: "Predators",
    fullName: "Nashville Predators",
    location: "Nashville, TN",
    city: "Nashville",
    color: "#fdba31",
    secondaryColor: "#002d62",
    logo: PredatorsLogo,
    logoLight: PredatorsLogoLight,
    established: 1998,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 690,
    espnId: 11,
    code: "NJ",
    name: "Devils",
    fullName: "New Jersey Devils",
    location: "Newark, NJ",
    city: "Newark",
    color: "#e30b2b",
    secondaryColor: "#000000",
    logo: DevilsLogo,
    logoLight: DevilsLogoLight,
    established: 1974,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 691,
    espnId: 12,
    code: "NYI",
    name: "Islanders",
    fullName: "New York Islanders",
    location: "Elmont, NY",
    city: "Elmont",
    color: "#00529b",
    secondaryColor: "#f47d31",
    logo: IslandersLogo,
    logoLight: IslandersLogoLight,
    established: 1972,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 692,
    espnId: 13,
    code: "NYR",
    name: "Rangers",
    fullName: "New York Rangers",
    location: "New York, NY",
    city: "New York",
    color: "#0056ae",
    secondaryColor: "#e51937",
    logo: RangersLogo,
    logoLight: RangersLogoLight,
    established: 1926,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 693,
    espnId: 14,
    code: "OTT",
    name: "Senators",
    fullName: "Ottawa Senators",
    location: "Ottawa, ON",
    city: "Ottawa",
    color: "#dd1a32",
    secondaryColor: "#b79257",
    logo: SenatorsLogo,
    logoLight: SenatorsLogoLight,
    established: 1883,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 695,
    espnId: 15,
    code: "PHI",
    name: "Flyers",
    fullName: "Philadelphia Flyers",
    location: "Philadelphia, PA",
    city: "Philadelphia",
    color: "#fe5823",
    secondaryColor: "#000000",
    logo: FlyersLogo,
    logoLight: FlyersLogoLight,
    established: 1967,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 696,
    espnId: 16,
    code: "PIT",
    name: "Penguins",
    fullName: "Pittsburgh Penguins",
    location: "Pittsburgh, PA",
    city: "Pittsburgh",
    color: "#000000",
    secondaryColor: "#fdb71a",
    logo: PenguinsLogo,
    logoLight: PenguinsLogoLight,
    established: 1967,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 697,
    espnId: 18,
    code: "SJ",
    name: "Sharks",
    fullName: "San Jose Sharks",
    location: "San Jose, CA",
    city: "San Jose",
    color: "#00788a",
    secondaryColor: "#070707",
    logo: SharksLogo,
    logoLight: SharksLogoLight,
    established: 1991,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 1436,
    espnId: 124292,
    code: "SEA",
    name: "Kraken",
    fullName: "Seattle Kraken",
    location: "Seattle, WA",
    city: "Seattle",
    color: "#000d33",
    secondaryColor: "#a3dce4",
    logo: KrakenLogo,
    logoLight: KrakenLogoLight,
    established: 2021,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 698,
    espnId: 19,
    code: "STL",
    name: "Blues",
    fullName: "St. Louis Blues",
    location: "St. Louis, MO",
    city: "St. Louis",
    color: "#0070b9",
    secondaryColor: "#fdb71a",
    logo: BluesLogo,
    logoLight: BluesLogoLight,
    established: 1967,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 699,
    espnId: 20,
    code: "TB",
    name: "Lightning",
    fullName: "Tampa Bay Lightning",
    location: "Tampa, FL",
    city: "Tampa",
    color: "#003e7e",
    secondaryColor: "#ffffff",
    logo: LightningLogo,
    logoLight: LightningLogoLight,
    established: 1992,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 700,
    espnId: 21,
    code: "TOR",
    name: "Maple Leafs",
    fullName: "Toronto Maple Leafs",
    location: "Toronto, ON",
    city: "Toronto",
    color: "#003e7e",
    secondaryColor: "#ffffff",
    logo: MapleLeafsLogo,
    logoLight: MapleLeafsLogoLight,
    established: 1917,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 2483,
    espnId: 129764,
    code: "UTAH",
    name: "Mammoth",
    fullName: "Utah Mammoth",
    location: "Salt Lake City, UT",
    city: "Salt Lake City",
    color: "#000000",
    secondaryColor: "#7ab2e1",
    logo: MammothLogo,
    logoLight: MammothLogoLight,
    established: 2024,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 701,
    espnId: 22,
    code: "VAN",
    name: "Canucks",
    fullName: "Vancouver Canucks",
    location: "Vancouver, BC",
    city: "Vancouver",
    color: "#003e7e",
    secondaryColor: "#008752",
    logo: CanucksLogo,
    logoLight: CanucksLogoLight,
    established: 1945,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 702,
    espnId: 37,
    code: "VGK",
    name: "Golden Knights",
    fullName: "Vegas Golden Knights",
    location: "Las Vegas, NV",
    city: "Las Vegas",
    color: "#344043",
    secondaryColor: "#b4975a",
    logo: GoldenKnightsLogo,
    logoLight: GoldenKnightsLogoLight,
    established: 2017,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 703,
    espnId: 23,
    code: "WSH",
    name: "Capitals",
    fullName: "Washington Capitals",
    location: "Washington, DC",
    city: "Washington",
    color: "#d71830",
    secondaryColor: "#0b1f41",
    logo: CapitalsLogo,
    logoLight: CapitalsLogoLight,
    established: 1974,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
  {
    id: 704,
    espnId: 28,
    code: "WPG",
    name: "Jets",
    fullName: "Winnipeg Jets",
    location: "Winnipeg, MB",
    city: "Winnipeg",
    color: "#002d62",
    secondaryColor: "#c41230",
    logo: JetsLogo,
    logoLight: JetsLogoLight,
    established: 1972,
    isActive: true,
    isAllStar: false,
    isNational: false,
   league: "NHL"
  },
];

export const getNHLTeam = (id: number | string) =>
  nhlTeams.find((t) => String(t.id) === String(id)) || undefined;

export const getNHLTeamLogo = (
  id: number | string | undefined,
  isDark: boolean,
) => {
  const team = nhlTeams.find((t) => String(t.id) === String(id));
  if (!team) return PlaceholderLogo;

  // adjust based on your actual team fields
  return isDark ? team.logoLight || team.logo : team.logo;
};

export const getNHLTeamByEspnId = (id: number | string) =>
  nhlTeams.find((t) => String(t.espnId) === String(id)) || null;
