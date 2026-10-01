import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { globalStyles } from "@/constants/styles";
import { Image } from "expo-image";
import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import {
  getMLBBracketLayoutStyles,
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

function ByeTeamCard({
  team,
  seed,
  isDark,
}: {
  team: MLBPlayoffTeam | undefined;
  seed: number;
  isDark: boolean;
}) {
  const styles = MLBPlayoffBracketStyles(isDark);

  return (
    <View style={styles.byeCard}>
      <Text style={styles.seed}>{seed}</Text>
      {team?.logo ? (
        <Image
          source={{ uri: team.logo }}
          style={styles.logo}
          contentFit="contain"
        />
      ) : (
        <View style={styles.logo} />
      )}
      <Text numberOfLines={1} style={styles.teamName}>
        {team?.abbreviation ?? "TBD"}
      </Text>
      <Text style={styles.byeLabel}>BYE</Text>
    </View>
  );
}

function MatchupCard({
  matchup,
  isDark,
}: {
  matchup: Matchup;
  isDark: boolean;
}) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const rows: (MLBPlayoffTeam | null)[] = [
    matchup.teams[0] ?? null,
    matchup.teams[1] ?? null,
  ];
  const winsNeeded = Math.floor(matchup.bestOf / 2) + 1;
  const knownTeams = rows.filter((team): team is MLBPlayoffTeam =>
    Boolean(team),
  );
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
              <Text
                style={[styles.seed, isEliminated && styles.eliminatedText]}
              >
                {isKnownTeam ? team?.seed : "-"}
              </Text>
              {isKnownTeam && team?.logo ? (
                <Image
                  source={{ uri: team.logo }}
                  style={styles.logo}
                  contentFit="contain"
                />
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
      <Text numberOfLines={1} style={styles.seriesLabel}>
        {footer}
      </Text>
    </View>
  );
}

function findSeries(
  bracket: MLBPlayoffBracketResponse,
  league: MLBPlayoffLeague,
  round: MLBPlayoffRound,
) {
  return bracket.series.filter(
    (series) => series.league === league && series.round === round,
  );
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
    teams: seeds
      .map((seed) =>
        bracket.teams.find(
          (team) => team.league === league && team.seed === seed,
        ),
      )
      .filter(Boolean) as MLBPlayoffTeam[],
    winnerTeamId: null,
  };
}

function lowestKnownSeed(matchup: Matchup) {
  const seeds = matchup.teams
    .map((team) => team.seed)
    .filter((seed) => seed > 0);

  return seeds.length > 0 ? Math.min(...seeds) : Number.MAX_SAFE_INTEGER;
}

