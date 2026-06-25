import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { Colors, Fonts, globalStyles } from "@/constants/styles";
import {
  DepthChartAthleteEntry,
  DepthChartInfo,
  DepthChartPosition,
  useDepthCharts,
} from "@/hooks/LeagueHooks/useDepthChart";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  type ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  league: "nba" | "nfl";
  teamId: number | string | null | undefined;
  season?: number | string | null;
  isDark?: boolean;
  showHeader?: boolean;
  resolveAthletes?: boolean;
};

type ChartOption = {
  chart: DepthChartInfo;
  key: string;
};

type DepthChartStyles = ReturnType<typeof depthChartStyles>;

function hasTeamId(teamId: Props["teamId"]) {
  return (
    teamId !== null && teamId !== undefined && String(teamId).trim() !== ""
  );
}

function isDepthChart(chart: DepthChartInfo | null): chart is DepthChartInfo {
  return chart !== null;
}

function getOrderedCharts(
  league: Props["league"],
  depthCharts: DepthChartInfo[],
  offensiveChart: DepthChartInfo | null,
  defensiveChart: DepthChartInfo | null,
  specialTeamsChart: DepthChartInfo | null,
) {
  const preferredCharts =
    league === "nfl"
      ? [offensiveChart, defensiveChart, specialTeamsChart].filter(isDepthChart)
      : [];

  return Array.from(new Set([...preferredCharts, ...depthCharts]));
}

function getChartLabel(chart: DepthChartInfo) {
  const name = chart.name?.trim();

  if (!name) return "Depth Chart";

  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("special")) return "Special Teams";
  if (normalizedName.includes("3wr 1te")) return "Offense";

  if (
    normalizedName.includes("defense") ||
    normalizedName.includes("defensive") ||
    /(^|\s)(base|nickel|dime|d)(\s|$)/.test(normalizedName)
  ) {
    return "Defense";
  }

  return name;
}

function getChartBaseKey(chart: DepthChartInfo) {
  const id = chart.id === null ? "missing-id" : `id-${chart.id}`;
  const name =
    chart.name?.trim().toLowerCase().replace(/\s+/g, "-") || "unnamed";
  const positions = (chart.positions ?? [])
    .map((position) => position.key || position.position?.id || "unknown")
    .join("-");

  return `${id}-${name}-${positions || "no-positions"}`;
}

