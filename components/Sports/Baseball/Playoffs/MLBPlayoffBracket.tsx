import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { globalStyles } from "@/constants/styles";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import {
  getMLBBracketLayoutStyles,
  MLBPlayoffBracketStyles,
} from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffBracketResponse } from "types/baseball/baseball";
import { LeagueBracket } from "./LeagueBracket";
import { RoundHeader } from "components/Sports/Playoffs/RoundHeader";
import { MatchupCard } from "./MatchupCard";
import { SeriesGamesSheet } from "./SeriesGamesSheet";
import { findSeries, type Matchup } from "./mlbBracketUtils";

type Props = {
  bracket: MLBPlayoffBracketResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isDark: boolean;
  onRefresh: () => Promise<void>;
};

export function MLBPlayoffBracket({
  bracket,
  loading,
  refreshing,
  error,
  isDark,
  onRefresh,
}: Props) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const selectedSeries = bracket?.series.find((series) => series.id === selectedSeriesId) ?? null;
  const selectSeries = (matchup: Matchup) => setSelectedSeriesId(matchup.id);
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
    games: [],
    winnerTeamId: null,
  };

  return (
    <>
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
            onSelectSeries={selectSeries}
            isDark={isDark}
          />
          <View style={styles.section}>
            <View style={styles.column}>
              <RoundHeader title="World Series" isDark={isDark} />
              <View style={styles.roundBody}>
                <View
                  style={getMLBBracketLayoutStyles("american").championshipCard}
                >
                  <MatchupCard matchup={worldSeries} isDark={isDark} onPress={() => selectSeries(worldSeries)} />
                </View>
              </View>
            </View>
          </View>
          <LeagueBracket
            bracket={bracket}
            league="national"
            onSelectSeries={selectSeries}
            isDark={isDark}
          />
        </ScrollView>
      </ScrollView>
      <SeriesGamesSheet series={selectedSeries} isDark={isDark} onClose={() => setSelectedSeriesId(null)} />
    </>
  );
}
