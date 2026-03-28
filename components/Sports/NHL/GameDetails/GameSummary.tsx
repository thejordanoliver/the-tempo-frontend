import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBar";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { getNHLTeam } from "constants/teamsNHL";
import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
interface Play {
  id: string;
  team?: { id: string };
  text?: string;
  period?: { number: number };
  clock?: { displayValue: string };
  awayScore: number;
  homeScore: number;
}

type Props = {
  plays?: Play[];
  loading?: boolean;
  isDark: boolean;
};

const quarterTabs = ["All", "1st", "2nd", "3rd", "OT"] as const;

export default function GameSummary({
  plays = [],
  loading = false,
  isDark,
}: Props) {
  const styles = gameSummaryStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedPeriod, setSelectedPeriod] =
    useState<(typeof quarterTabs)[number]>("All");

  /* ---------------- FILTER + SORT ---------------- */
  const filteredPlays = useMemo(() => {
    let filtered = plays?.filter((p) => p.period);

    if (selectedPeriod !== "All") {
      const periodNumber =
        selectedPeriod === "OT"
          ? 4
          : Number(
              selectedPeriod
                .replace("st", "")
                .replace("nd", "")
                .replace("rd", ""),
            );

      filtered = filtered.filter((p) => p.period?.number === periodNumber);
    }

    return filtered.sort((a, b) => {
      const periodA = a.period?.number ?? 0;
      const periodB = b.period?.number ?? 0;

      // Sort by period ascending
      if (periodA !== periodB) return periodA - periodB;

      const parseClock = (clock?: string) => {
        if (!clock) return 0;
        const [min, sec] = clock.split(":").map(Number);
        return min * 60 + sec;
      };

      const timeA = parseClock(a.clock?.displayValue);
      const timeB = parseClock(b.clock?.displayValue);

      // Hockey clock counts DOWN.
      // Bigger clock time = earlier in period.
      // So we reverse it to get true chronological order.
      return timeA - timeB;
    });
  }, [plays, selectedPeriod]);

  if (!loading && plays?.length === 0) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <TabBar
          tabs={quarterTabs}
          selected={selectedPeriod}
          onTabPress={(tab) =>
            setSelectedPeriod(tab as (typeof quarterTabs)[number])
          }
          isDark
        />

        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredPlays?.map((play, index) => {
            const team = getNHLTeam(Number(play.team?.id));
            const teamLogo = isDark ? team?.logoLight : team?.logo;

            return (
              <View key={index} style={styles.playRow}>
                <Text style={styles.periodText}>
                  P{play.period?.number}
                  <Text style={styles.clockText}>
                    {" "}
                    {play.clock?.displayValue ?? ""}
                  </Text>
                </Text>

                {teamLogo && <Image source={teamLogo} style={styles.logo} />}

                <View style={{ flex: 1 }}>
                  <Text style={styles.playDesc}>{play.text}</Text>
                </View>

                <Text style={styles.clockText}>
                  {play.awayScore}-{play.homeScore}
                </Text>
              </View>
            );
          })}

          {filteredPlays?.length === 0 && (
            <Text style={global.emptyText}>No plays available</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

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
