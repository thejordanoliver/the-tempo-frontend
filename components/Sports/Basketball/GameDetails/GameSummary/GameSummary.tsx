import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBars/TabBar";
import { globalStyles } from "constants/styles";
import { useNewSummaryPlays } from "hooks/useNewSummaryPlays";
import { memo, useMemo, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { GameSummaryStyles } from "styles/GameDetailStyles/GameSummaryStyles";
import type { GameSummaryModel } from "types/gameSummary";
import { filterGameSummaryPeriod } from "utils/games/gameSummaryPeriods";
import { gameTeamIdsMatch } from "utils/games/gameTeamIdentity";
import GameSummaryPlayRow from "./GameSummaryPlayRow";

type Props = {
  model: GameSummaryModel;
  scope: string;
  state?: string | null;
  loading?: boolean;
  isDark: boolean;
  homeId: string | number;
  awayId: string | number;
  homeLogo: ImageSourcePropType;
  awayLogo: ImageSourcePropType;
};

const PLAY_BATCH_SIZE = 30;

function GameSummary({
  model,
  scope,
  state,
  loading = false,
  isDark,
  homeId,
  awayId,
  homeLogo,
  awayLogo,
}: Props) {
  const styles = useMemo(() => GameSummaryStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [selectedPeriod, setSelectedPeriod] = useState("All");

  const [visibleCount, setVisibleCount] = useState(PLAY_BATCH_SIZE);
  const listRef = useRef<ScrollView>(null);

  const { plays: sortedPlays, periods: availablePeriods } = model;
  const periodTabs = availablePeriods.map((tab) => tab.label);
  if (!periodTabs.includes(selectedPeriod)) setSelectedPeriod("All");
  const filteredPlays = useMemo(
    () =>
      filterGameSummaryPeriod(sortedPlays, selectedPeriod, availablePeriods),
    [sortedPlays, selectedPeriod, availablePeriods],
  );

  const enteringPlays = useNewSummaryPlays(sortedPlays, scope, selectedPeriod);

  if (state === "pre" || (!loading && sortedPlays.length === 0)) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <TabBar
          tabs={periodTabs}
          selected={selectedPeriod}
          onTabPress={(tab) => {
            setSelectedPeriod(tab);
            setVisibleCount(PLAY_BATCH_SIZE);
            listRef.current?.scrollTo({ y: 0, animated: false });
          }}
          isDark={isDark}
        />

        <ScrollView
          ref={listRef}
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          scrollEventThrottle={100}
          onScroll={({ nativeEvent }) => {
            const { contentOffset, layoutMeasurement, contentSize } =
              nativeEvent;
            if (
              contentOffset.y + layoutMeasurement.height >=
              contentSize.height - 200
            ) {
              setVisibleCount((count) =>
                Math.max(
                  count,
                  Math.min(count + PLAY_BATCH_SIZE, filteredPlays.length),
                ),
              );
            }
          }}
        >
          {filteredPlays.slice(0, visibleCount).map((play, index) => {
            const teamLogo = gameTeamIdsMatch(play.teamId, homeId)
              ? homeLogo
              : gameTeamIdsMatch(play.teamId, awayId)
                ? awayLogo
                : null;
            const playText = play.text?.toLowerCase() ?? "";
            const showLogo =
              Boolean(teamLogo && playText) &&
              !playText.includes("start of") &&
              !playText.includes("end of");
            const scoring = play.scoring;

            return (
              <GameSummaryPlayRow
                key={play.id}
                animate={index < 30 && enteringPlays.has(play.id)}
                index={index}
                style={[styles.playRow, scoring && styles.scoringRow]}
              >
                <View style={styles.timeColumn}>
                  <Text style={styles.clockText}>{play.clock}</Text>
                  <Text style={styles.periodText}>{play.periodLabel}</Text>
                </View>
                <View style={styles.timelineColumn}>
                  <View
                    style={[styles.teamMarker, scoring && styles.scoringMarker]}
                  >
                    {showLogo && teamLogo ? (
                      <Image
                        source={teamLogo}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.neutralDot} />
                    )}
                  </View>
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.playContent}>
                  <View style={styles.playMeta}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.eventLabel,
                        scoring && styles.scoringLabel,
                      ]}
                    >
                      {play.eventLabel}
                    </Text>
                    <View
                      style={[
                        styles.scorePill,
                        scoring && styles.scoringScorePill,
                      ]}
                      accessible
                      accessibilityLabel={`Away ${play.awayScore ?? "unavailable"}, home ${play.homeScore ?? "unavailable"}`}
                    >
                      <Text style={styles.scoreText}>
                        {play.awayScore ?? "–"}
                      </Text>
                      <Text style={styles.scoreDivider}>–</Text>
                      <Text style={styles.scoreText}>
                        {play.homeScore ?? "–"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.playDesc}>{play.text}</Text>
                </View>
              </GameSummaryPlayRow>
            );
          })}

          {filteredPlays?.length === 0 && (
            <Text style={global.emptyText}>
              {loading ? "Loading plays…" : "No plays available"}
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default memo(GameSummary);
