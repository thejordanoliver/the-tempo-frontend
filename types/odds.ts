export type OddsValue = string | number | null;

export type OddsTeam = {
  id: string | number | null;
  uid?: string | null;
  name?: string | null;
  fullName?: string | null;
  code?: string | null;
  shortName?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  logo?: string | null;
  logoDark?: string | null;
};

export type TeamOdds = {
  team: OddsTeam | null;
  favorite: boolean | null;
  underdog: boolean | null;
  moneyLine: number | null;
  spreadOdds: number | null;
  favoriteAtOpen: boolean | null;
};

export type OddsProvider = {
  id: string | number | null;
  name: string | null;
  displayName: string | null;
  priority: number | null;
};

export type OddsHistory = {
  close: OddsValue;
  open: OddsValue;
};

export type SpreadOdds = OddsHistory & {
  line: OddsValue;
  openLine: OddsValue;
};

export type TotalOdds = {
  close: { line: OddsValue; odds: OddsValue };
  open: { line: OddsValue; odds: OddsValue };
};

export type GameOdds = {
  provider: OddsProvider;
  details: string | null;
  spread: number | null;
  overUnder: number | null;
  homeMoneyline: number | null;
  awayMoneyline: number | null;
  drawMoneyline: number | null;
  homeOdds: TeamOdds;
  awayOdds: TeamOdds;
  moneyLine: {
    name: string | null;
    shortName: string | null;
    home: OddsHistory;
    away: OddsHistory;
    draw: OddsHistory;
  };
  pointSpread: {
    name: string | null;
    shortName: string | null;
    home: SpreadOdds;
    away: SpreadOdds;
  };
  total: {
    name: string | null;
    shortName: string | null;
    over: TotalOdds;
    under: TotalOdds;
  };
};

export type ScoreboardOdds = Omit<GameOdds, "provider"> & {
  provider: string | null;
};
