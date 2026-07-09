export type TournamentRound =
  | "OPENING"
  | "ROUND_OF_64"
  | "ROUND_OF_32"
  | "SWEET_16"
  | "ELITE_8"
  | "FINAL_4"
  | "CHAMPIONSHIP";

export type BracketPosition = "top" | "bottom";

export type BracketTeam = {
  id: string;
  espnId: string | number | null;
  name: string;
  shortName: string | null;
  abbreviation: string | null;
  logo: string | null;
  seed: number | null;
  score: number | string | null;
  winner: boolean | null;
  record?: string | null;
};

export type BracketGameStatus =
  | "scheduled"
  | "pre"
  | "live"
  | "in"
  | "halftime"
  | "post"
  | "final"
  | "delayed"
  | "postponed"
  | "canceled";

export type BracketVenue = {
  id: string | null;
  name: string | null;
  city: string | null;
  state: string | null;
  indoor: boolean | null;
};

export type BracketGame = {
  id: string;
  eventId: string | null;
  tournamentId: string | null;
  regionId: string | null;
  regionName: string | null;
  round: TournamentRound;
  roundLabel: string | null;
  roundOrder: number;
  gameOrder: number;
  bracketSlot: number | null;
  topTeam: BracketTeam | null;
  bottomTeam: BracketTeam | null;
  topSourceGameId: string | null;
  bottomSourceGameId: string | null;
  winnerTeamId: string | null;
  nextGameId: string | null;
  nextGamePosition: BracketPosition | null;
  destinationRegionId: string | null;
  destinationRound: TournamentRound | null;
  destinationSeed: number | null;
  destinationGameId: string | null;
  destinationPosition: BracketPosition | null;
  date: string | null;
  status: BracketGameStatus;
  statusText: string | null;
  venue: BracketVenue | null;
  broadcast: string | null;
  headline: string | null;
};

export type BracketRegion = {
  id: string;
  name: string;
  order: number;
  side: "left" | "right";
  verticalPosition: "top" | "bottom";
  games: BracketGame[];
};

export type TournamentBracketCompetition = "CBB" | "WCBB";

export type TournamentBracketData = {
  tournamentId: string | null;
  tournamentName: string;
  season: number;
  competition: TournamentBracketCompetition;
  openingRoundLabel: string | null;
  regions: BracketRegion[];
  openingRoundGames: BracketGame[];
  finalFourGames: BracketGame[];
  championshipGame: BracketGame | null;
  metadata: {
    source: string;
    fetchedAt: string;
    totalGames: number;
    unresolvedConnections: unknown[];
    warnings: string[];
  };
};

export type RegionPlacement = {
  leftTop: BracketRegion | null;
  leftBottom: BracketRegion | null;
  rightTop: BracketRegion | null;
  rightBottom: BracketRegion | null;
};

export type BracketLayoutConfig = {
  gameCardWidth: number;
  gameCardHeight: number;
  roundColumnWidth: number;
  horizontalRoundGap: number;
  baseVerticalGap: number;
  regionGap: number;
  centerColumnWidth: number;
  centerGap: number;
  connectorHorizontalLength: number;
  connectorLineWidth: number;
  regionHeaderHeight: number;
  roundTitleHeight: number;
  regionPadding: number;
};

export type BracketCardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BracketConnectionLayout = {
  id: string;
  direction: "forward" | "reverse";
  sourceLayouts: readonly [BracketCardLayout, BracketCardLayout];
  targetLayout: BracketCardLayout;
};

export type BracketPathConnectionLayout = {
  id: string;
  direction: "forward" | "reverse";
  sourceLayout: BracketCardLayout;
  targetLayout: BracketCardLayout;
};

export type BracketRoundLayouts = Partial<
  Record<TournamentRound, BracketCardLayout[]>
>;

export type BracketRegionLayout = {
  region: BracketRegion;
  x: number;
  y: number;
  width: number;
  height: number;
  contentHeight: number;
  side: "left" | "right";
  roundLayouts: BracketRoundLayouts;
  globalRoundLayouts: BracketRoundLayouts;
  gameLayouts: ReadonlyMap<string, BracketCardLayout>;
  championLayout: BracketCardLayout | null;
};

export type TournamentBracketProps = {
  tournament: TournamentBracketData | null;
  loading?: boolean;
  error?: string | null;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
};

export type TournamentBracketApiResponse = unknown;
