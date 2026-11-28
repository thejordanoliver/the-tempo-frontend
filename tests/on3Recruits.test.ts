import assert from "node:assert/strict";
import test from "node:test";
import type { Recruit } from "../types/recruiting/recruits";
import {
  formatRecruitRating,
  getRecruitRanking,
  getRecruitStatus,
  normalizeRecruit,
} from "../utils/recruiting/recruits";

const record = {
  id: 1000000000,
  on3_person_id: "181033",
  year: 2027,
  name: "David Jacobs",
  height: "6-5.5",
  weight: "235",
  national_rank: 5,
  position_rank: 2,
  state_rank: 2,
  score: "98",
  stars: 5,
  industry_national_rank: 1,
  industry_position_rank: 1,
  industry_state_rank: 1,
  industry_rating: "98.8231182795699",
  industry_stars: 5,
  is_committed: null,
  is_signed: null,
  has_prediction: true,
  predicted_schools: [
    {
      team_id: 2641,
      team_name: "Texas Tech",
      team_title: "Texas Tech Red Raiders",
      school_slug: "texas-tech-red-raiders",
      percentage: 96.25016107555518,
    },
    null,
    { team_name: null },
  ],
} as unknown as Recruit;

test("normalizes the On3 list and detail shape while preserving the full name and provider IDs", () => {
  const row = normalizeRecruit(record);
  assert.equal(row.name, "David Jacobs");
  assert.equal(row.on3_person_id, "181033");
  assert.equal(row.predicted_schools.length, 1);
  assert.equal(row.predicted_schools[0].school_slug, "texas-tech-red-raiders");
  assert.equal(row.predicted_schools[0].percentage, 96.25016107555518);
  assert.deepEqual(row.offers, []);
  assert.equal(getRecruitStatus(row), "Status unavailable");
});
test("keeps On3 and Industry rankings distinct and formats PostgreSQL numerics", () => {
  const row = normalizeRecruit(record);
  assert.equal(getRecruitRanking(row, "industry").national, 1);
  assert.equal(getRecruitRanking(row, "on3").national, 5);
  assert.equal(
    formatRecruitRating(getRecruitRanking(row, "industry").rating),
    "98.82",
  );
  assert.equal(formatRecruitRating("100.00"), "100");
  assert.equal(formatRecruitRating(null), "—");
  assert.equal(formatRecruitRating(""), "—");
  assert.equal(formatRecruitRating("unknown"), "—");
  const unranked = { ...row, national_rank: null, score: null, stars: null };
  assert.equal(getRecruitRanking(unranked, "on3").national, null);
  assert.equal(getRecruitRanking(unranked, "industry").national, 1);
});
test("handles null predictions and legacy JSON arrays for both entry points", () => {
  assert.deepEqual(
    normalizeRecruit({
      ...record,
      predicted_schools: null,
    } as unknown as Recruit).predicted_schools,
    [],
  );
  const legacy = normalizeRecruit({
    ...record,
    predicted_schools: JSON.stringify(record.predicted_schools),
  } as unknown as Recruit);
  assert.equal(legacy.predicted_schools.length, 1);
});
test("distinguishes enrolled, signed, committed, explicitly uncommitted and unknown status", () => {
  assert.equal(
    getRecruitStatus({
      ...record,
      is_enrolled: true,
      is_signed: true,
      is_committed: true,
    }),
    "Enrolled",
  );
  assert.equal(
    getRecruitStatus({ ...record, is_signed: true, is_committed: true }),
    "Signed",
  );
  assert.equal(
    getRecruitStatus({ ...record, is_committed: true }),
    "Committed",
  );
  assert.equal(
    getRecruitStatus({ ...record, is_committed: false }),
    "Uncommitted",
  );
  assert.equal(getRecruitStatus(record), "Status unavailable");
});
