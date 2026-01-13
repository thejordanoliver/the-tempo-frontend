// utils/resolveVenue.ts

import { neutralStadiums } from "constants/teamsNFL";

export interface ResolveVenueParams {
  venue?: {
    name?: string | null;
    image?: string | null;
    capacity?: number | null;
    attendance?: number | null;
    grass?: boolean | null;
  } | null;
  homeTeam: {
    venue?: string;
    city?: string;
    address?: string;
    venueCapacity?: number;
    venueImage?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  neutralSite?: boolean;
}

export interface ResolvedVenue {
  venueName: string;
  city: string;
  address: string;
  capacity: string;
  image?: string | null;
  latitude: number | null;
  longitude: number | null;
  isNeutralStadiumMatch: boolean;
}

export function resolveVenue({
  venue,
  homeTeam,
  neutralSite,
}: ResolveVenueParams): ResolvedVenue {
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralEntry = Object.entries(neutralStadiums).find(
    ([stadiumName]) =>
      stadiumName.trim().toLowerCase() === normalizedVenueName
  );

  const isNeutralStadiumMatch = !!neutralEntry;
  const neutralName = neutralEntry?.[0];
  const neutralData = neutralEntry?.[1];

  // Defaults (home team first)
  let venueName = venue?.name ?? homeTeam.venue ?? "Unknown Stadium";
  let city = homeTeam.city ?? "Unknown City";
  let address = homeTeam.address ?? "";
  let capacity = homeTeam.venueCapacity?.toString() ?? "";
  let image = homeTeam.venueImage ?? venue?.image ?? null;
  let latitude = homeTeam.latitude ?? null;
  let longitude = homeTeam.longitude ?? null;

  // Override only when confirmed neutral site
  if (neutralSite && neutralData) {
    venueName = neutralName ?? venueName;
    city = neutralData.city ?? city;
    address = neutralData.address ?? address;
    capacity =
      neutralData.venueCapacity?.toString() ?? capacity;
    image = neutralData.venueImage ?? image;
    latitude = neutralData.latitude ?? latitude;
    longitude = neutralData.longitude ?? longitude;
  }

  return {
    venueName,
    city,
    address,
    capacity,
    image,
    latitude,
    longitude,
    isNeutralStadiumMatch,
  };
}
