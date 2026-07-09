import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { ScoringPlays } from "@/hooks/FootballHooks/useFootballGameDetails";
import { formatPeriod } from "@/utils/games";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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

  awayTeamEspnId?: number | string | null;
  homeTeamEspnId?: number | string | null;

  isDark: boolean;
  league: string;
  state?: string;
};

type TeamIds = {
  localId: string | null;
  espnId: string | null;
};

const normalizeId = (id?: number | string | null): string | null => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  return String(id);
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
  awayTeamEspnId,
  homeTeamEspnId,
  isDark,
  state,
}: Props) {
  const styles = TeamScoringSummaryStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

  const plays = useMemo(() => {
    return Array.isArray(scoringPlays) ? scoringPlays : [];
  }, [scoringPlays]);

  const teamIds = useMemo<Record<HomeAwayTabValue, TeamIds>>(
    () => ({
      away: {
        localId: normalizeId(awayId),
        espnId: normalizeId(awayTeamEspnId ?? awayId),
      },
      home: {
        localId: normalizeId(homeId),
        espnId: normalizeId(homeTeamEspnId ?? homeId),
      },
    }),
    [awayId, awayTeamEspnId, homeId, homeTeamEspnId],
  );

  const selectedTeamIds = teamIds[selectedTab];

  const teamPlays = useMemo(() => {
    return plays.filter((play) => {
      const playTeamId = normalizeId(play.team?.id);

      if (!playTeamId) {
        return false;
      }

      return (
        playTeamId === selectedTeamIds.localId ||
        playTeamId === selectedTeamIds.espnId
      );
    });
  }, [plays, selectedTeamIds]);

  const normalizedState = state?.toLowerCase();

  if (normalizedState !== "post" && normalizedState !== "in") {
    return null;
  }

  if (!loading && plays.length === 0) {
    return null;
  }

  if (!loading && teamPlays.length === 0) {
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
          />

          <View style={global.emptyContainer}>
            <Text style={global.emptyText}>
              No scoring plays for this team.
            </Text>
          </View>
        </View>
      </View>
    );
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
        />

        <View style={styles.listContainer}>
          {teamPlays.map((play, index) => {
            const period = formatPeriod({
              period: play.period?.number,
            });

            const clock = play.clock?.displayValue;
            const isLastPlay = index === teamPlays.length - 1;

            return (
              <View
                key={`${play.id}-${index}`}
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
        </View>
      </View>
    </View>
  );
}

const TeamScoringSummaryStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      overflow: "hidden",
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
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },

    clockText: {
      fontSize: 14,
      lineHeight: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
    },

    play: {
      flex: 1,
      minWidth: 0,
    },

    playText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.OSREGULAR,
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
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
  });
