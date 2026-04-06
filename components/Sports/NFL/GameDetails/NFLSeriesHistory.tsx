// components/NFL/GameDetails/NFLSeriesHistory.tsx

import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import type { TransformedNFLSeriesGame } from "utils/NFLUtils/transformSeriesGame";
type Props = {
  team1Code: string; // "DAL"
  team2Code: string; // "GB"
  team1Full: string; // "Dallas Cowboys"
  team2Full: string; // "Green Bay Packers"

  team1Wins: number;
  team2Wins: number;
  ties?: number;

  games?: TransformedNFLSeriesGame[];

  team1Logo?: any;
  team1LogoLight?: any;
  team2Logo?: any;
  team2LogoLight?: any;

  lighter?: boolean;
};

const NFLSeriesHistory: React.FC<Props> = ({
  team1Code,
  team2Code,
  team1Full,
  team2Full,
  team1Wins,
  team2Wins,
  ties = 0,
  games = [],
  team1Logo,
  team2Logo,
  team1LogoLight,
  team2LogoLight,
  lighter = false,
}) => {
  const isDark = useColorScheme() === "dark";

  const standardizedGames = games ?? [];

  const totalGames = team1Wins + team2Wins + ties;
  const isTied = team1Wins === team2Wins;

  // Leader text
  const leaderText = useMemo(() => {
    if (isTied) return "Series tied";
    return team1Wins > team2Wins ? `${team1Code} leads` : `${team2Code} leads`;
  }, [team1Wins, team2Wins, isTied]);

  // W-T-L
  const recordText =
    ties > 0
      ? `${team1Wins}-${ties}-${team2Wins}`
      : `${team1Wins}-${team2Wins}`;

  const pickLogo = (logo: any, logoLight?: any) => {
    const wantsLight = isDark || lighter;
    return wantsLight ? logoLight || logo : logo;
  };

  const leadingTeamLogo = isTied
    ? null
    : team1Wins > team2Wins
      ? pickLogo(
          team1Logo?.default || team1Logo,
          team1Logo?.light || team1LogoLight,
        )
      : pickLogo(
          team2Logo?.default || team2Logo,
          team2Logo?.light || team2LogoLight,
        );

  const recentGames = useMemo(() => {
    const today = new Date();

    // Strip time → only compare YYYY-MM-DD
    const todayLocal = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    return [...standardizedGames]
      .filter((g) => {
        if (!g.date) return false;

        const [year, month, day] = g.date.split("-").map(Number);
        const gameDate = new Date(year, month - 1, day); // local midnight

        return gameDate < todayLocal; // 👈 keep only past dates
      })
      .sort(
        (a, b) =>
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
      )
      .slice(0, 5);
  }, [standardizedGames]);

  const styles = seriesHistoryStyles(isDark, lighter);

  const formatDate = (iso?: string) => {
    if (!iso) return "";

    // Ensure date is interpreted as local by adding time offset
    const [year, month, day] = iso.split("-").map(Number);
    const d = new Date(year, month - 1, day); // local midnight

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLine = (game: TransformedNFLSeriesGame) => {
    const sHome = game.homeScore ?? 0;
    const sAway = game.awayScore ?? 0;

    // Compare using FULL names
    const team1IsHome = game.homeTeam === team1Full;
    const team2IsHome = game.homeTeam === team2Full;

    // Assign scores
    const s1 = team1IsHome ? sHome : sAway;
    const s2 = team2IsHome ? sHome : sAway;

    const winnerKey = s1 === s2 ? "tie" : s1 > s2 ? "team1" : "team2";

    // Location label uses **codes**
    let loc = "Neutral site";

    if (game.locationType === "home") {
      loc = `@ ${team1IsHome ? team1Code : team2Code}`;
    } else if (game.locationType === "away") {
      loc = `@ ${team1IsHome ? team2Code : team1Code}`;
    }

    return { s1, s2, loc, winnerKey };
  };

  const lineMeta = recentGames.map(formatLine);

  // ---- Determine streaks ----
  const winnerKeys = lineMeta.map((m) => m.winnerKey);
  const streakFlags = winnerKeys.map((key, idx) => {
    if (key === "tie") return false;
    const prev = idx > 0 ? winnerKeys[idx - 1] : null;
    const next = idx < winnerKeys.length - 1 ? winnerKeys[idx + 1] : null;
    return prev === key || next === key;
  });

  return (
    <View>
      <HeadingTwo isDark={isDark}>Series History</HeadingTwo>
      <View style={styles.wrapper}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.headerRowLeft}>
            {leadingTeamLogo && (
              <Image
                source={leadingTeamLogo}
                style={styles.leaderLogo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.leaderText}>{leaderText}</Text>
          </View>

          <View style={styles.headerRowRight}>
            <Text style={styles.recordText}>
              {totalGames} game{totalGames === 1 ? "" : "s"}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.recordText}>{recordText}</Text>
          </View>
        </View>

        {/* RECENT GAMES */}
        {recentGames.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.recentHeading}>Recent meetings</Text>

            {recentGames.map((g, idx) => {
              const { s1, s2, loc, winnerKey } = lineMeta[idx];

              const isTie = winnerKey === "tie";
              const t1Win = winnerKey === "team1";
              const t2Win = winnerKey === "team2";

              const streak = streakFlags[idx];

              return (
                <View key={`${g.id}-${idx}`} style={styles.gameRow}>
                  {/* LEFT SIDE */}
                  <View>
                    <Text style={styles.gameDate}>{formatDate(g.date)}</Text>

                    <View style={styles.gameRowLeft}>
                      <View style={styles.resultsContainer}>
                        {isTie ? (
                          <Text style={styles.gameScore}>
                            {team2Code} {s2} – {team1Code} {s1}
                          </Text>
                        ) : (
                          <Text style={styles.gameScore}>
                            <Text
                              style={
                                t2Win
                                  ? styles.gameScoreWinner
                                  : styles.gameScoreLoser
                              }
                            >
                              {team2Code} {s2}
                            </Text>

                            <Text style={styles.gameScoreDash}> – </Text>
                            <Text
                              style={
                                t1Win
                                  ? styles.gameScoreWinner
                                  : styles.gameScoreLoser
                              }
                            >
                              {team1Code} {s1}
                            </Text>
                          </Text>
                        )}
                      </View>
                      {streak && (
                        <Ionicons name="flame" size={20} color={"orange"} />
                      )}
                    </View>
                  </View>

                  {/* RIGHT SIDE */}
                  <View style={styles.gameRowRight}>
                    <Text style={styles.gameLocation}>{loc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

export default NFLSeriesHistory;

const seriesHistoryStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
    },

    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
    },
    headerRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerRowRight: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    leaderLogo: {
      width: 40,
      height: 40,
    },
    leaderText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: lighter
        ? Colors.dark.white
        : isDark
          ? Colors.dark.white
          : Colors.light.black,
    },
    recordText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: lighter
        ? Colors.dark.white
        : isDark
          ? Colors.dark.white
          : Colors.light.black,
    },
    divider: {
      width: 1.5,
      height: 18,
      backgroundColor: Colors.midTone,
    },
    recentContainer: {
      marginTop: 12,
    },
    recentHeading: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      marginBottom: 6,
      color: lighter
        ? Colors.dark.white
        : isDark
          ? Colors.dark.white
          : Colors.light.black,
      paddingHorizontal: 12,
    },
    gameRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.darkGray
          : Colors.lightGray,
      paddingHorizontal: 12,
    },
    gameRowLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    resultsContainer: {
      flexDirection: "row",
      minWidth: 90,
    },
    gameRowRight: {
      alignItems: "flex-end",
    },
    gameDate: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      color: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
    },
    gameScore: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,

      color: lighter
        ? Colors.dark.white
        : isDark
          ? Colors.dark.white
          : Colors.light.black,
    },
    gameScoreDash: {
      marginHorizontal: 2,
    },
    gameScoreWinner: {
      fontFamily: Fonts.OSBOLD,
      color: lighter
        ? Colors.dark.white
        : isDark
          ? Colors.dark.white
          : Colors.light.black,
    },
    gameScoreLoser: {
      fontFamily: Fonts.OSMEDIUM,
      color: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
    },
    gameLocation: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      color: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
    },
    streakEmoji: {
      marginLeft: 6,
      fontSize: 14,
    },
  });
