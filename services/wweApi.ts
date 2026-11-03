import { apiClient } from "utils/apiClient";

export type WweBrand = "Raw" | "SmackDown" | "NXT" | "Evolve" | "ID/NIL" | "Legends";

export interface WweSuperstarSummary {
  id: string;
  slug: string;
  name: string;
  brand: WweBrand | null;
  brand_memberships: WweBrand[];
  roster_status: string | null;
  active: boolean;
  headshot_url: string | null;
  profile_image_url: string | null;
  wwe_profile_url: string | null;
}

export interface WweSuperstar extends WweSuperstarSummary {
  wwe_id: string | null;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  division: string | null;
  birth_date: string | null;
  birth_city: string | null;
  birth_state: string | null;
  birth_country: string | null;
  billed_from: string | null;
  height: string | null;
  weight_lbs: number | null;
  debut_year: number | null;
  signature_moves: string[];
  championships: unknown[];
  accolades: unknown[];
  biography: string | null;
  banner_image_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  source: string;
}

export interface WweSuperstarsPage {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  data: WweSuperstarSummary[];
}

export async function getWweSuperstars(params: {
  q?: string;
  brand?: WweBrand | null;
  limit?: number;
  offset?: number;
} = {}): Promise<WweSuperstarsPage> {
  const response = await apiClient.get<WweSuperstarsPage>("/api/wwe/superstars", {
    params: {
      q: params.q || undefined,
      brand: params.brand || undefined,
      limit: params.limit ?? 40,
      offset: params.offset ?? 0,
    },
  });
  return response.data;
}

export async function getWweSuperstar(slug: string): Promise<WweSuperstar> {
  const response = await apiClient.get<{ data: WweSuperstar }>(
    `/api/wwe/superstars/${encodeURIComponent(slug)}`,
  );
  return response.data.data;
}
