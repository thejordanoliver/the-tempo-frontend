export type StandingsTeamInfo = {
  id: string | number | null;
  name: string;
  shortName?: string | null;
  shortDisplayName?: string | null;
  code?: string | null;
  location?: string | null;
  logo?: string | null;
  logoDark?: string | null;
  conferenceId?: number | null;
  conference?: {
    id: string | number;
    groupId?: number;
    name?: string | null;
    shortName?: string | null;
    logo?: string | null;
  } | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};
