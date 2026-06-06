import CenteredHeader from "components/Headings/CenteredHeader";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { PlayerSeason } from "hooks/NBAHooks/usePlayerSeasons";
import { Text, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import { getNBASeason } from "utils/dateUtils";
type Props = {
  season?: PlayerSeason[];
  loading: boolean;
  error: string | null;
  selectedSeason?: string;
};

function getCurrentNBASeason() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  return month >= 10
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;
}

function toNumber(value?: number | string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeFixed(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0.0";
  }

  return value.toFixed(1);
}

function StatItem({
  label,
  value,
  isDark,
  styles,
}: {
  label: string;
  value: string;
  isDark: boolean;
  styles: ReturnType<typeof seasonStatCardStyles>;
}) {
  return (
    <View style={styles.statItem}>
      <Text
        style={[
          styles.statValue,
          { color: isDark ? Colors.white : Colors.black },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function SeasonStatCard({
  season = [],
  loading,
  error,
  selectedSeason,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);
  const currentSeason = getNBASeason();

  if (loading) {
    return <SeasonStatCardSkeleton />;
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load stats</Text>
      </View>
    );
  }

  if (!season.length) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>No season stats available</Text>
      </View>
    );
  }

  const seasonData =
    season.find((item) => item.season === currentSeason) ??
    season[season.length - 1];

  if (!seasonData) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>No season stats available</Text>
      </View>
    );
  }

  const games = toNumber(seasonData.g);
  const points = toNumber(seasonData.pts);
  const assists = toNumber(seasonData.ast);
  const rebounds = toNumber(seasonData.trb);
  const fieldGoals = toNumber(seasonData.fg);
  const fieldGoalAttempts = toNumber(seasonData.fga);

  const ppg = games > 0 ? safeFixed(points / games) : "0.0";
  const apg = games > 0 ? safeFixed(assists / games) : "0.0";
  const rpg = games > 0 ? safeFixed(rebounds / games) : "0.0";
  const fgPercent =
    fieldGoalAttempts > 0
      ? safeFixed((fieldGoals / fieldGoalAttempts) * 100)
      : "0.0";

  return (
    <View>
      <CenteredHeader isDark={isDark}>{currentSeason} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem label="PTS" value={ppg} isDark={isDark} styles={styles} />
          <StatItem label="AST" value={apg} isDark={isDark} styles={styles} />
          <StatItem label="REB" value={rpg} isDark={isDark} styles={styles} />
          <StatItem
            label="FG%"
            value={fgPercent}
            isDark={isDark}
            styles={styles}
          />
        </View>
      </View>
    </View>
  );
}
