export type GameVenueInfo = {
  id: string | null;
  leagueKey: string;
  name: string | null;
  address: {
    formatted: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  };
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  image: string | null;
  grass: boolean | null;
  indoor: boolean | null;
};
