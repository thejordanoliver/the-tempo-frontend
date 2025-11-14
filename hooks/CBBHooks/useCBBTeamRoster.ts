import { useEffect, useState } from "react";
import axios from "axios";

export interface CBBPlayer {
  id: string;
  uid: string;
  fullName: string;
  displayName: string;
  shortName: string;
  jersey?: string;
  height?: string;
  weight?: string;
  displayHeight?: string;
  displayWeight?: string;
  position?: {
    abbreviation: string;
    displayName: string;
  };
  headshot?: {
    href: string;
  };
  birthPlace?: {
    city?: string;
    state?: string;
    country?: string;
  };
  links?: {
    href: string;
    rel: string[];
  }[];
}

export interface CBBRosterResponse {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
  };
  season: {
    year: number;
    displayName: string;
  };
  athletes: CBBPlayer[];
}

export function useCBBTeamRoster(teamId: string | number) {
  const [roster, setRoster] = useState<CBBPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchRoster = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${teamId}/roster`;
        const response = await axios.get<CBBRosterResponse>(url);

        // Some ESPN responses use `items` instead of `athletes`
        const players = response.data.athletes || [];
        setRoster(players);
      } catch (err: any) {
        setError(err.message || "Failed to fetch roster");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [teamId]);

  return { roster, loading, error };
}
