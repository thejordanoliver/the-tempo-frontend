import { NHLTeam } from "types/hockey";
import { Venue } from "types/types";

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

export const nhlTeams: NHLTeam[] = [
  {
    id: 670,
    espnID: 25,
    code: "ANA",
    name: "Ducks",
    fullName: "Anaheim Ducks",
    location: "Anaheim, CA",
    color: "#fc4c02",
    secondaryColor: "#000000",
    logo: DucksLogo,
    logoLight: DucksLogoLight,
    established: 1993,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Honda Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/ducks.jpg",
    latitude: 33.8078,
    longitude: -117.8765,
    address: "2695 E Katella Ave, Anaheim, CA 92806",
    venueCapacity: "17,174",
  },
  {
    id: 673,
    espnID: 1,
    code: "BOS",
    name: "Bruins",
    fullName: "Boston Bruins",
    location: "Boston, MA",
    color: "#231f20",
    secondaryColor: "#fdb71a",
    logo: BruinsLogo,
    logoLight: BruinsLogoLight,
    established: 1924,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "TD Garden",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/bruins.jpg",
    latitude: 42.3662,
    longitude: -71.0621,
    address: "100 Legends Way, Boston, MA 02114",
    venueCapacity: "17,850",
  },
  {
    id: 674,
    espnID: 2,
    code: "BUF",
    name: "Sabres",
    fullName: "Buffalo Sabres",
    location: "Buffalo, NY",
    color: "#00468b",
    secondaryColor: "#fdb71a",
    logo: SabresLogo,
    logoLight: SabresLogoLight,
    established: 1970,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "KeyBank Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/sabres.jpg",
    latitude: 42.875,
    longitude: -78.8766,
    address: "1 Seymour H Knox III Plaza, Buffalo, NY 14203",
    venueCapacity: "19,070",
  },
  {
    id: 675,
    espnID: 3,
    code: "CGY",
    name: "Flames",
    fullName: "Calgary Flames",
    location: "Calgary, AB",
    color: "#dd1a32",
    secondaryColor: "#000000",
    logo: FlamesLogo,
    logoLight: FlamesLogoLight,
    established: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Scotiabank Saddledome",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/flames.jpg",
    latitude: 51.0374,
    longitude: -114.0519,
    address: "555 Saddledome Rise SE, Calgary, AB T2G 2W1, Canada",
    venueCapacity: "19,289",
  },
  {
    id: 676,
    espnID: 7,
    code: "CAR",
    name: "Hurricanes",
    fullName: "Carolina Hurricanes",
    location: "Raleigh, NC",
    color: "#e30426",
    secondaryColor: "#000000",
    logo: HurricanesLogo,
    logoLight: HurricanesLogoLight,
    established: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Lenovo Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/hurricanes.jpg",
    latitude: 35.8033,
    longitude: -78.7219,
    address: "1400 Edwards Mill Rd, Raleigh, NC 27607",
    venueCapacity: "18,680",
  },
  {
    id: 678,
    espnID: 4,
    code: "CHI",
    name: "Blackhawks",
    fullName: "Chicago Blackhawks",
    location: "Chicago, IL",
    color: "#e31937",
    secondaryColor: "#000000",
    logo: BlackhawksLogo,
    logoLight: BlackhawksLogoLight,
    established: 1926,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "United Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/blackhawks.jpg",
    latitude: 41.8807,
    longitude: -87.6742,
    address: "1901 W Madison St, Chicago, IL 60612",
    venueCapacity: "19,717",
  },
  {
    id: 679,
    espnID: 17,
    code: "COL",
    name: "Avalanche",
    fullName: "Colorado Avalanche",
    location: "Denver, CO",
    color: "#860038",
    secondaryColor: "#005ea3",
    logo: AvalancheLogo,
    logoLight: AvalancheLogoLight,
    established: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Ball Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/avalanche.jpg",
    latitude: 39.7487,
    longitude: -105.0077,
    address: "1000 Chopper Cir, Denver, CO 80204",
    venueCapacity: "18,007",
  },
  {
    id: 680,
    espnID: 29,
    code: "CBJ",
    name: "Blue Jackets",
    fullName: "Columbus Blue Jackets",
    location: "Columbus, OH",
    color: "#002d62",
    secondaryColor: "#e31937",
    logo: BlueJacketsLogo,
    logoLight: BlueJacketsLogoLight,
    established: 2000,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Nationwide Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/bluejackets.jpg",
    latitude: 39.969,
    longitude: -83.0063,
    address: "200 W Nationwide Blvd, Columbus, OH 43215",
    venueCapacity: "18,144",
  },
  {
    id: 681,
    espnID: 9,
    code: "DAL",
    name: "Stars",
    fullName: "Dallas Stars",
    location: "Dallas, TX",
    color: "#20864c",
    secondaryColor: "#000000",
    logo: StarsLogo,
    logoLight: StarsLogoLight,
    established: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "American Airlines Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/stars.jpg",
    latitude: 32.7905,
    longitude: -96.8103,
    address: "2500 Victory Ave, Dallas, TX 75219",
    venueCapacity: "18,532",
  },
  {
    id: 682,
    espnID: 5,
    code: "DET",
    name: "Red Wings",
    fullName: "Detroit Red Wings",
    location: "Detroit, MI",
    color: "#e30526",
    secondaryColor: "#ffffff",
    logo: RedWingsLogo,
    logoLight: RedWingsLogoLight,
    established: 1926,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Little Caesars Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/redwings.jpg",
    latitude: 42.341,
    longitude: -83.055,
    address: "2645 Woodward Ave, Detroit, MI 48201",
    venueCapacity: "19,515",
  },
  {
    id: 683,
    espnID: 6,
    code: "EDM",
    name: "Oilers",
    fullName: "Edmonton Oilers",
    location: "Edmonton, AB",
    color: "#00205b",
    secondaryColor: "#ff4c00",
    logo: OilersLogo,
    logoLight: OilersLogoLight,
    established: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Rogers Place",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/oilers.jpg",
    latitude: 53.5461,
    longitude: -113.4978,
    address: "10220 104 Ave NW, Edmonton, AB T5J 0H6, Canada",
    venueCapacity: "18,347",
  },
  {
    id: 684,
    espnID: 26,
    code: "FLA",
    name: "Panthers",
    fullName: "Florida Panthers",
    location: "Sunrise, FL",
    color: "#e51937",
    secondaryColor: "#002d62",
    logo: PanthersLogo,
    logoLight: PanthersLogoLight,
    established: 1993,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Amerant Bank Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/panthers.jpg",
    latitude: 26.1584,
    longitude: -80.3256,
    address: "1 Panther Pkwy, Sunrise, FL 33323",
    venueCapacity: "19,250",
  },
  {
    id: 685,
    espnID: 8,
    code: "LA",
    name: "Kings",
    fullName: "Los Angeles Kings",
    location: "Los Angeles, CA",
    color: "#121212",
    secondaryColor: "#a2aaad",
    logo: KingsLogo,
    logoLight: KingsLogoLight,
    established: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Crypto.com Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/kings.jpg",
    latitude: 34.043,
    longitude: -118.2673,
    address: "1111 S Figueroa St, Los Angeles, CA 90015",
    venueCapacity: "18,230",
  },
  {
    id: 687,
    espnID: 30,
    code: "MIN",
    name: "Wild",
    fullName: "Minnesota Wild",
    location: "St. Paul, MN",
    color: "#124734",
    secondaryColor: "#ae122a",
    logo: WildLogo,
    logoLight: WildLogoLight,
    established: 2000,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Xcel Energy Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/wild.jpg",
    latitude: 44.9448,
    longitude: -93.101,
    address: "199 W Kellogg Blvd, St Paul, MN 55102",
    venueCapacity: "18,568",
  },
  {
    id: 688,
    espnID: 10,
    code: "MTL",
    name: "Canadiens",
    fullName: "Montreal Canadiens",
    location: "Montreal, QC",
    color: "#c41230",
    secondaryColor: "#013a81",
    logo: CanadiensLogo,
    logoLight: CanadiensLogoLight,
    established: 1909,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Bell Centre",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/canadiens.jpg",
    latitude: 45.496,
    longitude: -73.5693,
    address: "1909 Av. des Canadiens-de-Montréal, Montreal, QC H4B 5G0, Canada",
    venueCapacity: "21,105",
  },
  {
    id: 689,
    espnID: 27,
    code: "NSH",
    name: "Predators",
    fullName: "Nashville Predators",
    location: "Nashville, TN",
    color: "#fdba31",
    secondaryColor: "#002d62",
    logo: PredatorsLogo,
    logoLight: PredatorsLogoLight,
    established: 1998,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Bridgestone Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/predators.jpg",
    latitude: 36.1591,
    longitude: -86.7785,
    address: "501 Broadway, Nashville, TN 37203",
    venueCapacity: "17,113",
  },
  {
    id: 690,
    espnID: 11,
    code: "NJ",
    name: "Devils",
    fullName: "New Jersey Devils",
    location: "Newark, NJ",
    color: "#e30b2b",
    secondaryColor: "#000000",
    logo: DevilsLogo,
    logoLight: DevilsLogoLight,
    established: 1974,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Prudential Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/devils.jpg",
    latitude: 40.7336,
    longitude: -74.171,
    address: "25 Lafayette St, Newark, NJ 07102",
    venueCapacity: "16,514",
  },
  {
    id: 691,
    espnID: 12,
    code: "NYI",
    name: "Islanders",
    fullName: "New York Islanders",
    location: "Elmont, NY",
    color: "#00529b",
    secondaryColor: "#f47d31",
    logo: IslandersLogo,
    logoLight: IslandersLogoLight,
    established: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "UBS Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/islanders.jpg",
    latitude: 40.7118,
    longitude: -73.726,
    address: "2400 Hempstead Turnpike, Elmont, NY 11003",
    venueCapacity: "17,255",
  },
  {
    id: 692,
    espnID: 13,
    code: "NYR",
    name: "Rangers",
    fullName: "New York Rangers",
    location: "New York, NY",
    color: "#0056ae",
    secondaryColor: "#e51937",
    logo: RangersLogo,
    logoLight: RangersLogoLight,
    established: 1926,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Madison Square Garden",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/rangers.jpg",
    latitude: 40.7505,
    longitude: -73.9934,
    address: "4 Pennsylvania Plaza, New York, NY 10001",
    venueCapacity: "18,006",
  },
  {
    id: 693,
    espnID: 14,
    code: "OTT",
    name: "Senators",
    fullName: "Ottawa Senators",
    location: "Ottawa, ON",
    color: "#dd1a32",
    secondaryColor: "#b79257",
    logo: SenatorsLogo,
    logoLight: SenatorsLogoLight,
    established: 1883,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Canadian Tire Centre",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/senators.jpg",
    latitude: 45.2969,
    longitude: -75.9272,
    address: "1000 Palladium Dr, Ottawa, ON K2V 1A5, Canada",
    venueCapacity: "18,652",
  },
  {
    id: 695,
    espnID: 15,
    code: "PHI",
    name: "Flyers",
    fullName: "Philadelphia Flyers",
    location: "Philadelphia, PA",
    color: "#fe5823",
    secondaryColor: "#000000",
    logo: FlyersLogo,
    logoLight: FlyersLogoLight,
    established: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Wells Fargo Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/flyers.jpg",
    latitude: 39.9012,
    longitude: -75.172,
    address: "3601 S Broad St, Philadelphia, PA 19148",
    venueCapacity: "19,306",
  },
  {
    id: 696,
    espnID: 16,
    code: "PIT",
    name: "Penguins",
    fullName: "Pittsburgh Penguins",
    location: "Pittsburgh, PA",
    color: "#000000",
    secondaryColor: "#fdb71a",
    logo: PenguinsLogo,
    logoLight: PenguinsLogoLight,
    established: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "PPG Paints Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/penguins.jpg",
    latitude: 40.4394,
    longitude: -79.9893,
    address: "1001 Fifth Ave, Pittsburgh, PA 15219",
    venueCapacity: "18,387",
  },
  {
    id: 697,
    espnID: 18,
    code: "SJ",
    name: "Sharks",
    fullName: "San Jose Sharks",
    location: "San Jose, CA",
    color: "#00788a",
    secondaryColor: "#070707",
    logo: SharksLogo,
    logoLight: SharksLogoLight,
    established: 1991,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "SAP Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/sharks.jpg",
    latitude: 37.3327,
    longitude: -121.9011,
    address: "525 W Santa Clara St, San Jose, CA 95113",
    venueCapacity: "17,562",
  },
  {
    id: 1436,
    espnID: 124292,
    code: "SEA",
    name: "Kraken",
    fullName: "Seattle Kraken",
    location: "Seattle, WA",
    color: "#000d33",
    secondaryColor: "#a3dce4",
    logo: KrakenLogo,
    logoLight: KrakenLogoLight,
    established: 2021,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Climate Pledge Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/kraken.jpg",
    latitude: 47.6221,
    longitude: -122.354,
    address: "334 1st Ave N, Seattle, WA 98109",
    venueCapacity: "17,100",
  },
  {
    id: 698,
    espnID: 19,
    code: "STL",
    name: "Blues",
    fullName: "St. Louis Blues",
    location: "St. Louis, MO",
    color: "#0070b9",
    secondaryColor: "#fdb71a",
    logo: BluesLogo,
    logoLight: BluesLogoLight,
    established: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Enterprise Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/blues.jpg",
    latitude: 38.6268,
    longitude: -90.2026,
    address: "1401 Clark Ave, St. Louis, MO 63103",
    venueCapacity: "18,096",
  },
  {
    id: 699,
    espnID: 20,
    code: "TB",
    name: "Lightning",
    fullName: "Tampa Bay Lightning",
    location: "Tampa, FL",
    color: "#003e7e",
    secondaryColor: "#ffffff",
    logo: LightningLogo,
    logoLight: LightningLogoLight,
    established: 1992,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Amalie Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/lightning.jpg",
    latitude: 27.9427,
    longitude: -82.4518,
    address: "401 Channelside Dr, Tampa, FL 33602",
    venueCapacity: "19,092",
  },
  {
    id: 700,
    espnID: 21,
    code: "TOR",
    name: "Maple Leafs",
    fullName: "Toronto Maple Leafs",
    location: "Toronto, ON",
    color: "#003e7e",
    secondaryColor: "#ffffff",
    logo: MapleLeafsLogo,
    logoLight: MapleLeafsLogoLight,
    established: 1917,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Scotiabank Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/mapleleafs.jpg",
    latitude: 43.6435,
    longitude: -79.3791,
    address: "40 Bay St, Toronto, ON M5J 2X2, Canada",
    venueCapacity: "18,819",
  },
  {
    id: 2483,
    espnID: 129764,
    code: "UTAH",
    name: "Mammoth",
    fullName: "Utah Mammoth",
    location: "Salt Lake City, UT",
    color: "#000000",
    secondaryColor: "#7ab2e1",
    logo: MammothLogo,
    logoLight: MammothLogoLight,
    established: 2024,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Delta Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/utah.jpg",
    latitude: 40.7683,
    longitude: -111.9011,
    address: "301 S Temple, Salt Lake City, UT 84101",
    venueCapacity: "16,200",
  },
  {
    id: 701,
    espnID: 22,
    code: "VAN",
    name: "Canucks",
    fullName: "Vancouver Canucks",
    location: "Vancouver, BC",
    color: "#003e7e",
    secondaryColor: "#008752",
    logo: CanucksLogo,
    logoLight: CanucksLogoLight,
    established: 1945,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Rogers Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/canucks.jpg",
    latitude: 49.2777,
    longitude: -123.1089,
    address: "800 Griffiths Way, Vancouver, BC V6B 6G1, Canada",
    venueCapacity: "18,910",
  },
  {
    id: 702,
    espnID: 37,
    code: "VGK",
    name: "Golden Knights",
    fullName: "Vegas Golden Knights",
    location: "Las Vegas, NV",
    color: "#344043",
    secondaryColor: "#b4975a",
    logo: GoldenKnightsLogo,
    logoLight: GoldenKnightsLogoLight,
    established: 2017,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "T-Mobile Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/vegas.jpg",
    latitude: 36.1029,
    longitude: -115.1783,
    address: "3780 Las Vegas Blvd S, Las Vegas, NV 89158",
    venueCapacity: "17,500",
  },
  {
    id: 703,
    espnID: 23,
    code: "WSH",
    name: "Capitals",
    fullName: "Washington Capitals",
    location: "Washington, DC",
    color: "#d71830",
    secondaryColor: "#0b1f41",
    logo: CapitalsLogo,
    logoLight: CapitalsLogoLight,
    established: 1974,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Capital One Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/capitals.jpg",
    latitude: 38.8981,
    longitude: -77.0209,
    address: "601 F St NW, Washington, DC 20004",
    venueCapacity: "18,573",
  },
  {
    id: 704,
    espnID: 28,
    code: "WPG",
    name: "Jets",
    fullName: "Winnipeg Jets",
    location: "Winnipeg, MB",
    color: "#002d62",
    secondaryColor: "#c41230",
    logo: JetsLogo,
    logoLight: JetsLogoLight,
    established: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
    venueName: "Canada Life Centre",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/hockey/jets.jpg",
    latitude: 49.8927,
    longitude: -97.143,
    address: "300 Portage Ave, Winnipeg, MB R3C 5S4, Canada",
    venueCapacity: "15,321",
  },
];

