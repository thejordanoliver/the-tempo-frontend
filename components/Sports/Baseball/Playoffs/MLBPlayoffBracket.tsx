import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { RoundHeader } from "@/components/Sports/Basketball/Playoffs/NBAPlayoffs/RoundHeader";
import { globalStyles } from "@/constants/styles";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import {
  getMLBBracketLayoutStyles,
  MLBPlayoffBracketStyles,
} from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { MLBPlayoffBracketResponse } from "types/baseball/baseball";
import { findSeries } from "../../../../utils/mlbBracketUtils";
import { LeagueBracket } from "./LeagueBracket";
import { MatchupCard } from "./MatchupCard";

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
      <ScrollView
        contentContainerStyle={navigationContentStyle()}
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
          <LeagueBracket bracket={bracket} league="american" isDark={isDark} />
          <View style={styles.section}>
            <View style={styles.column}>
              <RoundHeader title="World Series" isDark={isDark} />
              <View style={styles.roundBody}>
                <View
                  style={getMLBBracketLayoutStyles("american").worldSeriesCard}
                >
                  <MatchupCard matchup={worldSeries} finals isDark={isDark} />
                </View>
              </View>
            </View>
          </View>
          <LeagueBracket bracket={bracket} league="national" isDark={isDark} />
        </ScrollView>
      </ScrollView>
    </>
  );
}
