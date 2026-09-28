import SeasonStatCardLayout, {
  type SeasonStatItem,
} from "@/components/Player/SeasonStatCardLayout";
import type { BaseballPlayerSeason } from "@/hooks/BaseballHooks/usePlayerSeasons";
import type { Stat } from "@/hooks/FootballHooks/usePlayerSeasons";
import CenteredHeader from "components/Headings/CenteredHeader";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { getFootballSeason } from "utils/dateUtils";
import type { PlayerSeasonRankings } from "types/playerSeasonRankings";

type Props = {
  position: string;
  isActive: boolean;
  season?: BaseballPlayerSeason | null;
  loading?: boolean;
  error?: string | null;
  rankings?: PlayerSeasonRankings;
  teamColor?: string;
};

type StatMatch = {
  displayValue: string;
  numericValue: number | null;
};

const EMPTY_STAT = "0";
const BATTING_POSITIONS = new Set([
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "DH",
]);
const PITCHING_POSITIONS = new Set(["SP", "RP", "CP", "P"]);

function normalizeText(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function getSeasonDisplayYear(season?: BaseballPlayerSeason | null) {
  return String(
    season?.displaySeason ??
      season?.year ??
      season?.season ??
      getFootballSeason(),
  );
}

function getAllStats(season?: BaseballPlayerSeason | null) {
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

function hasAnyStats(stats: Stat[]) {
  return stats.some((stat) => {
    const value = stat.displayValue ?? stat.value;
    return (
      value !== null && value !== undefined && value !== "" && value !== "-"
    );
  });
}

function getDisplayStats(
  stats: Stat[],
  position: string,
  rankings: PlayerSeasonRankings,
): SeasonStatItem[] {
  const item = (label: string, value: string): SeasonStatItem => ({
    label,
    value,
    ranking: rankings[label],
  });

  if (PITCHING_POSITIONS.has(position)) {
    return [
      item("ERA", getStatDisplay(stats, ["ERA"])),
      item("K", getStatDisplay(stats, ["strikeouts"])),
      item("SWR", getStatDisplay(stats, ["strikeoutToWalkRatio"])),
      item("WIN%", formatPercent(getStatDisplay(stats, ["winPct"]))),
    ];
  }

  if (BATTING_POSITIONS.has(position)) {
    return [
      item("HITS", getStatDisplay(stats, ["hits"])),
      item("RBI", getStatDisplay(stats, ["RBIs"])),
      item("RUNS", getStatDisplay(stats, ["runs"])),
      item("AVG", getStatDisplay(stats, ["avg"])),
    ];
  }

  return [];
}

export default function SeasonStatCard({
  season,
  position,
  isActive,
  loading,
  error,
  rankings = {},
  teamColor,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);

  if (!isActive) return null;

  if (loading) return <SeasonStatCardSkeleton />;
  const stats = getAllStats(season);

  if (error) {
    return <Text style={global.errorText}>Failed to load stats</Text>;
  }

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

  return (
    <SeasonStatCardLayout
      isDark={isDark}
      seasonLabel={getSeasonDisplayYear(season)}
      stats={getDisplayStats(stats, position, rankings)}
      teamColor={teamColor}
      formatValue={formatValue}
    />
  );
}
