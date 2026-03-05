import { NHLTeam, Venue } from "types/types";

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

export const nhlTeams = [
  {
    id: 670,
    espnID: 25,
    code: "ANA",
    name: "Ducks",
    nickname: "Ducks",
    fullName: "Anaheim Ducks",
    location: "Anaheim",
    color: "#fc4c02",
    secondaryColor: "#000000",
    logo: DucksLogo,
    logoLight: DucksLogoLight,
    founded: 1993,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 673,
    espnID: 1,
    code: "BOS",
    name: "Bruins",
    nickname: "Bruins",
    fullName: "Boston Bruins",
    location: "Boston",
    color: "#231f20",
    secondaryColor: "#fdb71a",
    logo: BruinsLogo,
    logoLight: BruinsLogoLight,
    founded: 1924,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 674,
    espnID: 2,
    code: "BUF",
    name: "Sabres",
    nickname: "Sabres",
    fullName: "Buffalo Sabres",
    location: "Buffalo",
    color: "#00468b",
    secondaryColor: "#fdb71a",
    logo: SabresLogo,
    logoLight: SabresLogoLight,
    founded: 1970,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 675,
    espnID: 3,
    code: "CGY",
    name: "Flames",
    nickname: "Flames",
    fullName: "Calgary Flames",
    location: "Calgary",
    color: "#dd1a32",
    secondaryColor: "#000000",
    logo: FlamesLogo,
    logoLight: FlamesLogoLight,
    founded: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 676,
    espnID: 7,
    code: "CAR",
    name: "Hurricanes",
    nickname: "Hurricanes",
    fullName: "Carolina Hurricanes",
    location: "Carolina",
    color: "#e30426",
    secondaryColor: "#000000",
    logo: HurricanesLogo,
    logoLight: HurricanesLogoLight,
    founded: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 678,
    espnID: 4,
    code: "CHI",
    name: "Blackhawks",
    nickname: "Blackhawks",
    fullName: "Chicago Blackhawks",
    location: "Chicago",
    color: "#e31937",
    secondaryColor: "#000000",
    logo: BlackhawksLogo,
    logoLight: BlackhawksLogoLight,
    founded: 1926,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 679,
    espnID: 17,
    code: "COL",
    name: "Avalanche",
    nickname: "Avalanche",
    fullName: "Colorado Avalanche",
    location: "Colorado",
    color: "#860038",
    secondaryColor: "#005ea3",
    logo: AvalancheLogo,
    logoLight: AvalancheLogoLight,
    founded: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 680,
    espnID: 29,
    code: "CBJ",
    name: "Blue Jackets",
    nickname: "Blue Jackets",
    fullName: "Columbus Blue Jackets",
    location: "Columbus",
    color: "#002d62",
    secondaryColor: "#e31937",
    logo: BlueJacketsLogo,
    logoLight: BlueJacketsLogoLight,
    founded: 2000,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 681,
    espnID: 9,
    code: "DAL",
    name: "Stars",
    nickname: "Stars",
    fullName: "Dallas Stars",
    location: "Dallas",
    color: "#20864c",
    secondaryColor: "#000000",
    logo: StarsLogo,
    logoLight: StarsLogoLight,
    founded: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 682,
    espnID: 5,
    code: "DET",
    name: "Red Wings",
    nickname: "Red Wings",
    fullName: "Detroit Red Wings",
    location: "Detroit",
    color: "#e30526",
    secondaryColor: "#ffffff",
    logo: RedWingsLogo,
    logoLight: RedWingsLogoLight,
    founded: 1926,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 683,
    espnID: 6,
    code: "EDM",
    name: "Oilers",
    nickname: "Oilers",
    fullName: "Edmonton Oilers",
    location: "Edmonton",
    color: "#00205b",
    secondaryColor: "#ff4c00",
    logo: OilersLogo,
    logoLight: OilersLogoLight,
    founded: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 684,
    espnID: 26,
    code: "FLA",
    name: "Panthers",
    nickname: "Panthers",
    fullName: "Florida Panthers",
    location: "Florida",
    color: "#e51937",
    secondaryColor: "#002d62",
    logo: PanthersLogo,
    logoLight: PanthersLogoLight,
    founded: 1993,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 685,
    espnID: 8,
    code: "LA",
    name: "Kings",
    nickname: "Kings",
    fullName: "Los Angeles Kings",
    location: "Los Angeles",
    color: "#121212",
    secondaryColor: "#a2aaad",
    logo: KingsLogo,
    logoLight: KingsLogoLight,
    founded: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 687,
    espnID: 30,
    code: "MIN",
    name: "Wild",
    nickname: "Wild",
    fullName: "Minnesota Wild",
    location: "Minnesota",
    color: "#124734",
    secondaryColor: "#ae122a",
    logo: WildLogo,
    logoLight: WildLogoLight,
    founded: 2000,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 688,
    espnID: 10,
    code: "MTL",
    name: "Canadiens",
    nickname: "Canadiens",
    fullName: "Montreal Canadiens",
    location: "Montreal",
    color: "#c41230",
    secondaryColor: "#013a81",
    logo: CanadiensLogo,
    logoLight: CanadiensLogoLight,
    founded: 1909,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 689,
    espnID: 27,
    code: "NSH",
    name: "Predators",
    nickname: "Predators",
    fullName: "Nashville Predators",
    location: "Nashville",
    color: "#fdba31",
    secondaryColor: "#002d62",
    logo: PredatorsLogo,
    logoLight: PredatorsLogoLight,
    founded: 1998,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 690,
    espnID: 11,
    code: "NJ",
    name: "Devils",
    nickname: "Devils",
    fullName: "New Jersey Devils",
    location: "New Jersey",
    color: "#e30b2b",
    secondaryColor: "#000000",
    logo: DevilsLogo,
    logoLight: DevilsLogoLight,
    founded: 1974,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 691,
    espnID: 12,
    code: "NYI",
    name: "Islanders",
    nickname: "Islanders",
    fullName: "New York Islanders",
    location: "New York",
    color: "#00529b",
    secondaryColor: "#f47d31",
    logo: IslandersLogo,
    logoLight: IslandersLogoLight,
    founded: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 692,
    espnID: 13,
    code: "NYR",
    name: "Rangers",
    nickname: "Rangers",
    fullName: "New York Rangers",
    location: "New York",
    color: "#0056ae",
    secondaryColor: "#e51937",
    logo: RangersLogo,
    logoLight: RangersLogoLight,
    founded: 1926,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 693,
    espnID: 14,
    code: "OTT",
    name: "Senators",
    nickname: "Senators",
    fullName: "Ottawa Senators",
    location: "Ottawa",
    color: "#dd1a32",
    secondaryColor: "#b79257",
    logo: SenatorsLogo,
    logoLight: SenatorsLogoLight,
    founded: 1883,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 695,
    espnID: 15,
    code: "PHI",
    name: "Flyers",
    nickname: "Flyers",
    fullName: "Philadelphia Flyers",
    location: "Philadelphia",
    color: "#fe5823",
    secondaryColor: "#000000",
    logo: FlyersLogo,
    logoLight: FlyersLogoLight,
    founded: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 696,
    espnID: 16,
    code: "PIT",
    name: "Penguins",
    nickname: "Penguins",
    fullName: "Pittsburgh Penguins",
    location: "Pittsburgh",
    color: "#000000",
    secondaryColor: "#fdb71a",
    logo: PenguinsLogo,
    logoLight: PenguinsLogoLight,
    founded: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 697,
    espnID: 18,
    code: "SJ",
    name: "Sharks",
    nickname: "Sharks",
    fullName: "San Jose Sharks",
    location: "San Jose",
    color: "#00788a",
    secondaryColor: "#070707",
    logo: SharksLogo,
    logoLight: SharksLogoLight,
    founded: 1991,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 1436,
    espnID: 124292,
    code: "SEA",
    name: "Kraken",
    nickname: "Kraken",
    fullName: "Seattle Kraken",
    location: "Seattle",
    color: "#000d33",
    secondaryColor: "#a3dce4",
    logo: KrakenLogo,
    logoLight: KrakenLogoLight,
    founded: 2021,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 698,
    espnID: 19,
    code: "STL",
    name: "Blues",
    nickname: "Blues",
    fullName: "St. Louis Blues",
    location: "St. Louis",
    color: "#0070b9",
    secondaryColor: "#fdb71a",
    logo: BluesLogo,
    logoLight: BluesLogoLight,
    founded: 1967,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 699,
    espnID: 20,
    code: "TB",
    name: "Lightning",
    nickname: "Lightning",
    fullName: "Tampa Bay Lightning",
    location: "Tampa Bay",
    color: "#003e7e",
    secondaryColor: "#ffffff",
    logo: LightningLogo,
    logoLight: LightningLogoLight,
    founded: 1992,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 700,
    espnID: 21,
    code: "TOR",
    name: "Maple Leafs",
    nickname: "Maple Leafs",
    fullName: "Toronto Maple Leafs",
    location: "Toronto",
    color: "#003e7e",
    secondaryColor: "#ffffff",
    logo: MapleLeafsLogo,
    logoLight: MapleLeafsLogoLight,
    founded: 1917,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 2483,
    espnID: 129764,
    code: "UTAH",
    name: "Mammoth",
    nickname: "Mammoth",
    fullName: "Utah Mammoth",
    location: "Utah",
    color: "#000000",
    secondaryColor: "#7ab2e1",
    logo: MammothLogo,
    logoLight: MammothLogoLight,
    founded: 2024,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 701,
    espnID: 22,
    code: "VAN",
    name: "Canucks",
    nickname: "Canucks",
    fullName: "Vancouver Canucks",
    location: "Vancouver",
    color: "#003e7e",
    secondaryColor: "#008752",
    logo: CanucksLogo,
    logoLight: CanucksLogoLight,
    founded: 1945,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 702,
    espnID: 37,
    code: "VGK",
    name: "Golden Knights",
    nickname: "Golden Knights",
    fullName: "Vegas Golden Knights",
    location: "Vegas",
    color: "#344043",
    secondaryColor: "#b4975a",
    logo: GoldenKnightsLogo,
    logoLight: GoldenKnightsLogoLight,
    founded: 2017,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 703,
    espnID: 23,
    code: "WSH",
    name: "Capitals",
    nickname: "Capitals",
    fullName: "Washington Capitals",
    location: "Washington",
    color: "#d71830",
    secondaryColor: "#0b1f41",
    logo: CapitalsLogo,
    logoLight: CapitalsLogoLight,
    founded: 1974,
    national: false,
    isActive: true,
    isAllStar: false,
  },
  {
    id: 704,
    espnID: 28,
    code: "WPG",
    name: "Jets",
    nickname: "Jets",
    fullName: "Winnipeg Jets",
    location: "Winnipeg",
    color: "#002d62",
    secondaryColor: "#c41230",
    logo: JetsLogo,
    logoLight: JetsLogoLight,
    founded: 1972,
    national: false,
    isActive: true,
    isAllStar: false,
  },
];

export const getNHLTeam = (id: number | string) =>
  nhlTeams.find((t) => String(t.id) === String(id)) || null;

export const getNHLTeamLogo = (id: number | string, isDark: boolean) => {
  const team = nhlTeams.find((t) => String(t.id) === String(id));
  if (!team) return null;

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
