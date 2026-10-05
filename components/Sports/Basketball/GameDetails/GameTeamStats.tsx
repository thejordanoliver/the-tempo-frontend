import { GameTeamStatsStyles } from "@/styles/GameDetailStyles/GameTeamStatsStyles";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useMemo } from "react";
import { Image, Text, View } from "react-native";

type StatType = "text" | "percent" | "number" | "time";
type BaseballStatCategory = "batting" | "pitching" | "fielding";

type StatConfig = {
  key: string;
  label: string;
  type?: StatType;
  category?: BaseballStatCategory;
  lowerIsBetter?: boolean;
  aliases?: string[];
};

type StatItem = {
  name?: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  value?: string | number | null;
  displayValue?: string | number | null;
};

type StatGroup = {
  name?: string;
  displayName?: string;
  stats?: StatItem[];
};

export type GameTeamStatsEntry = {
  homeAway?: "home" | "away" | string;
  displayOrder?: number;
  team?: any;
  stats?: StatItem[] | StatGroup[];
  statistics?: StatItem[] | StatGroup[];
};

type GameTeamStatsProps = {
  awayLogo?: any;
  homeLogo?: any;
  awayColor?: string;
  homeColor?: string;
  awayName?: string;
  homeName?: string;
  awayCode?: string;
  homeCode?: string;
  state?: string | null;
  stats?: GameTeamStatsEntry[];
  GameTeamStats?: GameTeamStatsEntry[];
  isDark: boolean;
  league?: string;
};

type StatRow = {
  id: string;
  label: string;
  awayDisplay: string;
  homeDisplay: string;
  awayNum: number;
  homeNum: number;
  awayWins: boolean;
  homeWins: boolean;
  isTie: boolean;
  max: number;
};

const EMPTY_DISPLAY = "-";

const BASKETBALL_STAT_KEYS: StatConfig[] = [
  {
    key: "fieldGoalsMade-fieldGoalsAttempted",
    label: "Field Goals Made/Attempted",
  },
  {
    key: "threePointFieldGoalsMade-threePointFieldGoalsAttempted",
    label: "3PT Made/Attempted",
  },
  {
    key: "freeThrowsMade-freeThrowsAttempted",
    label: "Free Throws Made/Attempted",
  },
  {
    key: "freeThrowPct",
    label: "Free Throws Percentage",
    type: "percent",
  },
  { key: "totalRebounds", label: "Total Rebounds" },
  { key: "offensiveRebounds", label: "Offensive Rebounds" },
  { key: "defensiveRebounds", label: "Defensive Rebounds" },
  { key: "assists", label: "Assists" },
  { key: "steals", label: "Steals" },
  { key: "blocks", label: "Blocks" },
  { key: "turnovers", label: "Turnovers", lowerIsBetter: true },
  { key: "teamTurnovers", label: "Team Turnovers", lowerIsBetter: true },
  { key: "totalTurnovers", label: "Total Turnovers", lowerIsBetter: true },
  { key: "turnoverPoints", label: "Points Off Turnovers" },
  { key: "fastBreakPoints", label: "Fast Break Points" },
  { key: "pointsInPaint", label: "Points in Paint" },
  { key: "fouls", label: "Fouls", lowerIsBetter: true },
  { key: "largestLead", label: "Largest Lead" },
  { key: "leadChanges", label: "Lead Changes" },
  { key: "leadPercentage", label: "Percent Led", type: "percent" },
  { key: "streak", label: "Streak" },
  {
    key: "threePointFieldGoalPct",
    label: "Three Point Percentage",
    type: "percent",
  },
  { key: "avgPointsAgainst", label: "Points Against", lowerIsBetter: true },
  { key: "avgPoints", label: "Points Per Game" },
  { key: "fieldGoalPct", label: "Field Goal Percentage", type: "percent" },
  { key: "technicalFouls", label: "Technical Fouls", lowerIsBetter: true },
  {
    key: "totalTechnicalFouls",
    label: "Total Technical Fouls",
    lowerIsBetter: true,
  },
  { key: "flagrantFouls", label: "Flagrant Fouls", lowerIsBetter: true },
  { key: "avgRebounds", label: "Rebounds Per Game" },
  { key: "avgAssists", label: "Assists Per Game" },
  { key: "avgBlocks", label: "Blocks Per Game" },
  { key: "avgSteals", label: "Steals Per Game" },
  {
    key: "avgTeamTurnovers",
    label: "Team Turnovers Per Game",
    lowerIsBetter: true,
  },
  {
    key: "avgTotalTurnovers",
    label: "Total Turnovers Per Game",
    lowerIsBetter: true,
  },
];

