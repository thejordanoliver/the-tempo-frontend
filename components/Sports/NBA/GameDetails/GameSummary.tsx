import TabBar from "components/TabBar";
import { Colors, Fonts } from "constants/Styles";
import { getTeamInfo, getTeamLogo, teams as nbaTeams } from "constants/teams";
import {
  teams as cbbTeams,
  getTeamInfo as getCBBTeamInfo,
  getTeamLogo as getCBBTeamLogo,
} from "constants/teamsCBB";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { CBBTeam, LeagueType, NBATeam } from "types/types";
import HeadingTwo from "components/Headings/HeadingTwo";

type AnyTeam = NBATeam | CBBTeam;

interface Play {
  id: string;
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
  lighter?: boolean;
  league?: LeagueType;
  awayTeamId?: string;
  homeTeamId?: string;
};

export default function GameSummary({
  plays = [],
  loading = false,
  lighter = false,
  league = "NBA",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = gameSummaryStyles(isDark);

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
        const periodA = a.period?.number ?? 0;
        const periodB = b.period?.number ?? 0;
        if (periodA !== periodB) return periodA - periodB;

        const parseClock = (clock: string) => {
          if (!clock) return 0;
          const parts = clock.split(":").map(Number);
          return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] ?? 0;
        };
        return (
          parseClock(b.clock?.displayValue ?? "00:00") -
          parseClock(a.clock?.displayValue ?? "00:00")
        );
      });
  }, [plays, selectedQuarter]);

  if (!loading && plays?.length === 0) return null;

  return (
    <View>
      <HeadingTwo lighter={lighter}>Game Summary</HeadingTwo>
      <View style={styles.wrapper}>
        <TabBar
          tabs={quarterTabs}
          selected={selectedQuarter}
          onTabPress={(tab) => setSelectedQuarter(tab as any)}
        />
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {teamPlays?.map((play, index) => {
            const playTeamId = play.team?.id;
            const allTeams: AnyTeam[] =
              league === "CBB" || league === "WCBB"
                ? (cbbTeams as CBBTeam[])
                : (nbaTeams as NBATeam[]);

            const teamObj = allTeams.find(
              (team) => String(team.espnID) === playTeamId
            );

            const showLogo =
              !!playTeamId &&
              play.text &&
              !play.text.toLowerCase().includes("start of game") &&
              !play.text.toLowerCase().includes("start of") &&
              !play.text.toLowerCase().includes("end of");

            const team = getTeamInfo(teamObj?.id ?? 0);
            const cbbTeam = getCBBTeamInfo(teamObj?.id ?? 0);
            const wcbbTeam = getCBBTeamInfo(teamObj?.id ?? 0);

            const nbaLogo = getTeamLogo(team?.id, isDark);
            const cbbLogo = getCBBTeamLogo(
              league === "WCBB" ? wcbbTeam?.wid : cbbTeam?.id,
              isDark
            );

            const teamLogo =
              league === "CBB"
                ? cbbLogo
                : league === "WCBB"
                ? cbbLogo
                : nbaLogo;

            return (
              <View key={index} style={styles.playRow}>
                <Text style={styles.periodText}>
                  {periodMap[String(play.period?.number)] ?? "-"}
                  <Text style={styles.clockText}>
                    {" "}
                    {play.clock?.displayValue ?? ""}
                  </Text>
                </Text>

                {showLogo && teamLogo ? (
                  <Image source={teamLogo} style={styles.logo} />
                ) : null}

                <View style={{ flex: 1 }}>
                  <Text style={styles.playDesc}>{play.text}</Text>
                </View>

                <Text style={styles.clockText}>
                  {play.awayScore ?? ""}-{play.homeScore}
                </Text>
              </View>
            );
          })}

          {teamPlays?.length === 0 && (
            <Text style={styles.empty}>No plays available</Text>
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
    empty: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
    },
  });
