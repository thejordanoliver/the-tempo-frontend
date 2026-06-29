import { activeOpacity } from "@/constants/styles";
import {
  CBBTeamRank,
  useCBBRankings,
} from "@/hooks/BasketballHooks/useCBBRankings";
import { getTeamByESPNId as getNBATeamByESPNId } from "constants/teams";
import { getCBBTeamByESPNId } from "constants/teamsCBB";
import { getCFBTeamByESPNId } from "constants/teamsCFB";
import { getMLBTeamByEspnId } from "constants/teamsMLB";
import { getNFLTeamByESPNId } from "constants/teamsNFL";
import { getNHLTeamByEspnId } from "constants/teamsNHL";
import { getWNBATeamByESPNId } from "constants/teamsWNBA";
import {
  CFBTeamRank,
  useCFBRankings,
} from "hooks/FootballHooks/useCFBRankings";
import {
  ConferenceStandings,
  StandingsTeam,
  useLeagueStandings,
} from "hooks/LeagueHooks/useLeagueStandings";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { standingsWidgetStyles } from "styles/ExploreStyles/StadningWidgetStyles";
import type { LeagueType } from "types/types";
import { ExploreWidgetSize } from "types/widgets";
import { WidgetEditControls } from "./WidgetSlider";

type StandingsWidgetProps = {
  isDark: boolean;
  size?: ExploreWidgetSize;
  containerWidth?: number;
  containerHeight?: number;
  widgetId?: string;
  widgetSize?: ExploreWidgetSize;
  isEditing?: boolean;
  availableSizeOptions?: ExploreWidgetSize[];
  onResizeWidget?: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveWidget?: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  favoriteLeagues?: string[];
  initialLeague?: string;
};

type SupportedStandingsLeague =
  | "NBA"
  | "NFL"
  | "MLB"
  | "NHL"
  | "WNBA"
  | "CBB"
  | "WCBB"
  | "CFB";

type StandingsRow = {
  id: string;
  rank: number;
  name: string;
  abbreviation: string;
  record: string;
  winPercent?: number | null;
  gamesBehind?: number | null;
  points?: number | null;
  logo?: ImageSourcePropType;
};

type StandingsLayout = {
  contentHeight?: number;
  rowHeight?: number;
  sectionHeaderHeight: number;
  sectionGap: number;
  rowGap: number;
  scrollable: boolean;
};

type StandingsSection = {
  title: string;
  rows: StandingsRow[];
};

const SUPPORTED_STANDINGS_LEAGUES: SupportedStandingsLeague[] = [
  "NBA",
  "NFL",
  "MLB",
  "NHL",
  "WNBA",
  "CBB",
  "WCBB",
  "CFB",
];

const getContentHeight = ({
  compact,
  containerHeight,
}: {
  compact: boolean;
  containerHeight?: number;
}) => {
  if (!containerHeight) return undefined;

  const verticalPadding = compact ? 20 : 28;
  const chipHeight = compact ? 30 : 34;
  const cardGap = compact ? 8 : 10;

  return Math.max(0, containerHeight - verticalPadding - chipHeight - cardGap);
};

const getLayoutConstants = (compact: boolean) => ({
  sectionHeaderHeight: compact ? 12 : 16,
  sectionGap: compact ? 3 : 8,
  rowGap: compact ? 2 : 4,
  minimumRowHeight: compact ? 24 : 32,
  fallbackRowHeight: compact ? 32 : 36,
});

