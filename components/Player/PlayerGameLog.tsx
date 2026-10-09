import Dropdown from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerStatsTableSkeleton from "components/Skeletons/PlayerStatsTableSkeleton";
import PillTabs from "components/TabBars/PillTabs";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { statsTableStyles } from "styles/PlayerStyles/StatsTableStyles";
import type { PlayerGameLog as GameLogData, PlayerGameLogSport } from "types/playerGameLog";
import { getPlayerGameLogFilters, isRegularGameLogSection } from "utils/playerGameLogFilters";

type Props = {
  sport?: PlayerGameLogSport;
  league: string;
  data: GameLogData | null;
  filterData?: GameLogData | null;
  selectedSeason?: string | null;
  selectedCategory?: string | null;
  loading: boolean;
  error: string | null;
  onSeasonChange: (season: string) => void;
  onRetry: () => void;
  onCategoryChange?: (category: string) => void;
};

export default function PlayerGameLog({
  sport = "basketball",
  league,
  data,
  filterData = null,
  selectedSeason,
  selectedCategory,
  loading,
  error,
  onSeasonChange,
  onRetry,
  onCategoryChange,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = statsTableStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const router = useScopedRouter();

  const [section, setSection] = useState<{ value: string; label: string } | null>(null);
  const filters = getPlayerGameLogFilters(data, filterData, league, selectedSeason);
  const selectedSection =
    (section && filters.sections.find(item => item.value === section.value || item.label.toLowerCase() === section.label.toLowerCase())?.value)
      || (filters.sections.find(
          (item) =>
            isRegularGameLogSection(item.label),
        )?.value ?? filters.sections[0]?.value);
  const games =
    data?.games.filter((game) => game.section === selectedSection) ?? [];
  const summaries =
    data?.summaries.filter((summary) => summary.section === selectedSection) ??
    [];
  const seasonOptions = filters.seasons;
  const sectionOptions = filters.sections;

  const rowStyle = (index: number) => [
    styles.row,
    index % 2 === 1 && styles.rowAlt,
    index === games.length - 1 && !summaries.length && styles.lastRow,
  ];
  const summaryStyle = (index: number) => [
    styles.row,
    styles.careerRow,
    index === summaries.length - 1 && styles.lastRow,
  ];
  const openGame = (game: GameLogData["games"][number]) => {
    router.push({
      pathname: ({
        basketball: "/game/basketball/[game]",
        football: "/game/football/[game]",
        baseball: "/game/baseball/[game]",
        hockey: "/game/hockey/[game]",
      } as const)[sport],
      params: { game: game.eventId, leagueId: league },
    });
  };
  const gameLabel = (game: GameLogData["games"][number]) =>
    `Open game ${game.date?.slice(0, 10) ?? ""}, ${game.team.abbreviation} ${game.location} ${game.opponent.abbreviation}`;


  return (
    <View style={styles.container}>
      <View style={styles.statsHeader}>
        <HeadingTwo isDark={isDark}>Game Log</HeadingTwo>
        <View style={styles.filtersRow}>
          {onCategoryChange && filters.categories.length ? (
            <Dropdown
              isDark={isDark}
              options={filters.categories}
              selectedValue={selectedCategory ?? data?.category ?? filterData?.category ?? undefined}
              onSelect={(value) => {
                onCategoryChange(value);
                setSection(null);
              }}
              style={styles.filterDropdown}
              width={140}
            />
          ) : null}
          <Dropdown
            isDark={isDark}
            options={seasonOptions}
            selectedValue={selectedSeason ?? (data ? String(data.season) : filterData ? String(filterData.season) : undefined)}
            onSelect={(value) => {
              onSeasonChange(value);
              setSection(null);
            }}
            style={styles.filterDropdown}
            width={140}
          />
        </View>
      </View>

      {sectionOptions.length ? (
        <PillTabs
          tabs={sectionOptions}
          selectedValue={selectedSection ?? sectionOptions[0].value}
          onChange={value => setSection(sectionOptions.find(option => option.value === value) ?? null)}
        />
      ) : null}

      {loading ? (
        <PlayerStatsTableSkeleton showHeader={false} />
      ) : error ? (
        <View>
          <Text style={global.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={onRetry}>
            <Text style={[global.text, layout.action]}>Retry</Text>
          </Pressable>
        </View>
      ) : !data ? (
        <Text style={global.emptyText}>Game log not available</Text>
      ) : !games.length ? (
        <Text style={global.emptyText}>
          No game log available for this season section.
        </Text>
      ) : (
        <View style={styles.tableWrapper}>
          <View style={styles.fixedSection}>
            <View style={styles.seasonColumn}>
              <View
                style={[styles.row, styles.headerRow, styles.tableHeaderRow]}
              >
                <Text style={[styles.fixedCell, styles.fixedHeaderCell]}>
                  DATE
                </Text>
              </View>
              {games.map((game, index) => (
                <Pressable
                  key={game.eventId}
                  style={rowStyle(index)}
                  accessibilityRole="button"
                  accessibilityLabel={gameLabel(game)}
                  onPress={() => openGame(game)}
                >
                  <Text
                    style={styles.fixedCell}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {game.date
                      ? new Date(game.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </Text>
                </Pressable>
              ))}
              {summaries.map((summary, index) => (
                <View
                  key={`${summary.type}:${index}`}
                  style={summaryStyle(index)}
                >
                  <Text
                    style={[
                      styles.fixedCell,
                      styles.fixedHeaderCell,
                      styles.fixedCareerHeaderCell,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {summary.type === "avg" ? "AVG" : summary.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.teamColumn}>
              <View
                style={[styles.row, styles.headerRow, styles.tableHeaderRow]}
              >
                <Text style={[styles.fixedTeamCell, styles.fixedHeaderCell]}>
                  OPP
                </Text>
              </View>
              {games.map((game, index) => (
                <Pressable
                  key={game.eventId}
                  style={rowStyle(index)}
                  accessibilityRole="button"
                  accessibilityLabel={gameLabel(game)}
                  onPress={() => openGame(game)}
                >
                  <Text
                    style={styles.fixedTeamCell}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {game.location} {game.opponent.abbreviation || "—"}
                  </Text>
                </Pressable>
              ))}
              {summaries.map((summary, index) => (
                <View
                  key={`${summary.type}:${index}`}
                  style={summaryStyle(index)}
                />
              ))}
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollSection}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.statScrollContent}>
              <View
                style={[styles.row, styles.headerRow, styles.tableHeaderRow]}
              >
                <Text style={[styles.cell, styles.headerCell]}>TEAM</Text>
                <Text
                  style={[styles.cell, styles.headerCell, layout.resultCell]}
                >
                  RESULT
                </Text>
                {data?.columns.map((column) => (
                  <Text
                    key={column.key}
                    style={[styles.cell, styles.headerCell]}
                    accessibilityLabel={column.description}
                  >
                    {column.label}
                  </Text>
                ))}
              </View>
              {games.map((game, index) => (
                <Pressable
                  key={game.eventId}
                  style={rowStyle(index)}
                  accessibilityRole="button"
                  accessibilityLabel={gameLabel(game)}
                  onPress={() => openGame(game)}
                >
                  <Text style={styles.cell}>
                    {game.team.abbreviation || "—"}
                  </Text>
                  <Text
                    style={[styles.cell, layout.resultCell]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {game.result} {game.score || "—"}
                  </Text>
                  {data?.columns.map((column) => (
                    <Text key={column.key} style={styles.cell}>
                      {game.stats[column.key] ?? "—"}
                    </Text>
                  ))}
                </Pressable>
              ))}
              {summaries.map((summary, index) => (
                <View
                  key={`${summary.type}:${index}`}
                  style={summaryStyle(index)}
                >
                  <Text style={styles.careerCell} />
                  <Text style={[styles.careerCell, layout.resultCell]} />
                  {data?.columns.map((column) => (
                    <Text key={column.key} style={styles.careerCell}>
                      {summary.stats[column.key] ?? "—"}
                    </Text>
                  ))}
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
  header: { zIndex: 1 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultCell: { width: 112 },
  action: { paddingVertical: 10, textDecorationLine: "underline" },
});
