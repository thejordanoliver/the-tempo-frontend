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
  team_title: string | null;
  percentage: number | null;
  confidence_score: number | null;
  confidence_text: string | null;
  matched_by?: string | null;
  href?: string | null;
  image_url?: string | null;
}

export interface Recruit {
  id: number;
  year: number;
  name: string;

  first_name: string | null;
  last_name: string | null;
  short_name: string | null;

  profile_url: string | null;
  image_url: string | null;

  high_school: string | null;
  hometown: string | null;
  position: string | null;
  height: string | null;
  weight: string | null;

  score: string | null;
  stars: number;
  national_rank: number | null;
  position_rank: number | null;
  state_rank: number | null;

  is_committed: boolean;
  is_signed: boolean;
  has_prediction: boolean;

  committed_team_id: number | null;
  committed_team_name: string | null;

  projected_team_id: number | null;
  projected_team_name: string | null;

  predicted_team_id: number | null;
  predicted_team_name: string | null;
  prediction_percentage: string | null;
  predicted_schools: RecruitPredictedSchool[];
}
