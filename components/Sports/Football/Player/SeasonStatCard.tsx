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
]);

function normalizeText(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function getPosition(player: any) {
  const rawPosition =
    player?.position?.abbreviation ??
    player?.position?.name ??
    player?.position ??
    "";

  return String(rawPosition).trim().toUpperCase();
}

function getSeasonDisplayYear(season?: FootballPlayerSeason | null) {
  return String(
    season?.displaySeason ??
      season?.year ??
      season?.season ??
      getFootballSeason(),
  );
}

function getAllStats(season?: FootballPlayerSeason | null) {
  if (!season?.categories?.length) {
    return [];
  }

  return season.categories.flatMap((category) => category.stats ?? []);
}

function getStatIdentity(stat: Stat) {
  return [stat.name, stat.displayName, stat.description, stat.label]
    .filter(Boolean)
    .map((value) => normalizeText(value));
}

function parseNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return null;
  }

  const parsed = Number(String(value).replace(/,/g, "").replace("%", ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return EMPTY_STAT;
  }

  const num = parseNumber(value);

  if (num === null) {
    return String(value);
  }

  if (Number.isInteger(num)) {
    return num >= 1000 ? num.toLocaleString("en-US") : String(num);
  }

  return num.toFixed(1);
}

function formatPercent(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return EMPTY_STAT;
  }

  const rawValue = String(value);

  if (rawValue.includes("%")) {
    return rawValue;
  }

  const num = parseNumber(value);

  if (num === null) {
    return rawValue;
  }

  const percent = Math.abs(num) <= 1 ? num * 100 : num;

  return `${percent.toFixed(1)}%`;
}

