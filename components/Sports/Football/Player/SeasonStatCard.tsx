import type {
  FootballPlayerSeason,
  Stat,
} from "@/hooks/FootballHooks/usePlayerSeasons";
import CenteredHeader from "components/Headings/CenteredHeader";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import { getFootballSeason } from "utils/dateUtils";

type Props = {
  player: any;
  season?: FootballPlayerSeason | null;
  loading?: boolean;
  error?: string | null;
};

type StatMatch = {
  displayValue: string;
  numericValue: number | null;
};

type StatCategoryLike = {
  name?: string | null;
  displayName?: string | null;
  shortDisplayName?: string | null;
  description?: string | null;
  label?: string | null;
  abbreviation?: string | null;
  stats?: Stat[] | null;
};

type StatOccurrence = "first" | "last";

const EMPTY_STAT = "0";

const DEFENSIVE_POSITIONS = new Set([
  "DE",
  "EDGE",
  "DT",
  "DL",
  "LB",
  "OLB",
  "ILB",
  "MLB",
  "CB",
  "DB",
  "S",
  "FS",
  "SS",
  "NT",
]);

const POSITION_ALIASES: Record<string, string> = {
  QUARTERBACK: "QB",
  RUNNINGBACK: "RB",
  FULLBACK: "FB",
  WIDERECEIVER: "WR",
  TIGHTEND: "TE",
  DEFENSIVEEND: "DE",
  DEFENSIVETACKLE: "DT",
  NOSETACKLE: "NT",
  LINEBACKER: "LB",
  OUTSIDELINEBACKER: "OLB",
  INSIDELINEBACKER: "ILB",
  MIDDLELINEBACKER: "MLB",
  CORNERBACK: "CB",
  DEFENSIVEBACK: "DB",
  SAFETY: "S",
  FREESAFETY: "FS",
  STRONGSAFETY: "SS",
  KICKER: "K",
  PUNTER: "P",
};

function normalizeText(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getPosition(player: any) {
  const rawPosition =
    player?.position?.abbreviation ??
    player?.position?.shortName ??
    player?.position?.name ??
    player?.position ??
    "";

  const position = String(rawPosition).trim().toUpperCase();
  const normalizedPosition = normalizeText(position).toUpperCase();

  return POSITION_ALIASES[normalizedPosition] ?? position;
}

function getSeasonDisplayYear(season?: FootballPlayerSeason | null) {
  return String(
    season?.displaySeason ??
      season?.year ??
      season?.season ??
      getFootballSeason(),
  );
}

function getCategories(
  season?: FootballPlayerSeason | null,
): StatCategoryLike[] {
  return (season?.categories ?? []) as StatCategoryLike[];
}

function getAllStats(season?: FootballPlayerSeason | null): Stat[] {
  return getCategories(season).flatMap((category) => category.stats ?? []);
}

function getCategoryIdentity(category: StatCategoryLike) {
  return [
    category.name,
    category.displayName,
    category.shortDisplayName,
    category.description,
    category.label,
    category.abbreviation,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    .map(normalizeText);
}

function getStatsByCategory(
  season: FootballPlayerSeason | null | undefined,
  aliases: string[],
): Stat[] {
  const normalizedAliases = aliases.map(normalizeText).filter(Boolean);

  return getCategories(season)
    .filter((category) => {
      const identities = getCategoryIdentity(category);

      return identities.some((identity) =>
        normalizedAliases.some(
          (alias) =>
            identity === alias ||
            identity.includes(alias) ||
            alias.includes(identity),
        ),
      );
    })
    .flatMap((category) => category.stats ?? []);
}

function getPreferredStats(
  season: FootballPlayerSeason | null | undefined,
  categoryAliases: string[],
): Stat[] {
  const categoryStats = getStatsByCategory(season, categoryAliases);

  return categoryStats.length > 0 ? categoryStats : getAllStats(season);
}

function getStatIdentity(stat: Stat) {
  return [stat.name, stat.displayName, stat.description, stat.label]
    .filter(
      (value): value is string =>
        value !== null && value !== undefined && String(value).trim() !== "",
    )
    .map(normalizeText);
}

function parseNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return null;
  }

  const parsed = Number(
    String(value).replace(/,/g, "").replace(/%/g, "").trim(),
  );

  return Number.isFinite(parsed) ? parsed : null;
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return EMPTY_STAT;
  }

  const rawValue = String(value).trim();

  // Preserve already-formatted values such as 213/337 and 85.7%.
  if (
    rawValue.includes("%") ||
    rawValue.includes("/") ||
    /^[+-]?\d+\s*-\s*\d+$/.test(rawValue)
  ) {
    return rawValue;
  }

  const numberValue = parseNumber(value);

  if (numberValue === null) {
    return rawValue;
  }

  if (Number.isInteger(numberValue)) {
    return numberValue >= 1000
      ? numberValue.toLocaleString("en-US")
      : String(numberValue);
  }

  return numberValue.toFixed(1);
}

