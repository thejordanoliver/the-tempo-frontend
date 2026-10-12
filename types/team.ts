import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";

export type Team = {
  id: number;
  summerLeagueId?: number;
  league: string;
  name: string;
  shortName?: string;
  fullName: string;
  code: string;
  city: string | null;
  location: string | null;
  coach?: string;
  conference?: string;
  conferenceShortName?: string;
  owner?: string;
  logo: any;
  logoLight?: any;
  color: string | null;
  secondaryColor: string | null;
  established: number;
  isAllStar: boolean;
  isNational: boolean;
  isActive: boolean;
};

export const emptyAwayTeam = {
  id: -2,
  league: "",
  isNational: false,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  shortName: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venueName: "Unknown",
  established: 0,
  color: Colors.darkGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};

export const emptyHomeTeam = {
  id: -1,
  league: "",
  isNational: false,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
  shortName: "TBD",
  fullName: "TBD",
  code: "TBD",
  city: "Unknown",
  location: "Unknown",
  conference: "Unknown",
  owner: "Unknown",
  venueName: "Unknown",
  established: 0,
  color: Colors.lightGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};
