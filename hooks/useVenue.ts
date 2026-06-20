import { apiClient } from "@/utils/apiClient";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

export type Venue = {
  league_key: string;
  sport: string;
  league_slug: string;
  id: string;
  api_ref: string | null;
  guid: string | null;
  full_name: string;
  name: string | null;
  slug: string | null;
  venue_key: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  grass: boolean | null;
  indoor: boolean | null;
  image: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
};

type UseVenueParams = {
  sport?: string | null;
  id?: number | string | null;
};

interface UseVenueResponse {
  venue: Venue | null;
  venueLoading: boolean;
  venueError: string | null;
  venueRefreshing: boolean;
  refreshVenue: () => Promise<void>;
}

export const useVenue = ({ sport, id }: UseVenueParams): UseVenueResponse => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueLoading, setVenueLoading] = useState<boolean>(false);
  const [venueError, setVenueError] = useState<string | null>(null);
  const [venueRefreshing, setVenueRefreshing] = useState<boolean>(false);

  const fetchVenue = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setVenueRefreshing(true);
        } else {
          setVenueLoading(true);
        }

        setVenueError(null);

        const response = await apiClient.get<{
          success: boolean;
          data: Venue;
          message?: string;
        }>(`api/venues/${sport}/${id}`);

        setVenue(response.data.data ?? null);
      } catch (err: unknown) {
        setVenue(null);

        if (isAxiosError(err)) {
          setVenueError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Failed to fetch venue",
          );
        } else if (err instanceof Error) {
          setVenueError(err.message);
        } else {
          setVenueError("Failed to fetch venue");
        }
      } finally {
        setVenueLoading(false);
        setVenueRefreshing(false);
      }
    },
    [sport, id],
  );

  const refreshVenue = useCallback(async () => {
    await fetchVenue(true);
  }, [fetchVenue]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  return {
    venue,
    venueLoading,
    venueRefreshing,
    venueError,
    refreshVenue,
  };
};
