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
  teamColor?: string;
  teamColorDark?: string;
  season?: FootballPlayerSeason | null;
  loading?: boolean;
  error?: string | null;
};

type StatMatch = {
  displayValue: string;
  numericValue: number | null;
};

const EMPTY_STAT = "0";

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

  const showBatting = [
    "1B",
    "2B",
    "3B",
    "SS",
    "LF",
    "CF",
    "RF",
    "DH",
    "SS",
  ].includes(position);
  const showPitching = ["SP"].includes(position);

  const hits = getStatDisplay(stats, ["hits"]);
  const rbi = getStatDisplay(stats, ["RBIs"]);
  const runs = getStatDisplay(stats, ["runs"]);
  const avg = getStatDisplay(stats, ["avg"]);

  const era = getStatDisplay(stats, ["ERA"]);
  const strikeouts = getStatDisplay(stats, ["strikeouts"]);
  const strikeoutToWalkRatio = getStatDisplay(stats, ["strikeoutToWalkRatio"]);
  const winPct = getStatDisplay(stats, ["winPct"]);

  return (
    <View>
      <CenteredHeader isDark={isDark}>{displayYear} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          {showPitching && (
            <>
              <StatItem label="ERA" value={era} />
              <StatItem label="K" value={strikeouts} />
              <StatItem label="SWR" value={strikeoutToWalkRatio} />
              <StatItem label="WIN%" value={formatPercent(winPct)} />
            </>
          )}

          {showBatting && (
            <>
              <StatItem label="HITS" value={hits} />
              <StatItem label="RBI" value={rbi} />
              <StatItem label="RUNS" value={runs} />
              <StatItem label="AVG" value={avg} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