const HOCKEY_STAT_KEYS: StatConfig[] = [
  { key: "blockedShots", label: "Blocked Shots" },
  { key: "hits", label: "Hits" },
  { key: "takeaways", label: "Takeaways" },
  { key: "shotsTotal", label: "Shots" },
  { key: "powerPlayGoals", label: "Power Play Goals" },
  { key: "powerPlayOpportunities", label: "Power Play Opportunities" },
  { key: "powerPlayPct", label: "Power Play Percentage", type: "percent" },
  { key: "shortHandedGoals", label: "Short Handed Goals" },
  { key: "shootoutGoals", label: "Shootout Goals" },
  { key: "faceoffsWon", label: "Faceoffs Won" },
  { key: "faceoffPercent", label: "Faceoff Win Percent", type: "percent" },
  { key: "giveaways", label: "Giveaways", lowerIsBetter: true },
  { key: "penalties", label: "Total Penalties", lowerIsBetter: true },
  { key: "penaltyMinutes", label: "Penalty Minutes", lowerIsBetter: true },
];

const FOOTBALL_STAT_KEYS: StatConfig[] = [
  { key: "firstDowns", label: "First Downs" },
  { key: "firstDownsPassing", label: "Passing First Downs" },
  { key: "firstDownsRushing", label: "Rushing First Downs" },
  { key: "firstDownsPenalty", label: "First Downs From Penalties" },
  { key: "thirdDownEff", label: "Third Down Efficiency" },
  { key: "fourthDownEff", label: "Fourth Down Efficiency" },
  { key: "totalOffensivePlays", label: "Total Plays" },
  { key: "totalYards", label: "Total Yards" },
  { key: "yardsPerPlay", label: "Yards per Play" },
  { key: "totalDrives", label: "Total Drives" },
  { key: "netPassingYards", label: "Passing" },
  { key: "completionAttempts", label: "Comp/Att" },
  { key: "yardsPerPass", label: "Yards per Pass" },
  { key: "interceptions", label: "Interceptions Thrown", lowerIsBetter: true },
  { key: "sacksYardsLost", label: "Sacks-Yards Lost", lowerIsBetter: true },
  { key: "rushingYards", label: "Rushing" },
  { key: "rushingAttempts", label: "Rushing Attempts" },
  { key: "yardsPerRushAttempt", label: "Yards per Rush" },
  { key: "redZoneAttempts", label: "Red Zone (Made-Att)" },
  { key: "totalPenaltiesYards", label: "Penalties", lowerIsBetter: true },
  { key: "turnovers", label: "Turnovers", lowerIsBetter: true },
  { key: "fumblesLost", label: "Fumbles Lost", lowerIsBetter: true },
  { key: "defensiveTouchdowns", label: "Defensive / Special Teams TDs" },
  { key: "possessionTime", label: "Time of Possession", type: "time" },
];

