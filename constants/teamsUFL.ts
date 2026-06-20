//Logos
import AviatorsLogo from "assets/Football/UFL_Logos/Aviators.png";
import BattlehawksLogo from "assets/Football/UFL_Logos/Battlehawks.png";
import DefendersLogo from "assets/Football/UFL_Logos/Defenders.png";
import GamblersLogo from "assets/Football/UFL_Logos/Gamblers.png";
import KingsLogo from "assets/Football/UFL_Logos/Kings.png";
import RenegadesLogo from "assets/Football/UFL_Logos/Renegades.png";
import StallionsLogo from "assets/Football/UFL_Logos/Stallions.png";
import StormLogo from "assets/Football/UFL_Logos/Storm.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";

import { Team } from "types/football";

export const uflTeams: Team[] = [
  {
    id: 126073,
    espnId: 126073,
    name: "Birmingham",
    fullName: "Birmingham Stallions",
    shortName: "Stallions",
    code: "BHAM",
    color: "#a32035",
    secondaryColor: "#c6b784",
    logo: StallionsLogo,
    logoLight: StallionsLogo,
    city: "Birmingham",
    location: "Birmingham, AL",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 132261,
    espnId: 132261,
    name: "Columbus",
    fullName: "Columbus Aviators",
    shortName: "Aviators",
    code: "CLB",
    color: "#0c2340",
    secondaryColor: "#69b3e7",
    logo: AviatorsLogo,
    logoLight: AviatorsLogo,
    city: "Columbus",
    location: "Columbus, OH",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 112646,
    espnId: 112646,
    name: "DC",
    fullName: "DC Defenders",
    shortName: "Defenders",
    code: "DC",
    color: "#c8102e",
    secondaryColor: "#ffffff",
    logo: DefendersLogo,
    logoLight: DefendersLogo,
    city: "Washington, DC",
    location: "Washington, DC",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 112647,
    espnId: 112647,
    name: "Dallas",
    fullName: "Dallas Renegades",
    shortName: "Renegades",
    code: "DAL",
    color: "#69b3e7",
    secondaryColor: "#000000",
    logo: RenegadesLogo,
    logoLight: RenegadesLogo,
    city: "Frisco",
    location: "Frisco, TX",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 126075,
    espnId: 126075,
    name: "Houston",
    fullName: "Houston Gamblers",
    shortName: "Gamblers",
    code: "HOU",
    color: "#000000",
    secondaryColor: "#e4002b",
    logo: GamblersLogo,
    logoLight: GamblersLogo,
    city: "Houston",
    location: "Houston, TX",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 132262,
    espnId: 132262,
    name: "Louisville",
    fullName: "Louisville Kings",
    shortName: "Kings",
    code: "LOU",
    color: "#06190a",
    secondaryColor: "#97d700",
    logo: KingsLogo,
    logoLight: KingsLogo,
    city: "Louisville",
    location: "Louisville, KY",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 132263,
    espnId: 132263,
    name: "Orlando",
    fullName: "Orlando Storm",
    shortName: "Storm",
    code: "ORL",
    color: "#fe5000",
    secondaryColor: "#252a36",
    logo: StormLogo,
    logoLight: StormLogo,
    city: "Orlando",
    location: "Orlando, FL",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
  {
    id: 112651,
    espnId: 112651,
    name: "St. Louis",
    fullName: "St. Louis Battlehawks",
    shortName: "Battlehawks",
    code: "STL",
    color: "#002677",
    secondaryColor: "#a2aaad",
    logo: BattlehawksLogo,
    logoLight: BattlehawksLogo,
    city: "St. Louis",
    location: "St. Louis, MO",
    established: 0,
    isAllStar: false,
    isActive: false,
  },
];

export const getUFLTeam = (id: number | string) =>
  uflTeams.find((t) => String(t.id) === String(id));

export function getUFLTeamLogo(
  id: string | number | undefined,
  isDark: boolean,
) {
  if (!id) return PlaceholderLogo; // fallback

  const searchStr = String(id).toLowerCase();

  const team = uflTeams.find((t) => {
    return (
      t.id === Number(id) || // match by ID
      (t.name && t.name.toLowerCase() === searchStr) || // match by name
      (t.code && t.code.toLowerCase() === searchStr) // match by code
    );
  });

  if (!team) return PlaceholderLogo;

  return isDark ? team.logoLight || team.logo : team.logo;
}

export const getUFLTeamByESPNId = (espnId: number | string) => {
  return uflTeams.find((t) => t.espnId?.toString() === espnId?.toString());
};
