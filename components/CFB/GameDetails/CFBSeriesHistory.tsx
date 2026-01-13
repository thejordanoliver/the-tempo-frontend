// components/CFB/GameDetails/CFBSeriesHistory.tsx

import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";

type SeriesGame = {
  season?: number;
  week?: number;
  seasonType?: string;
  date?: string; // ISO string from CFBD
  neutralSite?: boolean;

  // CFBD-style fields:
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  winner?: string;

  // (optional) old shape support:
  team1Score?: number;
  team2Score?: number;
  team1Home?: boolean;
};

type Props = {
  team1Name: string; // e.g. "Florida"
  team2Name: string; // e.g. "Florida State"
  team1Wins: number;
  team2Wins: number;
  ties?: number;
  games?: SeriesGame[];

  // logos for each team
  team1Logo?: any;
  team2Logo?: any;
  lighter?: boolean;
};

const CFBSeriesHistory: React.FC<Props> = ({
  team1Name,
  team2Name,
  team1Wins,
  team2Wins,
  ties = 0,
  games = [],
  team1Logo,
  team2Logo,
  lighter = false,
}) => {
  const isDark = useColorScheme() === "dark";

  const totalGames = team1Wins + team2Wins + (ties || 0);
  const isTied = team1Wins === team2Wins;

  const leaderText = useMemo(() => {
    if (isTied) {
      return "Series tied";
    }
    const leader = team1Wins > team2Wins ? team1Name : team2Name;
    return `${leader} leads`;
  }, [isTied, team1Wins, team2Wins, team1Name, team2Name]);

  // ✅ Ties go in the middle: W–T–L
  const recordText = useMemo(() => {
    if (ties && ties > 0) {
      return `${team1Wins}-${ties}-${team2Wins}`;
    }
    return `${team1Wins}-${team2Wins}`;
  }, [team1Wins, team2Wins, ties]);

  // ✅ Determine which logo to show (if any)
  const leadingTeamLogo = useMemo(() => {
    if (isTied) return null;
    return team1Wins > team2Wins ? team1Logo || null : team2Logo || null;
  }, [isTied, team1Wins, team2Wins, team1Logo, team2Logo]);

  // Sort games by date descending and take most recent 5
  const recentGames = useMemo(() => {
    if (!games || games.length === 0) return [];

    return [...games]
      .filter((g) => g.date)
      .sort((a, b) => {
        const da = new Date(a.date as string).getTime();
        const db = new Date(b.date as string).getTime();
        return db - da;
      })
      .slice(0, 5);
  }, [games]);

  const styles = getStyles(isDark, lighter);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLine = (game: SeriesGame) => {
    const t1 = team1Name;
    const t2 = team2Name;

    // 1️⃣ Prefer explicit team1Score/team2Score if present
    if (
      typeof game.team1Score === "number" ||
      typeof game.team2Score === "number"
    ) {
      const s1 = game.team1Score ?? 0;
      const s2 = game.team2Score ?? 0;

      const winnerKey = s1 === s2 ? "tie" : s1 > s2 ? "team1" : "team2";
      const winner =
        winnerKey === "tie" ? "Tied" : winnerKey === "team1" ? t1 : t2;

      let loc = "";
      if (game.neutralSite) {
        loc = "Neutral site";
      } else if (game.team1Home === true) {
        loc = `@ ${t1}`;
      } else if (game.team1Home === false) {
        loc = `@ ${t2}`;
      }

      return { winner, loc, s1, s2, winnerKey };
    }

    // 2️⃣ CFBD home/away shape (what you're actually getting)
    const homeTeam = game.homeTeam;
    const awayTeam = game.awayTeam;
    const homeScore = game.homeScore ?? 0;
    const awayScore = game.awayScore ?? 0;

    // Map scores into team1/team2 ordering based on names
    let s1 = 0;
    let s2 = 0;

    if (homeTeam && awayTeam) {
      const team1IsHome = homeTeam === t1;
      if (team1IsHome) {
        s1 = homeScore;
        s2 = awayScore;
      } else {
        s1 = awayScore;
        s2 = homeScore;
      }
    } else {
      // Fallback if names missing
      s1 = homeScore;
      s2 = awayScore;
    }

    const winnerKey = s1 === s2 ? "tie" : s1 > s2 ? "team1" : "team2";
    const winner =
      winnerKey === "tie" ? "Tied" : winnerKey === "team1" ? t1 : t2;

    let loc = "";
    if (game.neutralSite) {
      loc = "Neutral site";
    } else if (homeTeam === t1) {
      loc = `@ ${t1}`;
    } else if (homeTeam === t2) {
      loc = `@ ${t2}`;
    }

    return { winner, loc, s1, s2, winnerKey };
  };

  // 🔥 Determine which recent games are part of a streak
  // A "streak" here means 2+ consecutive wins by the same side in the recent list
  const lineMeta = recentGames.map((g) => formatLine(g));
  const winnerKeys = lineMeta.map((m) => m.winnerKey);
  const streakFlags = winnerKeys.map((w, idx) => {
    if (w === "tie" || !w) return false;
    const prev = idx > 0 ? winnerKeys[idx - 1] : null;
    const next = idx < winnerKeys.length - 1 ? winnerKeys[idx + 1] : null;
    // Mark as streak if same winner appears adjacent (part of a run of 2+)
    return prev === w || next === w;
  });

  return (
    <View>
      <HeadingTwo lighter={lighter}>Series History</HeadingTwo>
      <View style={styles.wrapper}>
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
              {totalGames} game
              {totalGames === 1 ? "" : "s"}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.recordText}>{recordText}</Text>
          </View>
        </View>

        {recentGames.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.recentHeading}>Recent meetings</Text>
            {recentGames.map((g, idx) => {
              const { loc, s1, s2, winnerKey } = lineMeta[idx];
              const isTieGame = winnerKey === "tie";
              const team1IsWinner = winnerKey === "team1";
              const team2IsWinner = winnerKey === "team2";
              const isStreak = streakFlags[idx];

              return (
                <View key={`${g.date}-${idx}`} style={styles.gameRow}>
                  <View>
                    <Text style={styles.gameDate}>{formatDate(g.date)}</Text>
                    <View style={styles.gameRowLeft}>
                      {/* Score line with faded loser */}
                      {isTieGame ? (
                        <Text style={styles.gameScore}>
                          {team1Name} {s1} – {team2Name} {s2}
                        </Text>
                      ) : (
                        <Text style={styles.gameScore}>
                          <Text
                            style={
                              team1IsWinner
                                ? styles.gameScoreWinner
                                : styles.gameScoreLoser
                            }
                          >
                            {team1Name} {s1}
                          </Text>
                          <Text style={styles.gameScoreDash}>{" – "}</Text>
                          <Text
                            style={
                              team2IsWinner
                                ? styles.gameScoreWinner
                                : styles.gameScoreLoser
                            }
                          >
                            {team2Name} {s2}
                          </Text>
                        </Text>
                      )}
                      {isStreak && <Ionicons name="flame" size={20} color={"orange"}/>}
                    </View>
                  </View>
                  <View style={styles.gameRowRight}>
                    <View style={styles.gameRowRightInner}>
                      {loc ? (
                        <Text style={styles.gameLocation}>{loc}</Text>
                      ) : null}
                    </View>
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

export default CFBSeriesHistory;

const getStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
      width: "100%",
    },
    headerRowRight: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      padding: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    headerRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    leaderLogo: {
      width: 40,
      height: 40,
    },
    divider: {
      width: 1.5,
      height: 18,
      alignSelf: "center",
      backgroundColor: Colors.midTone,
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
    },
    gameRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomColor: lighter
        ? Colors.darkGray
        : isDark
        ? Colors.darkGray
        : Colors.lightGray,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    gameRowLeft: {
      flex: 1.3,
      flexDirection: "row",
    },
    gameRowRight: {
      flex: 1,
      alignItems: "flex-end",
    },
    gameRowRightInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      color: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
    },
    gameScoreWinner: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      color: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
    },
    gameScoreLoser: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
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
      fontSize: 14,
      color: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
      marginLeft: 6,
    },
  });