const BASEBALL_STAT_KEYS: StatConfig[] = [
  { category: "batting", key: "runs", label: "Runs" },
  { category: "batting", key: "hits", label: "Hits" },
  { category: "batting", key: "homeRuns", label: "Home Runs" },
  { category: "batting", key: "RBIs", label: "RBI" },
  { category: "batting", key: "walks", label: "Walks" },
  {
    category: "batting",
    key: "strikeouts",
    label: "Batting K",
    lowerIsBetter: true,
  },
  { category: "batting", key: "stolenBases", label: "Stolen Bases" },
  {
    category: "batting",
    key: "runnersLeftOnBase",
    label: "Left On Base",
    lowerIsBetter: true,
  },
  { category: "batting", key: "avg", label: "AVG" },
  { category: "batting", key: "onBasePct", label: "OBP" },
  { category: "batting", key: "slugAvg", label: "SLG" },
  { category: "batting", key: "OPS", label: "OPS" },
  { category: "pitching", key: "innings", label: "Innings Pitched" },
  {
    category: "pitching",
    key: "hits",
    label: "Hits Allowed",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "runs",
    label: "Runs Allowed",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "earnedRuns",
    label: "Earned Runs",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "walks",
    label: "Walks Allowed",
    lowerIsBetter: true,
  },
  { category: "pitching", key: "strikeouts", label: "Pitching K" },
  {
    category: "pitching",
    key: "homeRuns",
    label: "HR Allowed",
    lowerIsBetter: true,
  },
  { category: "pitching", key: "ERA", label: "ERA", lowerIsBetter: true },
  { category: "pitching", key: "WHIP", label: "WHIP", lowerIsBetter: true },
  { category: "pitching", key: "pitches", label: "Pitches" },
  { category: "fielding", key: "errors", label: "Errors", lowerIsBetter: true },
  { category: "fielding", key: "doublePlays", label: "Double Plays" },
  { category: "fielding", key: "assists", label: "Assists" },
  { category: "fielding", key: "putouts", label: "Putouts" },
  { category: "fielding", key: "fieldingPct", label: "Fielding Pct" },
];

const SOCCER_STAT_KEYS: StatConfig[] = [
  {
    key: "foulsCommitted",
    type: "text",
    label: "Fouls",
  },
  {
    key: "yellowCards",
    type: "text",
    label: "Yellow Cards",
  },
  {
    key: "redCards",
    type: "text",
    label: "Red Cards",
  },
  {
    key: "offsides",
    type: "text",
    label: "Offsides",
  },
  {
    key: "wonCorners",
    type: "text",
    label: "Corner Kicks",
  },
  {
    key: "saves",
    type: "text",
    label: "Saves",
  },
  {
    key: "possessionPct",
    type: "percent",
    label: "Possession",
  },
  {
    key: "totalShots",
    type: "text",
    label: "Shots",
  },
  {
    key: "shotsOnTarget",
    type: "text",
    label: "On Goal",
  },
  {
    key: "shotPct",
    type: "percent",
    label: "On Target %",
  },
  {
    key: "penaltyKickGoals",
    type: "text",
    label: "Penalty Goals",
  },
  {
    key: "penaltyKickShots",
    type: "text",
    label: "Penalty Kicks Taken",
  },
  {
    key: "accuratePasses",
    type: "text",
    label: "Accurate Passes",
  },
  {
    key: "totalPasses",
    type: "text",
    label: "Passes",
  },
  {
    key: "passPct",
    type: "percent",
    label: "Pass Completion %",
  },
  {
    key: "accurateCrosses",
    type: "text",
    label: "Accurate Crosses",
  },
  {
    key: "totalCrosses",
    type: "text",
    label: "Crosses",
  },
  {
    key: "crossPct",
    type: "percent",
    label: "Cross %",
  },
  {
    key: "totalLongBalls",
    type: "text",
    label: "Long Balls",
  },
  {
    key: "accurateLongBalls",
    type: "text",
    label: "Accurate Long Balls",
  },
  {
    key: "longballPct",
    type: "percent",
    label: "Long Balls %",
  },
  {
    key: "blockedShots",
    type: "text",
    label: "Blocked Shots",
  },
  {
    key: "effectiveTackles",
    type: "text",
    label: "Effective Tackles",
  },
  {
    key: "totalTackles",
    type: "text",
    label: "Tackles",
  },
  {
    key: "tacklePct",
    type: "percent",
    label: "Tackle %",
  },
  {
    key: "interceptions",
    type: "text",
    label: "Interceptions",
  },
  {
    key: "effectiveClearance",
    type: "text",
    label: "Effective Clearances",
  },
  {
    key: "totalClearance",
    type: "text",
    label: "Clearances",
  },
];

