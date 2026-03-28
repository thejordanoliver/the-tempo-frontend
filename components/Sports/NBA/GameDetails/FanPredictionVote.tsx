import AsyncStorage from "@react-native-async-storage/async-storage";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import * as Haptics from "expo-haptics";
import { castVoteApi, fetchVoteResults, PollResult } from "hooks/useGameVotes";
import { useLiveVotes } from "hooks/useLiveVotes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type VoteTeam = {
  id: string | number;
  code?: string;
  logo: any;
  color?: string;
  secondaryColor?: string;
};

type Props = {
  gameId: string;
  awayTeam: VoteTeam;
  homeTeam: VoteTeam;
  onVoteCast?: (teamId: string | number) => void;
};

export default function FanPredictionVote({
  gameId,
  awayTeam,
  homeTeam,
  onVoteCast,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);
  const global = globalStyles(isDark);

  const [loading, setLoading] = useState(true);
  const { votes: liveVotes, emitVote } = useLiveVotes(gameId);
  const [results, setResults] = useState<PollResult[]>([]);
  const [userVote, setUserVote] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const [resultsRevealed, setResultsRevealed] = useState(false);

  const LOGO_SIZE = 64;

  const animPctAway = useRef(new Animated.Value(0.5)).current;
  const animPctHome = useRef(new Animated.Value(0.5)).current;
  const animOpacityAway = useRef(new Animated.Value(1)).current;
  const animOpacityHome = useRef(new Animated.Value(1)).current;
  const animScaleAway = useRef(new Animated.Value(1)).current;
  const animScaleHome = useRef(new Animated.Value(1)).current;
  const animTranslateAway = useRef(new Animated.Value(0)).current;
  const animTranslateHome = useRef(new Animated.Value(0)).current;

  const fetchUserVoteOnly = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVoteResults(gameId);
      setUserVote(data.userVote);
    } catch (err: any) {
      console.warn("Vote fetch error", err);
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
      setResultsRevealed(true);
    } catch (err: any) {
      console.warn("Vote fetch error", err);
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
      const data = await fetchVoteResults(gameId);
      setResults(data.votes);
      setResultsRevealed(true);
      const userId = await AsyncStorage.getItem("userId");
      emitVote(teamId, userId || "anonymous");
    } catch (err: any) {
      console.warn("Vote error", err);
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
      activeVotes.find((r) => String(r.team_id) === String(awayTeam.id))?.votes,
    ) || 0;
  const votesHome =
    Number(
      activeVotes.find((r) => String(r.team_id) === String(homeTeam.id))?.votes,
    ) || 0;

  const pctAway = totalVotes > 0 ? votesAway / totalVotes : 0;
  const pctHome = totalVotes > 0 ? votesHome / totalVotes : 0;

  const displayPctAway = resultsRevealed ? pctAway : 0.5;
  const displayPctHome = resultsRevealed ? pctHome : 0.5;

  useEffect(() => {
    const isAwayVoted = resultsRevealed && userVote === awayTeam.id;
    const isHomeVoted = resultsRevealed && userVote === homeTeam.id;

    let awayOffset = 0;
    let homeOffset = 0;

    if (isAwayVoted) {
      awayOffset = (barWidth * displayPctHome) / 2;
      homeOffset = displayPctHome === 0 ? barWidth : 0;
    } else if (isHomeVoted) {
      homeOffset = -(barWidth * displayPctAway) / 2;
      awayOffset = displayPctAway === 0 ? -barWidth : 0;
    }

    const awayOpacity =
      !resultsRevealed || isAwayVoted || displayPctAway > 0 ? 1 : 0;
    const homeOpacity =
      !resultsRevealed || isHomeVoted || displayPctHome > 0 ? 1 : 0;

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
      Animated.timing(animTranslateAway, {
        toValue: awayOffset,
        duration: 650,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animTranslateHome, {
        toValue: homeOffset,
        duration: 650,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animOpacityAway, {
        toValue: awayOpacity,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacityHome, {
        toValue: homeOpacity,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animScaleAway, {
        toValue:
          !resultsRevealed || displayPctAway >= displayPctHome ? 1.05 : 0.85,
        duration: 450,
        useNativeDriver: false,
      }),
      Animated.timing(animScaleHome, {
        toValue:
          !resultsRevealed || displayPctHome > displayPctAway ? 1.05 : 0.85,
        duration: 450,
        useNativeDriver: false,
      }),
    ]).start();
  }, [displayPctAway, displayPctHome, resultsRevealed, userVote, barWidth]);

  const formatPercentage = (pct: number) => `${Math.round(pct * 100)}%`;

  const resolveLogo = (logo: any) => {
    if (!logo) return undefined;
    if (typeof logo === "string") return { uri: logo };
    return logo;
  };

  if (error)
    return (
      <View>
        <HeadingTwo isDark={isDark}>Fan Prediction Vote</HeadingTwo>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Fan Prediction Vote</HeadingTwo>

      <View
        style={styles.barContainer}
        onLayout={(e: LayoutChangeEvent) =>
          setBarWidth(e.nativeEvent.layout.width)
        }
      >
        <View style={styles.barInner}>
          {/* Away */}
          <Animated.View style={[styles.halfBar, { flex: animPctAway }]}>
            <Animated.View
              style={[
                styles.fillAway,
                {
                  backgroundColor: awayTeam.color || Colors.darkGray,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => castVote(awayTeam.id)}
                disabled={!!userVote || submitting}
                activeOpacity={userVote ? 1 : 0.7}
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                <Animated.View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: animOpacityAway,
                    transform: [
                      { scale: animScaleAway },
                      { translateX: animTranslateAway },
                    ],
                  }}
                >
                  <Animated.Image
                    source={awayTeam.logo}
                    style={styles.teamLogo}
                    resizeMode="cover"
                  />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.teamName}
                  >
                    {awayTeam.code}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Home */}
          <Animated.View style={[styles.halfBar, { flex: animPctHome }]}>
            <Animated.View
              style={[
                styles.fillHome,
                {
                  backgroundColor: homeTeam.color || Colors.lightGray,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => castVote(homeTeam.id)}
                disabled={!!userVote || submitting}
                activeOpacity={userVote ? 1 : 0.7}
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                <Animated.View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: animOpacityHome,
                    transform: [
                      { scale: animScaleHome },
                      { translateX: animTranslateHome },
                    ],
                  }}
                >
                  <Animated.Image
                    source={homeTeam.logo}
                    style={styles.teamLogo}
                    resizeMode="cover"
                  />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.teamName}
                  >
                    {homeTeam.code}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
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

      <Text style={styles.totalVotesText}>
        {resultsRevealed
          ? `${totalVotes} total ${totalVotes === 1 ? "vote" : "votes"}`
          : ""}
      </Text>
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
    barInner: { flexDirection: "row", height: "100%", overflow: "hidden" },
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
    teamLogo: { width: LOGO_SIZE, height: LOGO_SIZE, opacity: 0.2 },
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
      color: Colors.white,
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
      flexShrink: 1,
      maxWidth: "90%",
      textAlign: "center",
    },
  });
