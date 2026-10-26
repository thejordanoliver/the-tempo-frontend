export type SoccerPlayByPlayAthlete = {
  id?: string | number | null;
  playerId?: string | number | null;
  displayName?: string | null;
  fullName?: string | null;
  shortName?: string | null;
  jersey?: string | null;
  position?: string | { abbreviation?: string | null } | null;
  headshot?: string | { href?: string | null; alt?: string | null } | null;
};

export type SoccerPlayByPlayEvent = {
  id: string;
  sequence: number;
  text: string;
  shortText: string | null;
  type: string | null;
  typeText: string;
  period: number | null;
  clock: string | null;
  clockValue: number | null;
  team: {
    id: string | number | null;
    name: string | null;
    code: string | null;
    logo: string | null;
  } | null;
  participants: {
    role: string | null;
    athlete: SoccerPlayByPlayAthlete;
  }[];
  scoringPlay: boolean;
  shootout: boolean;
  coordinates: {
    x: number | null;
    y: number | null;
    endX: number | null;
    endY: number | null;
  } | null;
};