export const getNHLTeam = (id: number | string) =>
  nhlTeams.find((t) => String(t.id) === String(id)) || null;

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
  nhlTeams.find((t) => String(t.espnID) === String(id)) || null;

export const teamsNHLById: Record<string, NHLTeam> = nhlTeams.reduce(
  (map, team) => {
    map[team.id] = team;
    return map;
  },
  {} as Record<string, NHLTeam>,
);

export const neutralVenues: Record<string, Venue> = {
  /* ---------------- International / Neutral ---------------- */

  "Etihad Arena": {
    name: "Etihad Arena",
    address:
      "FJ63+4PQ - Yas St - Yas Island - YS2 - Abu Dhabi - United Arab Emirates",
    latitude: 24.4539,
    longitude: 54.3773,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680251/arenas/basketball/etihad.avif",
  },

  "Stan Sheriff Center": {
    name: "Stan Sheriff Center",
    address: "1355 Lower Campus Rd, Honolulu, HI 96822",
    latitude: 21.3099,
    longitude: -157.8581,
    venueCapacity: "10,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/stan-sheriff-center.jpg",
  },

  "Accor Arena": {
    name: "Accor Arena",
    address: "8 Bd de Bercy, 75012 Paris, France",
    latitude: 48.8575,
    longitude: 2.3514,
    venueCapacity: "20,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/accor.jpg",
  },

  "Arena CDMX": {
    name: "Arena CDMX",
    city: "Mexico City",
    address: "Av. de las Granjas 800, Santa Barbara, Azcapotzalco",
    latitude: 19.4977,
    longitude: -99.1751,
    venueCapacity: "22,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/cdmx.jpg",
  },

  "Uber Arena": {
    name: "Uber Arena",
    city: "Berlin",
    address: "Mercedes-Platz 1, 10243 Berlin, Germany",
    latitude: 52.5062,
    longitude: 13.4434,
    venueCapacity: "17,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/uber.jpg",
  },

  "The O2": {
    name: "The O2 Arena",
    city: "London",
    address: "Peninsula Square, London SE10 0DX, United Kingdom",
    latitude: 51.503,
    longitude: 0.0032,
    venueCapacity: "20,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680191/arenas/basketball/the-o2.webp",
  },

  /* ---------------- NBA SUMMER LEAGUE ---------------- */

  "Thomas & Mack Center": {
    name: "Thomas & Mack Center",
    city: "Las Vegas",
    address: "4505 S Maryland Pkwy, Las Vegas, NV 89154",
    latitude: 36.1057,
    longitude: -115.1426,
    venueCapacity: "17,923",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680183/arenas/basketball/vegas-summer-league.jpg",
  },

  "Cox Pavilion": {
    name: "Cox Pavilion",
    city: "Las Vegas",
    address: "4505 S Maryland Pkwy, Las Vegas, NV 89154",
    latitude: 36.1054,
    longitude: -115.1433,
    venueCapacity: "3,286",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1767000000/arenas/basketball/cox-pavilion.jpg",
  },

  "Jon M. Huntsman Center": {
    name: "Jon M. Huntsman Center",
    city: "Salt Lake City",
    address: "1825 E South Campus Dr, Salt Lake City, UT 84112",
    latitude: 40.7625,
    longitude: -111.8508,
    venueCapacity: "15,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1769869282/basketball/arenas/huntsman-center.jpg",
  },

  /* ---------------- Other US Neutral ---------------- */

  "Acrisure Arena": {
    name: "Acrisure Arena",
    address: "75702 Varner Rd, Palm Desert, CA 92211",
    latitude: 33.7222,
    longitude: -116.3745,
    venueCapacity: "20,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/acrisure.jpg",
  },

  "Coliseo de Puerto Rico": {
    name: "Coliseo de Puerto Rico",
    address: "500 Av. Arterial B, San Juan, 00918, Puerto Rico",
    latitude: 18.4655,
    longitude: -66.1057,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/coliseode-puerto-rico.jpg",
  },

  "Pechanga Arena": {
    name: "Pechanga Arena",
    address: "3500 Sports Arena Blvd, San Diego, CA 92110",
    latitude: 32.7468,
    longitude: -117.1882,
    venueCapacity: "16,100",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/pechanga.jpg",
  },

  "North Charleston Coliseum": {
    name: "North Charleston Coliseum",
    address: "5001 Coliseum Dr, North Charleston, SC 29418",
    latitude: 32.8655,
    longitude: -80.0224,
    venueCapacity: "13,295",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/north-charleston-coliseum.jpg",
  },

  "Legacy Arena at BJCC": {
    name: "Legacy Arena at BJCC",
    address: "1001 19th St N, Birmingham, AL 35234",
    latitude: 33.5207,
    longitude: -86.8025,
    venueCapacity: "17,654",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/legacy.jpg",
  },
  "Nokia Arena": {
    name: "Nokia Arena",
    city: "Tampere",
    address: "Kansikatu 3, 33100 Tampere, Finland",
    latitude: 61.4981,
    longitude: 23.7736,
    venueCapacity: "15,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1769869282/hockey/arenas/nokia-arena-tampere.jpg",
  },
  "Kia Center": {
    name: "Kia Center",
    city: "Orlando",
    address: "400 W Church St, Orlando, FL 32801",
    latitude: 28.5392,
    longitude: -81.3839,
    venueCapacity: "20,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/magic.jpg",
  },
};

