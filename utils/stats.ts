export type TeamStats = {
  team: {
    id: string;
    name: string;
    fullName: string;
    code: string;
    recordSummary: string;
    standingSummary: string;
  };

  season: {
    year: string;
    type: string;
    name: string;
    displayName: string;
  };

  gamesPlayed: number;

  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;

  fgPercent: number;
  ftPercent: number;
  tpPercent: number;

  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
};

export type TeamStatRow = {
  label: string;
  value: string;
};

export type PlayerStats = {
  playerId: number;
  full_name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  team_id: number;
  position: string;
  jersey_number: string;
  headshot_url?: string;
  active: boolean;
  team: string;
  pos: string | null;
  latestSeason: {
    season: string;
    g: number;
    gs: number | null;
    mpg: number;
    fg: number;
    fga: number;
    fg_pct: string;
    three_p: number;
    three_pa: number;
    three_pct: string;
    two_p: number;
    two_pa: number;
    two_pct: string;
    efg_pct: string;
    ft: number;
    fta: number;
    ft_pct: string;
    orb: number;
    drb: number;
    trb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    pts: number;
  } | null;
};

export type RosterStatsProps = {
  rosterStats: PlayerStats[] | null;
  teamId: string;
  teamStats?: TeamStats | null;
  loading?: boolean;
  error?: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
};

// Team Stats
const numberFormatter = new Intl.NumberFormat("en-US");
export const formatStatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    return numberFormatter.format(value);
  }

  const raw = String(value).trim();

  if (raw.endsWith("%")) {
    const numeric = Number(raw.replace("%", ""));
    return Number.isFinite(numeric)
      ? `${numberFormatter.format(numeric)}%`
      : raw;
  }

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : raw;
};

const formatFixedStat = (value: number | null | undefined): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(1);
};

const formatPercentStat = (value: number | null | undefined): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
};

export const getTeamSummaryRows = (teamStats: TeamStats): TeamStatRow[] => [
  {
    label: "Team",
    value: teamStats?.team?.fullName || teamStats?.team?.name || "—",
  },
  {
    label: "Record",
    value: teamStats?.team?.recordSummary || "—",
  },
  {
    label: "Standing",
    value: teamStats?.team?.standingSummary || "—",
  },
  {
    label: "Season",
    value: teamStats?.season?.displayName || "—",
  },
];

export const getTeamDisplayAverages = (teamStats: TeamStats): TeamStatRow[] => [
  {
    label: "Points Per Game",
    value: formatFixedStat(teamStats.pointsPerGame),
  },
  {
    label: "Rebounds Per Game",
    value: formatFixedStat(teamStats.reboundsPerGame),
  },
  {
    label: "Assists Per Game",
    value: formatFixedStat(teamStats.assistsPerGame),
  },
  {
    label: "Steals Per Game",
    value: formatFixedStat(teamStats.stealsPerGame),
  },
  {
    label: "Blocks Per Game",
    value: formatFixedStat(teamStats.blocksPerGame),
  },
  {
    label: "Turnovers Per Game",
    value: formatFixedStat(teamStats.turnoversPerGame),
  },
  {
    label: "Personal Fouls Per Game",
    value: formatFixedStat(teamStats.foulsPerGame),
  },
  {
    label: "Field Goal %",
    value: formatPercentStat(teamStats.fgPercent),
  },
  {
    label: "3 Point %",
    value: formatPercentStat(teamStats.tpPercent),
  },
  {
    label: "Free Throw %",
    value: formatPercentStat(teamStats.ftPercent),
  },
];

export const getTeamDisplayTotals = (teamStats: TeamStats): TeamStatRow[] => [
  {
    label: "Total Points",
    value: formatStatValue(teamStats.totalPoints),
  },
  {
    label: "Total Rebounds",
    value: formatStatValue(teamStats.totalRebounds),
  },
  {
    label: "Total Assists",
    value: formatStatValue(teamStats.totalAssists),
  },
  {
    label: "Total Steals",
    value: formatStatValue(
      Math.round(teamStats.stealsPerGame * teamStats.gamesPlayed),
    ),
  },
  {
    label: "Total Blocks",
    value: formatStatValue(
      Math.round(teamStats.blocksPerGame * teamStats.gamesPlayed),
    ),
  },
  {
    label: "Total Turnovers",
    value: formatStatValue(
      Math.round(teamStats.turnoversPerGame * teamStats.gamesPlayed),
    ),
  },
  {
    label: "Total Fouls",
    value: formatStatValue(
      Math.round(teamStats.foulsPerGame * teamStats.gamesPlayed),
    ),
  },
];
