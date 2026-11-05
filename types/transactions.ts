export type TransactionTeam = {
  id: number;
  altId: string | null;
  name: string | null;
  shortName: string | null;
  code: string | null;
  location: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logo: string | null;
  logoDark: string | null;
};

export type LeagueTransaction = {
  date: string;
  description: string;
  teamId: number | null;
  team: TransactionTeam | null;
};

export type TransactionsResponse = {
  league: string;
  season: number;
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  transactions: LeagueTransaction[];
};
