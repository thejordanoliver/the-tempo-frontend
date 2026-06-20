import { isCancel } from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface FighterAccolade {
  fighter_id: number;
  accolade_key: string;
  accolade_id: string;
  accolade_name: string;
  accolade_type: "Belt";
}

export interface Fighter {
  id: string;
  api_ref: string | null;
  uid: string | null;
  guid: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
  short_name: string | null;
  nickname: string | null;
  slug: string | null;
  weight: string | null;
  height: string | null;
  reach: string | null;
  birth_date: string | null;
  gender: "M" | "F" | null;
  active: boolean | null;
  linked: boolean | null;
  citizenship: string | null;
  citizenship_country_id: string | null;
  citizenship_country_code: string | null;
  citizenship_country_color: string | null;
  citizenship_country_alt_color: string | null;
  flag_url: string | null;
  headshot_url: string | null;
  left_stance_url: string | null;
  right_stance_url: string | null;
  weight_class_id: string | null;
  weight_class_text: string | null;
  weight_class_short_name: string | null;
  weight_class_slug: string | null;
  stance_id: string | null;
  stance_text: string | null;
  association_id: string | null;
  association_name: string | null;
  association_country: string | null;
  style_id: string | null;
  style_text: string | null;
  status_id: string | null;
  status_name: string | null;
  status_type: string | null;
  status_abbreviation: string | null;
  is_champion: boolean | null;
  accolades: FighterAccolade[];
}

interface MMAFighterResponse {
  player: Fighter;
}

export function useMMAFighter(id: string) {
  const [player, setPlayer] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPlayer(null);
      return;
    }

    const controller = new AbortController();

    async function fetchFighter() {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/roster/mma/player/${id}`;

        const res = await apiClient.get<MMAFighterResponse>(url, {
          signal: controller.signal,
        });

        setPlayer(res.data.player);
      } catch (err: unknown) {
        if (isCancel(err) || controller.signal.aborted) return;

        console.error("Fighter fetch error:", err);
        setError("Failed to load player");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchFighter();

    return () => controller.abort();
  }, [id]);

  return {
    player,
    loading,
    error,
  };
}