const getGroupedLayout = ({
  compact,
  contentHeight,
  sections,
}: {
  compact: boolean;
  contentHeight?: number;
  sections: StandingsSection[];
}): StandingsLayout => {
  const constants = getLayoutConstants(compact);
  const rowCount = sections.reduce(
    (sum, section) => sum + section.rows.length,
    0,
  );
  const sectionCount = sections.length;

  if (!contentHeight || rowCount === 0 || sectionCount === 0) {
    return {
      ...constants,
      rowHeight: constants.fallbackRowHeight,
      scrollable: true,
    };
  }

  const fixedHeight =
    sectionCount * constants.sectionHeaderHeight +
    sectionCount * constants.sectionGap +
    Math.max(sectionCount - 1, 0) * constants.sectionGap +
    sections.reduce(
      (sum, section) =>
        sum + Math.max(section.rows.length - 1, 0) * constants.rowGap,
      0,
    );
  const rowHeight = (contentHeight - fixedHeight) / rowCount;
  const scrollable = rowHeight < constants.minimumRowHeight;
  const resolvedRowHeight = scrollable
    ? constants.minimumRowHeight
    : Math.max(constants.minimumRowHeight, rowHeight);

  return {
    ...constants,
    contentHeight,
    rowHeight: resolvedRowHeight,
    scrollable,
  };
};

const getFlatLayout = ({
  compact,
  contentHeight,
  rowCount,
}: {
  compact: boolean;
  contentHeight?: number;
  rowCount: number;
}): StandingsLayout => {
  const constants = getLayoutConstants(compact);

  if (!contentHeight || rowCount === 0) {
    return {
      ...constants,
      rowHeight: constants.fallbackRowHeight,
      scrollable: true,
    };
  }

  const fixedHeight = Math.max(rowCount - 1, 0) * constants.rowGap;
  const rowHeight = (contentHeight - fixedHeight) / rowCount;
  const scrollable = rowHeight < constants.minimumRowHeight;
  const resolvedRowHeight = scrollable
    ? constants.minimumRowHeight
    : Math.max(constants.minimumRowHeight, rowHeight);

  return {
    ...constants,
    contentHeight,
    rowHeight: resolvedRowHeight,
    scrollable,
  };
};

const normalizeLeague = (
  league?: string,
): SupportedStandingsLeague | undefined => {
  const normalized = String(league ?? "").toUpperCase();

  return SUPPORTED_STANDINGS_LEAGUES.includes(
    normalized as SupportedStandingsLeague,
  )
    ? (normalized as SupportedStandingsLeague)
    : undefined;
};

const isSupportedLeague = (
  league?: string,
): league is SupportedStandingsLeague => Boolean(normalizeLeague(league));

const formatWinPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "-";
  const normalized = value > 1 ? value / 100 : value;
  return normalized.toFixed(3).replace(/^0/, "");
};

const getTeamLogo = (
  league: SupportedStandingsLeague,
  teamId: string,
  isDark: boolean,
) => {
  const team =
    league === "NBA"
      ? getNBATeamByESPNId(teamId)
      : league === "NFL"
        ? getNFLTeamByESPNId(teamId)
        : league === "MLB"
          ? getMLBTeamByEspnId(teamId)
          : league === "NHL"
            ? getNHLTeamByEspnId(teamId)
            : league === "WNBA"
              ? getWNBATeamByESPNId(teamId)
              : league === "CFB"
                ? getCFBTeamByESPNId(teamId)
                : getCBBTeamByESPNId(teamId);

  if (!team) return undefined;
  return isDark ? (team.logoLight ?? team.logo) : team.logo;
};

const fromLeagueStandings = (
  league: SupportedStandingsLeague,
  teams: StandingsTeam[],
  isDark: boolean,
): StandingsRow[] =>
  teams.map((team, index) => ({
    id: `${league}:${team.teamId}`,
    rank: team.rank || index + 1,
    name: team.name,
    abbreviation: team.abbreviation || team.name,
    record:
      team.overallRecord ??
      `${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ""}${
        team.otLosses ? `-${team.otLosses}` : ""
      }`,
    winPercent: team.winPercent,
    gamesBehind: team.gamesBehind,
    points: team.points,
    logo: getTeamLogo(league, team.teamId, isDark),
  }));

type DisplayConferenceStandings = ConferenceStandings & {
  displayName?: string | null;
};

