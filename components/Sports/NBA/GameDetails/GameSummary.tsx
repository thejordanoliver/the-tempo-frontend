import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getNBATeam, getTeamLogo, teams as nbaTeams } from "constants/teams";
import {
  cbbTeams,
  getCBBTeam,
  getTeamLogo as getCBBTeamLogo,
} from "constants/teamsCBB";
import { getWNBATeam, getWNBATeamLogo, wnbaTeams } from "constants/teamsWNBA";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { CBBTeam, LeagueType, NBATeam } from "types/types";

type AnyTeam = NBATeam | CBBTeam;

interface Play {
  id: string;
  sequenceNumber: number;
  shootingPlay: boolean;
  coordinate: { x: number; y: number };
  pointsAttempted?: number;
  scoreValue?: number;
  team?: { id: string };
  text?: string;
  period?: { number: number; displayValue: string };
  clock?: { displayValue: string };
  awayScore: number;
  homeScore: number;
}

type Props = {
  plays?: Play[];
  loading?: boolean;
  isDark: boolean;
  league?: LeagueType;
};

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Animated row
function AnimatedPlayRow({
  children,
  style,
  isLatest,
}: {
  children: React.ReactNode;
  style: object;
  isLatest: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLatest) return;

    translateX.setValue(-200);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLatest]);

  return (
    <Animated.View style={[style, { transform: [{ translateX }], opacity }]}>
      {children}
    </Animated.View>
  );
}

export default function GameSummary({
  plays = [],
  loading = false,
  isDark,
  league = "NBA",
}: Props) {
  const styles = gameSummaryStyles(isDark);
  const global = globalStyles(isDark);

  const periodMap: Record<string, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    OT: "OT",
    OVERTIME: "OT",
  };

  const [selectedQuarter, setSelectedQuarter] = useState<
    "All" | "1st" | "2nd" | "3rd" | "4th" | "1st Half" | "2nd Half"
  >("All");

  const quarterTabs =
    league === "CBB"
      ? ["All", "1st Half", "2nd Half"]
      : ["All", "1st", "2nd", "3rd", "4th"];

  const QUARTER_MAP: Record<string, number[] | number> =
    league === "CBB"
      ? { "1st Half": [1], "2nd Half": [2] }
      : { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };

  // Call configureNext during render (before commit) so existing rows animate
  // downward when a new play is prepended. useEffect fires too late — by then
  // the layout has already jumped without animation.
  const prevPlaysLengthRef = useRef(plays.length);
  if (plays.length !== prevPlaysLengthRef.current) {
    prevPlaysLengthRef.current = plays.length;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  const teamPlays = useMemo(() => {
    return plays
      ?.filter((sp) => sp.period)
      .filter((sp) => {
        if (selectedQuarter === "All") return true;
        const periods = QUARTER_MAP[selectedQuarter];
        return Array.isArray(periods)
          ? periods.includes(sp.period!.number)
          : sp.period?.number === periods;
      })
      .sort((a, b) => {
        // Sort by sequenceNumber ascending
        const seqA = Number(a.sequenceNumber ?? 0);
        const seqB = Number(b.sequenceNumber ?? 0);
        return seqA - seqB;
      })
      .reverse(); // latest play on top
  }, [plays, selectedQuarter]);

  if (!loading && plays?.length === 0) return null;

  const latestPlayId = teamPlays?.[0]?.id;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <TabBar
          tabs={quarterTabs}
          selected={selectedQuarter}
          onTabPress={(tab) => setSelectedQuarter(tab as any)}
          isDark={isDark}
        />

        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {teamPlays?.map((play) => {
            const playTeamId = play.team?.id;

            const allTeams: AnyTeam[] =
              league === "CBB" || league === "WCBB"
                ? (cbbTeams as CBBTeam[])
                : league === "WNBA"
                  ? wnbaTeams
                  : (nbaTeams as NBATeam[]);

            const teamObj = allTeams.find(
              (team) => String(team.espnID) === playTeamId,
            );

            const showLogo =
              !!playTeamId &&
              play.text &&
              !play.text.toLowerCase().includes("start of") &&
              !play.text.toLowerCase().includes("end of");

            const team =
              league === "WNBA"
                ? getWNBATeam(teamObj?.id ?? 0)
                : getNBATeam(teamObj?.id ?? 0);
            const cbbTeam = getCBBTeam(teamObj?.id ?? 0);

            const teamLogo =
              league === "NBA"
                ? getTeamLogo(team?.id, isDark)
                : league === "WNBA"
                  ? getWNBATeamLogo(team?.id, isDark)
                  : getCBBTeamLogo(
                      league === "WCBB" ? cbbTeam?.wid : cbbTeam?.id,
                      isDark,
                    );

            const isLatest = play.id === latestPlayId;

            return (
              <AnimatedPlayRow
                key={play.id}
                style={styles.playRow}
                isLatest={isLatest}
              >
                <Text style={styles.periodText}>
                  {periodMap[String(play.period?.number)] ?? "-"}
                  <Text style={styles.clockText}>
                    {" "}
                    {play.clock?.displayValue ?? ""}
                  </Text>
                </Text>

                {showLogo && teamLogo && (
                  <Image source={teamLogo} style={styles.logo} />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.playDesc}>{play.text}</Text>
                </View>

                <Text style={styles.clockText}>
                  {play.awayScore}-{play.homeScore}
                </Text>
              </AnimatedPlayRow>
            );
          })}

          {teamPlays?.length === 0 && (
            <Text style={global.emptyText}>No plays available</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const gameSummaryStyles = (isDark: boolean) =>
  StyleSheet.create({
    logo: { width: 26, height: 26, marginRight: 8 },
    listContainer: { marginTop: 12, height: 400 },
    playRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.midTone,
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
      color: isDark ? Colors.lightGray : Colors.darkGray,
      width: 45,
      textAlign: "right",
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
    },
  });
