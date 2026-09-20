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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

import PredictionCard from "./PredictionCard";

type TeamId = string | number;

type Props = {
  votes: PollResult[] | null;
  castVote: (teamId: TeamId) => Promise<CastVoteAck>;
  gameId: number;

  awayId: TeamId;
  awayCode?: string;
  awayLogo: any;
  awayColor?: string | null;

  homeId: TeamId;
  homeCode?: string;
  homeLogo: any;
  homeColor?: string | null;

  onVoteCast?: (teamId: TeamId) => void;

  state?: string | null;
};

function isSameTeamId(
  first: TeamId | null | undefined,
  second: TeamId | null | undefined,
): boolean {
  if (first == null || second == null) {
    return false;
  }

  return String(first) === String(second);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function isCanceledRequest(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const requestError = error as {
    code?: unknown;
    name?: unknown;
  };

  return (
    requestError.code === "ERR_CANCELED" ||
    requestError.name === "CanceledError" ||
    requestError.name === "AbortError"
  );
}

function getVoteCount(votes: PollResult[], teamId: TeamId): number {
  const result = votes.find((vote) => isSameTeamId(vote.team_id, teamId));

  const count = Number(result?.votes ?? 0);

  return Number.isFinite(count) ? count : 0;
}

export default function FanPrediction(props: Props) {
  if (props.state === "post") {
    return null;
  }

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

  const [userVote, setUserVote] = useState<TeamId | null>(null);

  const [results, setResults] = useState<PollResult[]>([]);

  const [resultsRevealed, setResultsRevealed] = useState(false);

  const [submittingTeamId, setSubmittingTeamId] = useState<TeamId | null>(null);

  const [animFillAway] = useState(() => new Animated.Value(0));

  const [animFillHome] = useState(() => new Animated.Value(0));

  const submittingRef = useRef(false);

  const canVote = state === "pre" || state === "in";

  /*
   * Load the persisted poll state whenever the game changes or
   * voting availability changes.
   */
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

        if (!active) {
          return;
        }

        const fetchedVotes = Array.isArray(data.votes) ? data.votes : [];

        const fetchedUserVote = data.userVote ?? null;

        setResults(fetchedVotes);
        setUserVote(fetchedUserVote);

        /*
         * Reveal results when:
         * - this user already voted, or
         * - voting is closed.
         */
        setResultsRevealed(fetchedUserVote != null || !canVote);

        setPhase("ready");
      } catch (error: unknown) {
        if (!active || isCanceledRequest(error)) {
          return;
        }

        console.warn("Vote fetch error", error);

        setErrorMessage(getErrorMessage(error, "We couldn't load this poll."));

        setPhase("error");
      }
    };

    void loadPredictionState();

    return () => {
      active = false;
      controller.abort();
    };
  }, [gameId, canVote]);

  /*
   * Prefer realtime results once we actually have realtime data.
   *
   * This prevents an initial empty socket array from replacing
   * valid REST results with a temporary 0-0 state.
   */
  const activeVotes = useMemo(() => {
    if (liveVotes && liveVotes.length > 0) {
      return liveVotes;
    }

    return results;
  }, [liveVotes, results]);

  const votesAway = useMemo(
    () => getVoteCount(activeVotes, awayId),
    [activeVotes, awayId],
  );

  const votesHome = useMemo(
    () => getVoteCount(activeVotes, homeId),
    [activeVotes, homeId],
  );

  const totalVotes = votesAway + votesHome;

  const rawPctAway = totalVotes > 0 ? votesAway / totalVotes : 0;

  const rawPctHome = totalVotes > 0 ? votesHome / totalVotes : 0;

  /*
   * Animate each team's row independently.
   */
  useEffect(() => {
    const animation = Animated.parallel([
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
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animFillAway, animFillHome, rawPctAway, rawPctHome, resultsRevealed]);

  const handleVote = async (teamId: TeamId) => {
    if (!canVote || submittingRef.current || userVote != null) {
      return;
    }

    const previousVote = userVote;
    const previousResultsRevealed = resultsRevealed;

    submittingRef.current = true;

    setSubmittingTeamId(teamId);
    setErrorMessage(null);

    try {
      /*
       * Optimistically reveal the user's selection immediately.
       */
      setUserVote(teamId);
      setResultsRevealed(true);

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        () => {},
      );

      const response = await castLiveVote(teamId);

      if (!response.ok) {
        setUserVote(previousVote);
        setResultsRevealed(previousResultsRevealed);

        setErrorMessage(
          response.error || "Your vote didn't go through. Try again.",
        );

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        ).catch(() => {});

        return;
      }

      onVoteCast?.(teamId);

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    } catch (error: unknown) {
      console.warn("Vote error", error);

      setUserVote(previousVote);
      setResultsRevealed(previousResultsRevealed);

      setErrorMessage(
        getErrorMessage(error, "Your vote didn't go through. Try again."),
      );

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});
    } finally {
      submittingRef.current = false;
      setSubmittingTeamId(null);
    }
  };

  const formatPercentage = (percentage: number) =>
    `${Math.round(percentage * 100)}%`;

  const pickedName = useMemo(() => {
    if (isSameTeamId(userVote, awayId)) {
      return awayCode ?? "Away";
    }

    if (isSameTeamId(userVote, homeId)) {
      return homeCode ?? "Home";
    }

    return null;
  }, [userVote, awayId, awayCode, homeId, homeCode]);

  const subtitle = useMemo(() => {
    if (!canVote) {
      if (userVote != null && pickedName) {
        return `Final results — you picked ${pickedName}`;
      }

      return "Final results";
    }

    if (userVote != null && pickedName) {
      return `You picked ${pickedName}`;
    }

    return "Tap a team to cast your prediction";
  }, [canVote, userVote, pickedName]);

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

  if (phase === "error") {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Fan Prediction</HeadingTwo>

        <Text style={global.errorText}>
          {errorMessage ?? "We couldn't load this poll."}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Fan Prediction</HeadingTwo>

      <View style={styles.wrapper}>
        <PredictionCard
          code={awayCode}
          logo={awayLogo}
          color={awayColor ?? Colors.darkGray}
          fillAnim={animFillAway}
          onPress={() => {
            void handleVote(awayId);
          }}
          disabled={!canVote || userVote != null || submittingTeamId != null}
          isSelected={isSameTeamId(userVote, awayId)}
          showPercent={resultsRevealed}
          percentText={formatPercentage(rawPctAway)}
          isDark={isDark}
        />

        <PredictionCard
          code={homeCode}
          logo={homeLogo}
          color={homeColor ?? Colors.lightGray}
          fillAnim={animFillHome}
          onPress={() => {
            void handleVote(homeId);
          }}
          disabled={!canVote || userVote != null || submittingTeamId != null}
          isSelected={isSameTeamId(userVote, homeId)}
          showPercent={resultsRevealed}
          percentText={formatPercentage(rawPctHome)}
          isDark={isDark}
        />
      </View>

      <Text style={styles.subtitle}>{subtitle}</Text>

      {errorMessage ? (
        <Text style={global.errorText}>{errorMessage}</Text>
      ) : null}

      {resultsRevealed ? (
        <Text style={styles.totalVotesText}>
          {`${totalVotes.toLocaleString()} ${
            totalVotes === 1 ? "vote" : "votes"
          }`}
        </Text>
      ) : null}
    </View>
  );
}
