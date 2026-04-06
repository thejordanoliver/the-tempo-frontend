import { NBATeam } from "types/types";

// Logos
import AcesLogo from "../assets/Logos/WNBA/Aces.png";
import DreamLogo from "../assets/Logos/WNBA/Dream.png";
import FeverLogo from "../assets/Logos/WNBA/Fever.png";
import FireLogo from "../assets/Logos/WNBA/Fire.png";
import FireLogoLight from "../assets/Logos/WNBA/FireLight.png";
import LibertyLogo from "../assets/Logos/WNBA/Liberty.png";
import LynxLogo from "../assets/Logos/WNBA/Lynx.png";
import MercuryLogo from "../assets/Logos/WNBA/Mercury.png";
import MysticsLogo from "../assets/Logos/WNBA/Mystics.png";
import SkyLogo from "../assets/Logos/WNBA/Sky.png";
import SparksLogo from "../assets/Logos/WNBA/Sparks.png";
import StormLogo from "../assets/Logos/WNBA/Storm.png";
import SunLogo from "../assets/Logos/WNBA/Sun.png";
import TempoLogo from "../assets/Logos/WNBA/Tempo.png";
import TempoLogoLight from "../assets/Logos/WNBA/TempoLight.png";
import ValkyrieLogo from "../assets/Logos/WNBA/Valkyrie.png";
import WingsLogo from "../assets/Logos/WNBA/Wings.png";
import PlaceholderLogo from "../assets/Placeholders/teamPlaceholder.png";