function isBaseballLeague(league?: string) {
  return league === "mlb" || league === "cb" || league === "sb";
}

function isFootballLeague(league?: string) {
  return league === "nfl" || league === "cfb" || league === "ufl";
}

function isSoccerLeague(league?: string) {
  return (
    league === "msoc" ||
    league === "wsoc" ||
    league === "mls" ||
    league === "fifa" ||
    league === "bundesliga" ||
    league === "laliga" ||
    league === "ligue1" ||
    league === "ligue2" ||
    league === "champions" ||
    league === "europa" ||
    league === "leaguescup" ||
    league === "epl"
  );
}

function getStatConfig(league?: string, state?: string | null) {
  if (isBaseballLeague(league)) return BASEBALL_STAT_KEYS;
  if (isSoccerLeague(league)) return SOCCER_STAT_KEYS;
  if (isFootballLeague(league)) return FOOTBALL_STAT_KEYS;
  if (league === "nhl") return HOCKEY_STAT_KEYS;
  if (state === "pre") {
    // Lead with season comparisons instead of unplayed game totals.
    const seasonKeys = [
      "avgPoints",
      "avgPointsAgainst",
      "avgRebounds",
      "avgAssists",
      "fieldGoalPct",
      "threePointFieldGoalPct",
      "freeThrowPct",
      "avgBlocks",
      "avgSteals",
      "avgTeamTurnovers",
      "avgTotalTurnovers",
      "streak",
    ];
    return [
      ...seasonKeys.flatMap((key) =>
        BASKETBALL_STAT_KEYS.filter((config) => config.key === key),
      ),
      ...BASKETBALL_STAT_KEYS.filter(
        (config) => !seasonKeys.includes(config.key),
      ),
    ];
  }
  return BASKETBALL_STAT_KEYS;
}

function getTeams(
  stats?: GameTeamStatsEntry[],
  GameTeamStats?: GameTeamStatsEntry[],
) {
  return Array.isArray(stats)
    ? stats
    : Array.isArray(GameTeamStats)
      ? GameTeamStats
      : [];
}

function getSideTeam(teams: GameTeamStatsEntry[], side: "away" | "home") {
  return (
    teams.find((team) => team.homeAway === side) ??
    teams.find((team) => {
      if (side === "away") return team.displayOrder === 1;
      return team.displayOrder === 2;
    })
  );
}

function isGroupedStats(
  items?: StatItem[] | StatGroup[],
): items is StatGroup[] {
  return (
    Array.isArray(items) &&
    items.some(
      (item) => "stats" in item && Array.isArray((item as StatGroup).stats),
    )
  );
}

function getFlatStats(team?: GameTeamStatsEntry) {
  if (!team) return [];
  if (Array.isArray(team.stats) && !isGroupedStats(team.stats)) {
    return team.stats;
  }
  if (Array.isArray(team.statistics) && !isGroupedStats(team.statistics)) {
    return team.statistics;
  }
  return [];
}

function getGroupedStats(team?: GameTeamStatsEntry) {
  if (!team) return [];
  if (isGroupedStats(team.stats)) return team.stats;
  if (isGroupedStats(team.statistics)) return team.statistics;
  return [];
}

function findFlatStat(
  team: GameTeamStatsEntry | undefined,
  config: StatConfig,
) {
  const names = [config.key, ...(config.aliases ?? [])];
  return getFlatStats(team).find((stat) => {
    const statNames = [
      stat.name,
      stat.displayName,
      stat.shortDisplayName,
      stat.abbreviation,
    ];

    return names.some((name) => statNames.includes(name));
  });
}

