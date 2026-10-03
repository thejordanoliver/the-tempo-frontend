import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import placeholder from "@/assets/Placeholders/playerPlaceholder.png";
import { Colors, activeOpacity, globalStyles } from "@/constants/styles";
import { getNBATeam } from "@/constants/teams";
import { getMCBBTeam } from "@/constants/teamsMCBB";
import { getCFBTeam } from "@/constants/teamsCFB";
import { getMLBTeam } from "@/constants/teamsMLB";
import { getNFLTeam } from "@/constants/teamsNFL";
import { getNHLTeam } from "@/constants/teamsNHL";
import { getWCBBTeam } from "@/constants/teamsWCBB";
import { getWNBATeam } from "@/constants/teamsWNBA";
import { SeasonLeadersTableStyles } from "@/styles/LeagueStyles/SeasonLeadersTableStyles";
import { PlayerLeader, SeasonLeaderColumn } from "@/types/stats";
import { Image } from "expo-image";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StandingsSkeleton } from "../Skeletons/StandingsSkeleton";

type PlayerRoutePathname =
  | "/player/basketball/[id]"
  | "/player/baseball/[id]"
  | "/player/hockey/[id]"
  | "/player/football/[id]";
const PLAYER_ROUTES: Record<string, PlayerRoutePathname> = {
  nba: "/player/basketball/[id]",
  wnba: "/player/basketball/[id]",
  mcbb: "/player/basketball/[id]",
  wcbb: "/player/basketball/[id]",
  mlb: "/player/baseball/[id]",
  nfl: "/player/football/[id]",
  cfb: "/player/football/[id]",
  nhl: "/player/hockey/[id]",
};

const getTeam = (league: string, teamId: number) => {
  switch (league) {
    case "nba":
      return getNBATeam(teamId);
    case "wnba":
      return getWNBATeam(teamId);
    case "mcbb":
      return getMCBBTeam(teamId);
    case "wcbb":
      return getWCBBTeam(teamId);
    case "mlb":
      return getMLBTeam(teamId);
    case "nfl":
      return getNFLTeam(teamId);
    case "cfb":
      return getCFBTeam(teamId);
    case "nhl":
      return getNHLTeam(teamId);
    default:
      return undefined;
  }
};
const numericId = (value: string | number | null) => {
  const parsed = Number(value);
  return value !== null && Number.isFinite(parsed) ? parsed : null;
};

interface Props {
  leaders: PlayerLeader[];
  league: string;
  columns: SeasonLeaderColumn[];
  primaryStatKey?: string;
  isDark: boolean;
  loadingMore: boolean;
  onEndReached: () => void;
  loading: boolean;
  error: string | null;
}

export default function SeasonLeadersTable({
  leaders,
  league,
  columns,
  primaryStatKey,
  isDark,
  loadingMore,
  onEndReached,
  loading,
  error,
}: Props) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = useMemo(() => SeasonLeadersTableStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const router = useScopedRouter();

  const openPlayer = useCallback(
    (item: PlayerLeader) => {
      const playerId = numericId(item.id);
      const teamId = numericId(item.team_id);
      const route = PLAYER_ROUTES[league];
      if (playerId === null || teamId === null || !route) return;
      router.push({
        pathname: route,
        params: { id: String(playerId), teamId: String(teamId), league },
      });
    },
    [league, router],
  );
  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const remaining =
        nativeEvent.contentSize.height -
        nativeEvent.layoutMeasurement.height -
        nativeEvent.contentOffset.y;
      if (remaining < 240) onEndReached();
    },
    [onEndReached],
  );

  if (loading && leaders.length === 0)
    return <StandingsSkeleton variant="seasonLeaders" />;

  if (leaders.length === 0)
    return (
      <View style={global.emptyContainer}>
        <Text selectable style={global.emptyTitle}>
          No season leaders are available.
        </Text>
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text selectable style={global.emptyTitle}>
          {error}
        </Text>
      </View>
    );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={navigationContentStyle(styles.contentContainer)}
      onScroll={handleScroll}
      scrollEventThrottle={200}
    >
      <View style={styles.table}>
        <View style={styles.fixedPane}>
          <View style={styles.fixedHeader}>
            <Text style={[styles.headerText, styles.rankColumn]}>Rk</Text>
            <Text style={[styles.headerText, styles.playerHeader]}>Player</Text>
          </View>
          {leaders.map((item, index) => {
            const playerId = numericId(item.id);
            const teamId = numericId(item.team_id);
            const team = teamId === null ? undefined : getTeam(league, teamId);
            const canOpen =
              playerId !== null && teamId !== null && !!PLAYER_ROUTES[league];
            const playerName = item.short_name ?? "Unknown Player";
            const teamLogo =
              isDark && team?.logoLight ? team.logoLight : team?.logo;
            return (
              <TouchableOpacity
                key={`${item.id ?? "leader"}-${item.rank}-${index}`}
                activeOpacity={activeOpacity}
                disabled={!canOpen}
                accessibilityRole={canOpen ? "button" : undefined}
                accessibilityLabel={canOpen ? `Open ${playerName}` : undefined}
                onPress={() => openPlayer(item)}
                style={[
                  styles.fixedRow,
                  index % 2 === 1 && styles.alternateRow,
                  index === leaders.length - 1 && styles.fixedLastRow,
                ]}
              >
                <Text selectable style={[styles.cellText, styles.rankColumn]}>
                  {item.rank}
                </Text>
                <Image
                  source={item.headshot ? { uri: item.headshot } : placeholder}
                  placeholder={placeholder}
                  contentFit="cover"
                  style={styles.headshot}
                />
                <View style={styles.playerDetails}>
                  <Text selectable numberOfLines={1} style={styles.playerName}>
                    {playerName}
                  </Text>
                  <View style={styles.teamIdentity}>
                    {teamLogo ? (
                      <Image
                        source={teamLogo}
                        contentFit="contain"
                        style={styles.teamLogo}
                      />
                    ) : null}
                    <Text selectable numberOfLines={1} style={styles.teamCode}>
                      {team?.code ?? "—"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={styles.statsScroller}
          contentContainerStyle={styles.statsContent}
        >
          <View style={styles.statsTable}>
            <View style={styles.statsHeader}>
              {columns.map((column) => (
                <View
                  key={column.key}
                  style={[
                    styles.statColumn,
                    column.key === primaryStatKey && styles.mainStatColumn,
                  ]}
                >
                  <Text
                    accessibilityLabel={column.label}
                    style={styles.headerText}
                  >
                    {column.abbreviation}
                  </Text>
                </View>
              ))}
            </View>
            {leaders.map((item, index) => (
              <TouchableOpacity
                key={`${item.id ?? "stat"}-${item.rank}-${index}`}
                activeOpacity={activeOpacity}
                onPress={() => openPlayer(item)}
                style={[
                  styles.statsRow,
                  index % 2 === 1 && styles.alternateRow,
                  index === leaders.length - 1 && styles.statsLastRow,
                ]}
              >
                {columns.map((column, columnIndex) => {
                  const value =
                    item.stats?.[column.key] ??
                    (columnIndex === 0 ? item.stat_value : null);
                  return (
                    <View
                      key={column.key}
                      style={[
                        styles.statColumn,
                        column.key === primaryStatKey && styles.mainStatColumn,
                      ]}
                    >
                      <Text selectable style={styles.statText}>
                        {value == null ? "—" : Number(value).toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loadingMore ? (
        <View style={styles.loadingFooter}>
          <ActivityIndicator
            accessibilityLabel="Loading more leaders"
            color={isDark ? Colors.white : Colors.black}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
