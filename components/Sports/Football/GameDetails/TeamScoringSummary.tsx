import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { ScoringPlays } from "@/hooks/FootballHooks/useFootballGameDetails";
import { formatPeriod } from "@/utils/games";
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

export default function TeamScoringSummary({
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
  const styles = TeamScoringSummaryStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("all");

  const plays = useMemo(() => {
    return Array.isArray(scoringPlays) ? scoringPlays : [];
  }, [scoringPlays]);

  const filteredPlays = useMemo(() => {
    if (selectedTab === "all") {
      return plays;
    }

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

  if (!loading && plays.length === 0) {
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
          showAllTab
        />

        {!loading && filteredPlays.length === 0 ? (
          <View style={global.emptyContainer}>
            <Text style={global.emptyText}>
              {selectedTab === "all"
                ? "No scoring plays available."
                : "No scoring plays for this team."}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.listContainer}>
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
                  <View style={styles.status}>
                    <Text numberOfLines={1} style={styles.statusText}>
                      {period}
                    </Text>

                    {!!clock && (
                      <Text numberOfLines={1} style={styles.clockText}>
                        {clock}
                      </Text>
                    )}
                  </View>

                  <View style={styles.play}>
                    <Text style={styles.playText}>{play.text}</Text>
                  </View>

                  <View style={styles.score}>
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

const TeamScoringSummaryStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      overflow: "hidden",
      maxHeight: 400,
      borderWidth: 1,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    listContainer: {
      marginTop: 4,
    },

    playRow: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,
    },

    lastPlayRow: {
      borderBottomWidth: 0,
    },

    status: {
      width: 64,
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },

    statusText: {
      fontSize: 14,
      lineHeight: 16,
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },

    clockText: {
      fontSize: 14,
      lineHeight: 16,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
    },

    play: {
      flex: 1,
      minWidth: 0,
    },

    playText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    score: {
      minWidth: 48,
      flexShrink: 0,
      alignItems: "flex-end",
      justifyContent: "center",
      paddingTop: 1,
    },

    scoreText: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "right",
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
  });
