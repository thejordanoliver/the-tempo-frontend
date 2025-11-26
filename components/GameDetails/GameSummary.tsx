import TabBar from "components/TabBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo, teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams, getTeamLogo as getCBBTeamLogo } from "constants/teamsCBB";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { LeagueType } from "types/types";
import HeadingTwo from "../Headings/HeadingTwo";

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
  const styles = getStyles(isDark);

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
    league === "CBB" ? ["All", "1st Half", "2nd Half"] : ["All", "1st", "2nd", "3rd", "4th"];

const QUARTER_MAP: Record<string, number[] | number> =
  league === "CBB"
    ? { "1st Half": [1], "2nd Half": [2] }
    : { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };

  const teamPlays = useMemo(() => {
    return plays
      ?.filter(sp => sp.period)
      .filter(sp => {
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
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Summary</HeadingTwo>

      <TabBar
        tabs={quarterTabs}
        selected={selectedQuarter}
        onTabPress={(tab) => setSelectedQuarter(tab as any)}
      />

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        snapToInterval={40}
        decelerationRate="fast"
      >
        {teamPlays?.map((play, index) => {
          const playTeamId = play.team?.id;
          const allTeams = league === "CBB" ? cbbTeams : nbaTeams;

          // Find team
          const teamObj =
            allTeams.find(t => String(t.espnID) === playTeamId) ||
            allTeams.find(t => String(t.espnID) === playTeamId);

          // Determine if we should show a logo
          let teamLogo: any = null;

          if (teamObj?.id) {
            teamLogo =
              league === "CBB"
                ? getCBBTeamLogo(teamObj.id, isDark, lighter)
                : getTeamLogo(teamObj.id, isDark);
          }

          return (
            <View key={index} style={styles.playRow}>
              <Text style={styles.periodText}>
                {periodMap[String(play.period?.number)] ?? "-"}
                <Text style={styles.clockText}> {play.clock?.displayValue ?? ""}</Text>
              </Text>

              {/* Only show logo if valid */}
              {teamLogo ? (
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
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginTop: 10, height: 600 },
    logo: { width: 26, height: 26 },
    listContainer: { marginTop: 12, gap: 12 },
    playRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.midTone,
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
  });
