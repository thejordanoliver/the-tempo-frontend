import { ScoringPlays } from "@/hooks/FootballHooks/useFootballGameDetails";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/styles";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";

type Props = {
  scoringPlays?: ScoringPlays | null;
  loading?: boolean;

  awayTeamId?: number | string | null;
  homeTeamId?: number | string | null;

  awayLogo: any;
  homeLogo: any;
  awayCode: string;
  homeCode: string;

  awayTeamEspnId?: number | string | null;
  homeTeamEspnId?: number | string | null;

  isDark: boolean;
  league: string;
  gameStatusDescription: string;
};

export default function TeamScoringSummary({
  scoringPlays = [],
  loading = false,
  awayTeamId,
  homeTeamId,
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  awayTeamEspnId,
  homeTeamEspnId,
  isDark,
  league = "nfl",
  gameStatusDescription,
}: Props) {
  const styles = TeamScoringSummaryStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<"away" | "home">("away");

  const normalizeId = (id?: number | string | null): string | null => {
    if (id === null || id === undefined || id === "") return null;
    return String(id);
  };

  const plays = useMemo(() => {
    return Array.isArray(scoringPlays) ? scoringPlays : [];
  }, [scoringPlays]);

  const awayLocalId = useMemo(() => normalizeId(awayTeamId), [awayTeamId]);
  const homeLocalId = useMemo(() => normalizeId(homeTeamId), [homeTeamId]);

  const awayEspnId = useMemo(
    () => normalizeId(awayTeamEspnId ?? awayTeamId),
    [awayTeamEspnId, awayTeamId],
  );

  const homeEspnId = useMemo(
    () => normalizeId(homeTeamEspnId ?? homeTeamId),
    [homeTeamEspnId, homeTeamId],
  );

  const tabs = useMemo(
    () =>
      [
        {
          key: "away",
          label: awayCode ?? "Away",
          logo: awayLogo,
          localId: awayLocalId,
          espnId: awayEspnId,
        },
        {
          key: "home",
          label: homeCode ?? "Home",
          logo: homeLogo,
          localId: homeLocalId,
          espnId: homeEspnId,
        },
      ] as const,
    [
      awayCode,
      awayLogo,
      awayLocalId,
      awayEspnId,
      homeCode,
      homeLogo,
      homeLocalId,
      homeEspnId,
    ],
  );

  const selectedTeam = useMemo(() => {
    return tabs.find((team) => team.key === selectedTab);
  }, [tabs, selectedTab]);

  const teamPlays = useMemo(() => {
    if (!selectedTeam) return plays;

    return plays.filter((play) => {
      const playTeamId = normalizeId(play.team?.id);

      return (
        playTeamId === selectedTeam.espnId ||
        playTeamId === selectedTeam.localId
      );
    });
  }, [plays, selectedTeam]);

  const periodMap: Record<string, string> = {
    "1": "1st",
    "2": "2nd",
    "3": "3rd",
    "4": "4th",
    OT: "OT",
    OVERTIME: "OT",
  };

  if (!loading && plays.length === 0) return null;

  if (
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Canceled" ||
    gameStatusDescription === "Delayed" ||
    gameStatusDescription === "Postponed"
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Scoring Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((tab) => tab.key)}
          selected={selectedTab}
          onTabPress={(tabKey) => setSelectedTab(tabKey as "away" | "home")}
          isDark={isDark}
          renderLabel={(tabKey, isSelected, tabStyles) => {
            const team = tabs.find((tab) => tab.key === tabKey);

            if (!team) return null;

            return (
              <View style={styles.tabLabel}>
                {team.logo && (
                  <Image
                    source={team.logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {team.label}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.listContainer}>
          {teamPlays.map((play, index) => (
            <View
              key={`${selectedTab}-score-play-${index}`}
              style={styles.playRow}
            >
              <Text style={styles.periodText}>
                {periodMap[String(play.period?.number)] ?? "-"}
                <Text style={styles.clockText}>
                  {" "}
                  {play.clock?.displayValue ?? ""}
                </Text>
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.playDesc}>{play.text}</Text>
              </View>

              <Text style={styles.scoreText}>
                {play.awayScore}-{play.homeScore}
              </Text>
            </View>
          ))}

          {teamPlays.length === 0 && !loading && (
            <Text style={styles.empty}>No scoring plays for this team.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const TeamScoringSummaryStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
    },
    wrapper: {
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      paddingTop: 12,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    tabLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    listContainer: {
      marginTop: 12,
      gap: 12,
    },
    playRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.midTone : Colors.lightGray,
    },
    periodText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 60,
    },
    playDesc: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 1,
    },
    clockText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
      width: 45,
      textAlign: "right",
    },
    scoreText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.midTone : Colors.darkGray,
      width: 45,
      textAlign: "right",
    },
    empty: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      padding: 20,
      color: isDark ? Colors.midTone : Colors.darkGray,
    },
  });