function findGroupedStat(
  team: GameTeamStatsEntry | undefined,
  config: StatConfig,
) {
  if (!config.category) return undefined;

  const group = getGroupedStats(team).find((item) => {
    const name = item.name?.toLowerCase();
    const displayName = item.displayName?.toLowerCase();
    return name === config.category || displayName === config.category;
  });

  return group?.stats?.find((stat) => stat.name === config.key);
}

const MISSING_STAT_VALUES = new Set([
  "",
  "-",
  "--",
  "—",
  "–",
  "n/a",
  "na",
  "null",
  "undefined",
]);

function hasStatValue(stat?: StatItem) {
  if (!stat) return false;

  const value = stat.displayValue ?? stat.value;

  if (value === undefined || value === null) return false;

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return !MISSING_STAT_VALUES.has(value.trim().toLowerCase());
}

function getDisplayValue(stat: StatItem | undefined, type?: StatType) {
  if (!hasStatValue(stat)) return EMPTY_DISPLAY;
  const value = stat?.displayValue ?? stat?.value;
  if (value === undefined || value === null || value === "") {
    return EMPTY_DISPLAY;
  }

  const display = String(value);
  if (type === "percent" && !display.includes("%")) {
    return `${display}%`;
  }

  return display;
}

function getRawValue(stat?: StatItem) {
  return stat?.value ?? stat?.displayValue;
}

function parseBaseballInnings(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return 0;

  const raw = String(value).trim();
  const [wholeRaw, partRaw] = raw.split(".");
  const whole = Number(wholeRaw) || 0;
  const part = Number(partRaw) || 0;

  if (!partRaw) return whole;
  if (part === 1) return whole + 1 / 3;
  if (part === 2) return whole + 2 / 3;

  return Number(raw) || 0;
}

function parseTime(value: string) {
  const [minutes, seconds] = value.split(":").map(Number);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
  return minutes * 60 + seconds;
}

