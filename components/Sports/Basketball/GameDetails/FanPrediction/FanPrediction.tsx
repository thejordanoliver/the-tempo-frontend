import {
  SkeletonBlock,
  SkeletonCircle,
} from "@/components/Skeletons/primitives";
import { CastVoteAck } from "@/hooks/useLiveVotes";
import { FanPredictionStyles } from "@/styles/GameDetailStyles/FanPredictionStyles";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import { fetchVoteResults, PollResult } from "hooks/useGameVotes";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import PredictionCard from "./PredictionCard";

type Props = {
  votes: PollResult[] | null;
  castVote: (teamId: string | number) => Promise<CastVoteAck>;
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

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function isCanceledRequest(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const requestError = error as { code?: unknown; name?: unknown };

  return (
    requestError.code === "ERR_CANCELED" ||
    requestError.name === "CanceledError"
  );
}

export default function FanPrediction(props: Props) {
  if (props.state === "post") return null;

  return <FanPredictionContent {...props} />;
}

function FanPredictionContent({
  votes: liveVotes,
  castVote: castLiveVote,
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
  const styles = FanPredictionStyles(isDark);
  const global = globalStyles(isDark);
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
  const submittingRef = useRef(false);

  const canVote = state === "pre" || state === "in";

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadPredictionState = async () => {
      try {
        setPhase("loading");
        setErrorMessage(null);
        setResults([]);
        setUserVote(null);
        setResultsRevealed(false);

        const data = await fetchVoteResults(gameId, {
          signal: controller.signal,
        });

        if (!active) return;

        setResults(data.votes);
        setUserVote(data.userVote ?? null);
        setResultsRevealed(data.userVote != null || !canVote);
        setPhase("ready");
      } catch (err: unknown) {
        if (!active || isCanceledRequest(err)) {
          return;
        }

        console.warn("Vote fetch error", err);
        setErrorMessage(getErrorMessage(err, "We couldn't load this poll."));
        setPhase("error");
      }
    };

    loadPredictionState();

    return () => {
      active = false;
      controller.abort();
    };
  }, [gameId, canVote]);

  const handleVote = async (teamId: string | number) => {
    if (!canVote || submittingRef.current || userVote != null) return;

    const previousVote = userVote;
    const previousResultsRevealed = resultsRevealed;

    submittingRef.current = true;
    setSubmittingTeamId(teamId);
    setErrorMessage(null);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setUserVote(teamId);
      setResultsRevealed(true);

      const response = await castLiveVote(teamId);

      if (!response.ok) {
        setUserVote(previousVote);
        setResultsRevealed(previousResultsRevealed);
        setErrorMessage(
          response.error || "Your vote didn't go through. Try again.",
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {},
        );

        return;
      }

      onVoteCast?.(teamId);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    } catch (err: unknown) {
      console.warn("Vote error", err);
      setUserVote(previousVote);
      setResultsRevealed(previousResultsRevealed);
      setErrorMessage(
        getErrorMessage(err, "Your vote didn't go through. Try again."),
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    } finally {
      submittingRef.current = false;
      setSubmittingTeamId(null);
    }
  };

  const activeVotes = liveVotes ?? results;
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
  const subtitle = !canVote
    ? userVote
      ? `Final results — you picked ${pickedName}`
      : "Final results"
    : userVote
      ? `You picked ${pickedName}`
      : "Tap a team to cast your prediction";

  if (phase === "loading") {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Fan Prediction</HeadingTwo>

        <View style={styles.wrapper}>
          <View style={styles.skeletonRow}>
            <SkeletonCircle style={styles.skeletonBadgeLogo} />
            <SkeletonBlock style={styles.skeletonTeamName} />
          </View>

          <View style={styles.skeletonRow}>
            <SkeletonCircle style={styles.skeletonBadgeLogo} />
            <SkeletonBlock style={styles.skeletonTeamName} />
          </View>
        </View>

        <SkeletonBlock style={styles.skeletonSubtitle} />
      </View>
    );
  }
  if (phase === "error")
    return (
      <View>
        <HeadingTwo isDark={isDark}>Fan Prediction</HeadingTwo>
        <Text style={global.errorText}>{errorMessage}</Text>
      </View>
    );

  return (
    <View>
      <HeadingTwo isDark={isDark}>Fan Prediction</HeadingTwo>
      <View style={styles.wrapper}>
        <PredictionCard
          code={awayCode}
          logo={awayLogo}
          color={awayColor || Colors.darkGray}
          fillAnim={animFillAway}
          onPress={() => handleVote(awayId)}
          disabled={!canVote || userVote != null || submittingTeamId != null}
          isSelected={isSameTeamId(userVote, awayId)}
          showPercent={resultsRevealed}
          percentText={formatPercentage(rawPctAway)}
          isDark={isDark}
        />

        <PredictionCard
          code={homeCode}
          logo={homeLogo}
          color={homeColor || Colors.lightGray}
          fillAnim={animFillHome}
          onPress={() => handleVote(homeId)}
          disabled={!canVote || userVote != null || submittingTeamId != null}
          isSelected={isSameTeamId(userVote, homeId)}
          showPercent={resultsRevealed}
          percentText={formatPercentage(rawPctHome)}
          isDark={isDark}
        />
      </View>

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
