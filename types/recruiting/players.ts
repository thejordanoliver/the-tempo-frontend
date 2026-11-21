export interface RecruitOffer {
  visit: string | null;
  school: string;
  status: string | null;
  hasOffer: boolean;
  signedDate: string | null;
}

export interface RecruitPredictedSchool {
  team_id: number | null;
  team_name: string;
  school_slug?: string | null;
  team_title: string | null;
  percentage: number | null;
  confidence_score?: number | null;
  confidence_text?: string | null;
  matched_by?: string | null;
  href?: string | null;
  image_url?: string | null;
}

export interface Recruit {
  id: number;
  year: number;
  on3_person_id?: string | number | null;
  on3_recruitment_id?: string | number | null;
  sport?: "football" | "basketball";
  slug?: string | null;
  height_inches?: number | string | null;
  state?: string | null;
  industry_national_rank?: number | null;
  industry_position_rank?: number | null;
  industry_state_rank?: number | null;
  industry_rating?: string | number | null;
  industry_stars?: number | null;
  five_star_plus?: boolean | null;
  is_enrolled?: boolean | null;
  commitment_date?: string | null;
  on3_committed_school_id?: string | number | null;
  committed_school_slug?: string | null;
  committed_school_logo_url?: string | null;
  interest_count?: number | null;
  nil_valuation?: string | number | null;
  last_imported_at?: string | null;
  name: string;

  first_name?: string | null;
  last_name?: string | null;
  short_name?: string | null;

  profile_url: string | null;
  image_url: string | null;

  high_school: string | null;
  hometown: string | null;
  position: string | null;
  height: string | null;
  weight: string | number | null;

  score: string | number | null;
  stars: number | null;
  national_rank: number | null;
  position_rank: number | null;
  state_rank: number | null;

  is_committed: boolean | null;
  is_signed: boolean | null;
  has_prediction: boolean | null;

  committed_team_id: number | null;
  committed_team_name: string | null;

  projected_team_id?: number | null;
  projected_team_name?: string | null;

  predicted_team_id?: number | null;
  predicted_team_name?: string | null;
  prediction_percentage?: string | null;
  predicted_schools: RecruitPredictedSchool[];
  offers?: RecruitOffer[];
}
