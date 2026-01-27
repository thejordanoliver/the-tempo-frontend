import TabBar from "components/TabBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getMLBTeamByEspn, getTeamLogo } from "constants/teamsMLB";

import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";

interface Play {
  id: string;
  text?: string;

  // ESPN MLB actually returns `period`, so we convert it to this format:
  inning?: {
    number: number;
    half: "Top" | "Bottom";
  };

  period?: {
    displayValue: string;
    number: number;
    type: "Top" | "Bottom";
  };

  pitchCount?: {
    balls: number;
    strikes: number;
  };

  resultCount?: {
    balls: number;
    strikes: number;
  };
  outs?: number;

  team?: { id: string };
  awayScore: number;
  homeScore: number;
}

type Props = {
  plays?: Play[];
  loading?: boolean;
  lighter?: boolean;
};

export default function GameSummary({
  plays = [],
  loading = false,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // --- Tabs: All, 1–9, Extras ---
  const inningTabs = [
    "All",
    ...Array.from({ length: 9 }, (_, i) => `${i + 1}`),
    "Extras",
  ];

  const [selectedInning, setSelectedInning] = useState<string>("All");

  /**
   * Convert ESPN's `period` → our `inning` format
   */
  const normalizedPlays = useMemo(() => {
    return plays.map((p) => {
      if (p.inning) return p;

      return {
        ...p,
        inning: {
          number: p.period?.number ?? 0,
          half: p.period?.type === "Top" ? "Top" : "Bottom",
        },
      };
    });
  }, [plays]);

  /**
   * Filtering logic (now работает 100%)
   */
const filteredPlays = useMemo(() => {
  return normalizedPlays
    // ✅ must have inning
    .filter((p) => p.inning && p.inning.number)

    // ✅ must have meaningful text
    .filter(
      (p) => typeof p.text === "string" && p.text.trim().length > 0
    )

    // ✅ inning tab logic
    .filter((p) => {
      if (selectedInning === "All") return true;
      if (selectedInning === "Extras") return p.inning!.number > 9;

      return String(p.inning!.number) === selectedInning;
    })

    // ✅ sort by inning + half
    .sort((a, b) => {
      const innA = a.inning?.number ?? 0;
      const innB = b.inning?.number ?? 0;

      if (innA !== innB) return innA - innB;

      const halfA = a.inning?.half === "Top" ? 0 : 1;
      const halfB = b.inning?.half === "Top" ? 0 : 1;

      return halfA - halfB;
    });
}, [normalizedPlays, selectedInning]);

  if (!loading && plays?.length === 0) return null;

  return (
    <View>
      <HeadingTwo lighter={lighter}>Game Summary</HeadingTwo>
      <View style={styles.wrapper}>
        <TabBar
          tabs={inningTabs}
          selected={selectedInning}
          onTabPress={(tab) => setSelectedInning(tab)}
        />

        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredPlays.map((play, index) => {
            const playTeamId = play.team?.id;
            const teamObj = getMLBTeamByEspn(playTeamId ?? 0);

            let teamLogo: any = null;
            if (teamObj?.id) {
              teamLogo = getTeamLogo(teamObj.id, isDark);
            }

            const formatHalf = (half: "Top" | "Bottom" | undefined) => {
              if (!half) return "";
              return half === "Bottom" ? "Bot" : "Top";
            };

            const normalizeHalf = (
              value?: string
            ): "Top" | "Bottom" | undefined => {
              if (!value) return undefined;
              const v = value.toLowerCase();
              if (v.startsWith("top")) return "Top";
              if (v.startsWith("bottom")) return "Bottom";
              return undefined;
            };

            const inningLabel =
              play.inning?.number && play.inning.number > 9
                ? "Extras"
                : `${formatHalf(normalizeHalf(play.inning?.half))} ${
                    play.inning?.number
                  }`;

            return (
              <View key={index} style={styles.playRow}>
                <Text style={styles.periodText}>{inningLabel}</Text>

                {teamLogo ? (
                  <Image source={teamLogo} style={styles.logo} />
                ) : null}

                <View style={{ flex: 1 }}>
                  <Text style={styles.playDesc}>{play.text}</Text>
                  <View style={styles.subTextRow}>
                    <Text style={styles.pitchCount}>
                      Pitch Count: {play.pitchCount?.balls}-
                      {play.pitchCount?.strikes}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.outs}>Outs: {play.outs}</Text>
                  </View>
                </View>

                <Text style={styles.clockText}>
                  {play.awayScore}-{play.homeScore}
                </Text>
              </View>
            );
          })}

          {filteredPlays.length === 0 && (
            <Text style={styles.empty}>No plays available</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
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
    subTextRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    divider: {
      height: 12,
      width: 1,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    pitchCount: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
      flexShrink: 1,
    },
    outs: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      flexShrink: 1,
    },
  });
