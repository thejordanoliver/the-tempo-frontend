import { SkeletonBlock } from "@/components/Skeletons/primitives";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import { castVoteApi, fetchVoteResults, PollResult } from "hooks/useGameVotes";
import { useLiveVotes } from "hooks/useLiveVotes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  gameId: number;
  awayId: string | number;
  awayCode?: string;
  awayLogo: any;
  awayColor?: string | null;
  homeId: string | number;
  homeCode?: string;
  homeLogo: any;
  homeColor?: string | null;
  onVoteCast?: (teamId: string | number) => void;
  state?: string | null;
};

function isSameTeamId(
  first: string | number | null,
  second: string | number | null,
) {
  return first !== null && second !== null && String(first) === String(second);
}

// Extracted so each team's row is one readable, testable unit — matches the
// component-extraction pattern used elsewhere in the app.
type PollRowProps = {
  teamId: string | number;
  code?: string;
  name?: string;
  logo: any;
  color: string;
  fillAnim: Animated.Value;
  onPress: () => void;
  disabled: boolean;
  isSubmitting: boolean;
  isSelected: boolean;
  showPercent: boolean;
  percentText: string;
  isDark: boolean;
  style?: object;
};

function PollRow({
  code,
  name,
  logo,
  color,
  fillAnim,
  onPress,
  disabled,
  isSubmitting,
  isSelected,
  showPercent,
  percentText,
  isDark,
  style,
}: PollRowProps) {
  const rowStyles = pollRowStyles(isDark);
  const label = name || code;
  const SELECTED_TEAM_COLOR = isDark ? Colors.dark.green : Colors.light.green;
  const fillColor = isSelected ? SELECTED_TEAM_COLOR : color;

  return (
    <View style={[rowStyles.row, isSelected && rowStyles.rowSelected, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          rowStyles.fill,
          {
            backgroundColor: fillColor,
            width: fillAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
        style={rowStyles.touchArea}
        accessibilityRole="button"
        accessibilityLabel={
          showPercent
            ? `${label}, ${percentText} of the vote`
            : `Vote for ${label}`
        }
        accessibilityState={{ disabled, selected: isSelected }}
      >
        <View style={rowStyles.badge}>
          <Image
            source={typeof logo === "string" ? { uri: logo } : logo}
            style={rowStyles.badgeLogo}
            resizeMode="contain"
          />
        </View>

        <Text numberOfLines={1} style={rowStyles.label}>
          {label}
        </Text>

        {showPercent && <Text style={rowStyles.percent}>{percentText}</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function FanPredictionVote({
  gameId,
  awayId,
  awayCode,
  awayLogo,
  awayColor,
  homeId,
  homeCode,
  homeLogo,
  homeColor,
  onVoteCast,
  state,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = fanPredictionVoteStyles(isDark);
  const global = globalStyles(isDark);

  const { votes: liveVotes, emitVote } = useLiveVotes(gameId);

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | number | null>(null);
  const [results, setResults] = useState<PollResult[]>([]);
  const [resultsRevealed, setResultsRevealed] = useState(false);
  const [submittingTeamId, setSubmittingTeamId] = useState<
    string | number | null
  >(null);

  const animFillAway = useRef(new Animated.Value(0)).current;
  const animFillHome = useRef(new Animated.Value(0)).current;

  const canVote = state === "pre" || state === "in";

  // Single request on mount instead of the original's two sequential fetches.
  // fetchVoteResults already returns both the user's vote and the tallies, so
  // one call covers it. Results are revealed if the user voted OR the game has
  // ended, so someone who never voted still gets to see the final read once
  // it's over instead of a poll that's permanently locked at nothing shown.
  const loadVoteState = useCallback(async () => {
    try {
      setPhase("loading");
      setErrorMessage(null);
      const data = await fetchVoteResults(gameId);
      setUserVote(data.userVote ?? null);
      if (data.userVote != null || !canVote) {
        setResults(data.votes);
        setResultsRevealed(true);
      }
      setPhase("ready");
    } catch (err: any) {
      console.warn("Vote fetch error", err);
      setErrorMessage(err?.message || "We couldn't load this poll.");
      setPhase("error");
    }
  }, [gameId, canVote]);

  useEffect(() => {
    loadVoteState();
  }, [loadVoteState]);

  const castVote = async (teamId: string | number) => {
    if (!canVote || submittingTeamId != null || userVote != null) return;
    setSubmittingTeamId(teamId);
    setErrorMessage(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await castVoteApi(String(gameId), String(teamId));
      setUserVote(teamId);
      onVoteCast?.(teamId);
      const data = await fetchVoteResults(gameId);
      setResults(data.votes);
      setResultsRevealed(true);
      const userId = await AsyncStorage.getItem("userId");
      emitVote(teamId, userId || "anonymous");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    } catch (err: any) {
      console.warn("Vote error", err);
      setErrorMessage(
        err?.message || "Your vote didn't go through — try again.",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    } finally {
      setSubmittingTeamId(null);
    }
  };

  const activeVotes = liveVotes.length > 0 ? liveVotes : results;
  const totalVotes =
    activeVotes.reduce((sum, r) => sum + Number(r.votes), 0) || 0;
  const votesAway =
    Number(
      activeVotes.find((r) => String(r.team_id) === String(awayId))?.votes,
    ) || 0;
  const votesHome =
    Number(
      activeVotes.find((r) => String(r.team_id) === String(homeId))?.votes,
    ) || 0;

  const rawPctAway = totalVotes > 0 ? votesAway / totalVotes : 0;
  const rawPctHome = totalVotes > 0 ? votesHome / totalVotes : 0;

  // Each row fills independently, so — unlike a single shared bar — neither
  // team's badge or name can ever be crowded out by a lopsided vote. No
  // minimum-width clamp needed here.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(animFillAway, {
        toValue: resultsRevealed ? rawPctAway : 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animFillHome, {
        toValue: resultsRevealed ? rawPctHome : 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [resultsRevealed, rawPctAway, rawPctHome, animFillAway, animFillHome]);

  const formatPercentage = (pct: number) => `${Math.round(pct * 100)}%`;

  const pickedName = isSameTeamId(userVote, awayId) ? awayCode : homeCode;
  const subtitle =
    phase === "loading"
      ? "Loading poll…"
      : phase === "error"
        ? null
        : !canVote
          ? userVote
            ? `Final results — you picked ${pickedName}`
            : "Final results"
          : userVote
            ? `You picked ${pickedName}`
            : "Tap a team to cast your prediction";

  if (state === "post") return null;

  if (phase === "loading")
    return (
      <View>
        <HeadingTwo isDark={isDark}>Fan Prediction Vote</HeadingTwo>
        <SkeletonBlock style={styles.skeletonRow} />
        <SkeletonBlock style={styles.skeletonRow} />
        <SkeletonBlock style={styles.skeletonSubtitle} />
        <SkeletonBlock style={styles.skeletonTotalVotesText} />
      </View>
    );

  if (phase === "error")
    return (
      <View style={global.emptyContainer}>
        <HeadingTwo isDark={isDark}>Fan Prediction Vote</HeadingTwo>
        <Text style={global.errorText}>{errorMessage}</Text>
      </View>
    );

  return (
    <View>
      <HeadingTwo isDark={isDark}>Fan Prediction Vote</HeadingTwo>

      <PollRow
        teamId={awayId}
        code={awayCode}
        logo={awayLogo}
        color={awayColor || Colors.darkGray}
        fillAnim={animFillAway}
        onPress={() => castVote(awayId)}
        disabled={!canVote || userVote != null || submittingTeamId != null}
        isSubmitting={isSameTeamId(submittingTeamId, awayId)}
        isSelected={isSameTeamId(userVote, awayId)}
        showPercent={resultsRevealed}
        percentText={formatPercentage(rawPctAway)}
        isDark={isDark}
        style={{ marginBottom: 8 }}
      />
      <PollRow
        teamId={homeId}
        code={homeCode}
        logo={homeLogo}
        color={homeColor || Colors.lightGray}
        fillAnim={animFillHome}
        onPress={() => castVote(homeId)}
        disabled={!canVote || userVote != null || submittingTeamId != null}
        isSubmitting={isSameTeamId(submittingTeamId, homeId)}
        isSelected={isSameTeamId(userVote, homeId)}
        showPercent={resultsRevealed}
        percentText={formatPercentage(rawPctHome)}
        isDark={isDark}
      />

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {resultsRevealed && (
        <Text style={styles.totalVotesText}>
          {resultsRevealed
            ? `${totalVotes.toLocaleString()} ${totalVotes === 1 ? "vote" : "votes"}`
            : " "}
        </Text>
      )}
    </View>
  );
}

const pollRowStyles = (isDark: boolean) =>
  StyleSheet.create({
    row: {
      position: "relative",
      justifyContent: "center",
      height: 60,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 12,
      overflow: "hidden",
    },
    rowSelected: {
      borderColor: isDark ? Colors.white : Colors.black,
    },
    fill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      opacity: 0.26,
    },
    touchArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      height: "100%",
      paddingHorizontal: 12,
    },
    badge: {
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: "hidden",
    },
    badgeLogo: {
      width: 32,
      height: 32,
      resizeMode: "contain",
    },
    label: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
    percent: {
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
  });

const fanPredictionVoteStyles = (isDark: boolean) =>
  StyleSheet.create({
    subtitle: {
      marginTop: 4,
      marginBottom: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: Colors.midTone,
    },
    totalVotesText: {
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: Colors.midTone,
    },
    skeletonRow: {
      height: 60,
      marginBottom: 8,
      borderRadius: 12,
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },
    skeletonSubtitle: {
      width: 60,
      height: 14,
      marginTop: 4,
      marginBottom: 2,
      borderRadius: 12,
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },
    skeletonTotalVotesText: {
      width: 40,
      height: 14,
      marginTop: 4,
      borderRadius: 12,
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