function findStat(stats: Stat[], aliases: string[]): StatMatch {
  const normalizedAliases = aliases.map(normalizeText);

  const stat = stats.find((item) => {
    const identities = getStatIdentity(item);

    return identities.some((identity) => normalizedAliases.includes(identity));
  });

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

function getStatDisplay(stats: Stat[], aliases: string[]) {
  return findStat(stats, aliases).displayValue;
}

function getStatNumber(stats: Stat[], aliases: string[]) {
  return findStat(stats, aliases).numericValue;
}

function getMadeAttemptedDisplay(
  stats: Stat[],
  combinedAliases: string[],
  madeAliases: string[],
  attemptedAliases: string[],
  separator = "/",
) {
  const combined = findStat(stats, combinedAliases);

  if (combined.displayValue !== EMPTY_STAT && combined.displayValue !== "0") {
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
  loading,
  error,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);

  if (loading) return <SeasonStatCardSkeleton />;
  const stats = getAllStats(season);

  if (!season || !hasAnyStats(stats)) {
    return (
      <View>
        <CenteredHeader isDark={isDark}>
          {getFootballSeason()} Season
        </CenteredHeader>
        <Text style={global.emptyText}>No season stats available</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={global.errorText}>Failed to load stats</Text>;
  }

  const displayYear = getSeasonDisplayYear(season);
  const position = getPosition(player);

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
  const showRushing = position === "RB";
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

  const cmpAtt = getMadeAttemptedDisplay(
    stats,
    ["completions-passingAttempts", "completionsPassingAttempts"],
    ["completions"],
    ["passingAttempts", "passing attempts"],
  );

  const passingYards = getStatDisplay(stats, ["passingYards", "passing yards"]);
  const passingTDs = getStatDisplay(stats, [
    "passingTouchdowns",
    "passing touchdowns",
  ]);
  const interceptions = getStatDisplay(stats, ["interceptions"]);

  const rushingAttempts = getStatDisplay(stats, [
    "rushingAttempts",
    "rushing attempts",
  ]);
  const rushingYards = getStatDisplay(stats, ["rushingYards", "rushing yards"]);
  const rushingAvg = getStatDisplay(stats, [
    "yardsPerRushAttempt",
    "yards per rush attempt",
    "yards per rush avg",
  ]);
  const rushingTDs = getStatDisplay(stats, [
    "rushingTouchdowns",
    "rushing touchdowns",
  ]);

  const receptionTargets = getMadeAttemptedDisplay(
    stats,
    ["receptions-receivingTargets", "receptionsReceivingTargets"],
    ["receptions"],
    ["receivingTargets", "targets"],
  );

  const receivingYards = getStatDisplay(stats, [
    "receivingYards",
    "receiving yards",
  ]);
  const receivingYardsPer = getStatDisplay(stats, [
    "yardsPerReception",
    "yards per reception",
  ]);
  const receivingTDs = getStatDisplay(stats, [
    "receivingTouchdowns",
    "receiving touchdowns",
  ]);

  const totalTackles = getStatDisplay(stats, ["totalTackles", "total tackles"]);
  const defenseInterceptions = getStatDisplay(stats, ["interceptions"]);
  const tacklesForLoss = getStatDisplay(stats, [
    "stuffs",
    "tacklesForLoss",
    "tackles for loss",
  ]);
  const sacks = getStatDisplay(stats, ["sacks"]);

  const fgmFga = getMadeAttemptedDisplay(
    stats,
    [
      "fieldGoalsMade-fieldGoalAttempts",
      "fieldGoalsMade-fieldGoalsAttempted",
      "field goals made-field goals attempted",
    ],
    ["fieldGoalsMade", "field goals made"],
    ["fieldGoalAttempts", "field goals attempts", "field goals attempted"],
  );

  const xpmXpa = getMadeAttemptedDisplay(
    stats,
    ["extraPointsMade-extraPointAttempts"],
    ["extraPointsMade", "extra points made"],
    ["extraPointAttempts", "extra points attempts", "extra points attempted"],
  );

  const longFieldGoal = getStatDisplay(stats, [
    "longFieldGoalMade",
    "longest field goal",
  ]);

  const fieldGoalPctValue =
    getStatNumber(stats, ["fieldGoalPct", "field goal pct"]) ??
    getStatDisplay(stats, ["fieldGoalPct", "field goal pct"]);

  const fieldGoalPct = formatPercent(fieldGoalPctValue);

  const punts = getStatDisplay(stats, ["punts"]);
  const puntYards = getStatDisplay(stats, [
    "puntYards",
    "grossPuntYards",
    "gross punt yards",
  ]);
  const longestPunt = getStatDisplay(stats, ["longPunt", "longest punt"]);
  const touchbacks = getStatDisplay(stats, ["puntTouchbacks", "touchbacks"]);

  const fallbackGamesPlayed = getStatDisplay(stats, [
    "gamesPlayed",
    "games played",
  ]);
  const fallbackPoints = getStatDisplay(stats, ["totalPoints", "points"]);
  const fallbackTouchdowns = getStatDisplay(stats, [
    "totalTouchdowns",
    "total touchdowns",
  ]);
  const fallbackYards =
    getStatDisplay(stats, ["passingYards", "passing yards"]) !== EMPTY_STAT
      ? getStatDisplay(stats, ["passingYards", "passing yards"])
      : getStatDisplay(stats, [
          "rushingYards",
          "rushing yards",
          "receivingYards",
          "receiving yards",
        ]);

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
              <StatItem label="INT" value={interceptions} />
            </>
          )}

          {showRushing && (
            <>
              <StatItem label="RUSH ATT" value={rushingAttempts} />
              <StatItem label="RUSH YDS" value={rushingYards} />
              <StatItem label="AVG/YDS" value={rushingAvg} />
              <StatItem label="RUSH TD" value={rushingTDs} />
            </>
          )}

          {showReceiving && (
            <>
              <StatItem label="REC/TAR" value={receptionTargets} />
              <StatItem label="REC YDS" value={receivingYards} />
              <StatItem label="YDS/REC" value={receivingYardsPer} />
              <StatItem label="REC TD" value={receivingTDs} />
            </>
          )}

          {showDefense && (
            <>
              <StatItem label="TOT" value={totalTackles} />
              <StatItem label="INT" value={defenseInterceptions} />
              <StatItem label="TFL" value={tacklesForLoss} />
              <StatItem label="SACK" value={sacks} />
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
