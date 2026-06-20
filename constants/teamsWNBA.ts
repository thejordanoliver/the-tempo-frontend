import { NBATeam } from "types/basketball";

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
    espnId: 20,
    name: "Dream",
    shortName: "Dream",
    fullName: "Atlanta Dream",
    code: "ATL",
    color: "#e31837",
    secondaryColor: "#5091cc",
    logo: DreamLogo,
    logoLight: DreamLogo,
    location: "College Park, GA",
    established: 2008,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 163,
    espnId: 19,
    name: "Sky",
    shortName: "Sky",
    fullName: "Chicago Sky",
    code: "CHI",
    color: "#5091cd",
    secondaryColor: "#ffd520",
    logo: SkyLogo,
    logoLight: SkyLogo,
    location: "Chicago, IL",
    established: 2006,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 164,
    espnId: 18,
    name: "Sun",
    shortName: "Sun",
    fullName: "Connecticut Sun",
    code: "CONN",
    color: "#f05023",
    secondaryColor: "#0a2240",
    logo: SunLogo,
    logoLight: SunLogo,
    location: "Uncasville, CT",
    established: 1999,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 165,
    espnId: 3,
    name: "Wings",
    shortName: "Wings",
    fullName: "Dallas Wings",
    code: "DAL",
    color: "#002b5c",
    secondaryColor: "#c4d600",
    logo: WingsLogo,
    logoLight: WingsLogo,
    location: "Arlington, TX",

    established: 1998,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 7326,
    espnId: 129689,
    name: "Valkyries",
    shortName: "Valkyries",
    fullName: "Golden State Valkyries",
    code: "GS",
    color: "#b38fcf",
    secondaryColor: "#000000",
    logo: ValkyrieLogo,
    logoLight: ValkyrieLogo,
    location: "San Francisco, CA",
    established: 2023,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 166,
    espnId: 5,
    name: "Fever",
    shortName: "Fever",
    fullName: "Indiana Fever",
    code: "IND",
    color: "#002d62",
    secondaryColor: "#e03a3e",
    logo: FeverLogo,
    logoLight: FeverLogo,
    location: "Indianapolis, IN",
    established: 2000,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 167,
    espnId: 17,
    name: "Aces",
    shortName: "Aces",
    fullName: "Las Vegas Aces",
    code: "LV",
    color: "#a7a8aa",
    secondaryColor: "#000000",
    logo: AcesLogo,
    logoLight: AcesLogo,
    location: "Las Vegas, NV",
    established: 1997,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 168,
    espnId: 6,
    name: "Sparks",
    shortName: "Sparks",
    fullName: "Los Angeles Sparks",
    code: "LA",
    color: "#552583",
    secondaryColor: "#fdb927",
    logo: SparksLogo,
    logoLight: SparksLogo,
    location: "Los Angeles, CA",
    established: 1997,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 169,
    espnId: 8,
    name: "Lynx",
    shortName: "Lynx",
    fullName: "Minnesota Lynx",
    code: "MIN",
    color: "#266092",
    secondaryColor: "#79bc43",
    logo: LynxLogo,
    logoLight: LynxLogo,
    location: "Minneapolis, MN",
    established: 1999,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 170,
    espnId: 9,
    name: "Liberty",
    shortName: "Liberty",
    fullName: "New York Liberty",
    code: "NY",
    color: "#86cebc",
    secondaryColor: "#000000",
    logo: LibertyLogo,
    logoLight: LibertyLogo,
    location: "Brooklyn, NY",
    established: 1997,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 171,
    espnId: 11,
    name: "Mercury",
    shortName: "Mercury",
    fullName: "Phoenix Mercury",
    code: "PHX",
    color: "#3c286e",
    secondaryColor: "#fa4b0a",
    logo: MercuryLogo,
    logoLight: MercuryLogo,
    location: "Phoenix, AZ",
    established: 1997,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 7100,
    espnId: 132052,
    name: "Fire",
    shortName: "Fire",
    fullName: "Portland Fire",
    code: "POR",
    color: "#b22222",
    secondaryColor: "#a52a2a",
    logo: FireLogo,
    logoLight: FireLogoLight,
    location: "Portland, OR",
    established: 2000,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 172,
    espnId: 14,
    name: "Storm",
    shortName: "Storm",
    fullName: "Seattle Storm",
    code: "SEA",
    color: "#2c5235",
    secondaryColor: "#fee11a",
    logo: StormLogo,
    logoLight: StormLogo,
    location: "Seattle, WA",
    established: 2000,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 7870,
    espnId: 131935,
    name: "Tempo",
    shortName: "Tempo",
    fullName: "Toronto Tempo",
    code: "TOR",
    color: "#33476D",
    secondaryColor: "#7B1B38",
    logo: TempoLogo,
    logoLight: TempoLogoLight,
    location: "Toronto, ON",
    established: 2023,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 175,
    espnId: 16,
    name: "Mystics",
    shortName: "Mystics",
    fullName: "Washington Mystics",
    code: "WSH",
    color: "#e03a3e",
    secondaryColor: "#002b5c",
    logo: MysticsLogo,
    logoLight: MysticsLogo,
    location: "Washington, DC",
    established: 1998,
    isAllStar: false,
    isActive: true,
  },
  {
    id: 3807,
    espnId: 130927,
    name: "Antelopes",
    shortName: "Antelopes",
    fullName: "Toyota Antelopes",
    code: "TOY",
    color: "#000000",
    secondaryColor: "#FFC0CB",
    logo: PlaceholderLogo, 
    logoLight: PlaceholderLogo,
    location: "Nagoya, Japan",
    established: 1961,
    isAllStar: false,
    isActive: false,
  },
];

export const getWNBATeamByESPNId = (espnId: number | string) => {
  return wnbaTeams.find((t) => t.espnId?.toString() === espnId?.toString());
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
