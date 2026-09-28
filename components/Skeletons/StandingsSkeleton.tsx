import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

const ROW_HEIGHT = 60;
const STAT_WIDTH = 70;

type StandingsSkeletonProps = {
  variant?: "league" | "rankings" | "conference" | "widget" | "seasonLeaders";
};

export const StandingsSkeleton = ({
  variant = "league",
}: StandingsSkeletonProps) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const [pulse] = useState(() => new Animated.Value(0.42));
  const blockColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;
  const sectionCount = variant === "league" ? 2 : 1;
  const rowCount = variant === "league" ? 5 : 8;
  const filterCount =
    variant === "league" ? 2 : variant === "rankings" ? 1 : 0;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.42,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const renderBlock = (style: StyleProp<ViewStyle>) => (
    <Animated.View
      style={[style, { backgroundColor: blockColor, opacity: pulse }]}
    />
  );
  const renderSeasonBlock = (style: StyleProp<ViewStyle>) => (
    <Animated.View
      style={[style, { backgroundColor: Colors.midTone, opacity: pulse }]}
    />
  );

  if (variant === "seasonLeaders") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.seasonLeadersContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.seasonLeadersTable, { borderColor }]}>
          <View style={styles.seasonLeadersFixedPane}>
            <View
              style={[
                styles.seasonLeadersHeader,
                styles.seasonLeadersFixedBorder,
                { borderColor },
              ]}
            >
              {renderSeasonBlock(styles.seasonLeadersRankHeader)}
              {renderSeasonBlock(styles.seasonLeadersPlayerHeader)}
            </View>
            {Array.from({ length: 8 }, (_, index) => (
              <View
                key={`season-player-${index}`}
                style={[
                  styles.seasonLeadersRow,
                  styles.seasonLeadersFixedBorder,
                  index % 2 === 1 && { backgroundColor: blockColor },
                  index < 7 && { borderBottomWidth: 1 },
                  { borderColor },
                ]}
              >
                {renderSeasonBlock(styles.seasonLeadersRank)}
                {renderSeasonBlock(styles.seasonLeadersHeadshot)}
                <View style={styles.seasonLeadersPlayerDetails}>
                  {renderSeasonBlock([
                    styles.seasonLeadersPlayerName,
                    { width: index % 3 === 0 ? 112 : index % 3 === 1 ? 94 : 104 },
                  ])}
                  <View style={styles.seasonLeadersTeam}>
                    {renderSeasonBlock(styles.seasonLeadersTeamLogo)}
                    {renderSeasonBlock(styles.seasonLeadersTeamCode)}
                  </View>
                </View>
              </View>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonLeadersStatsViewport}>
            <View style={styles.seasonLeadersStatsContent}>
              <View
                style={[
                  styles.seasonLeadersHeader,
                  { borderBottomColor: borderColor },
                ]}
              >
                {Array.from({ length: 4 }, (_, index) => (
                  <View key={`season-stat-header-${index}`} style={styles.seasonLeadersStatCell}>
                    {renderSeasonBlock(styles.seasonLeadersStatHeader)}
                  </View>
                ))}
              </View>
              {Array.from({ length: 8 }, (_, rowIndex) => (
                <View
                  key={`season-stats-${rowIndex}`}
                  style={[
                    styles.seasonLeadersRow,
                    rowIndex % 2 === 1 && { backgroundColor: blockColor },
                    rowIndex < 7 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  ]}
                >
                  {Array.from({ length: 4 }, (_, statIndex) => (
                    <View key={`season-stat-${statIndex}`} style={styles.seasonLeadersStatCell}>
                      {renderSeasonBlock([
                        styles.seasonLeadersStatValue,
                        { width: (rowIndex + statIndex) % 2 === 0 ? 32 : 40 },
                      ])}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }

  if (variant === "widget") {
    return (
      <View style={styles.widget}>
        <View style={[styles.widgetConference, { borderBottomColor: borderColor }]}>
          {renderBlock(styles.widgetConferenceName)}
        </View>
        <View style={[styles.widgetHeader, { borderBottomColor: borderColor }]}>
          {renderBlock(styles.widgetRank)}
          {renderBlock(styles.widgetTeamHeader)}
          {renderBlock(styles.widgetRecordHeader)}
          {renderBlock(styles.widgetMetricHeader)}
        </View>
        {Array.from({ length: 5 }, (_, index) => (
          <View
            key={`widget-row-${index}`}
            style={[
              styles.widgetRow,
              index < 4 && { borderBottomColor: borderColor },
            ]}
          >
            {renderBlock(styles.widgetRank)}
            {renderBlock(styles.widgetLogo)}
            {renderBlock([
                styles.widgetTeamName,
                { width: index % 2 === 0 ? 58 : 44 },
              ])}
            {renderBlock(styles.widgetRecord)}
            {renderBlock(styles.widgetMetric)}
          </View>
        ))}
      </View>
    );
  }

  const renderTable = (sectionIndex: number) => (
    <View style={[styles.table, { borderColor }]}>
      <View style={[styles.sectionHeader, { borderBottomColor: borderColor }]}>
        {renderBlock([
            styles.sectionTitle,
            { width: sectionIndex === 0 ? 146 : 126 },
          ])}
      </View>

      <View style={styles.columns}>
        <View style={styles.teamColumn}>
          <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
            {renderBlock(styles.rankHeader)}
            {renderBlock(styles.teamHeader)}
          </View>

          {Array.from({ length: rowCount }, (_, index) => (
            <View
              key={`team-${index}`}
              style={[
                styles.row,
                index < rowCount - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                },
              ]}
            >
              {renderBlock(styles.rank)}
              {renderBlock(styles.logo)}
              {renderBlock([
                  styles.teamName,
                  { width: index % 3 === 0 ? 54 : index % 3 === 1 ? 70 : 62 },
                ])}
            </View>
          ))}
        </View>

        <View style={styles.statsViewport}>
          <View style={styles.statsContent}>
            <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
              {Array.from({ length: 4 }, (_, index) => (
                <View key={`stat-header-${index}`} style={styles.statCell}>
                  {renderBlock(styles.statHeader)}
                </View>
              ))}
            </View>

            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <View
                key={`stats-${rowIndex}`}
                style={[
                  styles.row,
                  rowIndex < rowCount - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  },
                ]}
              >
                {Array.from({ length: 4 }, (_, statIndex) => (
                  <View key={`stat-${statIndex}`} style={styles.statCell}>
                    {renderBlock([
                        styles.statValue,
                        { width: (rowIndex + statIndex) % 2 === 0 ? 34 : 42 },
                      ])}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {filterCount > 0 && (
        <View style={styles.filters}>
          {Array.from({ length: filterCount }, (_, index) => (
            <View key={`filter-${index}`}>
              {renderBlock([
                styles.filter,
                { width: index === 0 ? 140 : 112 },
              ])}
            </View>
          ))}
        </View>
      )}

      {Array.from({ length: sectionCount }, (_, index) => (
        <View key={`section-${index}`}>{renderTable(index)}</View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 12, paddingBottom: 100 },
  filters: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  filter: { height: 38, borderRadius: 8 },
  seasonLeadersContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
  },
  seasonLeadersTable: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  seasonLeadersFixedPane: { width: 250 },
  seasonLeadersHeader: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  seasonLeadersFixedBorder: { borderRightWidth: 1 },
  seasonLeadersRankHeader: { width: 14, height: 13, marginHorizontal: 10, borderRadius: 4 },
  seasonLeadersPlayerHeader: { width: 48, height: 13, borderRadius: 4 },
  seasonLeadersRow: { height: 64, flexDirection: "row", alignItems: "center" },
  seasonLeadersRank: { width: 14, height: 16, marginHorizontal: 10, borderRadius: 4 },
  seasonLeadersHeadshot: { width: 38, height: 38, marginRight: 8, borderRadius: 19 },
  seasonLeadersPlayerDetails: { flex: 1, gap: 6, paddingRight: 8 },
  seasonLeadersPlayerName: { height: 13, borderRadius: 4 },
  seasonLeadersTeam: { flexDirection: "row", alignItems: "center", gap: 5 },
  seasonLeadersTeamLogo: { width: 17, height: 17, borderRadius: 4 },
  seasonLeadersTeamCode: { width: 28, height: 10, borderRadius: 3 },
  seasonLeadersStatsViewport: { flex: 1 },
  seasonLeadersStatsContent: { width: 72 * 4 },
  seasonLeadersStatCell: { width: 72, alignItems: "center", justifyContent: "center" },
  seasonLeadersStatHeader: { width: 34, height: 12, borderRadius: 4 },
  seasonLeadersStatValue: { height: 14, borderRadius: 4 },
  table: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionHeader: {
    height: 49,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: { height: 20, borderRadius: 5 },
  columns: { flexDirection: "row" },
  teamColumn: { flex: 1, minWidth: 138 },
  statsViewport: { width: 220, overflow: "hidden" },
  statsContent: { width: STAT_WIDTH * 4 },
  headerRow: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  rankHeader: {
    width: 18,
    height: 14,
    marginHorizontal: 11,
    borderRadius: 4,
  },
  teamHeader: { width: 48, height: 14, borderRadius: 4 },
  rank: {
    width: 18,
    height: 18,
    marginHorizontal: 11,
    borderRadius: 4,
  },
  logo: { width: 30, height: 30, borderRadius: 15 },
  teamName: { height: 14, marginLeft: 8, borderRadius: 4 },
  statCell: {
    width: STAT_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  statHeader: { width: 46, height: 13, borderRadius: 4 },
  statValue: { height: 13, borderRadius: 4 },
  widget: { flex: 1, paddingHorizontal: 8 },
  widgetConference: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  widgetConferenceName: { width: 84, height: 10, borderRadius: 3 },
  widgetHeader: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  widgetRow: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  widgetRank: { width: 10, height: 10, marginHorizontal: 6, borderRadius: 3 },
  widgetTeamHeader: { flex: 1, height: 9, borderRadius: 3 },
  widgetRecordHeader: {
    width: 36,
    height: 9,
    marginLeft: 15,
    borderRadius: 3,
  },
  widgetMetricHeader: {
    width: 25,
    height: 9,
    marginHorizontal: 7,
    borderRadius: 3,
  },
  widgetLogo: { width: 20, height: 20, borderRadius: 10 },
  widgetTeamName: { height: 10, marginLeft: 5, borderRadius: 3 },
  widgetRecord: {
    width: 36,
    height: 10,
    marginLeft: "auto",
    borderRadius: 3,
  },
  widgetMetric: { width: 25, height: 10, marginHorizontal: 7, borderRadius: 3 },
});