export const nhlDivisionsById: Record<string, number[]> = {
  // 🟦 EASTERN CONFERENCE

  Atlantic: [
    673, // Boston Bruins
    674, // Buffalo Sabres
    684, // Florida Panthers
    688, // Montreal Canadiens
    693, // Ottawa Senators
    699, // Tampa Bay Lightning
    700, // Toronto Maple Leafs
    690, // Detroit Red Wings (if added later use correct id)
  ],

  Metropolitan: [
    676, // Carolina Hurricanes
    680, // Columbus Blue Jackets
    690, // New Jersey Devils
    691, // New York Islanders
    692, // New York Rangers
    695, // Philadelphia Flyers
    696, // Pittsburgh Penguins
    703, // Washington Capitals
  ],

  // 🟥 WESTERN CONFERENCE

  Central: [
    678, // Chicago Blackhawks
    679, // Colorado Avalanche
    681, // Dallas Stars
    687, // Minnesota Wild
    689, // Nashville Predators
    698, // St. Louis Blues
    704, // Winnipeg Jets
    2483, // Utah Mammoth
  ],

  Pacific: [
    670, // Anaheim Ducks
    675, // Calgary Flames
    683, // Edmonton Oilers
    685, // Los Angeles Kings
    697, // San Jose Sharks
    1436, // Seattle Kraken
    701, // Vancouver Canucks
    702, // Vegas Golden Knights
  ],
};
