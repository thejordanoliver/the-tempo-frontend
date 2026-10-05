import { View } from "react-native";
import { RoundHeader } from "components/Sports/Playoffs/RoundHeader";
import { getMLBBracketLayoutStyles, MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffBracketResponse } from "types/baseball/baseball";
import { findSeries, seededMatchup, lowestKnownSeed, type Matchup } from "./mlbBracketUtils";
import { ByeTeamCard } from "./ByeTeamCard";
import { MatchupCard } from "./MatchupCard";
import { BracketConnectors } from "./BracketConnectors";

export function LeagueBracket({
  bracket,
  league,
  isDark,
  onSelectSeries,
}: {
  bracket: MLBPlayoffBracketResponse;
  league: "american" | "national";
  isDark: boolean;
  onSelectSeries: (matchup: Matchup) => void;
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
          games: [],
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

  return (
    <View style={styles.section}>
      <View style={styles.leagueBoard}>
        <BracketConnectors league={league} matchups={wildCardMatchups} isDark={isDark} />
        {orderedColumns.map((column) => (
          <View key={column.title} style={styles.column}>
            <RoundHeader title={column.title} isDark={isDark} />
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
                    <MatchupCard matchup={matchup} isDark={isDark} onPress={() => onSelectSeries(matchup)} />
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
