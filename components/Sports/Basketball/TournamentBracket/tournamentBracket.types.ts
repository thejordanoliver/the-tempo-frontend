import type {
  TournamentData,
  TournamentGame,
  TournamentTeam,
  TournamentVenue,
} from "hooks/BasketballHooks/useTournamentBracket";

export type TournamentRound = TournamentGame["round"];
export type BracketPosition = "top" | "bottom";
export type BracketTeam = TournamentTeam;
export type BracketVenue = TournamentVenue;
export type BracketGame = TournamentGame;
export type TournamentBracketCompetition = "CBB" | "WCBB";
export type TournamentBracketSourceData = TournamentData;

export type BracketRegion = {
  id: string;
  name: string;
  order: number;
  side: "left" | "right";
  verticalPosition: "top" | "bottom";
  games: BracketGame[];
};

export type TournamentBracketData = {
  tournamentId: TournamentData["tournamentId"] | null;
  tournamentName: TournamentData["tournamentName"];
  season: TournamentData["season"];
  competition: TournamentBracketCompetition;
  openingRoundLabel: TournamentData["openingRoundLabel"] | null;
  regions: BracketRegion[];
  openingRoundGames: BracketGame[];
  finalFourGames: BracketGame[];
  championshipGame: BracketGame | null;
  metadata: TournamentData["metadata"];
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
  tournament: TournamentBracketSourceData | null;
  loading?: boolean;
  error?: string | null;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
};
