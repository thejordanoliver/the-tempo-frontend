import { TeamAggregatedStats } from "@/hooks/BaseballHooks/useTeamStats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { rosterStatsStyles } from "styles/TeamStyles/RosterStatStyles";
import { PlayerStats } from "types/types";

export type RosterStatsProps = {
  rosterStats: PlayerStats[];
  teamId: string;
  teamStats?: TeamAggregatedStats | null;
  loading?: boolean;
  error?: Error | null;
  refreshing: boolean;
  onRefresh: () => void;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const formatStatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    return numberFormatter.format(value);
  }

  const raw = String(value).trim();

  if (raw.endsWith("%")) {
    const numeric = Number(raw.replace("%", ""));
    return Number.isFinite(numeric)
      ? `${numberFormatter.format(numeric)}%`
      : raw;
  }

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : raw;
};

const formatFixed = (
  value: number | null | undefined,
  decimals: number,
): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(decimals);
};

const formatBaseballDecimal = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(3).replace(/^0/, "");
};

type TableRow = {
  label: string;
  value: string | number;
};

export default function RosterStats({
  rosterStats,
  teamId,
  teamStats,
  loading,
  error,
  refreshing,
  onRefresh,
}: RosterStatsProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = rosterStatsStyles(isDark);
  const global = globalStyles(isDark);

  const [viewMode, setViewMode] = useState<"Player Stats" | "Team Stats">(
    "Player Stats",
  );

  const activeRoster = useMemo(
    () =>
      (rosterStats ?? []).filter(
        (p) => p.latestSeason !== null && p.latestSeason!.g > 0,
      ),
    [rosterStats],
  );

  const hasPlayerStats = activeRoster.length > 0;
  const hasTeamStats = Boolean(teamStats);

  const selectedView =
    viewMode === "Player Stats" && !hasPlayerStats && hasTeamStats
      ? "Team Stats"
      : viewMode;

  const dropdownOptions = [
    ...(hasPlayerStats
      ? [{ label: "Player Stats", value: "Player Stats" }]
      : []),
    ...(hasTeamStats ? [{ label: "Team Stats", value: "Team Stats" }] : []),
  ];

  const statLeaders = [
    { label: "Points", key: "pts" as const },
    { label: "Rebounds", key: "trb" as const },
    { label: "Assists", key: "ast" as const },
    { label: "Blocks", key: "blk" as const },
    { label: "Steals", key: "stl" as const },
  ].map((item) => ({
    ...item,
    player: [...activeRoster].sort(
      (a, b) =>
        (b.latestSeason![item.key] as number) -
        (a.latestSeason![item.key] as number),
    )[0],
  }));

  const rowBg = (idx: number) =>
    idx % 2 === 1
      ? {
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
        }
      : {};

  const headerBg = {
    backgroundColor: isDark
      ? Colors.dark.itemBackground
      : Colors.light.itemBackground,
  };

  const renderTable = (rows: TableRow[]) => (
    <View style={styles.table}>
      {rows.map((item, idx) => (
        <View
          key={item.label}
          style={[
            styles.teamTableRow,
            rowBg(idx),
            idx === rows.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <Text style={[styles.tableCell, styles.headerText]}>
            {item.label}
          </Text>
          <Text style={[styles.tableCell, styles.statValue]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );

  const LeaderCard = ({
    player,
    label,
    statKey,
    index,
    total,
  }: {
    player: PlayerStats;
    label: string;
    statKey: keyof NonNullable<PlayerStats["latestSeason"]>;
    index: number;
    total: number;
  }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() =>
          router.push(`/player/${player.playerId}?teamId=${teamId}`)
        }
        style={styles.cardContainer}
      >
        <Text style={styles.cardLabel}>{label}</Text>

        <View style={styles.statCard}>
          <Image
            source={{
              uri: player.headshot_url,
            }}
            style={styles.avatar}
          />

          <View style={styles.nameValue}>
            <Text style={styles.cardName}>
              {player.short_name}{" "}
              <Text style={styles.number}>#{player.jersey_number}</Text>
            </Text>

            <Text style={styles.cardValue}>
              {formatStatValue(player.latestSeason![statKey])}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {index < total - 1 && <View style={styles.divider} />}
    </View>
  );

  const renderTeamStats = () => {
    if (!teamStats) return null;

    const battingRows: TableRow[] = [
      {
        label: "Games Played",
        value: formatStatValue(teamStats.batting.gamesPlayed),
      },
      { label: "At Bats", value: formatStatValue(teamStats.batting.atBats) },
      { label: "Runs", value: formatStatValue(teamStats.batting.runs) },
      { label: "Hits", value: formatStatValue(teamStats.batting.hits) },
      { label: "Doubles", value: formatStatValue(teamStats.batting.doubles) },
      { label: "Triples", value: formatStatValue(teamStats.batting.triples) },
      {
        label: "Home Runs",
        value: formatStatValue(teamStats.batting.homeRuns),
      },
      { label: "RBIs", value: formatStatValue(teamStats.batting.rbis) },
      {
        label: "Stolen Bases",
        value: formatStatValue(teamStats.batting.stolenBases),
      },
      {
        label: "Caught Stealing",
        value: formatStatValue(teamStats.batting.caughtStealing),
      },
      { label: "Walks", value: formatStatValue(teamStats.batting.walks) },
      {
        label: "Strikeouts",
        value: formatStatValue(teamStats.batting.strikeouts),
      },
      {
        label: "Total Bases",
        value: formatStatValue(teamStats.batting.totalBases),
      },
      {
        label: "Plate Appearances",
        value: formatStatValue(teamStats.batting.plateAppearances),
      },
      {
        label: "Extra Base Hits",
        value: formatStatValue(teamStats.batting.extraBaseHits),
      },
      {
        label: "Batting Average",
        value: formatBaseballDecimal(teamStats.batting.battingAverage),
      },
      {
        label: "On-Base Percentage",
        value: formatBaseballDecimal(teamStats.batting.onBasePct),
      },
      {
        label: "Slugging Percentage",
        value: formatBaseballDecimal(teamStats.batting.sluggingPct),
      },
      {
        label: "OPS",
        value: formatBaseballDecimal(teamStats.batting.ops),
      },
    ];

    const pitchingRows: TableRow[] = [
      {
        label: "Games Played",
        value: formatStatValue(teamStats.pitching.gamesPlayed),
      },
      {
        label: "Record",
        value: `${teamStats.pitching.wins}-${teamStats.pitching.losses}`,
      },
      {
        label: "Win Percentage",
        value: formatBaseballDecimal(teamStats.pitching.winPct),
      },
      { label: "Saves", value: formatStatValue(teamStats.pitching.saves) },
      {
        label: "Save Opportunities",
        value: formatStatValue(teamStats.pitching.saveOpportunities),
      },
      { label: "Holds", value: formatStatValue(teamStats.pitching.holds) },
      {
        label: "Quality Starts",
        value: formatStatValue(teamStats.pitching.qualityStarts),
      },
      {
        label: "Innings Pitched",
        value: formatFixed(teamStats.pitching.innings, 1),
      },
      {
        label: "Hits Allowed",
        value: formatStatValue(teamStats.pitching.hitsAllowed),
      },
      {
        label: "Runs Allowed",
        value: formatStatValue(teamStats.pitching.runsAllowed),
      },
      {
        label: "Earned Runs",
        value: formatStatValue(teamStats.pitching.earnedRuns),
      },
      {
        label: "Home Runs Allowed",
        value: formatStatValue(teamStats.pitching.homeRunsAllowed),
      },
      {
        label: "Walks Allowed",
        value: formatStatValue(teamStats.pitching.walksAllowed),
      },
      {
        label: "Strikeouts",
        value: formatStatValue(teamStats.pitching.strikeouts),
      },
      { label: "ERA", value: formatFixed(teamStats.pitching.era, 2) },
      { label: "WHIP", value: formatFixed(teamStats.pitching.whip, 2) },
      {
        label: "K/9",
        value: formatFixed(teamStats.pitching.strikeoutsPerNine, 1),
      },
      {
        label: "Opponent AVG",
        value: formatBaseballDecimal(teamStats.pitching.opponentAvg),
      },
      {
        label: "Opponent OBP",
        value: formatBaseballDecimal(teamStats.pitching.opponentOnBasePct),
      },
      {
        label: "Opponent SLG",
        value: formatBaseballDecimal(teamStats.pitching.opponentSluggingPct),
      },
      {
        label: "Opponent OPS",
        value: formatBaseballDecimal(teamStats.pitching.opponentOps),
      },
    ];

    const fieldingRows: TableRow[] = [
      {
        label: "Games Played",
        value: formatStatValue(teamStats.fielding.gamesPlayed),
      },
      {
        label: "Innings Played",
        value: formatStatValue(teamStats.fielding.inningsPlayed),
      },
      {
        label: "Total Chances",
        value: formatStatValue(teamStats.fielding.totalChances),
      },
      { label: "Putouts", value: formatStatValue(teamStats.fielding.putouts) },
      { label: "Assists", value: formatStatValue(teamStats.fielding.assists) },
      { label: "Errors", value: formatStatValue(teamStats.fielding.errors) },
      {
        label: "Double Plays",
        value: formatStatValue(teamStats.fielding.doublePlays),
      },
      {
        label: "Fielding Percentage",
        value: formatFixed(teamStats.fielding.fieldingPct, 3),
      },
      {
        label: "Range Factor",
        value: formatFixed(teamStats.fielding.rangeFactor, 1),
      },
    ];

    return (
      <View style={{ gap: 20 }}>
        <View>
          <Text style={styles.categoryTitle}>Team Summary</Text>
          {renderTable([
            {
              label: "Team",
              value: teamStats.team.fullName || teamStats.team.name,
            },
            { label: "Record", value: teamStats.team.recordSummary || "—" },
            { label: "Standing", value: teamStats.team.standingSummary || "—" },
            { label: "Season", value: teamStats.season.displayName || "—" },
          ])}
        </View>

        <View>
          <Text style={styles.categoryTitle}>Batting</Text>
          {renderTable(battingRows)}
        </View>

        <View>
          <Text style={styles.categoryTitle}>Pitching</Text>
          {renderTable(pitchingRows)}
        </View>

        <View>
          <Text style={styles.categoryTitle}>Fielding</Text>
          {renderTable(fieldingRows)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text style={global.errorText}>{error.message}</Text>;
  }

  if (!hasPlayerStats && !hasTeamStats) {
    return <Text style={global.emptyText}>No stats available.</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <HeadingTwo isDark={isDark}>{selectedView}</HeadingTwo>

      {dropdownOptions.length > 1 && (
        <Dropdown
          options={dropdownOptions}
          selectedValue={selectedView}
          onSelect={(val: string) =>
            setViewMode(val as "Player Stats" | "Team Stats")
          }
          isDark={isDark}
          absolute
        />
      )}

      <View>
        {selectedView === "Player Stats" ? (
          <>
            <ScrollView
              horizontal
              nestedScrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              snapToInterval={276}
              decelerationRate="fast"
              snapToAlignment="start"
            >
              {statLeaders
                .filter((item) => item.player)
                .map((item, idx) => (
                  <LeaderCard
                    key={item.label}
                    player={item.player!}
                    label={item.label}
                    statKey={item.key}
                    index={idx}
                    total={statLeaders.length}
                  />
                ))}
            </ScrollView>

            <View style={styles.tableWrapper}>
              <View style={styles.fixedColumnContainer}>
                <View style={[styles.tableRow, headerBg]}>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.nameHeaderText,
                      { width: 120 },
                    ]}
                  >
                    Player
                  </Text>
                </View>

                {activeRoster.map((p, idx) => (
                  <View
                    key={p.playerId}
                    style={[
                      styles.tableRow,
                      rowBg(idx),
                      idx === activeRoster.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/player/${p.playerId}?teamId=${teamId}`)
                      }
                    >
                      <Text
                        style={[
                          styles.tableCell,
                          styles.playerName,
                          { width: 140 },
                        ]}
                      >
                        {p.short_name}{" "}
                        <Text style={styles.number}>#{p.jersey_number}</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={[styles.tableRow, headerBg]}>
                    {[
                      "GP",
                      "MIN",
                      "PTS",
                      "FGM",
                      "FGA",
                      "FG%",
                      "3PM",
                      "3PA",
                      "3P%",
                      "FTM",
                      "FTA",
                      "FT%",
                      "OREB",
                      "DREB",
                      "REB",
                      "AST",
                      "STL",
                      "BLK",
                      "TO",
                      "PF",
                      "+/-",
                    ].map((h) => (
                      <Text
                        key={h}
                        style={[
                          styles.tableCell,
                          styles.headerText,
                          { width: 80 },
                        ]}
                      >
                        {h}
                      </Text>
                    ))}
                  </View>

                  {activeRoster.map((p, idx) => {
                    const s = p.latestSeason!;

                    const cells = [
                      s.g,
                      s.mpg,
                      s.pts,
                      s.fg,
                      s.fga,
                      `${s.fg_pct}%`,
                      s.three_p,
                      s.three_pa,
                      `${s.three_pct}%`,
                      s.ft,
                      s.fta,
                      `${s.ft_pct}%`,
                      s.orb,
                      s.drb,
                      s.trb,
                      s.ast,
                      s.stl,
                      s.blk,
                      s.tov,
                      s.pf,
                      "—",
                    ];

                    return (
                      <View
                        key={p.playerId}
                        style={[
                          styles.tableRow,
                          rowBg(idx),
                          idx === activeRoster.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}
                      >
                        {cells.map((val, i) => (
                          <Text
                            key={`${p.playerId}-${i}`}
                            style={[
                              styles.tableCell,
                              styles.statValue,
                              { width: 80 },
                            ]}
                          >
                            {formatStatValue(val)}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          renderTeamStats()
        )}
      </View>
    </ScrollView>
  );
}