const getConferenceTitle = (
  conference: DisplayConferenceStandings,
  fallbackIndex: number,
) =>
  conference.displayName ||
  conference.name ||
  conference.abbreviation ||
  `Conference ${fallbackIndex + 1}`;

const fromCollegeStandings = (
  league: SupportedStandingsLeague,
  teams: (CBBTeamRank | CFBTeamRank)[],
  isDark: boolean,
): StandingsRow[] => {
  return teams
    .sort((a, b) => (a.current || 999) - (b.current || 999))
    .map((team, index) => {
      const rankedTeam = team.team as {
        id?: string | number;
        name?: string;
        nickname?: string;
        shortName?: string;
        shortDisplayName?: string;
        abbreviation?: string;
        code?: string;
        logos?: { href?: string }[];
      } | null;

      return {
        id: `${league}:${rankedTeam?.id ?? index}`,
        rank: team.current || index + 1,
        name:
          rankedTeam?.shortDisplayName ??
          rankedTeam?.shortName ??
          rankedTeam?.name ??
          rankedTeam?.nickname ??
          rankedTeam?.abbreviation ??
          "Team",
        abbreviation:
          rankedTeam?.abbreviation ??
          rankedTeam?.code ??
          rankedTeam?.shortName ??
          rankedTeam?.name ??
          "Team",
        record: team.recordSummary || "-",
        points: team.points,
        logo: rankedTeam?.logos?.[0]?.href
          ? { uri: rankedTeam.logos[0].href }
          : rankedTeam?.id
            ? getTeamLogo(league, String(rankedTeam.id), isDark)
            : undefined,
      };
    });
};

function ProStandingsRows({
  league,
  isDark,
  compact,
  contentHeight,
}: {
  league: Exclude<SupportedStandingsLeague, "CBB" | "WCBB" | "CFB">;
  isDark: boolean;
  compact: boolean;
  contentHeight?: number;
}) {
  const styles = standingsWidgetStyles(isDark, compact);
  const { standings, loading, error } = useLeagueStandings(
    league as LeagueType,
  );

  const sections = useMemo(
    () =>
      (standings as DisplayConferenceStandings[])
        .map((conference, index) => {
          const teams = [...conference.standings].sort(
            (a, b) => (a.rank || 999) - (b.rank || 999),
          );

          return {
            title: getConferenceTitle(conference, index),
            rows: fromLeagueStandings(league, teams, isDark),
          };
        })
        .filter((section) => section.rows.length > 0),
    [isDark, league, standings],
  );
  const layout = useMemo(
    () => getGroupedLayout({ compact, contentHeight, sections }),
    [compact, contentHeight, sections],
  );

  return (
    <GroupedStandingsRows
      error={error}
      loading={loading}
      compact={compact}
      layout={layout}
      sections={sections}
      styles={styles}
    />
  );
}

function CollegeBasketballRows({
  league,
  isDark,
  compact,
  contentHeight,
}: {
  league: "CBB" | "WCBB";
  isDark: boolean;
  compact: boolean;
  contentHeight?: number;
}) {
  const styles = standingsWidgetStyles(isDark, compact);
  const { rankings, loading, error } = useCBBRankings(league);
  const selectedPoll =
    rankings.find((poll) => poll.type === "ap") ?? rankings[0];

  const rows = useMemo(
    () => fromCollegeStandings(league, selectedPoll?.ranks ?? [], isDark),
    [isDark, league, selectedPoll?.ranks],
  );
  const layout = useMemo(
    () => getFlatLayout({ compact, contentHeight, rowCount: rows.length }),
    [compact, contentHeight, rows.length],
  );

  return (
    <StandingsRows
      error={error}
      loading={loading}
      compact={compact}
      layout={layout}
      rows={rows}
      styles={styles}
    />
  );
}

