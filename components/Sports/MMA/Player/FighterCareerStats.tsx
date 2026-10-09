import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatsTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { StyleSheet, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";
import type { MMAFightLog } from "types/mma/fightLog";

type Props = { data: MMAFightLog | null; loading: boolean; error: string | null; isDark: boolean };

export default function FighterCareerStats({ data, loading, error, isDark }: Props) {
  const styles = statsTableStyles(isDark);
  if (loading) return <PlayerStatsTableSkeleton />;
  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Career Stats</HeadingTwo>
      {error || !data?.careerStats.length ? (
        <Text style={styles.emptyText}>{error ?? "Career stats not available."}</Text>
      ) : (
        <View style={styles.glossaryContainer}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, layout.label]}>STAT</Text>
            <Text style={[styles.cell, styles.headerCell]}>CAREER</Text>
          </View>
          {data.careerStats.map((stat, index) => (
            <View key={stat.key} style={[styles.row, index % 2 === 1 && styles.rowAlt, index === data.careerStats.length - 1 && styles.lastRow]}>
              <Text
                style={[styles.cell, layout.label]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                accessibilityLabel={stat.description}
              >
                {stat.description}
              </Text>
              <Text style={styles.fixedCell}>{stat.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const layout = StyleSheet.create({ label: { flex: 1, textAlign: "left", paddingHorizontal: 10 } });