export const wnbaTeams: NBATeam[] = [
  {
    id: 162,
    espnID: 20,
    name: "Atlanta",
    fullName: "Atlanta Dream",
    code: "ATL",
    color: "#e31837",
    secondaryColor: "#5091cc",
    logo: DreamLogo,
    logoLight: DreamLogo,
    location: "College Park, GA",
    address: "One Gateway Center, College Park, GA 30337",
    latitude: 33.6196,
    longitude: -84.4443,
    venueName: "Gateway Center Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1775410994/arenas/basketball/gateway-center-arena.jpg",
    venueCapacity: "3,500",
    isAllStar: false,
  },
  {
    id: 163,
    espnID: 19,
    name: "Chicago",
    fullName: "Chicago Sky",
    code: "CHI",
    color: "#5091cd",
    secondaryColor: "#ffd520",
    logo: SkyLogo,
    logoLight: SkyLogo,
    location: "Chicago, IL",
    address: "200 W Cermak Rd, Chicago, IL 60616",
    latitude: 41.8807,
    longitude: -87.6742,
    venueName: "Wintrust Arena",
    venueImage: undefined,
    venueCapacity: "10,387",
    isAllStar: false,
  },
  {
    id: 164,
    espnID: 18,
    name: "Connecticut",
    fullName: "Connecticut Sun",
    code: "CON",
    color: "#f05023",
    secondaryColor: "#0a2240",
    logo: SunLogo,
    logoLight: SunLogo,
    location: "Uncasville, CT",
    address: "1 Mohegan Sun Blvd, Uncasville, CT 06382",
    latitude: 41.4871,
    longitude: -72.086,
    venueName: "Mohegan Sun Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774671887/arenas/basketball/mohegan-sun-arena.jpg",
    venueCapacity: "10,000",
    isAllStar: false,
  },
  {
    id: 165,
    espnID: 3,
    name: "Dallas",
    fullName: "Dallas Wings",
    code: "DAL",
    color: "#002b5c",
    secondaryColor: "#c4d600",
    logo: WingsLogo,
    logoLight: WingsLogo,
    location: "Arlington, TX",
    address: "600 E Border St, Arlington, TX 76010",
    latitude: 32.7296,
    longitude: -97.0803,
    venueName: "College Park Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1775411537/arenas/basketball/college-park-center.jpg",
    venueCapacity: "7,000",
    isAllStar: false,
  },
  {
    id: 7326,
    espnID: 129689,
    name: "Golden State",
    fullName: "Golden State Valkyries",
    code: "GS",
    color: "#b38fcf",
    secondaryColor: "#000000",
    logo: ValkyrieLogo,
    logoLight: ValkyrieLogo,
    location: "San Francisco, CA",
    address: "1 Warriors Way, San Francisco, CA 94158",
    latitude: 37.768,
    longitude: -122.3877,
    venueName: "Chase Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/warriors.jpg",
    venueCapacity: "18,064",
    isAllStar: false,
  },
  {
    id: 166,
    espnID: 5,
    name: "Indiana",
    fullName: "Indiana Fever",
    code: "IND",
    color: "#002d62",
    secondaryColor: "#e03a3e",
    logo: FeverLogo,
    logoLight: FeverLogo,
    location: "Indianapolis, IN",
    address: "125 S Pennsylvania St, Indianapolis, IN 46204",
    latitude: 39.7639,
    longitude: -86.1555,
    venueName: "Gainbridge Fieldhouse",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/pacers.jpg",
    venueCapacity: "17,923",
    isAllStar: false,
  },
  {
    id: 167,
    espnID: 17,
    name: "Las Vegas",
    fullName: "Las Vegas Aces",
    code: "LV",
    color: "#a7a8aa",
    secondaryColor: "#000000",
    logo: AcesLogo,
    logoLight: AcesLogo,
    location: "Las Vegas, NV",
    address: "3780 S Las Vegas Blvd, Las Vegas, NV 89158",
    latitude: 36.1024,
    longitude: -115.1839,
    venueName: "Michelob ULTRA Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1775411686/arenas/basketball/michelob-ultra-arena.jpg",
    venueCapacity: "12,000",
    isAllStar: false,
  },
  {
    id: 168,
    espnID: 6,
    name: "Los Angeles",
    fullName: "Los Angeles Sparks",
    code: "LA",
    color: "#552583",
    secondaryColor: "#fdb927",
    logo: SparksLogo,
    logoLight: SparksLogo,
    location: "Los Angeles, CA",
    address: "1111 S Figueroa St, Los Angeles, CA 90015",
    latitude: 34.043,
    longitude: -118.2673,
    venueName: "Crypto.com Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/lakers.jpg",
    venueCapacity: "19,079",
    isAllStar: false,
  },
  {
    id: 169,
    espnID: 8,
    name: "Minnesota",
    fullName: "Minnesota Lynx",
    code: "MIN",
    color: "#266092",
    secondaryColor: "#79bc43",
    logo: LynxLogo,
    logoLight: LynxLogo,
    location: "Minneapolis, MN",
    address: "600 1st Ave N, Minneapolis, MN 55403",
    latitude: 44.9795,
    longitude: -93.2762,
    venueName: "Target Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/timberwolves.jpg",
    venueCapacity: "18,798",
    isAllStar: false,
  },
  {
    id: 170,
    espnID: 9,
    name: "New York",
    fullName: "New York Liberty",
    code: "NY",
    color: "#86cebc",
    secondaryColor: "#000000",
    logo: LibertyLogo,
    logoLight: LibertyLogo,
    location: "Brooklyn, NY",
    address: "620 Atlantic Avenue, Brooklyn, NY 11217",
    latitude: 40.6826,
    longitude: -73.9754,
    venueName: "Barclays Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/nets.jpg",
    venueCapacity: "17,732",
    isAllStar: false,
  },
  {
    id: 171,
    espnID: 11,
    name: "Phoenix",
    fullName: "Phoenix Mercury",
    code: "PHX",
    color: "#3c286e",
    secondaryColor: "#fa4b0a",
    logo: MercuryLogo,
    logoLight: MercuryLogo,
    location: "Phoenix, AZ",
    address: "201 East Jefferson Street, Phoenix, AZ 85004",
    latitude: 33.4452,
    longitude: -112.0712,
    venueName: "Mortgage Matchup Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/suns.jpg",
    venueCapacity: "18,422",
    isAllStar: false,
  },
  {
    id: 0,
    espnID: 132052,
    name: "Portland",
    fullName: "Portland Fire",
    code: "POR",
    color: "#B22222",
    secondaryColor: "#A52A2A",
    logo: FireLogo,
    logoLight: FireLogoLight,
    location: "Portland, OR",
    address: "1 N Center Court St, Portland, OR 97227",
    latitude: 45.5316,
    longitude: -122.6668,
    venueName: "Moda Center",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680186/arenas/basketball/trail-blazers.jpg",
    venueCapacity: "19,441",
    isAllStar: false,
  },
  {
    id: 172,
    espnID: 14,
    name: "Seattle",
    fullName: "Seattle Storm",
    code: "SEA",
    color: "#2c5235",
    secondaryColor: "#fee11a",
    logo: StormLogo,
    logoLight: StormLogo,
    location: "Seattle, WA",
    address: "334 1st Ave N, Seattle, WA 98109",
    latitude: 47.622,
    longitude: -122.3541,
    venueName: "Climate Pledge Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1775412019/arenas/basketball/climate-pledge-arena.jpg",
    venueCapacity: "18,100",
    isAllStar: false,
  },
  {
    id: 7870,
    espnID: 131935,
    name: "Toronto",
    fullName: "Toronto Tempo",
    code: "TOR",
    color: "#33476D",
    secondaryColor: "#7B1B38",
    logo: TempoLogo,
    logoLight: TempoLogoLight,
    location: "Toronto, ON",
    address: "40 Bay St, Toronto, ON M5J 2X2",
    latitude: 43.6435,
    longitude: -79.3791,
    venueName: "Scotiabank Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/raptors.jpg",
    venueCapacity: "19,800",
    isAllStar: false,
  },
  {
    id: 175,
    espnID: 16,
    name: "Washington",
    fullName: "Washington Mystics",
    code: "WSH",
    color: "#e03a3e",
    secondaryColor: "#002b5c",
    logo: MysticsLogo,
    logoLight: MysticsLogo,
    location: "Washington, DC",
    address: "601 F St NW, Washington, DC 20004",
    latitude: 38.8981,
    longitude: -77.0209,
    venueName: "Capital One Arena",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/wizards.jpg",
    venueCapacity: "20,356",
    isAllStar: false,
  },
];

export const getWNBATeamByESPNId = (espnId: number | string) => {
  return wnbaTeams.find((t) => t.espnID?.toString() === espnId?.toString());
};

export const getWNBATeam = (id: number | string) => {
  if (id == null) return undefined;
  return wnbaTeams.find((t) => String(t.id) === String(id));
};

export function getWNBATeamLogo(
  id: number | string | undefined,
  isDark: boolean,
) {
  if (!id) return PlaceholderLogo;

  const team = wnbaTeams.find((t) => String(t.id) === String(id));

  return team
    ? isDark
      ? team.logoLight || team.logo
      : team.logo
    : PlaceholderLogo;
}
