import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import * as Haptics from "expo-haptics";
import { useLiveVotes } from "hooks/useLiveVotes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import {
  castVoteApi,
  fetchVoteResults,
  PollResult,
} from "../../hooks/useGameVotes";
import HeadingTwo from "./../Headings/HeadingTwo";

type VoteTeam = {
  id: string | number;
  name: string;
  code?: string;
  logo: any;
  logoLight: any;
  color?: string;
  secondaryColor?: string;
};

type Props = {
  gameId: string;
  awayTeam: VoteTeam;
  homeTeam: VoteTeam;
  onVoteCast?: (teamId: string | number) => void;
};

export default function WinPredictionVote({
  gameId,
  awayTeam,
  homeTeam,
  onVoteCast,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  const [loading, setLoading] = useState(true);
  const { votes: liveVotes, emitVote } = useLiveVotes(gameId);
  const [results, setResults] = useState<PollResult[]>([]);
  const [userVote, setUserVote] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const LOGO_SIZE = 64;
  const animPctAway = useRef(new Animated.Value(0.5)).current;
  const animPctHome = useRef(new Animated.Value(0.5)).current;
  const animOpacityAway = useRef(new Animated.Value(1)).current;
  const animOpacityHome = useRef(new Animated.Value(1)).current;
  const animScaleAway = useRef(new Animated.Value(1)).current;
  const animScaleHome = useRef(new Animated.Value(1)).current;

  const fetchUserVoteOnly = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVoteResults(gameId);
      setUserVote(data.userVote);
    } catch (err: any) {
      console.warn("❌ Vote fetch error", err);
      setError(err.message || "Error loading vote");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const fetchResultsIfVoted = useCallback(async () => {
    if (!userVote) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVoteResults(gameId);
      setResults(data.votes);
    } catch (err: any) {
      console.warn("❌ Vote fetch error", err);
      setError(err.message || "Error loading vote results");
    } finally {
      setLoading(false);
    }
  }, [gameId, userVote]);

  useEffect(() => {
    fetchUserVoteOnly();
  }, [fetchUserVoteOnly]);

  useEffect(() => {
    fetchResultsIfVoted();
  }, [fetchResultsIfVoted]);

  const castVote = async (teamId: string | number) => {
    if (submitting || userVote) return;
    setSubmitting(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await castVoteApi(String(gameId), String(teamId));
      setUserVote(teamId);
      if (onVoteCast) onVoteCast(teamId);
      await fetchResultsIfVoted();
      const userId = await AsyncStorage.getItem("userId");
      emitVote(teamId, userId || "anonymous");
    } catch (err: any) {
      console.warn("❌ Vote error", err);
      setError(err.message || "Error submitting vote");
    } finally {
      setSubmitting(false);
    }
  };

  const activeVotes = liveVotes.length > 0 ? liveVotes : results;
  const totalVotes =
    activeVotes.reduce((sum, r) => sum + Number(r.votes), 0) || 0;
  const votesAway =
    Number(
      activeVotes.find((r) => String(r.team_id) === String(awayTeam.id))?.votes
    ) || 0;
  const votesHome =
    Number(
      activeVotes.find((r) => String(r.team_id) === String(homeTeam.id))?.votes
    ) || 0;

  const pctAway = totalVotes > 0 ? votesAway / totalVotes : 0;
  const pctHome = totalVotes > 0 ? votesHome / totalVotes : 0;

  const displayPctAway = userVote ? pctAway : 0.5;
  const displayPctHome = userVote ? pctHome : 0.5;

  const animTranslateAway = useRef(new Animated.Value(0)).current;
  const animTranslateHome = useRef(new Animated.Value(0)).current;

  // Animate bars and logos
  useEffect(() => {
    Animated.parallel([
      Animated.timing(animPctAway, {
        toValue: displayPctAway,
        duration: 650,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animPctHome, {
        toValue: displayPctHome,
        duration: 650,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animOpacityAway, {
        toValue: displayPctAway > 0 ? 1 : 0.35,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacityHome, {
        toValue: displayPctHome > 0 ? 1 : 0.35,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animScaleAway, {
        toValue: displayPctAway >= displayPctHome ? 1.05 : 0.85,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animScaleHome, {
        toValue: displayPctHome > displayPctAway ? 1.05 : 0.85,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animTranslateAway, {
        toValue: displayPctAway === 0 ? -LOGO_SIZE / 1 : 0,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animTranslateHome, {
        toValue: displayPctHome === 0 ? LOGO_SIZE / 1 : 0,
        duration: 450,
        useNativeDriver: false,
      }),
    ]).start();
  }, [displayPctAway, displayPctHome]);

  const formatPercentage = (pct: number) => `${Math.round(pct * 100)}%`;

  const resolveLogo = (logo: any) => {
    if (!logo) return undefined;

    // String URI
    if (typeof logo === "string") {
      return { uri: logo };
    }

    // RN require() asset
    return logo;
  };

  return (
    <View style={styles.container}>
      <HeadingTwo>Fan Prediction Vote</HeadingTwo>

      {loading ? (
        <ActivityIndicator
          color={isDark ? Colors.light.text : Colors.dark.text}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.barContainer}>
            <View style={styles.barInner}>
              {/* Away bar */}
              <Animated.View
                style={[
                  styles.halfBar,
                  { flex: animPctAway, backgroundColor: "transparent" },
                ]}
              >
                <Animated.View
                  style={[
                    styles.fillAway,
                    {
                      backgroundColor: awayTeam.color || Colors.darkGray,
                      opacity: animOpacityAway,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      !submitting && !userVote && castVote(awayTeam.id)
                    }
                    style={{ alignItems: "center", justifyContent: "center" }}
                    pointerEvents={userVote ? "none" : "auto"}
                  >
                    <Animated.Image
                      source={resolveLogo(
                        colorScheme === "dark"
                          ? awayTeam.logoLight || awayTeam.logo
                          : awayTeam.logoLight || awayTeam.logo
                      )}
                      style={[
                        styles.teamLogo,
                        {
                          transform: [
                            { scale: animScaleAway },
                            { translateX: animTranslateAway },
                          ],
                        },
                      ]}
                      resizeMode="cover"
                    />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.teamName}
                    >
                      {awayTeam.code}
                    </Text>
                  </Pressable>
                </Animated.View>
              </Animated.View>

              {/* Home bar */}
              <Animated.View
                style={[
                  styles.halfBar,
                  { flex: animPctHome, backgroundColor: "transparent" },
                ]}
              >
                <Animated.View
                  style={[
                    styles.fillHome,
                    {
                      backgroundColor: homeTeam.color || Colors.lightGray,
                      opacity: animOpacityHome,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      !submitting && !userVote && castVote(homeTeam.id)
                    }
                    style={{ alignItems: "center", justifyContent: "center" }}
                    pointerEvents={userVote ? "none" : "auto"}
                  >
                    <Animated.Image
                      source={resolveLogo(
                        colorScheme === "dark"
                          ? homeTeam.logoLight || homeTeam.logo
                          : homeTeam.logoLight || homeTeam.logo
                      )}
                      style={[
                        styles.teamLogo,
                        {
                          transform: [
                            { scale: animScaleHome },
                            { translateX: animTranslateHome },
                          ],
                        },
                      ]}
                      resizeMode="cover"
                    />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.teamName}
                    >
                      {homeTeam.code}
                    </Text>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            </View>
          </View>

          {/* Percent labels */}
          <View style={styles.percentRow}>
            <Text style={styles.percentText}>
              {formatPercentage(displayPctAway)}
            </Text>
            <Text style={styles.percentText}>
              {formatPercentage(displayPctHome)}
            </Text>
          </View>

          {/* Total votes */}
          <Text style={styles.totalVotesText}>
            {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
          </Text>
        </>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean, LOGO_SIZE = 150) =>
  StyleSheet.create({
    container: {},
    barContainer: {
      height: 50,
      width: "100%",
      overflow: "hidden",
      position: "relative",
      justifyContent: "center",
      borderRadius: 8,
    },
    barInner: {
      flexDirection: "row",
      height: "100%",
      overflow: "hidden",
    },
    halfBar: {
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    fillAway: {
      ...StyleSheet.absoluteFillObject,

      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    fillHome: {
      ...StyleSheet.absoluteFillObject,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    teamLogo: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      opacity: 0.2,
    },
    percentRow: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    percentText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      textAlign: "center",
    },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 14,
      textAlign: "center",
    },
    totalVotesText: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamName: {
      position: "absolute",
      flexWrap: "nowrap",
      color: "#fff",
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
      flexShrink: 1,
      maxWidth: "90%",
      textAlign: "center",
    },
  });
