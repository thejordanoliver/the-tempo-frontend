import type {
  Recruit,
  RecruitPredictedSchool,
} from "../../types/recruiting/players";

function parseJsonArray<T>(value: T[] | string | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizePredictedSchool(
  prediction: Partial<RecruitPredictedSchool> | null,
): RecruitPredictedSchool | null {
  const teamName =
    typeof prediction?.team_name === "string"
      ? prediction.team_name.trim()
      : "";

  if (!prediction || !teamName) {
    return null;
  }

  return {
    team_id:
      typeof prediction.team_id === "number" &&
      Number.isFinite(prediction.team_id)
        ? prediction.team_id
        : null,
    team_name: teamName,
    school_slug: prediction.school_slug ?? null,
    team_title: prediction.team_title ?? null,
    percentage:
      typeof prediction.percentage === "number" &&
      Number.isFinite(prediction.percentage)
        ? prediction.percentage
        : null,
    confidence_score:
      typeof prediction.confidence_score === "number" &&
      Number.isFinite(prediction.confidence_score)
        ? prediction.confidence_score
        : null,
    confidence_text: prediction.confidence_text ?? null,
    matched_by: prediction.matched_by ?? null,
    href: prediction.href ?? null,
    image_url: prediction.image_url ?? null,
  };
}

export function normalizeRecruit(recruit: Recruit): Recruit {
  const predictedSchools = parseJsonArray<RecruitPredictedSchool>(
    recruit.predicted_schools,
  )
    .map(normalizePredictedSchool)
    .filter((prediction): prediction is RecruitPredictedSchool =>
      Boolean(prediction),
    );

  return {
    ...recruit,
    committed_team_id: recruit.committed_team_id ?? null,
    predicted_team_id: recruit.predicted_team_id ?? null,
    projected_team_id: recruit.projected_team_id ?? null,
    offers: parseJsonArray(recruit.offers),
    predicted_schools: predictedSchools,
  };
}

export type RecruitRankingSource = "industry" | "on3";

export function getRecruitRanking(
  recruit: Recruit,
  source: RecruitRankingSource,
) {
  return source === "industry"
    ? {
        national: recruit.industry_national_rank ?? null,
        position: recruit.industry_position_rank ?? null,
        state: recruit.industry_state_rank ?? null,
        rating: recruit.industry_rating ?? null,
        stars: recruit.industry_stars ?? null,
      }
    : {
        national: recruit.national_rank,
        position: recruit.position_rank,
        state: recruit.state_rank,
        rating: recruit.score,
        stars: recruit.stars,
      };
}

export function formatRecruitRating(value: string | number | null) {
  if (
    value === null ||
    String(value).trim() === "" ||
    !Number.isFinite(Number(value))
  )
    return "—";
  return Number(value)
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

export function getRecruitStatus(recruit: Recruit) {
  if (recruit.is_enrolled) return "Enrolled";
  if (recruit.is_signed) return "Signed";
  if (recruit.is_committed) return "Committed";
  return recruit.is_committed === false ? "Uncommitted" : "Status unavailable";
}
