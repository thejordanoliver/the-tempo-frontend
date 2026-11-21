import type { Recruit } from "types/recruiting/players";

export type RecruitSectionProps = { recruit: Recruit; isDark: boolean };
export type RecruitSchoolSectionProps = RecruitSectionProps & {
  league: "cfb" | "mcbb";
};
