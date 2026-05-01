import NBAPlayoffsDark from "assets/Logos/NBAPlayoffs.png";
import NBAPlayoffsLight from "assets/Logos/NBAPlayoffsLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import {
  getColCenter,
  nbaPlayoffBracketStyles,
} from "styles/NBAPlayoffBraketStyles";
import { PlayoffBracket } from "types/nba";
import {
  COLS,
  ConnectorLayer,
  EAST_ROUND1_LAYOUTS,
  EAST_ROUND2_LAYOUTS,
  EAST_ROUND3_LAYOUTS,
  FINALS_LAYOUT,
  WEST_ROUND1_LAYOUTS,
  WEST_ROUND2_LAYOUTS,
  WEST_ROUND3_LAYOUTS,
} from "./ConnectorLayer";
import { MatchupCard } from "./MatchupCard";
import { RoundLabel } from "./RoundLabel";

export function NBAPlayoffBracket({
  bracket,
  loading,
  error,
  refreshing,
  onRefresh,
}: {
  bracket: PlayoffBracket | null;
  loading: boolean;
  error: string | null;
  refreshing: any;
  onRefresh: any;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => nbaPlayoffBracketStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text style={global.errorText}>{error}</Text>;
  }

  if (!bracket) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No playoff bracket available.</Text>
        <Text style={global.emptySubText}>
          Playoff series will appear here once the postseason data is available.
        </Text>
      </View>
    );
  }

  const PlayoffsLogo = isDark ? NBAPlayoffsLight : NBAPlayoffsDark;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.canvas}>
          <Text style={[styles.sideLabel, styles.westLabel]}>WEST</Text>
          <Text style={[styles.sideLabel, styles.eastLabel]}>EAST</Text>

          <RoundLabel
            title="FIRST ROUND"
            x={getColCenter(COLS.WEST_R1)}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE SEMIFINALS"
            x={getColCenter(COLS.WEST_R2)}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE FINALS"
            x={getColCenter(COLS.WEST_R3)}
            isDark={isDark}
          />

          <RoundLabel
            title="NBA FINALS"
            x={getColCenter(COLS.FINALS)}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE FINALS"
            x={getColCenter(COLS.EAST_R3)}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE SEMIFINALS"
            x={getColCenter(COLS.EAST_R2)}
            isDark={isDark}
          />

          <RoundLabel
            title="FIRST ROUND"
            x={getColCenter(COLS.EAST_R1)}
            isDark={isDark}
          />
          <Image
            source={PlayoffsLogo}
            style={styles.playoffsLogo}
            resizeMode="contain"
          />

          <ConnectorLayer isDark={isDark} />

          {bracket.west[0].map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              layout={WEST_ROUND1_LAYOUTS[index]}
              isDark={isDark}
            />
          ))}
          {bracket.west[1].map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              layout={WEST_ROUND2_LAYOUTS[index]}
              isDark={isDark}
            />
          ))}
          {bracket.west[2].map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              layout={WEST_ROUND3_LAYOUTS[index]}
              isDark={isDark}
            />
          ))}
          {bracket.east[2].map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              layout={EAST_ROUND3_LAYOUTS[index]}
              isDark={isDark}
            />
          ))}
          {bracket.east[1].map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              layout={EAST_ROUND2_LAYOUTS[index]}
              isDark={isDark}
            />
          ))}
          {bracket.east[0].map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              layout={EAST_ROUND1_LAYOUTS[index]}
              isDark={isDark}
            />
          ))}
          {bracket.finals ? (
            <MatchupCard
              matchup={bracket.finals}
              layout={FINALS_LAYOUT}
              isDark={isDark}
              finals={true}
            />
          ) : null}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
