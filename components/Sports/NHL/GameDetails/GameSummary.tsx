import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBars/TabBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getNHLTeamByEspnId, getNHLTeamLogo } from "constants/teamsNHL";
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

// NHL quarter/period tabs
const periodTabs = ["All", "1st", "2nd", "3rd", "OT"] as const;

export default function GameSummary({
  plays = [],
  loading = false,
  isDark,
}: Props) {
  const styles = gameSummaryStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedPeriod, setSelectedPeriod] =
    useState<(typeof periodTabs)[number]>("All");

  // Animate new plays
  const prevPlaysLengthRef = useRef(plays.length);
  if (plays.length !== prevPlaysLengthRef.current) {
    prevPlaysLengthRef.current = plays.length;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  /* ---------------- FILTER + SORT ---------------- */
  const filteredPlays = useMemo(() => {
    let filtered = plays?.filter((p) => p.period);

    if (selectedPeriod !== "All") {
      const periodNumber =
        selectedPeriod === "OT"
          ? 4 // OT period number, adjust if needed
          : Number(selectedPeriod.replace(/\D/g, ""));

      filtered = filtered.filter((p) => p.period?.number === periodNumber);
    }

    return filtered
      .sort((a, b) => {
        const periodA = a.period?.number ?? 0;
        const periodB = b.period?.number ?? 0;

        if (periodA !== periodB) return periodB - periodA;

        const parseClock = (clock?: string) => {
          if (!clock) return 0;
          const [min = 0, sec = 0] = clock.split(":").map(Number);
          return min * 60 + sec;
        };

        const timeA = parseClock(a.clock?.displayValue);
        const timeB = parseClock(b.clock?.displayValue);

        return timeA - timeB;
      })
      .reverse(); // latest play on top
  }, [plays, selectedPeriod]);

  if (!loading && plays?.length === 0) return null;
  const latestPlayId = filteredPlays?.[0]?.id;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Summary</HeadingTwo>

      <View style={styles.wrapper}>
        <TabBar
          tabs={periodTabs}
          selected={selectedPeriod}
          onTabPress={(tab) =>
            setSelectedPeriod(tab as (typeof periodTabs)[number])
          }
          isDark={isDark}
        />

        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredPlays?.map((play) => {
            const team = getNHLTeamByEspnId(Number(play.team?.id));
            const teamLogo = getNHLTeamLogo(team?.id, isDark);

            const showLogo =
              !!team?.espnID &&
              play.text &&
              !play.text.toLowerCase().includes("start of") &&
              !play.text.toLowerCase().includes("end of");

            const isLatest = play.id === latestPlayId;

            return (
              <AnimatedPlayRow
                key={play.id}
                style={styles.playRow}
                isLatest={isLatest}
              >
                <Text style={styles.periodText}>
                  P{play.period?.number}
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