function createChartOptions(charts: DepthChartInfo[]): ChartOption[] {
  const keyCounts = new Map<string, number>();

  return charts.map((chart) => {
    const baseKey = getChartBaseKey(chart);
    const duplicateIndex = keyCounts.get(baseKey) ?? 0;
    keyCounts.set(baseKey, duplicateIndex + 1);

    return {
      chart,
      key: `${baseKey}-${duplicateIndex}`,
    };
  });
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function getAthleteName(entry: DepthChartAthleteEntry) {
  const athlete = entry.athlete;
  const name =
    athlete?.displayName?.trim() ||
    athlete?.fullName?.trim() ||
    athlete?.shortName?.trim();

  if (name) return name;

  return entry.athleteId === null || entry.athleteId === undefined
    ? "Unknown player"
    : `Player ${entry.athleteId}`;
}

function getRemoteHeadshotUri(headshot?: string | null) {
  const uri = headshot?.trim();

  return uri && /^https?:\/\//i.test(uri) ? uri : null;
}

function getPlayerMeta(entry: DepthChartAthleteEntry) {
  const athlete = entry.athlete;
  const jersey = athlete?.jersey ? `#${athlete.jersey}` : null;
  const details = [
    jersey,
    athlete?.position?.abbreviation,
    athlete?.height,
    athlete?.weight,
  ].filter((item): item is string => Boolean(item));

  return details.length > 0 ? details.join(" • ") : "No player details";
}

function getPlayerRowKey(
  position: DepthChartPosition,
  entry: DepthChartAthleteEntry,
  index: number,
) {
  const athleteKey =
    entry.athleteId ??
    entry.athlete?.id ??
    entry.athlete?.uid ??
    entry.athleteRef ??
    entry.athlete?.athleteRef ??
    "unknown-player";

  return `${position.key || "unknown-position"}-${athleteKey}-${entry.slot ?? "no-slot"}-${entry.rank ?? "no-rank"}-${index}`;
}

function getPositionKey(
  chartOption: ChartOption | null,
  position: DepthChartPosition,
  index: number,
) {
  const positionKey =
    position.key || position.position?.id || "unknown-position";

  return `${chartOption?.key ?? "depth-chart"}-${positionKey}-${index}`;
}

function hasMultipleSlots(athletes: DepthChartAthleteEntry[]) {
  const slots = new Set(
    athletes
      .map((entry) => entry.slot)
      .filter((slot): slot is number => typeof slot === "number"),
  );

  return slots.size > 1;
}

function PlayerRow({
  entry,
  showSlot,
  styles,
}: {
  entry: DepthChartAthleteEntry;
  showSlot: boolean;
  styles: DepthChartStyles;
}) {
  const name = getAthleteName(entry);
  const headshotUri = getRemoteHeadshotUri(entry.athlete?.headshot);
  const playerMeta = getPlayerMeta(entry);
  const [headshotFailed, setHeadshotFailed] = useState(false);

  useEffect(() => {
    setHeadshotFailed(false);
  }, [headshotUri]);

  return (
    <View style={styles.playerRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{entry.rank ?? "-"}</Text>
      </View>

      {headshotUri && !headshotFailed ? (
        <Image
          accessibilityLabel={`${name} headshot`}
          onError={() => setHeadshotFailed(true)}
          source={{ uri: headshotUri }}
          style={styles.headshot}
        />
      ) : (
        <View style={styles.fallbackHeadshot}>
          <Text style={styles.fallbackInitials}>{getInitials(name)}</Text>
        </View>
      )}

      <View style={styles.playerInfo}>
        <View style={styles.playerNameRow}>
          <Text selectable style={styles.playerName} numberOfLines={1}>
            {name}
          </Text>

          {showSlot && entry.slot !== null && entry.slot !== undefined ? (
            <View style={styles.slotChip}>
              <Text style={styles.slotChipText}>Slot {entry.slot}</Text>
            </View>
          ) : null}
        </View>

        <Text selectable style={styles.playerMeta} numberOfLines={1}>
          {playerMeta}
        </Text>
      </View>
    </View>
  );
}

function PositionCard({
  position,
  styles,
}: {
  position: DepthChartPosition;
  styles: DepthChartStyles;
}) {
  const athletes = position.athletes ?? [];
  const showSlot = hasMultipleSlots(athletes);
  const abbreviation =
    position.position?.abbreviation || position.key?.toUpperCase() || "--";
  const displayName =
    position.position?.displayName ||
    position.position?.name ||
    position.key?.toUpperCase() ||
    "Position";

  return (
    <View style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <View style={styles.positionAbbrBox}>
          <Text style={styles.positionAbbr}>{abbreviation}</Text>
        </View>

        <View style={styles.positionTitleWrap}>
          <Text style={styles.positionName}>{displayName}</Text>
          <Text style={styles.positionCount}>
            {athletes.length} {athletes.length === 1 ? "player" : "players"}
          </Text>
        </View>
      </View>

      <View style={styles.playersList}>
        {athletes.length > 0 ? (
          athletes.map((entry, index) => (
            <View
              key={getPlayerRowKey(position, entry, index)}
              style={[
                styles.playerRowWrap,
                index === athletes.length - 1 && styles.lastPlayerRow,
              ]}
            >
              <PlayerRow entry={entry} showSlot={showSlot} styles={styles} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No players listed.</Text>
        )}
      </View>
    </View>
  );
}

function ChartTab({
  chart,
  selected,
  onPress,
  styles,
}: {
  chart: DepthChartInfo;
  selected: boolean;
  onPress: () => void;
  styles: DepthChartStyles;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chartTab,
        selected && styles.chartTabSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.chartTabText, selected && styles.chartTabTextSelected]}
      >
        {getChartLabel(chart)}
      </Text>
    </Pressable>
  );
}

export default function DepthChart({
  league,
  teamId,
  season,
  isDark = false,
  showHeader = true,
  resolveAthletes = true,
}: Props) {
  const styles = useMemo(() => depthChartStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const teamIdIsPresent = hasTeamId(teamId);
  const {
    depthCharts,
    loading,
    error,
    refetch,
    offensiveChart,
    defensiveChart,
    specialTeamsChart,
  } = useDepthCharts(teamId, {
    league,
    season,
    resolveAthletes,
    enabled: teamIdIsPresent,
  });

  const orderedCharts = useMemo(
    () =>
      getOrderedCharts(
        league,
        depthCharts,
        offensiveChart,
        defensiveChart,
        specialTeamsChart,
      ),
    [defensiveChart, depthCharts, league, offensiveChart, specialTeamsChart],
  );
  const chartOptions = useMemo(
    () => createChartOptions(orderedCharts),
    [orderedCharts],
  );

  const [activeChartKey, setActiveChartKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveChartKey((currentKey) => {
      if (chartOptions.length === 0) {
        return currentKey === null ? currentKey : null;
      }

      return chartOptions.some((option) => option.key === currentKey)
        ? currentKey
        : chartOptions[0].key;
    });
  }, [chartOptions]);

  const activeChartOption = useMemo(
    () =>
      chartOptions.find((option) => option.key === activeChartKey) ??
      chartOptions[0] ??
      null,
    [activeChartKey, chartOptions],
  );
  const activeChart = activeChartOption?.chart ?? null;
  const activePositions = activeChart?.positions ?? [];

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={loading}
        onRefresh={refetch}
        tintColor={isDark ? Colors.white : Colors.black}
      />
    ),
    [isDark, loading, refetch],
  );

  const renderChartTab = useCallback(
    ({ item }: ListRenderItemInfo<ChartOption>) => (
      <ChartTab
        chart={item.chart}
        selected={item.key === activeChartOption?.key}
        onPress={() => setActiveChartKey(item.key)}
        styles={styles}
      />
    ),
    [activeChartOption?.key, styles],
  );

  const renderPosition = useCallback(
    ({ item }: ListRenderItemInfo<DepthChartPosition>) => (
      <View style={styles.positionItemWrap}>
        <PositionCard position={item} styles={styles} />
      </View>
    ),
    [styles],
  );

  const renderPositionsHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {chartOptions.length > 1 ? (
          <FlatList
            horizontal
            data={chartOptions}
            keyExtractor={(option) => option.key}
            renderItem={renderChartTab}
            contentContainerStyle={styles.tabsContent}
            showsHorizontalScrollIndicator={false}
            style={styles.tabsList}
          />
        ) : null}
      </View>
    ),
    [chartOptions, renderChartTab, styles],
  );

  const renderEmptyPositions = useCallback(
    () => (
      <View style={styles.emptyChartCardWrap}>
        <View style={global.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={20}
            color={isDark ? Colors.dark.icon : Colors.light.icon}
          />
          <Text style={global.emptyText}>
            No positions listed for this depth chart.
          </Text>
        </View>
      </View>
    ),
    [
      global.emptyContainer,
      global.emptyText,
      isDark,
      styles.emptyChartCardWrap,
    ],
  );

  const renderPositionSeparator = useCallback(
    () => <View style={styles.positionSeparator} />,
    [styles.positionSeparator],
  );

  const getActivePositionKey = useCallback(
    (position: DepthChartPosition, index: number) =>
      getPositionKey(activeChartOption, position, index),
    [activeChartOption],
  );

  if (!teamIdIsPresent) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>Missing team ID.</Text>
      </View>
    );
  }

  if (loading && depthCharts.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error && depthCharts.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text selectable style={global.errorText}>
          {error}
        </Text>
        <Text selectable style={global.emptyText}>
          Pull down to refresh.
        </Text>
      </View>
    );
  }

  if (!activeChart) {
    return (
      <View style={global.emptyContainer}>
        <View style={styles.stateCard}>
          <Text selectable style={global.emptyText}>
            No depth chart available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={activePositions}
      keyExtractor={getActivePositionKey}
      renderItem={renderPosition}
      ListHeaderComponent={renderPositionsHeader}
      ListEmptyComponent={renderEmptyPositions}
      ItemSeparatorComponent={renderPositionSeparator}
      contentContainerStyle={styles.listContent}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    />
  );
}

