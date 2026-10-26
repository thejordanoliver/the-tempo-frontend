import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { ScoringPlays } from "@/hooks/FootballHooks/useFootballGameDetails";
import { formatPeriod } from "@/utils/games/games";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";

type Props = {
  scoringPlays?: ScoringPlays | null;
  loading?: boolean;

  homeId: number | string;
  awayId: number | string;

  awayLogo: any;
  homeLogo: any;
  awayCode: string;
  homeCode: string;

  isDark: boolean;
  league: string;
  state?: string;
};

export default function ScoringSummary({
  scoringPlays = [],
  loading = false,
  homeId,
  awayId,
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  isDark,
  state,
}: Props) {
  const styles = ScoringSummaryStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

  const plays = useMemo(() => {
    return Array.isArray(scoringPlays) ? scoringPlays : [];
  }, [scoringPlays]);

  const filteredPlays = useMemo(() => {
    const selectedTeamId = selectedTab === "away" ? awayId : homeId;

    return plays.filter((play) => {
      const playTeamId = play.team?.id;

      if (playTeamId === null || playTeamId === undefined) {
        return false;
      }

      return String(playTeamId) === String(selectedTeamId);
    });
  }, [plays, selectedTab, awayId, homeId]);

  const normalizedState = state?.toLowerCase();

  if (normalizedState !== "post" && normalizedState !== "in") {
    return null;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Scoring Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <HomeAwayTabBar
          awayTeam={{
            id: awayId,
            name: awayCode?.trim() || "Away",
            logo: awayLogo,
          }}
          homeTeam={{
            id: homeId,
            name: homeCode?.trim() || "Home",
            logo: homeLogo,
          }}
          selected={selectedTab}
          onTabPress={setSelectedTab}
          isDark={isDark}
          showAllTab={false}
        />

        {!loading && filteredPlays.length === 0 ? (
          <View style={[global.emptyContainer, styles.emptyContainer]}>
            <Text style={global.emptyText}>
              {plays.length === 0
                ? "No scoring plays available"
                : "No scoring plays for this team"}
            </Text>
          </View>
        ) : (
          <ScrollView>
            {filteredPlays.map((play, index) => {
              const period = formatPeriod({
                period: play.period?.number,
              });

              const clock = play.clock?.displayValue;
              const isLastPlay = index === filteredPlays.length - 1;

              return (
                <View
                  key={`${play.id ?? "scoring-play"}-${index}`}
                  style={[styles.playRow, isLastPlay && styles.lastPlayRow]}
                >
                  <View style={styles.timeColumn}>
                    {clock && (
                      <Text numberOfLines={1} style={styles.clockText}>
                        {clock}
                      </Text>
                    )}
                    <Text numberOfLines={1} style={styles.periodText}>
                      {period}
                    </Text>
                  </View>

                  <View style={styles.play}>
                    <Text style={styles.playText}>{play.text}</Text>
                  </View>

                  <View style={styles.scorePill}>
                    <Text numberOfLines={1} style={styles.scoreText}>
                      {play.awayScore ?? 0}-{play.homeScore ?? 0}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const ScoringSummaryStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return StyleSheet.create({
    wrapper: {
      maxHeight: 400,
      borderWidth: 1,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "hidden",
    },

    emptyContainer: {
      flex: 0,
      flexShrink: 0,
      minHeight: 72,
    },

    playRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 72,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,
    },

    lastPlayRow: {
      borderBottomWidth: 0,
    },

    status: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      width: 64,
    },

    statusText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      lineHeight: 16,
      color: isDark ? Colors.white : Colors.black,
    },

    timeColumn: {
      width: 44,
      paddingTop: 3,
      alignItems: "flex-end",
    },

    clockText: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      lineHeight: 22,
      color: theme.text,
    },

    periodText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: theme.icon,
      marginTop: 2,
    },

    timelineColumn: {
      width: 32,
      alignItems: "center",
    },

    play: {
      flex: 1,
      minWidth: 0,
    },

    playText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    scorePill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: theme.itemBackground,
    },
    scoringScorePill: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.green,
    },
    scoreText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 15,
      color: theme.text,
      fontVariant: ["tabular-nums"],
    },
  });
};
