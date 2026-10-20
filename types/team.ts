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
  primaryColor: string | null;
  secondaryColor: string | null;
  established: number;
  isAllStar: boolean;
  isNational: boolean;
  isActive: boolean;
};

export type TeamVenue = {
  id: number;
  city: string | null;
  guid: string | null;
  name: string;
  slug: string | null;
  grass: boolean | null;
  image: string | null;
  sport: string | null;
  state: string | null;
  indoor: boolean | null;
  address: string | null;
  apiRef: string | null;
  country: string | null;
  capacity: number | null;
  latitude: number | null;
  zipCode: string | null;
  longitude: number | null;
  venueKey: string | null;
  createdAt: string | null;
  leagueKey: string | null;
  sourceRef: string | null;
  updatedAt: string | null;
  geocodedAt: string | null;
  leagueSlug: string | null;
  sourceType: string | null;
  sourceTeamId: number | null;
  geocodingQuery: string | null;
  sourceImageUrl: string | null;
  geocodingProvider: string | null;
  geocodingConfidence: number | null;
  geocodingNeedsReview: boolean | null;
};

export type Conference = {
  id: number;
  uid: string;
  logo: string | null;
  name: string | null;
  groupId: number;
  createdAt: string | null;
  shortName: string | null;
  updatedAt: string | null;
  parentGroupId: number;
};

export type Coach = {
  id: string | number;
  firstName: string;
  lastName: string;
  image: string | null;
  role: string;
  season: number;
  teamId: number;
  isActive: boolean;
  experience: number | null;
  record: string | null;
  birthDate: string | null;
};

export type Championships = {
  id: number;
  notes: string | null;
  league?: string | null;
  season: number | string;
  teamId: number;
  teamName: string;
  champion?: string;
  mop?: string | null;

  // Some championship records include these fields.
  era?: string | null;
  selector?: string | null;
};

export type TeamDetails = {
  id: number;
  logo?: string | null;
  logoDark?: string | null;
  shortName: string;
  name: string;
  code: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  location: string | null;
  city: string | null;
  state?: string | null;
  established: number | null;
  conferenceId?: number | null;
  venueId: string | number | null;
  venue: TeamVenue | null;
  league: string;
  isActive: boolean;
  isAllStar: boolean;
  isNational: boolean;
  coach: Coach | null;
  conference: Conference | null;
  championships: Championships[];
  [key: string]: unknown;
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
  primaryColor: Colors.darkGray,
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
  primaryColor: Colors.lightGray,
  secondaryColor: Colors.black,
  latitude: 0,
  longitude: 0,
  venueImage: null,
  venueCapacity: "",
  isAllStar: false,
  isActive: false,
};