function formatPercent(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return EMPTY_STAT;
  }

  const rawValue = String(value).trim();

  if (rawValue.includes("%")) {
    return rawValue;
  }

  const numberValue = parseNumber(value);

  if (numberValue === null) {
    return rawValue;
  }

  const percent = Math.abs(numberValue) <= 1 ? numberValue * 100 : numberValue;

  return `${percent.toFixed(1)}%`;
}

function findStat(
  stats: Stat[],
  aliases: string[],
  occurrence: StatOccurrence = "first",
): StatMatch {
  const normalizedAliases = aliases.map(normalizeText).filter(Boolean);

  const matches = stats.filter((item) => {
    const identities = getStatIdentity(item);

    return identities.some((identity) => normalizedAliases.includes(identity));
  });

  const stat = occurrence === "last" ? matches[matches.length - 1] : matches[0];

  if (!stat) {
    return {
      displayValue: EMPTY_STAT,
      numericValue: null,
    };
  }

  const displayValue =
    stat.displayValue !== null &&
    stat.displayValue !== undefined &&
    stat.displayValue !== ""
      ? String(stat.displayValue)
      : formatValue(stat.value);

  return {
    displayValue,
    numericValue:
      typeof stat.value === "number" && Number.isFinite(stat.value)
        ? stat.value
        : parseNumber(displayValue),
  };
}

function getStatDisplay(
  stats: Stat[],
  aliases: string[],
  occurrence: StatOccurrence = "first",
) {
  return findStat(stats, aliases, occurrence).displayValue;
}

function getStatNumber(
  stats: Stat[],
  aliases: string[],
  occurrence: StatOccurrence = "first",
) {
  return findStat(stats, aliases, occurrence).numericValue;
}

function getMadeAttemptedDisplay(
  stats: Stat[],
  combinedAliases: string[],
  madeAliases: string[],
  attemptedAliases: string[],
  separator = "/",
) {
  const combined = findStat(stats, combinedAliases);

  if (
    combined.numericValue !== null ||
    (combined.displayValue !== EMPTY_STAT && combined.displayValue !== "0")
  ) {
    return combined.displayValue;
  }

  const made = getStatDisplay(stats, madeAliases);
  const attempted = getStatDisplay(stats, attemptedAliases);

  return `${made}${separator}${attempted}`;
}

function hasAnyStats(stats: Stat[]) {
  return stats.some((stat) => {
    const value = stat.displayValue ?? stat.value;

    return (
      value !== null && value !== undefined && value !== "" && value !== "-"
    );
  });
}

