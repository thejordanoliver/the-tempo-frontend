import { Image } from "expo-image";
import { useMemo } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { Colors } from "constants/styles";
import {
  MLB_BRACKET_COLUMN_WIDTH,
  MLBPlayoffBracketStyles,
} from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type {
  MLBPlayoffBracketResponse,
  MLBPlayoffLeague,
  MLBPlayoffRound,
  MLBPlayoffSeries,
  MLBPlayoffTeam,
} from "types/baseball/baseball";

type Props = {
  bracket: MLBPlayoffBracketResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isDark: boolean;
  onRefresh: () => Promise<void>;
};

type Matchup = Pick<
  MLBPlayoffSeries,
  "id" | "label" | "bestOf" | "teams" | "winnerTeamId"
>;

const ROUND_HEADER_HEIGHT = 32;
const ROUND_HEADER_GAP = 14;
const MATCHUP_HEIGHT = 142;
const MATCHUP_ROW_GAP = 36;
const COLUMN_GAP = 18;
const SECOND_MATCHUP_TOP = MATCHUP_HEIGHT + MATCHUP_ROW_GAP;
const CHAMPIONSHIP_TOP = SECOND_MATCHUP_TOP / 2;
const ROUND_BODY_HEIGHT = SECOND_MATCHUP_TOP + MATCHUP_HEIGHT;
const TOP_TEAM_CONNECTOR_OFFSET = 34;
const BOTTOM_TEAM_CONNECTOR_OFFSET = 82;
const LEAGUE_BOARD_WIDTH =
  MLB_BRACKET_COLUMN_WIDTH * 3 + COLUMN_GAP * 2;

