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

import { FootballTeam } from "types/football";

export const uflTeams: FootballTeam[] = [
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
    venueName: "Protective Stadium",
    city: "Birmingham",
    location: "Birmingham, AL",
    address: "1001 22nd St N, Birmingham, AL 35203",
    latitude: 33.5278,
    longitude: -86.8092,
    venueCapacity: "47,100",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780937202/stadiums/football/protective-stadium.webp",
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
    venueName: "Historic Crew Stadium",
    city: "Columbus",
    location: "Columbus, OH",
    address: "1 Black and Gold Blvd, Columbus, OH 43211",
    latitude: 40.0094,
    longitude: -82.9911,
    venueCapacity: "19,968",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780942982/stadiums/football/historic-crew-stadium.jpg",
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
    venueName: "Audi Field",
    city: "Washington, DC",
    location: "Washington, DC",
    address: "100 Potomac Ave SW, Washington, DC 20024",
    latitude: 38.8689,
    longitude: -77.0129,
    venueCapacity: "20,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780936671/stadiums/soccer/audi-field.jpg",
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
    venueName: "Toyota Stadium",
    city: "Frisco",
    location: "Frisco, TX",
    address: "9200 World Cup Way, Frisco, TX 75033",
    latitude: 33.1543,
    longitude: -96.8355,
    venueCapacity: "20,500",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780944045/stadiums/soccer/toyota-stadium.jpg",
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
    venueName: "Shell Energy Stadium",
    city: "Houston",
    location: "Houston, TX",
    address: "2200 Texas Avenue, Houston, TX 77003",
    latitude: 29.7522,
    longitude: -95.3524,
    venueCapacity: "22,039",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780943631/stadiums/soccer/shell-energy-stadium.jpg",
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
    venueName: "Lynn Family Stadium",
    city: "Louisville",
    location: "Louisville, KY",
    address: "350 Adams Street, Louisville, KY 40206",
    latitude: 38.2596,
    longitude: -85.7333,
    venueCapacity: "15,304",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780937202/stadiums/football/lynn-family-stadium.webp",
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
    venueName: "Inter&Co Stadium",
    city: "Orlando",
    location: "Orlando, FL",
    address: "655 W Church Street, Orlando, FL 32805",
    latitude: 28.5411,
    longitude: -81.389,
    venueCapacity: "25,500",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780943344/stadiums/soccer/interco-stadium.webp",
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
    venueName: "The Dome at America's Center",
    city: "St. Louis",
    location: "St. Louis, MO",
    address: "701 Convention Plaza, St. Louis, MO 63101",
    latitude: 38.6327,
    longitude: -90.1886,
    venueCapacity: "67,277",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1780937202/stadiums/football/dome-at-americas-center.webp",
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
