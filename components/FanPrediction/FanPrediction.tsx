import FanPredictionSkeleton from "components/Skeletons/GameDetails/FanPredictionSkeleton";
import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import {
  useFanPrediction,
  type FanPredictionInput,
} from "hooks/FanPredictionHooks/useFanPrediction";

import { FanPredictionStyles } from "@/styles/FanPredictionStyles/FanPredictionStyles";
import { useMemo, type ReactNode } from "react";
import { Text, View, type ImageProps } from "react-native";
import { formatPercentage, isSameTeamId } from "utils/games/fanPredictionVotes";
import FanPredictionFooter from "./FanPredictionFooter";
import FanPredictionHeader from "./FanPredictionHeader";
import FanPredictionSection from "./FanPredictionSection";
import FanRankingsLink from "./FanRankingsLink";
import PredictionCard from "./PredictionCard";

type Props = FanPredictionInput & {
  awayLogo: ImageProps["source"] | string;
  awayColor?: string | null;
  homeLogo: ImageProps["source"] | string;
  homeColor?: string | null;
  children?: ReactNode;
};

export default function FanPrediction(props: Props) {
  return <FanPredictionContent {...props} />;
}

function FanPredictionContent(props: Props) {
  const {
    awayId,
    awayCode = "AWY",
    awayLogo,
    awayColor,
    homeId,
    homeCode = "HME",
    homeLogo,
    homeColor,
    state,
    scoring,
    scoringError,
    retryScoring,
    children,
  } = props;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const {
    phase,
    errorMessage,
    userVote,
    resultsRevealed,
    submittingTeamId,
    canVote,
    totalVotes,
    rawPctAway,
    rawPctHome,
    subtitle,
    handleAwayVote,
    handleHomeVote,
  } = useFanPrediction(props);
  const isLive = state === "in";
  const hasPick = userVote != null;
  const theme = isDark ? Colors.dark : Colors.light;
  const statusText =
    submittingTeamId != null
      ? "Saving your pick…"
      : canVote && !hasPick
        ? "Pick a team to reveal fan votes"
        : subtitle || "Predictions are locked";
  const voteDisabled =
    (canVote && !scoring) ||
    !canVote ||
    userVote != null ||
    submittingTeamId != null;

  if (
    phase === "loading" ||
    (phase === "ready" && canVote && !scoring && !scoringError)
  ) {
    return (
      <FanPredictionSkeleton
        isDark={isDark}
        isLive={isLive}
        canVote={canVote}
        resultsRevealed={resultsRevealed || !canVote}
        hasPick={hasPick}
        subtitle={statusText}
        scoring={scoring}
        scoringError={scoringError}
        retryScoring={retryScoring}
      >
        {children}
      </FanPredictionSkeleton>
    );
  }

  if (phase === "error") {
    return (
      <FanPredictionSection>
        {children}
        <Text style={global.errorText}>
          {errorMessage ?? "We couldn't load this poll."}
        </Text>
        <FanRankingsLink />
      </FanPredictionSection>
    );
  }

  return (
    <FanPredictionSection>
      {children}
      <FanPredictionHeader
        isDark={isDark}
        canVote={canVote}
        isLive={isLive}
        hasPick={hasPick}
        scoring={scoring}
        scoringError={scoringError}
        retryScoring={retryScoring}
      />
      <View style={styles.cardsRow}>
        <PredictionCard
          variant="matchup"
          isSubmitting={isSameTeamId(submittingTeamId, awayId)}
          code={awayCode}
          logo={awayLogo}
          color={awayColor ?? Colors.midTone}
          fillPercentage={resultsRevealed ? rawPctAway : 0}
          onPress={handleAwayVote}
          disabled={voteDisabled}
          isSelected={isSameTeamId(userVote, awayId)}
          showPercent={resultsRevealed}
          percentText={formatPercentage(rawPctAway)}
          isDark={isDark}
        />

        <PredictionCard
          variant="matchup"
          isSubmitting={isSameTeamId(submittingTeamId, homeId)}
          code={homeCode}
          logo={homeLogo}
          color={homeColor ?? Colors.midTone}
          fillPercentage={resultsRevealed ? rawPctHome : 0}
          onPress={handleHomeVote}
          disabled={voteDisabled}
          isSelected={isSameTeamId(userVote, homeId)}
          showPercent={resultsRevealed}
          percentText={formatPercentage(rawPctHome)}
          isDark={isDark}
        />
      </View>
      <View style={styles.statusRow}>
        <View style={styles.statusCopy}>
          <Ionicons
            name={
              hasPick
                ? "checkmark-circle"
                : canVote
                  ? "eye-off-outline"
                  : "lock-closed-outline"
            }
            size={14}
            color={hasPick ? theme.green : theme.secondaryText}
            accessible={false}
          />
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.subtitle, hasPick && styles.selectedStatus]}
          >
            {statusText}
          </Text>
        </View>
        {resultsRevealed && (
          <Text style={styles.totalVotesText}>
            {totalVotes === 0
              ? "No votes yet"
              : `${totalVotes.toLocaleString()} ${totalVotes === 1 ? "vote" : "votes"}`}
          </Text>
        )}
      </View>
      {errorMessage && (
        <Text accessibilityRole="alert" style={global.errorText}>
          {errorMessage}
        </Text>
      )}
      {!isLive && <FanPredictionFooter />}
    </FanPredictionSection>
  );
}