function depthChartStyles(isDark: boolean) {
  const theme = isDark ? Colors.dark : Colors.light;
  const borderColor = isDark ? Colors.dark.white : Colors.light.black;

  return StyleSheet.create({
    listContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    stateListContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: 100,
    },
    listHeader: {
      gap: 12,
      paddingBottom: 12,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    title: {
      color: theme.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
    },
    tabsList: {
      flexGrow: 0,
    },
    tabsContent: {
      gap: 8,
      paddingHorizontal: 16,
    },
    chartTab: {
      backgroundColor: theme.itemBackground,
      borderColor,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chartTabSelected: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderColor: theme.yellow,
    },
    chartTabText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 13,
    },
    chartTabTextSelected: {
      color: isDark ? Colors.black : Colors.white,
    },
    positionItemWrap: {
      paddingHorizontal: 16,
    },
    positionSeparator: {
      height: 10,
    },
    positionCard: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.background,
      borderColor,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: "hidden",
    },
    positionHeader: {
      alignItems: "center",
      borderBottomColor: borderColor,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: "row",
      gap: 10,
      padding: 12,
    },
    positionAbbrBox: {
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.itemBackground,
      borderRadius: 10,
      height: 40,
      justifyContent: "center",
      width: 50,
    },
    positionAbbr: {
      color: theme.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
    },
    positionTitleWrap: {
      flex: 1,
    },
    positionName: {
      color: theme.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
    },
    positionCount: {
      color: theme.icon,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      marginTop: 2,
    },
    playersList: {
      paddingLeft: 12,
    },
    playerRowWrap: {
      borderBottomColor: borderColor,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    lastPlayerRow: {
      borderBottomWidth: 0,
    },
    playerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      minHeight: 64,
      paddingRight: 12,
      paddingVertical: 10,
    },
    rankBadge: {
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.itemBackground,
      borderRadius: 14,
      height: 28,
      justifyContent: "center",
      width: 28,
    },
    rankText: {
      color: theme.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
    },
    headshot: {
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.itemBackground,
      borderRadius: 21,
      height: 42,
      width: 42,
    },
    fallbackHeadshot: {
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.itemBackground,
      borderRadius: 21,
      height: 42,
      justifyContent: "center",
      width: 42,
    },
    fallbackInitials: {
      color: theme.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
    },
    playerInfo: {
      flex: 1,
      gap: 2,
    },
    playerNameRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
    },
    playerName: {
      color: theme.text,
      flexShrink: 1,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
    },
    slotChip: {
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.itemBackground,
      borderRadius: 12,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    slotChipText: {
      color: theme.icon,
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 10,
    },
    playerMeta: {
      color: theme.icon,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
    },
    emptyText: {
      color: theme.icon,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      padding: 14,
    },
    emptyChartCardWrap: {
      paddingHorizontal: 16,
    },
    stateCard: {
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.background,
      borderColor,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      gap: 8,
      justifyContent: "center",
      marginHorizontal: 16,
      minHeight: 132,
      padding: 18,
    },
    errorStateCard: {
      backgroundColor: theme.errorBackground,
    },
    stateText: {
      color: theme.text,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      textAlign: "center",
    },
    stateHint: {
      color: theme.icon,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      textAlign: "center",
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
