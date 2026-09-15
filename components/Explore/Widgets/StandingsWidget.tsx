import { Ionicons } from "@expo/vector-icons";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { getNBATeamLogo, getTeamByESPNId } from "constants/teams";
import { getMLBTeamByEspnId, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamByESPNId, getNFLTeamLogo } from "constants/teamsNFL";
import {
  getNHLTeamByEspnId,
  getNHLTeamLogo,
} from "constants/teamsNHL";
import { getUFLTeamByESPNId, getUFLTeamLogo } from "constants/teamsUFL";
import { getWNBATeamByESPNId, getWNBATeamLogo } from "constants/teamsWNBA";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  type StandingsTeam,
  useLeagueStandings,
} from "hooks/LeagueHooks/useLeagueStandings";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type {
  ExploreStandingsLeague,
  ExploreWidgetSize,
} from "types/widgets";
import {
  buildStandingsPreviewGroups,
  formatStandingsMetric,
  formatStandingsRecord,
} from "utils/standingsWidget";
import StandingsLeagueModal from "../StandingsLeagueModal";
import { WidgetEditControls } from "./WidgetSlider";

type StandingsWidgetProps = {
  isDark: boolean;
  size: ExploreWidgetSize;
  width: number;
  height: number;
  league: ExploreStandingsLeague;
  onChangeLeague: (league: ExploreStandingsLeague) => void;
  widgetId: string;
  widgetSize: ExploreWidgetSize;
  isEditing: boolean;
  availableSizeOptions: readonly ExploreWidgetSize[];
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

type StandingsTableProps = Pick<
  StandingsWidgetProps,
  "height" | "isDark" | "isEditing" | "league"
> & Pick<StandingsWidgetProps, "size" | "width">;

type StandingsConferenceProps = Pick<
  StandingsWidgetProps,
  "isDark" | "league"
> & {
  compact: boolean;
  group: ReturnType<typeof buildStandingsPreviewGroups>[number];
  showConferenceName: boolean;
};

function StandingsConference({
  compact,
  group,
  isDark,
  league,
  showConferenceName,
}: StandingsConferenceProps) {
  const styles = useMemo(
    () => standingsWidgetStyles(isDark, compact),
    [compact, isDark],
  );

  return (
    <View style={styles.conferenceGroup}>
      <View style={styles.conferenceHeader}>
        <Text style={styles.conferenceName} numberOfLines={1}>
          {showConferenceName
            ? group.name
            : group.abbreviation || group.name}
        </Text>
      </View>

      {!compact ? (
        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, styles.positionColumn]}>#</Text>
          <Text style={[styles.columnLabel, styles.teamColumn]}>Team</Text>
          <Text style={[styles.columnLabel, styles.recordColumn]}>Record</Text>
          <Text style={[styles.columnLabel, styles.metricColumn]}>
            {league === "nhl" ? "PTS" : "PCT"}
          </Text>
        </View>
      ) : null}

      {group.rows.map(({ conference, position, team }) => {
        const logo = getLocalTeamLogo(team, league, isDark);

        return (
          <View key={`${conference}:${team.id}`} style={styles.row}>
            <Text style={[styles.position, styles.positionColumn]}>
              {position}
            </Text>
            <View style={[styles.teamCell, styles.teamColumn]}>
              {logo ? (
                <Image
                  source={logo}
                  style={styles.teamLogo}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.logoFallback}>
                  <Text style={styles.logoFallbackText}>
                    {(team.code || team.name).slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.teamName} numberOfLines={1}>
                {compact
                  ? team.code || team.shortName || team.name
                  : team.shortName || team.name}
              </Text>
            </View>
            <Text
              style={[styles.stat, styles.recordColumn]}
              numberOfLines={1}
            >
              {formatStandingsRecord(team, league)}
            </Text>
            {!compact ? (
              <Text style={[styles.stat, styles.metricColumn]}>
                {formatStandingsMetric(team, league)}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function getLocalTeamLogo(
  team: StandingsTeam,
  league: ExploreStandingsLeague,
  isDark: boolean,
) {
  switch (league) {
    case "nba": {
      const localTeam = getTeamByESPNId(team.id);
      return localTeam ? getNBATeamLogo(localTeam.id, isDark) : undefined;
    }
    case "wnba": {
      const localTeam = getWNBATeamByESPNId(team.id);
      return localTeam ? getWNBATeamLogo(localTeam.id, isDark) : undefined;
    }
    case "nfl": {
      const localTeam = getNFLTeamByESPNId(team.id);
      return localTeam ? getNFLTeamLogo(localTeam.id, isDark) : undefined;
    }
    case "ufl": {
      const localTeam = getUFLTeamByESPNId(team.id);
      return localTeam ? getUFLTeamLogo(localTeam.id, isDark) : undefined;
    }
    case "mlb": {
      const localTeam = getMLBTeamByEspnId(team.id);
      return localTeam ? getMLBTeamLogo(localTeam.id, isDark) : undefined;
    }
    case "nhl": {
      const localTeam = getNHLTeamByEspnId(team.id);
      return localTeam ? getNHLTeamLogo(localTeam.id, isDark) : undefined;
    }
  }
}

function StandingsTable({
  height,
  isDark,
  isEditing,
  league,
  size,
  width,
}: StandingsTableProps) {
  const { standings, seasonDisplayName, loading, error, refetch } =
    useLeagueStandings(league);
  const compact = size === "small" || width < 240;
  const styles = useMemo(
    () => standingsWidgetStyles(isDark, compact),
    [compact, isDark],
  );
  const populatedConferenceCount = standings.filter(
    (conference) => conference.standings.length > 0,
  ).length;
  const rowLimit = compact
    ? populatedConferenceCount > 1
      ? 2
      : 5
    : Math.max(2, Math.min(10, Math.floor((height - 98) / 30)));
  const groups = useMemo(
    () => buildStandingsPreviewGroups(standings, rowLimit),
    [rowLimit, standings],
  );

  if (loading) {
    return (
      <View style={styles.state}>
        <CustomActivityIndicator />
        <Text style={styles.stateText}>Loading standings…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <Pressable
        disabled={isEditing}
        onPress={() => {
          void refetch();
        }}
        style={({ pressed }) => [
          styles.state,
          pressed && !isEditing && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Retry loading standings"
        accessibilityState={{ disabled: isEditing }}
      >
        <Ionicons name="refresh" size={22} color={Colors.midTone} />
        <Text style={styles.stateTitle}>Unable to load standings</Text>
        <Text style={styles.stateText} numberOfLines={2}>
          Tap to try again.
        </Text>
      </Pressable>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.state}>
        <Ionicons name="podium-outline" size={24} color={Colors.midTone} />
        <Text style={styles.stateTitle}>No standings available</Text>
        <Text style={styles.stateText} numberOfLines={2}>
          Check back when the league publishes its table.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.table, isEditing && styles.tableEditing]}>
      <View style={styles.conferenceGrid}>
        {groups.map((group) => (
          <StandingsConference
            key={group.id}
            compact={compact}
            group={group}
            isDark={isDark}
            league={league}
            showConferenceName={!compact || groups.length === 1}
          />
        ))}
      </View>

      {!compact && seasonDisplayName ? (
        <Text style={styles.season} numberOfLines={1}>
          {seasonDisplayName}
        </Text>
      ) : null}
    </View>
  );
}

export default function StandingsWidget({
  isDark,
  size,
  width,
  height,
  league,
  onChangeLeague,
  widgetId,
  widgetSize,
  isEditing,
  availableSizeOptions,
  onResizeWidget,
  onRemoveWidget,
  onMoveWidget,
  canMoveUp,
  canMoveDown,
}: StandingsWidgetProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const compact = size === "small" || width < 240;
  const styles = useMemo(
    () => standingsWidgetStyles(isDark, compact),
    [compact, isDark],
  );
  const leagueConfig = LEAGUE_CONFIG[league];

  const handleSelectLeague = useCallback(
    (nextLeague: ExploreStandingsLeague) => {
      onChangeLeague(nextLeague);
    },
    [onChangeLeague],
  );

  return (
    <>
      <BlurView intensity={100} style={[styles.container, { width, height }]}>
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>Standings</Text>
            {!compact ? (
              <Text style={styles.subtitle}>By conference</Text>
            ) : null}
          </View>

          <Pressable
            disabled={isEditing}
            onPress={() => setPickerVisible(true)}
            style={({ pressed }) => [
              styles.leagueButton,
              pressed && !isEditing && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Change standings league. Currently ${leagueConfig.label}`}
            accessibilityState={{ disabled: isEditing }}
          >
            <Image
              source={isDark ? leagueConfig.logoLight : leagueConfig.logo}
              style={styles.leagueLogo}
              contentFit="contain"
            />
            <Text style={styles.leagueLabel}>{league.toUpperCase()}</Text>
            <Ionicons name="chevron-down" size={13} color={Colors.midTone} />
          </Pressable>
        </View>

        <StandingsTable
          key={league}
          height={height}
          isDark={isDark}
          isEditing={isEditing}
          league={league}
          size={size}
          width={width}
        />

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

      <StandingsLeagueModal
        visible={pickerVisible}
        isDark={isDark}
        selectedLeague={league}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectLeague}
      />
    </>
  );
}

const standingsWidgetStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    container: {
      position: "relative",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: compact ? 6 : 10,
      minHeight: compact ? 52 : 52,
      paddingHorizontal: compact ? 8 : 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    headingCopy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: compact ? 14 : 17,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      paddingTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    leagueButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 4 : 6,
      minHeight: compact ? 32 : 34,
      paddingHorizontal: compact ? 6 : 9,
      borderRadius: 17,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    leagueLogo: {
      width: compact ? 20 : 22,
      height: compact ? 20 : 22,
    },
    leagueLabel: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    table: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: compact ? 6 : 8,
    },
    tableEditing: {
      opacity: 0.62,
    },
    conferenceGrid: {
      flex: 1,
      minHeight: 0,
      flexDirection: compact ? "column" : "row",
      gap: compact ? 0 : 8,
    },
    conferenceGroup: {
      flex: 1,
      minWidth: 0,
    },
    conferenceHeader: {
      justifyContent: "center",
      minHeight: compact ? 20 : 24,
      paddingHorizontal: compact ? 5 : 7,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    conferenceName: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: compact ? 10 : 11,
      color: isDark ? Colors.white : Colors.black,
      textTransform: "uppercase",
      letterSpacing: 0.35,
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 22,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    columnLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 9,
      letterSpacing: 0.5,
      color: Colors.midTone,
      textTransform: "uppercase",
    },
    positionColumn: {
      width: compact ? 20 : 22,
      textAlign: "center",
    },
    teamColumn: {
      flex: 1,
      minWidth: 0,
    },
    recordColumn: {
      width: compact ? 48 : 51,
      textAlign: "right",
    },
    metricColumn: {
      width: 39,
      textAlign: "right",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: compact ? 28 : 30,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    position: {
      fontFamily: Fonts.MEDIUM,
      fontSize: compact ? 10 : 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontVariant: ["tabular-nums"],
    },
    teamCell: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 4 : 5,
      paddingHorizontal: compact ? 2 : 3,
    },
    teamLogo: {
      width: compact ? 19 : 20,
      height: compact ? 19 : 20,
    },
    logoFallback: {
      alignItems: "center",
      justifyContent: "center",
      width: compact ? 19 : 20,
      height: compact ? 19 : 20,
      borderRadius: 10,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    logoFallbackText: {
      fontFamily: Fonts.BOLD,
      fontSize: 8,
      color: isDark ? Colors.white : Colors.black,
    },
    teamName: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.MEDIUM,
      fontSize: compact ? 9 : 10,
      color: isDark ? Colors.white : Colors.black,
    },
    stat: {
      fontFamily: Fonts.MEDIUM,
      fontSize: compact ? 9 : 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontVariant: ["tabular-nums"],
    },
    season: {
      paddingTop: 3,
      fontFamily: Fonts.REGULAR,
      fontSize: 9,
      color: Colors.midTone,
      textAlign: "right",
    },
    state: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 18,
    },
    stateTitle: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    stateText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      lineHeight: 15,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    pressed: {
      opacity: activeOpacity,
    },
  });