function CollegeFootballRows({
  isDark,
  compact,
  contentHeight,
}: {
  isDark: boolean;
  compact: boolean;
  contentHeight?: number;
}) {
  const styles = standingsWidgetStyles(isDark, compact);
  const { rankings, loading, error } = useCFBRankings();
  const selectedPoll =
    rankings.find((poll) => poll.type === "cfp") ??
    rankings.find((poll) => poll.type === "ap") ??
    rankings[0];

  const rows = useMemo(
    () => fromCollegeStandings("CFB", selectedPoll?.ranks ?? [], isDark),
    [isDark, selectedPoll?.ranks],
  );
  const layout = useMemo(
    () => getFlatLayout({ compact, contentHeight, rowCount: rows.length }),
    [compact, contentHeight, rows.length],
  );

  return (
    <StandingsRows
      error={error}
      loading={loading}
      compact={compact}
      layout={layout}
      rows={rows}
      styles={styles}
    />
  );
}

function StandingsRows({
  error,
  loading,
  compact,
  layout,
  rows,
  styles,
}: {
  error: string | null;
  loading: boolean;
  compact: boolean;
  layout: StandingsLayout;
  rows: StandingsRow[];
  styles: ReturnType<typeof standingsWidgetStyles>;
}) {
  if (loading) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>Loading standings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.errorText}>Failed to load standings</Text>
      </View>
    );
  }

  if (!rows.length) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>No standings available.</Text>
      </View>
    );
  }

  const table = (
    <StandingsTable
      rows={rows}
      compact={compact}
      layout={layout}
      styles={styles}
    />
  );

  if (!layout.scrollable)
    return <View style={styles.contentArea}>{table}</View>;

  return (
    <ScrollView
      style={styles.contentScroll}
      contentContainerStyle={styles.flatContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {table}
    </ScrollView>
  );
}

function GroupedStandingsRows({
  error,
  loading,
  compact,
  layout,
  sections,
  styles,
}: {
  error: string | null;
  loading: boolean;
  compact: boolean;
  layout: StandingsLayout;
  sections: { title: string; rows: StandingsRow[] }[];
  styles: ReturnType<typeof standingsWidgetStyles>;
}) {
  if (loading) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>Loading standings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.errorText}>Failed to load standings</Text>
      </View>
    );
  }

  if (!sections.length) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>No standings available.</Text>
      </View>
    );
  }

  const content = (
    <View style={[styles.groupedContent, { gap: layout.sectionGap }]}>
      {sections.map((section) => (
        <ConferenceSection
          key={section.title}
          title={section.title}
          rows={section.rows}
          compact={compact}
          layout={layout}
          styles={styles}
        />
      ))}
    </View>
  );

  if (!layout.scrollable) {
    return <View style={styles.contentArea}>{content}</View>;
  }

  return (
    <ScrollView
      style={styles.contentScroll}
      contentContainerStyle={styles.groupedContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {content}
    </ScrollView>
  );
}