function MatchupCard({ matchup, isDark }: { matchup: Matchup; isDark: boolean }) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const rows: (MLBPlayoffTeam | null)[] = [
    matchup.teams[0] ?? null,
    matchup.teams[1] ?? null,
  ];
  const winsNeeded = Math.floor(matchup.bestOf / 2) + 1;
  const knownTeams = rows.filter((team): team is MLBPlayoffTeam => Boolean(team));
  const leadingTeam = [...knownTeams].sort((a, b) => b.wins - a.wins)[0];
  const trailingTeam = [...knownTeams].sort((a, b) => a.wins - b.wins)[0];
  const seriesTied =
    knownTeams.length === 2 && knownTeams[0].wins === knownTeams[1].wins;
  const winner =
    knownTeams.find((team) => team.id === matchup.winnerTeamId) ??
    knownTeams.find((team) => team.wins >= winsNeeded);
  const footer = winner
    ? `${winner.abbreviation} won series ${winner.wins}-${trailingTeam?.wins ?? 0}`
    : seriesTied && knownTeams[0].wins > 0
      ? `Series tied ${knownTeams[0].wins}-${knownTeams[1].wins}`
      : leadingTeam && trailingTeam && leadingTeam.wins > trailingTeam.wins
        ? `${leadingTeam.abbreviation} leads ${leadingTeam.wins}-${trailingTeam.wins}`
        : `Best of ${matchup.bestOf}`;

  return (
    <View style={styles.matchup}>
      {rows.map((team, index) => {
        const isKnownTeam = Boolean(
          team &&
            team.seed > 0 &&
            !team.id.startsWith("placeholder:") &&
            team.abbreviation !== "TBD" &&
            !team.abbreviation.includes("/"),
        );
        const isWinner = isKnownTeam && team?.id === winner?.id;
        const isEliminated = Boolean(winner && isKnownTeam && !isWinner);
        return (
          <View key={team?.id ?? `tbd-${index}`}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.teamRow}>
              <Text style={[styles.seed, isEliminated && styles.eliminatedText]}>
                {isKnownTeam ? team?.seed : "-"}
              </Text>
              {isKnownTeam && team?.logo ? (
                <Image source={{ uri: team.logo }} style={styles.logo} contentFit="contain" />
              ) : (
                <View style={styles.logo} />
              )}
              <Text
                numberOfLines={1}
                style={[styles.teamName, isEliminated && styles.eliminatedText]}
              >
                {isKnownTeam ? team?.abbreviation : "TBD"}
              </Text>
              <View style={[styles.winsBadge, isWinner && styles.winnerBadge]}>
                <Text style={[styles.wins, isWinner && styles.winnerWins]}>
                  {isKnownTeam ? team?.wins : "-"}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
      <Text numberOfLines={1} style={styles.seriesLabel}>{footer}</Text>
    </View>
  );
}

function findSeries(
  bracket: MLBPlayoffBracketResponse,
  league: MLBPlayoffLeague,
  round: MLBPlayoffRound,
) {
  return bracket.series.filter((series) => series.league === league && series.round === round);
}

function seededMatchup(
  bracket: MLBPlayoffBracketResponse,
  league: Exclude<MLBPlayoffLeague, "world-series">,
  seeds: number[],
  label: string,
  bestOf: number,
): Matchup {
  return {
    id: `${league}-${seeds.join("-")}`,
    label,
    bestOf,
    teams: seeds.map((seed) => bracket.teams.find((team) => team.league === league && team.seed === seed)).filter(Boolean) as MLBPlayoffTeam[],
    winnerTeamId: null,
  };
}

function lowestKnownSeed(matchup: Matchup) {
  const seeds = matchup.teams
    .map((team) => team.seed)
    .filter((seed) => seed > 0);

  return seeds.length > 0 ? Math.min(...seeds) : Number.MAX_SAFE_INTEGER;
}

function LeagueBracket({ bracket, league, title, isDark }: {
  bracket: MLBPlayoffBracketResponse;
  league: "american" | "national";
  title: string;
  isDark: boolean;
}) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const wildCard = findSeries(bracket, league, "wild-card");
  const division = findSeries(bracket, league, "division-series");
  const championship = findSeries(bracket, league, "championship-series");
  const wildCardMatchups = wildCard.length
    ? [...wildCard].sort(
        (a, b) => lowestKnownSeed(b) - lowestKnownSeed(a),
      )
    : [
        seededMatchup(bracket, league, [4, 5], "Wild Card", 3),
        seededMatchup(bracket, league, [3, 6], "Wild Card", 3),
      ];
  const divisionMatchups = division.length
    ? [...division].sort(
        (a, b) => lowestKnownSeed(a) - lowestKnownSeed(b),
      )
    : [
        seededMatchup(bracket, league, [1], "No. 1 vs 4/5 winner", 5),
        seededMatchup(bracket, league, [2], "No. 2 vs 3/6 winner", 5),
      ];
  const championshipMatchups = championship.length
    ? championship
    : [{ id: `${league}-cs`, label: "League Championship", bestOf: 7, teams: [], winnerTeamId: null }];

  const columns = [
    { key: "wild-card", title: "Wild Card", matchups: wildCardMatchups },
    { key: "division-series", title: "Division Series", matchups: divisionMatchups },
    { key: "championship", title: "Championship", matchups: championshipMatchups },
  ];
  const orderedColumns = league === "national" ? [...columns].reverse() : columns;
  const connectorTop =
    ROUND_HEADER_HEIGHT +
    ROUND_HEADER_GAP +
    BOTTOM_TEAM_CONNECTOR_OFFSET;
  const connectorBottom = connectorTop + SECOND_MATCHUP_TOP;
  const connectorMiddle =
    ROUND_HEADER_HEIGHT +
    ROUND_HEADER_GAP +
    CHAMPIONSHIP_TOP +
    MATCHUP_HEIGHT / 2;
  const worldSeriesConnectorTop =
    ROUND_HEADER_HEIGHT +
    ROUND_HEADER_GAP +
    CHAMPIONSHIP_TOP +
    (league === "american"
      ? TOP_TEAM_CONNECTOR_OFFSET
      : BOTTOM_TEAM_CONNECTOR_OFFSET);

  const connectorLayer = (() => {
    const firstGapLeft = MLB_BRACKET_COLUMN_WIDTH;
    const secondGapLeft =
      MLB_BRACKET_COLUMN_WIDTH * 2 + COLUMN_GAP;
    const branchGapLeft =
      league === "american" ? secondGapLeft : firstGapLeft;
    const directGapLeft =
      league === "american" ? firstGapLeft : secondGapLeft;
    const halfGap = COLUMN_GAP / 2;
    const branchMidpoint = branchGapLeft + halfGap;

    const branchFromLeft = league === "american";
    const branchLegLeft = branchFromLeft
      ? branchGapLeft
      : branchMidpoint;
    const branchMiddleLeft = branchFromLeft
      ? branchMidpoint
      : branchGapLeft;
    const worldSeriesLeft =
      league === "american" ? LEAGUE_BOARD_WIDTH : -COLUMN_GAP;

    return (
      <View pointerEvents="none" style={styles.connectorLayer}>
        <View
          style={[
            styles.connectorHorizontal,
            {
              left: directGapLeft,
              top: connectorTop,
              width: COLUMN_GAP,
            },
          ]}
        />
        <View
          style={[
            styles.connectorHorizontal,
            {
              left: directGapLeft,
              top: connectorBottom,
              width: COLUMN_GAP,
            },
          ]}
        />

        <View
          style={[
            styles.connectorHorizontal,
            {
              left: branchLegLeft,
              top: connectorTop,
              width: halfGap,
            },
          ]}
        />
        <View
          style={[
            styles.connectorHorizontal,
            {
              left: branchLegLeft,
              top: connectorBottom,
              width: halfGap,
            },
          ]}
        />
        <View
          style={[
            styles.connectorVertical,
            {
              left: branchMidpoint,
              top: connectorTop,
              height: connectorBottom - connectorTop,
            },
          ]}
        />
        <View
          style={[
            styles.connectorHorizontal,
            {
              left: branchMiddleLeft,
              top: connectorMiddle,
              width: halfGap,
            },
          ]}
        />

        <View
          style={[
            styles.connectorHorizontal,
            {
              left: worldSeriesLeft,
              top: worldSeriesConnectorTop,
              width: COLUMN_GAP,
            },
          ]}
        />
      </View>
    );
  })();

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.leagueTitle}>{title}</Text>
      <View style={styles.leagueBoard}>
        {connectorLayer}
        {orderedColumns.map((column) => (
          <View key={column.title} style={styles.column}>
            <View style={{ height: ROUND_HEADER_HEIGHT }}>
              <Text style={styles.roundTitle}>{column.title}</Text>
            </View>
            <View style={[styles.matchups, { height: ROUND_BODY_HEIGHT }]}>
              {column.matchups.map((matchup, index) => {
                const top =
                  column.key === "championship"
                    ? CHAMPIONSHIP_TOP
                    : index * SECOND_MATCHUP_TOP;

                return (
                  <View
                    key={matchup.id}
                    style={{ position: "absolute", left: 0, right: 0, top }}
                  >
                    <MatchupCard matchup={matchup} isDark={isDark} />
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MLBPlayoffBracket({ bracket, loading, refreshing, error, isDark, onRefresh }: Props) {
  const styles = useMemo(() => MLBPlayoffBracketStyles(isDark), [isDark]);

  if (loading && !bracket) {
    return <View style={styles.container}><ActivityIndicator color={isDark ? Colors.white : Colors.black} /></View>;
  }

  if (!bracket) {
    return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}><Text style={styles.empty}>{error ?? "No MLB playoff bracket available."}</Text></ScrollView>;
  }

  const worldSeries = findSeries(bracket, "world-series", "world-series")[0] ?? {
    id: "world-series",
    label: "World Series",
    bestOf: 7,
    teams: [],
    winnerTeamId: null,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LeagueBracket bracket={bracket} league="american" title="American League" isDark={isDark} />
        <View style={{ gap: 12 }}>
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[styles.leagueTitle, { opacity: 0 }]}
          >
            World Series
          </Text>
          <View style={styles.column}>
            <View style={{ height: ROUND_HEADER_HEIGHT }}>
              <Text style={styles.roundTitle}>World Series</Text>
            </View>
            <View style={{ height: ROUND_BODY_HEIGHT, position: "relative" }}>
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: CHAMPIONSHIP_TOP,
                }}
              >
                <MatchupCard matchup={worldSeries} isDark={isDark} />
              </View>
            </View>
          </View>
        </View>
        <LeagueBracket bracket={bracket} league="national" title="National League" isDark={isDark} />
      </ScrollView>
    </ScrollView>
  );
}
