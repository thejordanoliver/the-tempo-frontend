import type { FootballGame } from "@/types/football/football";

export type FootballTeam = NonNullable<FootballGame["home"] | FootballGame["away"]>;

export type CFPBracketData = {
  firstRound: FootballGame[];

  byeTeams: (FootballTeam | null)[];

  quarterfinals: FootballGame[];

  semifinals: FootballGame[];

  championship: FootballGame | null;
};

export type CFPRoundDates = {
  firstRound: string;

  quarterfinals: string;

  semifinals: string;

  championship: string;
};

export type CFPBracketProps = {
  games: FootballGame[];

  loading?: boolean;

  refreshing?: boolean;

  error?: string | null;

  onRetry?: () => void;

  onGamePress?: (game: FootballGame) => void;

  onTeamPress?: (team: FootballTeam) => void;
};
