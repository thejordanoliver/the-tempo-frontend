import Dropdown from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatsTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";
import type { MMAFightLog } from "types/mma/fightLog";

type Props = {
  data: MMAFightLog | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function FighterFightLog({ data, loading, error, onRetry }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const [year, setYear] = useState("all");
  const selectedYear = data?.years.some(item => item.value === year) ? year : "all";
  const fights = data?.fights.filter(fight => selectedYear === "all" || String(fight.year) === selectedYear) ?? [];
  const rowStyle = (index: number) => [styles.row, index % 2 === 1 && styles.rowAlt, index === fights.length - 1 && styles.lastRow];

  const header = (
    <View style={styles.statsHeader}>
      <HeadingTwo isDark={isDark}>Fight Log</HeadingTwo>
      <Dropdown
        isDark={isDark}
        options={[{ value: "all", label: "All fights" }, ...(data?.years ?? [])]}
        selectedValue={selectedYear}
        onSelect={setYear}
        width={140}
        style={styles.filterDropdown}
      />
    </View>
  );

  if (loading) return (
    <View style={styles.container}>
      {header}
      <PlayerStatsTableSkeleton showHeader={false} />
    </View>
  );
  if (error) return (
    <View style={styles.container}>
      {header}
      <Text style={global.errorText}>{error}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <Text style={[global.text, layout.retry]}>Retry</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {header}
      {!fights.length ? (
        <Text style={global.emptyText}>No fight history available.</Text>
      ) : (
        <View style={styles.tableWrapper}>
          <View style={[styles.fixedSection, styles.seasonColumn]}>
            <View>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.fixedCell, styles.fixedHeaderCell]}>DATE</Text>
              </View>
              {fights.map((fight, index) => (
                <View key={`${fight.eventId}:${fight.fightId}`} style={rowStyle(index)}>
                  <Text style={styles.fixedCell} numberOfLines={1} adjustsFontSizeToFit>
                    {fight.date ? new Date(fight.date).toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit", timeZone: "UTC" }) : "—"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollSection} contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.statScrollContent}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, layout.opponent]}>OPPONENT</Text>
                <Text style={[styles.cell, styles.headerCell]}>RESULT</Text>
                <Text style={[styles.cell, styles.headerCell, layout.method]}>METHOD</Text>
                <Text style={[styles.cell, styles.headerCell]}>ROUND</Text>
                <Text style={[styles.cell, styles.headerCell]}>TIME</Text>
                <Text style={[styles.cell, styles.headerCell, layout.event]}>EVENT</Text>
                <Text style={[styles.cell, styles.headerCell]}>TITLE</Text>
              </View>
              {fights.map((fight, index) => (
                <View key={`${fight.eventId}:${fight.fightId}`} style={rowStyle(index)}>
                  <Text style={[styles.cell, layout.opponent]} numberOfLines={1} accessibilityLabel={fight.opponent.name}>{fight.opponent.name || "—"}</Text>
                  <Text style={styles.cell} accessibilityLabel={fight.result === "NC" ? "No contest" : undefined}>{fight.result ?? "—"}</Text>
                  <Text style={[styles.cell, layout.method]} numberOfLines={1} adjustsFontSizeToFit>{fight.method ?? "—"}</Text>
                  <Text style={styles.cell}>{fight.round ?? "—"}</Text>
                  <Text style={styles.cell}>{fight.time ?? "—"}</Text>
                  <Text style={[styles.cell, layout.event]} numberOfLines={1} accessibilityLabel={fight.eventName}>{fight.eventShortName || "—"}</Text>
                  <Text style={styles.cell}>{fight.titleFight ? "Yes" : "—"}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const layout = StyleSheet.create({
  opponent: { width: 160, textAlign: "left", paddingHorizontal: 10 },
  method: { width: 180 },
  event: { width: 200 },
  retry: { paddingVertical: 10, textDecorationLine: "underline" },
});
