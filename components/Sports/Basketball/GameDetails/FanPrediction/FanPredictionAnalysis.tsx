import Button from "components/Buttons/Button";
import { SkeletonBlock } from "components/Skeletons/primitives";
import { useMemo } from "react";
import { Text, View } from "react-native";
import type { PredictionAnalytics, PredictionSample } from "hooks/useFanPredictionAnalytics";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";

const accuracy = (sample: PredictionSample) => sample.graded > 0 ? 100 * sample.correct / sample.graded : null;
const percentage = (value: number | null) => value == null ? "—" : `${value.toFixed(1)}%`;

type Props = {
  isDark: boolean;
  data: PredictionAnalytics | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function FanPredictionAnalysis({ isDark, data, loading, error, onRetry }: Props) {
  const styles = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  if (loading && !data) return (
    <View style={styles.intro}>
      <Text style={styles.sectionTitle}>Your prediction analysis</Text>
      <SkeletonBlock width="60%" height={24} />
      <SkeletonBlock height={100} />
    </View>
  );
  if (error) return (
    <View style={styles.intro} accessibilityRole="alert">
      <Text style={styles.sectionTitle}>Your prediction analysis</Text>
      <Text style={styles.description}>{error}</Text>
      <Button isDark={isDark} onPress={onRetry} disabled={loading} variant="text">Retry analysis</Button>
    </View>
  );
  if (!data) return null;
  const recent = accuracy(data.recent);
  const previous = accuracy(data.previous);
  const delta = recent != null && previous != null ? recent - previous : null;
  const strongest = data.leagues.filter(league => league.graded >= 5)
    .sort((a, b) => b.correct / b.graded - a.correct / a.graded || b.graded - a.graded)[0];
  return (
    <View style={styles.analysis}>
      <View style={styles.intro}>
        <Text style={styles.sectionTitle}>Your prediction analysis</Text>
        <View style={styles.analysisStats}>
          <View style={styles.analysisStat}>
            <Text style={styles.analysisValue}>{percentage(recent)}</Text>
            <Text style={styles.note}>Latest {data.recent.graded} scored picks</Text>
          </View>
          <View style={styles.analysisStat}>
            <Text style={styles.analysisValue}>{percentage(previous)}</Text>
            <Text style={styles.note}>Previous {data.previous.graded} scored picks</Text>
          </View>
        </View>
        <Text style={styles.description}>
          {delta == null ? "Make more picks to build your performance trend." :
            `Accuracy ${delta > 0 ? "rose" : delta < 0 ? "fell" : "held steady"}${delta === 0 ? "" : ` by ${Math.abs(delta).toFixed(1)} percentage points`} between these samples.`}
        </Text>
        {data.recent.graded < 10 || data.previous.graded < 10 ? (
          <Text style={styles.note}>Early trend: each comparison uses up to 10 scored picks. Small samples can change quickly.</Text>
        ) : null}
        {strongest ? <Text style={styles.description}>Strongest league: {strongest.league.toUpperCase()} · {percentage(accuracy(strongest))} across {strongest.graded} scored picks.</Text> : null}
      </View>
      <View style={styles.intro}>
        <Text style={styles.sectionTitle}>Weekly accuracy</Text>
        <Text style={styles.note}>Last 8 weeks · grouped by game date · UTC · current week is partial</Text>
        <View style={styles.weeklyChart}>
          {data.weekly.map(week => {
            const value = accuracy(week);
            return (
              <View key={week.week} style={styles.weekColumn} accessible accessibilityLabel={`Week of ${week.week}, ${percentage(value)} accuracy, ${week.correct} correct of ${week.graded} scored picks`}>
                <Text style={styles.chartLabel}>{value == null ? "—" : `${Math.round(value)}%`}</Text>
                <View style={styles.barTrack}>
                  {value != null ? <View style={[styles.barFill, { height: `${value}%` }]} /> : null}
                </View>
                <Text style={styles.chartLabel}>{Number(week.week.slice(5, 7))}/{Number(week.week.slice(8))}</Text>
                <Text style={styles.chartLabel}>{week.graded} picks</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.note}>— means no scored picks. Pending picks and games without a winner are excluded.</Text>
      </View>
      <View style={styles.intro}>
        <Text style={styles.sectionTitle}>Performance by league</Text>
        {data.leagues.length === 0 ? <Text style={styles.description}>Your league breakdown appears after your first ranked pick.</Text> : data.leagues.map(league => (
          <View key={`${league.sport}:${league.league}`} style={styles.leagueAnalysis}>
            <View style={styles.sectionHeader}>
              <Text style={styles.rulesLabel}>{league.league.toUpperCase()} · {league.sport}</Text>
              <Text style={styles.rulesLabel}>{percentage(accuracy(league))}</Text>
            </View>
            <View style={styles.accuracyTrack}>
              <View style={[styles.accuracyFill, { width: `${accuracy(league) ?? 0}%` }]} />
            </View>
            <Text style={styles.note}>{league.correct} correct / {league.graded} scored · {league.pending} pending</Text>
          </View>
        ))}
        <Text style={styles.note}>All-time league records. Strongest league requires at least 5 scored picks.</Text>
      </View>
    </View>
  );
}