function LeagueBracket({
  bracket,
  league,
  title,
  isDark,
}: {
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
    ? [...wildCard].sort((a, b) => lowestKnownSeed(b) - lowestKnownSeed(a))
    : [
        seededMatchup(bracket, league, [4, 5], "Wild Card", 3),
        seededMatchup(bracket, league, [3, 6], "Wild Card", 3),
      ];
  const divisionMatchups = division.length
    ? [...division].sort((a, b) => lowestKnownSeed(a) - lowestKnownSeed(b))
    : [
        seededMatchup(bracket, league, [1], "No. 1 vs 4/5 winner", 5),
        seededMatchup(bracket, league, [2], "No. 2 vs 3/6 winner", 5),
      ];
  const championshipMatchups = championship.length
    ? championship
    : [
        {
          id: `${league}-cs`,
          label: "League Championship",
          bestOf: 7,
          teams: [],
          winnerTeamId: null,
        },
      ];

  const columns = [
    { key: "wild-card", title: "Wild Card", matchups: wildCardMatchups },
    {
      key: "division-series",
      title: "Division Series",
      matchups: divisionMatchups,
    },
    {
      key: "championship",
      title: "Championship",
      matchups: championshipMatchups,
    },
  ];
  const orderedColumns =
    league === "national" ? [...columns].reverse() : columns;
  const layout = getMLBBracketLayoutStyles(league);
  const connectorLayer = (
    <View pointerEvents="none" style={styles.connectorLayer}>
      {wildCardMatchups.map((matchup, index) => {
        const opening = getMLBBracketLayoutStyles(league, index);
        return (
          <View key={`bye-connector-${matchup.id}`} style={styles.connectorLayer}>
            <View style={[styles.connectorVertical, opening.byeBranch]} />
            <View style={[styles.connectorVertical, opening.wildCardBranch]} />
            <View style={[styles.connectorHorizontal, opening.byeLeg]} />
            <View style={[styles.connectorHorizontal, opening.wildCardLeg]} />
            <View style={[styles.connectorHorizontal, opening.openingOutput]} />
          </View>
        );
      })}
      <View style={[styles.connectorHorizontal, layout.divisionTopLeg]} />
      <View style={[styles.connectorHorizontal, layout.divisionBottomLeg]} />
      <View style={[styles.connectorVertical, layout.divisionBranch]} />
      <View style={[styles.connectorHorizontal, layout.championshipLeg]} />
      <View style={[styles.connectorHorizontal, layout.worldSeriesLeg]} />
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.leagueBoard}>
        {connectorLayer}
        {orderedColumns.map((column) => (
          <View key={column.title} style={styles.column}>
            <View style={styles.roundHeader}>
              <Text style={styles.roundTitle}>{column.title}</Text>
            </View>
            <View style={styles.matchups}>
              {column.matchups.map((matchup, index) => {
                const positions = getMLBBracketLayoutStyles(league, index);
                const position =
                  column.key === "championship"
                    ? positions.championshipCard
                    : column.key === "wild-card"
                      ? positions.wildCardCard
                      : positions.divisionCard;

                return (
                  <View key={matchup.id} style={position}>
                    <MatchupCard matchup={matchup} isDark={isDark} />
                  </View>
                );
              })}
              {column.key === "wild-card"
                ? wildCardMatchups.map((matchup, index) => {
                    const seed =
                      bracket.format.firstRoundByes[index] ?? index + 1;
                    const team = bracket.teams.find(
                      (item) => item.league === league && item.seed === seed,
                    );

                    return (
                      <View
                        key={`bye-${matchup.id}`}
                        style={getMLBBracketLayoutStyles(league, index).byeCard}
                      >
                        <ByeTeamCard team={team} seed={seed} isDark={isDark} />
                      </View>
                    );
                  })
                : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MLBPlayoffBracket({
  bracket,
  loading,
  refreshing,
  error,
  isDark,
  onRefresh,
}: Props) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = useMemo(() => MLBPlayoffBracketStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  if (loading && !bracket) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (!bracket) {
    return (
      <ScrollView contentContainerStyle={navigationContentStyle()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
          />
        }
      >
        <Text style={styles.empty}>
          {error ?? "No MLB playoff bracket available."}
        </Text>
      </ScrollView>
    );
  }

  const worldSeries = findSeries(
    bracket,
    "world-series",
    "world-series",
  )[0] ?? {
    id: "world-series",
    label: "World Series",
    bestOf: 7,
    teams: [],
    winnerTeamId: null,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={navigationContentStyle()}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <LeagueBracket
          bracket={bracket}
          league="american"
          title="American League"
          isDark={isDark}
        />
        <View style={styles.section}>
          <View style={styles.column}>
            <View style={styles.roundHeader}>
              <Text style={styles.roundTitle}>World Series</Text>
            </View>
            <View style={styles.roundBody}>
              <View
                style={getMLBBracketLayoutStyles("american").championshipCard}
              >
                <MatchupCard matchup={worldSeries} isDark={isDark} />
              </View>
            </View>
          </View>
        </View>
        <LeagueBracket
          bracket={bracket}
          league="national"
          title="National League"
          isDark={isDark}
        />
      </ScrollView>
    </ScrollView>
  );
}