export default function SeasonStatCard({
  player,
  season,
  loading = false,
  error = null,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);
  const allStats = getAllStats(season);

  if (loading) {
    return <SeasonStatCardSkeleton />;
  }

  if (error) {
    return (
      <View>
        <CenteredHeader isDark={isDark}>
          {getFootballSeason()} Season
        </CenteredHeader>
        <Text style={global.errorText}>Failed to load stats</Text>
      </View>
    );
  }

  if (!season || !hasAnyStats(allStats)) {
    return (
      <View>
        <CenteredHeader isDark={isDark}>
          {getFootballSeason()} Season
        </CenteredHeader>

        <Text style={global.emptyText}>No season stats available</Text>
      </View>
    );
  }

  const displayYear = getSeasonDisplayYear(season);
  const position = getPosition(player);

  const passingStats = getPreferredStats(season, [
    "passing",
    "pass",
    "passingStats",
  ]);

  const rushingStats = getPreferredStats(season, [
    "rushing",
    "rush",
    "rushingStats",
  ]);

  const receivingStats = getPreferredStats(season, [
    "receiving",
    "receive",
    "receivingStats",
  ]);

  const defensiveStats = getPreferredStats(season, [
    "defensive",
    "defense",
    "defensiveStats",
  ]);

  const kickingStats = getPreferredStats(season, [
    "kicking",
    "kick",
    "kickingStats",
  ]);

  const puntingStats = getPreferredStats(season, [
    "punting",
    "punt",
    "puntingStats",
  ]);

  function StatItem({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) {
    return (
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{formatValue(value)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  const showPassing = position === "QB";
  const showRushing = ["RB", "FB"].includes(position);
  const showReceiving = ["WR", "TE"].includes(position);
  const showDefense = DEFENSIVE_POSITIONS.has(position);
  const showKicking = position === "K";
  const showPunting = position === "P";

  const shouldShowFallback =
    !showPassing &&
    !showRushing &&
    !showReceiving &&
    !showDefense &&
    !showKicking &&
    !showPunting;

  /*
   * Passing
   *
   * ESPN commonly returns:
   * - completions
   * - passingAttempts
   *
   * It does not always return a combined completionsPassingAttempts stat.
   */
  const cmpAtt = getMadeAttemptedDisplay(
    passingStats,
    [
      "completionsPassingAttempts",
      "completions-passingAttempts",
      "completionAttempts",
      "completionsAttempts",
    ],
    ["completions", "passingCompletions"],
    ["passingAttempts", "attempts", "passAttempts", "passing attempts"],
  );

  const passingYards = getStatDisplay(passingStats, [
    "passingYards",
    "passing yards",
  ]);

  const passingTDs = getStatDisplay(passingStats, [
    "passingTouchdowns",
    "passing touchdowns",
    "passingTDs",
  ]);

  // This selects interceptions thrown from the passing category.
  const passingInterceptions = getStatDisplay(passingStats, [
    "interceptions",
    "passingInterceptions",
    "interceptionsThrown",
  ]);

  /*
   * Rushing
   */
  const rushingAttempts = getStatDisplay(rushingStats, [
    "rushingAttempts",
    "rushing attempts",
    "carries",
  ]);

  const rushingYards = getStatDisplay(rushingStats, [
    "rushingYards",
    "rushing yards",
  ]);

  const rushingAvg = getStatDisplay(rushingStats, [
    "yardsPerRushAttempt",
    "yards per rush attempt",
    "yardsPerCarry",
    "rushingAverage",
  ]);

  const rushingTDs = getStatDisplay(rushingStats, [
    "rushingTouchdowns",
    "rushing touchdowns",
    "rushingTDs",
  ]);

  /*
   * Receiving
   */
  const receptions = getStatDisplay(receivingStats, [
    "receptions",
    "receivingReceptions",
  ]);

  const receivingYards = getStatDisplay(receivingStats, [
    "receivingYards",
    "receiving yards",
  ]);

  const receivingYardsPer = getStatDisplay(receivingStats, [
    "yardsPerReception",
    "yards per reception",
    "receivingAverage",
  ]);

  const receivingTDs = getStatDisplay(receivingStats, [
    "receivingTouchdowns",
    "receiving touchdowns",
    "receivingTDs",
  ]);

  /*
   * Defense
   *
   * "last" is used as a safe fallback for flattened ESPN arrays because
   * passing interceptions and times-sacked commonly appear before the
   * defensive versions of those stats.
   */
  const totalTackles = getStatDisplay(
    defensiveStats,
    ["totalTackles", "total tackles", "tackles"],
    "last",
  );

  const defensiveInterceptions = getStatDisplay(
    defensiveStats,
    ["interceptions", "defensiveInterceptions", "interceptionsCaught"],
    "last",
  );

  const tacklesForLoss = getStatDisplay(
    defensiveStats,
    ["stuffs", "tacklesForLoss", "tackles for loss", "totalTacklesForLoss"],
    "last",
  );

  const defensiveSacks = getStatDisplay(
    defensiveStats,
    ["sacks", "defensiveSacks"],
    "last",
  );

  /*
   * Kicking
   */
  const fgmFga = getMadeAttemptedDisplay(
    kickingStats,
    [
      "fieldGoalsMade-fieldGoalAttempts",
      "fieldGoalsMade-fieldGoalsAttempted",
      "fieldGoalsMadeAttempts",
    ],
    ["fieldGoalsMade", "field goals made"],
    [
      "fieldGoalAttempts",
      "fieldGoalsAttempted",
      "field goals attempts",
      "field goals attempted",
    ],
  );

  const xpmXpa = getMadeAttemptedDisplay(
    kickingStats,
    [
      "extraPointsMade-extraPointAttempts",
      "extraPointsMade-extraPointsAttempted",
      "extraPointsMadeAttempts",
    ],
    ["extraPointsMade", "kickExtraPointsMade", "extra points made"],
    [
      "extraPointAttempts",
      "extraPointsAttempted",
      "kickExtraPointAttempts",
      "extra points attempted",
    ],
  );

  const longFieldGoal = getStatDisplay(kickingStats, [
    "longFieldGoalMade",
    "longFieldGoal",
    "longest field goal",
  ]);

  const fieldGoalPctValue =
    getStatNumber(kickingStats, [
      "fieldGoalPct",
      "fieldGoalPercentage",
      "field goal pct",
    ]) ??
    getStatDisplay(kickingStats, [
      "fieldGoalPct",
      "fieldGoalPercentage",
      "field goal pct",
    ]);

  const fieldGoalPct = formatPercent(fieldGoalPctValue);

  /*
   * Punting
   */
  const punts = getStatDisplay(puntingStats, ["punts", "puntingAttempts"]);

  const puntYards = getStatDisplay(puntingStats, [
    "puntYards",
    "grossPuntYards",
    "gross punt yards",
  ]);

  const longestPunt = getStatDisplay(puntingStats, [
    "longPunt",
    "longestPunt",
    "longest punt",
  ]);

  const touchbacks = getStatDisplay(puntingStats, [
    "puntTouchbacks",
    "touchbacks",
  ]);

  /*
   * Unknown-position fallback
   */
  const fallbackGamesPlayed = getStatDisplay(allStats, [
    "gamesPlayed",
    "games played",
    "games",
  ]);

  const fallbackPoints = getStatDisplay(allStats, ["totalPoints", "points"]);

  const fallbackTouchdowns = getStatDisplay(allStats, [
    "totalTouchdowns",
    "total touchdowns",
  ]);

  const fallbackPassingYards = getStatDisplay(passingStats, [
    "passingYards",
    "passing yards",
  ]);

  const fallbackRushingYards = getStatDisplay(rushingStats, [
    "rushingYards",
    "rushing yards",
  ]);

  const fallbackReceivingYards = getStatDisplay(receivingStats, [
    "receivingYards",
    "receiving yards",
  ]);

  const fallbackYards =
    fallbackPassingYards !== EMPTY_STAT
      ? fallbackPassingYards
      : fallbackRushingYards !== EMPTY_STAT
        ? fallbackRushingYards
        : fallbackReceivingYards;

  return (
    <View>
      <CenteredHeader isDark={isDark}>{displayYear} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          {showPassing && (
            <>
              <StatItem label="CMP/ATT" value={cmpAtt} />
              <StatItem label="PASS YDS" value={passingYards} />
              <StatItem label="PASS TD" value={passingTDs} />
              <StatItem label="INT" value={passingInterceptions} />
            </>
          )}

          {showRushing && (
            <>
              <StatItem label="RUSH ATT" value={rushingAttempts} />
              <StatItem label="RUSH YDS" value={rushingYards} />
              <StatItem label="YDS/ATT" value={rushingAvg} />
              <StatItem label="RUSH TD" value={rushingTDs} />
            </>
          )}

          {showReceiving && (
            <>
              <StatItem label="REC" value={receptions} />
              <StatItem label="REC YDS" value={receivingYards} />
              <StatItem label="YDS/REC" value={receivingYardsPer} />
              <StatItem label="REC TD" value={receivingTDs} />
            </>
          )}

          {showDefense && (
            <>
              <StatItem label="TOT" value={totalTackles} />
              <StatItem label="INT" value={defensiveInterceptions} />
              <StatItem label="TFL" value={tacklesForLoss} />
              <StatItem label="SACK" value={defensiveSacks} />
            </>
          )}

          {showKicking && (
            <>
              <StatItem label="FGM/FGA" value={fgmFga} />
              <StatItem label="FG%" value={fieldGoalPct} />
              <StatItem label="XPM/XPA" value={xpmXpa} />
              <StatItem label="LONG" value={longFieldGoal} />
            </>
          )}

          {showPunting && (
            <>
              <StatItem label="PUNTS" value={punts} />
              <StatItem label="PUNT YDS" value={puntYards} />
              <StatItem label="LONG" value={longestPunt} />
              <StatItem label="TB" value={touchbacks} />
            </>
          )}

          {shouldShowFallback && (
            <>
              <StatItem label="GP" value={fallbackGamesPlayed} />
              <StatItem label="YDS" value={fallbackYards} />
              <StatItem label="TD" value={fallbackTouchdowns} />
              <StatItem label="PTS" value={fallbackPoints} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
