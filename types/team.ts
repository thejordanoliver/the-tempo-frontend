
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";
import type { ImageSourcePropType } from "react-native";

export type Team = {
  id: number;
  league: string
  espnId?: number | null;
  summerLeagueId?: number;
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
  established: number;
  logo: any;
  logoLight?: any;
  color: string | null;
  secondaryColor: string | null;
  championships?: number[];
  uniforms?: {
    home?: ImageSourcePropType;
    away?: ImageSourcePropType;
  };
  isAllStar: boolean;
  isNational: boolean;
  isActive: boolean;
};

export const emptyAwayTeam = {
  id: 0,
  espnId: -2,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
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
  id: 0,
  espnId: -1,
  logo: PlaceholderLogo,
  logoLight: PlaceholderLogo,
  name: "TBD",
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