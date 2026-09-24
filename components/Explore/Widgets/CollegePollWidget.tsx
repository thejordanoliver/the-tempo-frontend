import { Ionicons } from "@expo/vector-icons";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors } from "constants/styles";
import {
  getCBBTeam,
  getCBBTeamByESPNId,
  getCBBTeamLogo,
} from "constants/teamsCBB";
import {
  getCFBTeam,
  getCFBTeamByESPNId,
  getCFBTeamLogo,
} from "constants/teamsCFB";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  type CBBTeamRank,
  useCBBRankings,
} from "hooks/BasketballHooks/useCBBRankings";
import {
  type CFBTeamRank,
  useCFBRankings,
} from "hooks/FootballHooks/useCFBRankings";
import { memo, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { collegePollWidgetStyles } from "styles/ExploreStyles/CollegePollWidgetStyles";
import type {
  CollegePollRow,
  CollegePollSourceProps,
  CollegePollTableProps,
  CollegePollWidgetProps,
} from "types/collegePollWidget";
import {
  getCollegePollLabel,
  getCollegePollPageSize,
  normalizeCollegePollType,
} from "utils/collegePollWidget";
import CollegePollSettingsModal from "../CollegePollSettingsModal";
import WidgetCarousel from "./WidgetCarousel";
import { WidgetEditControls } from "./WidgetSlider";

// -----------------------------------------------------------------------------
// Constants and helpers
// -----------------------------------------------------------------------------

const MAX_RANKED_TEAMS = 25;

function createPollPages(rows: CollegePollRow[], pageSize: number) {
  const top25 = rows.slice(0, MAX_RANKED_TEAMS);

  return Array.from(
    { length: Math.ceil(top25.length / pageSize) },
    (_, index) => top25.slice(index * pageSize, (index + 1) * pageSize),
  );
}

function getTrendColor(trend: number, isDark: boolean) {
  if (trend > 0) {
    return isDark ? Colors.dark.leafGreen : Colors.light.green;
  }

  return isDark ? Colors.dark.lightRed : Colors.light.red;
}

// -----------------------------------------------------------------------------
// Paginated poll presentation
// -----------------------------------------------------------------------------

const CollegePollTable = memo(function CollegePollTable({
  size,
  width,
  isDark,
  isEditing,
  league,
  loading,
  error,
  rows,
  onRetry,
  autoPlay,
}: CollegePollTableProps) {
  const router = useRouter();
  const compact = size === "small";
  const pageSize = getCollegePollPageSize(size);
  const pages = useMemo(
    () => createPollPages(rows, pageSize),
    [pageSize, rows],
  );
  const styles = useMemo(
    () => collegePollWidgetStyles(isDark, size),
    [isDark, size],
  );

  const openTeam = useCallback(
    (row: CollegePollRow) => {
      if (row.teamId == null) return;

      router.push({
        pathname:
          league === "cfb" ? "/team/cfb/[teamId]" : "/team/cbb/[teamId]",
        params: { teamId: String(row.teamId) },
      });
    },
    [league, router],
  );

  if (loading) {
    return (
      <View style={styles.state}>
        <CustomActivityIndicator />
        <Text style={styles.stateText}>Loading poll…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <Pressable
        disabled={isEditing}
        onPress={() => {
          void onRetry();
        }}
        style={({ pressed }) => [
          styles.state,
          pressed && !isEditing && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Retry loading college poll"
        accessibilityState={{ disabled: isEditing }}
      >
        <Ionicons name="refresh" size={22} color={Colors.midTone} />
        <Text style={styles.stateTitle}>Unable to load poll</Text>
        <Text style={styles.stateText}>Tap to try again.</Text>
      </Pressable>
    );
  }

  if (rows.length === 0) {
    return (
      <View style={styles.state}>
        <Ionicons name="school-outline" size={24} color={Colors.midTone} />
        <Text style={styles.stateTitle}>No poll available</Text>
        <Text style={styles.stateText} numberOfLines={2}>
          Rankings will appear when the next poll is published.
        </Text>
      </View>
    );
  }

  const renderTable = (pageRows: CollegePollRow[]) => (
    <View style={styles.page}>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnLabel, styles.rankColumn]}>#</Text>
        <Text style={[styles.columnLabel, styles.teamColumn]}>Team</Text>
        <Text style={[styles.columnLabel, styles.recordColumn]}>Record</Text>
        <Text style={[styles.columnLabel, styles.pointsColumn]}>PTS</Text>
      </View>

      {pageRows.map((row) => {
        const movement = row.trend;
        const movedUp = movement > 0;
        const movementColor = getTrendColor(movement, isDark);

        return (
          <Pressable
            key={row.key}
            disabled={isEditing || row.teamId == null}
            onPress={() => openTeam(row)}
            style={({ pressed }) => [
              styles.row,
              pressed && !isEditing && styles.pressed,
            ]}
            accessibilityRole={row.teamId == null ? undefined : "button"}
            accessibilityLabel={
              row.teamId == null ? undefined : `Open ${row.teamName} team page`
            }
            accessibilityState={{ disabled: isEditing || row.teamId == null }}
          >
            <Text style={[styles.rank, styles.rankColumn]}>{row.rank}</Text>
            <View style={[styles.teamCell, styles.teamColumn]}>
              {row.logo ? (
                <Image
                  source={row.logo}
                  style={styles.teamLogo}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.logoFallback}>
                  <Text style={styles.logoFallbackText}>
                    {row.teamCode.slice(0, 2)}
                  </Text>
                </View>
              )}
              <Text style={styles.teamName} numberOfLines={1}>
                {row.teamCode || row.teamName}
              </Text>
              {!compact && movement !== 0 ? (
                <View style={styles.trend}>
                  <Ionicons
                    name={movedUp ? "arrow-up" : "arrow-down"}
                    size={9}
                    color={movementColor}
                  />
                  <Text style={[styles.trendText, { color: movementColor }]}>
                    {Math.abs(movement)}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.stat, styles.recordColumn]} numberOfLines={1}>
              {row.record || "—"}
            </Text>
            <Text style={[styles.stat, styles.pointsColumn]}>{row.points}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderCompactSlide = (row: CollegePollRow) => {
    const movement = row.trend;
    const movedUp = movement > 0;
    const movementColor = getTrendColor(movement, isDark);
    return (
      <Pressable
        disabled={isEditing || row.teamId == null}
        onPress={() => openTeam(row)}
        style={({ pressed }) => [
          styles.compactSlide,
          pressed && !isEditing && styles.pressed,
        ]}
        accessibilityRole={row.teamId == null ? undefined : "button"}
        accessibilityLabel={
          row.teamId == null
            ? undefined
            : `${row.rank}. ${row.teamName}, ${row.record || "record unavailable"}, ${row.points} points`
        }
        accessibilityState={{ disabled: isEditing || row.teamId == null }}
      >
        <LinearGradient
          colors={[row.color, isDark ? Colors.black : Colors.white]}
          locations={[0, 0.8]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.compactTeamGlow, StyleSheet.absoluteFill]}
        />

        <BlurView intensity={100} style={styles.compactRankContainer}>
          <Text style={styles.compactRank}>#{row.rank}</Text>
        </BlurView>

        <Image
          source={row.logo}
          style={styles.compactLogo}
          contentFit="contain"
        />
        {movement !== 0 ? (
          <View style={styles.compactTrend}>
            <Ionicons
              name={movedUp ? "arrow-up" : "arrow-down"}
              size={20}
              color={movementColor}
            />
            <Text style={[styles.compactTrendText, { color: movementColor }]}>
              {Math.abs(movement)}
            </Text>
          </View>
        ) : null}

        <View style={styles.compactCopy}>
          <Text style={styles.compactTeamName} numberOfLines={1}>
            {row.teamName}
          </Text>

          <View style={styles.compactStatsContainer}>
            <Text style={styles.compactStats} numberOfLines={1}>
              {row.record || "—"}
            </Text>
            <View style={styles.compactStatsDivider} />
            <Text style={styles.compactStats} numberOfLines={1}>
              {row.points} PTS
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.table, isEditing && styles.tableEditing]}>
      <WidgetCarousel
        items={pages}
        initialWidth={Math.max(width - StyleSheet.hairlineWidth * 2, 1)}
        isDark={isDark}
        autoPlay={autoPlay}
        disabled={isEditing}
        style={styles.carousel}
        keyExtractor={(pageRows, index) => pageRows[0]?.key ?? String(index)}
        renderItem={(pageRows) =>
          compact && pageRows[0]
            ? renderCompactSlide(pageRows[0])
            : renderTable(pageRows)
        }
        accessibilityLabel={(pageIndex, pageCount) =>
          `College poll, page ${pageIndex + 1} of ${pageCount}`
        }
      />
    </View>
  );
});

// -----------------------------------------------------------------------------
// League-specific data sources
// -----------------------------------------------------------------------------

const CFBPollTable = memo(function CFBPollTable({
  size,
  width,
  isDark,
  isEditing,
  pollType,
  autoPlay,
}: CollegePollSourceProps) {
  const { rankings, loading, error, refresh } = useCFBRankings();
  const selectedPoll = rankings.find((poll) => poll.type === pollType);
  const rows = useMemo<CollegePollRow[]>(
    () =>
      (selectedPoll?.ranks ?? [])
        .slice(0, MAX_RANKED_TEAMS)
        .map((rank, index) => createCFBRow(rank, index, isDark)),
    [isDark, selectedPoll?.ranks],
  );

  return (
    <CollegePollTable
      size={size}
      width={width}
      isDark={isDark}
      isEditing={isEditing}
      league="cfb"
      loading={loading}
      error={error}
      rows={rows}
      onRetry={refresh}
      autoPlay={autoPlay}
    />
  );
});

const CBBPollTable = memo(function CBBPollTable({
  size,
  width,
  isDark,
  isEditing,
  pollType,
  autoPlay,
}: CollegePollSourceProps) {
  const { rankings, loading, error, refresh } = useCBBRankings("cbb");
  const selectedPoll =
    rankings.find((poll) => poll.type === pollType) ??
    rankings.find((poll) =>
      pollType === "ap"
        ? poll.shortName === "AP Poll"
        : poll.shortName === "Coaches Poll",
    );
  const rows = useMemo<CollegePollRow[]>(
    () =>
      (selectedPoll?.ranks ?? [])
        .slice(0, MAX_RANKED_TEAMS)
        .map((rank, index) => createCBBRow(rank, index, isDark)),
    [isDark, selectedPoll?.ranks],
  );

  return (
    <CollegePollTable
      size={size}
      width={width}
      isDark={isDark}
      isEditing={isEditing}
      league="cbb"
      loading={loading}
      error={error}
      rows={rows}
      onRetry={refresh}
      autoPlay={autoPlay}
    />
  );
});

function createCFBRow(
  rank: CFBTeamRank,
  index: number,
  isDark: boolean,
): CollegePollRow {
  const apiTeam = rank.team;
  const team = apiTeam
    ? (getCFBTeam(apiTeam.id) ?? getCFBTeamByESPNId(apiTeam.espnId))
    : undefined;
  const teamId = team?.id;
  const teamCode = team?.code || "N/A";
  const teamName = team?.fullName || "N/A";
  const teamColor = team?.color || Colors.midTone;
  const teamLogo = getCFBTeamLogo(teamId, isDark);

  return {
    key: `cfb:${teamId ?? apiTeam?.id ?? index}:${rank.current}`,
    rank: rank.current,
    trend: Number(rank.trend) || 0,
    points: rank.points ?? 0,
    record: rank.recordSummary,
    teamId: teamId,
    teamCode: teamCode,
    teamName: teamName,
    color: teamColor,
    logo: teamLogo,
  };
}

function createCBBRow(
  rank: CBBTeamRank,
  index: number,
  isDark: boolean,
): CollegePollRow {
  const apiTeam = rank.team;
  const team = apiTeam
    ? (getCBBTeam(apiTeam.id ?? undefined) ??
      (apiTeam.espnId != null ? getCBBTeamByESPNId(apiTeam.espnId) : undefined))
    : undefined;
  const teamId = team?.id;
  const teamCode = team?.code || "N/A";
  const teamName = team?.fullName || "N/A";
  const teamColor = team?.color || apiTeam?.color || Colors.midTone;
  const teamLogo = getCBBTeamLogo(teamId, isDark);

  return {
    key: `cbb:${teamId ?? apiTeam?.id ?? index}:${rank.current}`,
    rank: rank.current,
    trend: Number(rank.trend) || 0,
    points: rank.points ?? 0,
    record: rank.recordSummary,
    teamId: teamId,
    teamCode: teamCode,
    teamName: teamName,
    color: teamColor,
    logo: teamLogo,
  };
}

// -----------------------------------------------------------------------------
// Public widget shell
// -----------------------------------------------------------------------------

const CollegePollWidget = memo(function CollegePollWidget({
  isDark,
  size,
  width,
  height,
  league,
  pollType,
  onChangeSelection,
  autoPlay,
  onChangeAutoPlay,
  widgetId,
  widgetSize,
  isEditing,
  availableSizeOptions,
  onResizeWidget,
  onRemoveWidget,
  onMoveWidget,
  canMoveUp,
  canMoveDown,
}: CollegePollWidgetProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const compact = size === "small";
  const styles = useMemo(
    () => collegePollWidgetStyles(isDark, size),
    [isDark, size],
  );
  const leagueConfig = LEAGUE_CONFIG[league];
  const normalizedPollType = normalizeCollegePollType(league, pollType);
  const pollLabel = getCollegePollLabel(league, normalizedPollType);

  return (
    <>
      <BlurView intensity={100} style={[styles.container, { width, height }]}>
        <View style={styles.header}>
          {!compact && (
            <View style={styles.headingCopy}>
              <Text style={styles.title} numberOfLines={1}>
                {pollLabel}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          disabled={isEditing}
          onPress={() => setPickerVisible(true)}
          style={({ pressed }) => [
            styles.leagueButton,
            pressed && !isEditing && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Change college poll. Currently ${leagueConfig.label}, ${pollLabel}`}
          accessibilityState={{ disabled: isEditing }}
        >
          <BlurView intensity={100} style={[StyleSheet.absoluteFill]} />
          <Image
            source={isDark ? leagueConfig.logoLight : leagueConfig.logo}
            style={styles.leagueLogo}
            contentFit="contain"
          />
          <Text style={styles.leagueLabel}>{league.toUpperCase()}</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.midTone} />
        </Pressable>

        {league === "cfb" ? (
          <CFBPollTable
            key={`cfb:${normalizedPollType}`}
            size={size}
            width={width}
            isDark={isDark}
            isEditing={isEditing}
            pollType={normalizedPollType}
            autoPlay={autoPlay}
          />
        ) : (
          <CBBPollTable
            key={`cbb:${normalizedPollType}`}
            size={size}
            width={width}
            isDark={isDark}
            isEditing={isEditing}
            pollType={normalizedPollType}
            autoPlay={autoPlay}
          />
        )}

        {isEditing ? (
          <WidgetEditControls
            isDark={isDark}
            widgetId={widgetId}
            widgetSize={widgetSize}
            availableSizeOptions={availableSizeOptions}
            onResizeWidget={onResizeWidget}
            onRemoveWidget={onRemoveWidget}
            onMoveWidget={onMoveWidget}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            compact={compact}
          />
        ) : null}
      </BlurView>

      <CollegePollSettingsModal
        visible={pickerVisible}
        isDark={isDark}
        selectedLeague={league}
        selectedPollType={normalizedPollType}
        autoPlay={autoPlay}
        onClose={() => setPickerVisible(false)}
        onSelect={onChangeSelection}
        onChangeAutoPlay={onChangeAutoPlay}
      />
    </>
  );
});

export default CollegePollWidget;
