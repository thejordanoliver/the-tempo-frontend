export type MMAFightLogEntry = {
  fightId: string;
  eventId: string;
  eventName: string;
  eventShortName: string;
  date: string | null;
  year: number | null;
  opponent: { id: string | null; name: string; shortName: string };
  result: "W" | "L" | "D" | "NC" | null;
  method: string | null;
  round: number | null;
  time: string | null;
  titleFight: boolean;
};

export type MMAFightLog = {
  fighterId: string;
  league: "ufc";
  years: { value: string; label: string }[];
  fights: MMAFightLogEntry[];
  careerStats: { key: string; label: string; description: string; value: string }[];
  fetchedAt: string;
  stale: boolean;
};