function ConferenceSection({
  title,
  rows,
  compact,
  layout,
  styles,
}: {
  title: string;
  rows: StandingsRow[];
  compact: boolean;
  layout: StandingsLayout;
  styles: ReturnType<typeof standingsWidgetStyles>;
}) {
  return (
    <View style={[styles.conferenceSection, { gap: layout.sectionGap }]}>
      <Text
        style={[styles.conferenceTitle, { height: layout.sectionHeaderHeight }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <StandingsTable
        rows={rows}
        compact={compact}
        layout={layout}
        styles={styles}
      />
    </View>
  );
}

function StandingsTable({
  rows,
  compact,
  layout,
  styles,
}: {
  rows: StandingsRow[];
  compact: boolean;
  layout: StandingsLayout;
  styles: ReturnType<typeof standingsWidgetStyles>;
}) {
  return (
    <View style={[styles.table, { gap: layout.rowGap }]}>
      {rows.map((team) => (
        <View
          key={team.id}
          style={[
            styles.row,
            layout.rowHeight ? { height: layout.rowHeight } : null,
          ]}
        >
          <Text style={styles.rank}>{team.rank}</Text>

          {team.logo ? (
            <Image source={team.logo} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback} />
          )}

          <Text style={styles.teamName} numberOfLines={1}>
            {team.abbreviation || team.name}
          </Text>

          <Text style={styles.record}>{team.record}</Text>

          {!compact && (
            <Text style={styles.meta}>
              {team.points != null
                ? `${team.points} pts`
                : team.gamesBehind != null
                  ? `${team.gamesBehind} GB`
                  : formatWinPercent(team.winPercent)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function StandingsWidget({
  isDark,
  size = "medium",
  containerWidth,
  containerHeight,
  widgetId,
  widgetSize = size,
  isEditing = false,
  availableSizeOptions,
  onResizeWidget,
  onRemoveWidget,
  onMoveWidget,
  canMoveUp,
  canMoveDown,
  favoriteLeagues = [],
  initialLeague,
}: StandingsWidgetProps) {
  const compact =
    size === "small" || (containerWidth != null && containerWidth < 260);

  const styles = standingsWidgetStyles(isDark, compact);
  const showActions = isEditing && widgetId != null;

  const contentHeight = getContentHeight({ compact, containerHeight });

  const preferredLeague = useMemo<SupportedStandingsLeague>(() => {
    const normalizedInitialLeague = normalizeLeague(initialLeague);

    if (normalizedInitialLeague) return normalizedInitialLeague;

    const normalizedFavoriteLeague = favoriteLeagues
      .map(normalizeLeague)
      .find(Boolean);

    return normalizedFavoriteLeague ?? "NBA";
  }, [favoriteLeagues, initialLeague]);

  const [selectedLeague, setSelectedLeague] =
    useState<SupportedStandingsLeague>(preferredLeague);
  const [displayedLeague, setDisplayedLeague] =
    useState<SupportedStandingsLeague>(preferredLeague);
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setSelectedLeague((current) =>
      isSupportedLeague(current) ? current : preferredLeague,
    );
  }, [preferredLeague]);

  const leagueOptions = useMemo(() => {
    const favorites = favoriteLeagues
      .map(normalizeLeague)
      .filter(Boolean) as SupportedStandingsLeague[];

    return [
      ...favorites,
      ...SUPPORTED_STANDINGS_LEAGUES.filter(
        (league) => !favorites.includes(league),
      ),
    ];
  }, [favoriteLeagues]);

  const handleLeaguePress = (league: SupportedStandingsLeague) => {
    if (league === selectedLeague) return;

    setSelectedLeague(league);
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setDisplayedLeague(league);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View
      style={[
        styles.card,
        containerHeight ? { height: containerHeight } : null,
      ]}
    >
      <Text style={styles.heading} numberOfLines={1}>
        Standings
      </Text>
      <ScrollView
        horizontal
        style={styles.chipScroll}
        contentContainerStyle={styles.chips}
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        {leagueOptions.map((league) => {
          const selected = selectedLeague === league;

          return (
            <TouchableOpacity
              key={league}
              activeOpacity={activeOpacity}
              onPress={() => handleLeaguePress(league)}
              style={[styles.chip, selected && styles.selectedChip]}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Text
                style={[styles.chipText, selected && styles.selectedChipText]}
                numberOfLines={1}
              >
                {league}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Animated.View
        style={[styles.animatedContent, { opacity: contentOpacity }]}
      >
        {displayedLeague === "CBB" || displayedLeague === "WCBB" ? (
          <CollegeBasketballRows
            league={displayedLeague}
            isDark={isDark}
            compact={compact}
            contentHeight={contentHeight}
          />
        ) : displayedLeague === "CFB" ? (
          <CollegeFootballRows
            isDark={isDark}
            compact={compact}
            contentHeight={contentHeight}
          />
        ) : (
          <ProStandingsRows
            league={displayedLeague}
            isDark={isDark}
            compact={compact}
            contentHeight={contentHeight}
          />
        )}
      </Animated.View>

      {showActions && widgetId && (
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
      )}
    </View>
  );
}