function extractNumber(
  value?: string | number | null,
  key?: string,
  type?: StatType,
) {
  if (value === undefined || value === null || value === "") return 0;

  if (key === "innings") {
    return parseBaseballInnings(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = value.replace("%", "").trim();
  if (type === "time" && cleaned.includes(":")) {
    return parseTime(cleaned);
  }

  if (cleaned.includes("-")) {
    const [first] = cleaned.split("-");
    return Number(first) || 0;
  }

  if (key === "streak") {
    const match = cleaned.match(/[WL](\d+)/);
    return match ? Number(match[1]) : 0;
  }

  return Number(cleaned) || 0;
}

function buildRows(
  away: GameTeamStatsEntry | undefined,
  home: GameTeamStatsEntry | undefined,
  configs: StatConfig[],
  grouped: boolean,
) {
  return configs
    .map((config): StatRow | null => {
      const getStat = grouped ? findGroupedStat : findFlatStat;
      const awayStat = getStat(away, config);
      const homeStat = getStat(home, config);
      const awayHasValue = hasStatValue(awayStat);
      const homeHasValue = hasStatValue(homeStat);

      if (!awayHasValue && !homeHasValue) return null;

      const awayNum = awayHasValue
        ? extractNumber(getRawValue(awayStat), config.key, config.type)
        : 0;
      const homeNum = homeHasValue
        ? extractNumber(getRawValue(homeStat), config.key, config.type)
        : 0;
      const isTie = awayHasValue && homeHasValue && awayNum === homeNum;
      const max = Math.max(awayNum, homeNum, 1);

      let awayWins = false;
      let homeWins = false;

      if (!isTie) {
        if (awayHasValue && !homeHasValue) {
          awayWins = true;
        } else if (!awayHasValue && homeHasValue) {
          homeWins = true;
        } else if (config.lowerIsBetter) {
          awayWins = awayNum < homeNum;
          homeWins = homeNum < awayNum;
        } else {
          awayWins = awayNum > homeNum;
          homeWins = homeNum > awayNum;
        }
      }

      return {
        id: `${config.category ?? "flat"}-${config.key}`,
        label: config.label,
        awayDisplay: getDisplayValue(awayStat, config.type),
        homeDisplay: getDisplayValue(homeStat, config.type),
        awayNum,
        homeNum,
        awayWins,
        homeWins,
        isTie,
        max,
      };
    })
    .filter(Boolean) as StatRow[];
}

export default function GameTeamStats({
  stats,
  GameTeamStats,
  state,
  awayLogo,
  homeLogo,
  awayName,
  homeName,
  awayCode,
  homeCode,
  isDark,
  league,
}: GameTeamStatsProps) {
  const styles = GameTeamStatsStyles(isDark);
  const teams = useMemo(
    () => getTeams(stats, GameTeamStats),
    [stats, GameTeamStats],
  );
  const away = getSideTeam(teams, "away") ?? teams[0];
  const home = getSideTeam(teams, "home") ?? teams[1];
  const isBaseball = isBaseballLeague(league);

  const rows = useMemo(() => {
    const configs = getStatConfig(league, state);

    if (!isBaseball) {
      return buildRows(away, home, configs, false);
    }

    const groupedRows = buildRows(away, home, configs, true);
    return groupedRows.length > 0
      ? groupedRows
      : buildRows(away, home, configs, false);
  }, [away, home, isBaseball, league, state]);

  const hasMeaningfulStats = useMemo(() => {
    if (rows.length === 0) return false;

    // Pregame payloads can contain placeholder rows such as "-" and
    // synthetic 0/0.0 values even when no real team stats are available yet.
    // Hide the entire section until at least one real pregame stat exists.
    if (state === "pre") {
      return rows.some((row) => {
        if (row.awayNum !== 0 || row.homeNum !== 0) return true;

        // Text-based stats such as a real W/L streak are meaningful even
        // though their numeric comparison value may be zero.
        if (row.id.endsWith("-streak")) {
          return (
            row.awayDisplay !== EMPTY_DISPLAY ||
            row.homeDisplay !== EMPTY_DISPLAY
          );
        }

        return false;
      });
    }

    return true;
  }, [rows, state]);

  if (
    teams.length < 2 ||
    !away ||
    !home ||
    rows.length === 0 ||
    !hasMeaningfulStats
  ) {
    return null;
  }

  const awayLabel = awayName ?? awayCode ?? away.team?.abbreviation ?? "";
  const homeLabel = homeName ?? homeCode ?? home.team?.abbreviation ?? "";

  const renderStatRow = (
    row: StatRow,
    index: number,
  ) => {
    const awayOpacity = row.isTie || row.awayWins ? 1 : 0.4;
    const homeOpacity = row.isTie || row.homeWins ? 1 : 0.4;
    const isLastRow = index === rows.length - 1;

    return (
      <View key={row.id} style={styles.statSection}>
        <View style={[styles.row, isLastRow && styles.lastRow]}>
          <Text style={[styles.barText, { opacity: awayOpacity }]}>
            {row.awayDisplay}
          </Text>

          <Text style={styles.statLabel} numberOfLines={1}>
            {row.label}
          </Text>

          <Text style={[styles.barText, { opacity: homeOpacity }]}>
            {row.homeDisplay}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      <HeadingTwo isDark={isDark}>
        {state === "pre" ? "Team Stats" : "Game Stats"}
      </HeadingTwo>

      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          {awayLogo ? <Image source={awayLogo} style={styles.logo} /> : null}
          <Text style={styles.teamLabel}>{awayLabel}</Text>
        </View>

        <View style={styles.teamContainer}>
          {homeLogo ? <Image source={homeLogo} style={styles.logo} /> : null}
          <Text style={styles.teamLabel}>{homeLabel}</Text>
        </View>
      </View>

      <View style={styles.container}>
        {rows.map((row, index) => renderStatRow(row, index))}
      </View>
    </View>
  );
}
