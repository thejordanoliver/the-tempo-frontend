import FanPredictionSkeleton from "components/Skeletons/GameDetails/FanPredictionSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ImageProps } from "expo-image";
import {
  useFanPrediction,
  type FanPredictionInput,
} from "hooks/useFanPrediction";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";
import { formatPercentage, isSameTeamId } from "utils/fanPredictionVotes";
import FanPredictionSection from "./FanPredictionSection";
import FanRankingsLink from "./FanRankingsLink";
import PredictionCard from "./PredictionCard";

type Props = FanPredictionInput & {
  awayLogo: ImageProps["source"];
  awayColor?: string | null;
  homeLogo: ImageProps["source"];
  homeColor?: string | null;
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
  const voteDisabled = !canVote || userVote != null || submittingTeamId != null;

  if (phase === "loading") {
    return <FanPredictionSkeleton isDark={isDark} isLive={isLive} />;
  }

  if (phase === "error") {
    return (
      <FanPredictionSection>
        <Text style={global.errorText}>
          {errorMessage ?? "We couldn't load this poll."}
        </Text>
        <FanRankingsLink />
      </FanPredictionSection>
    );
  }

  return (
    <FanPredictionSection>
      <View style={styles.cardsRow}>
        <PredictionCard
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
      {isLive && userVote != null && (
        <View style={styles.statusRow}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      )}
      {!isLive && (
        <>
          <View style={styles.statusRow}>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {resultsRevealed && (
              <Text style={styles.totalVotesText}>
                {`${totalVotes.toLocaleString()} ${
                  totalVotes === 1 ? "vote" : "votes"
                }`}
              </Text>
            )}
          </View>
          <View style={styles.footer}>
            <Text style={styles.rankingHint}>
              Pregame picks earn 1 point for a correct prediction.
            </Text>
            <FanRankingsLink />
          </View>
        </>
      )}
    </FanPredictionSection>
  );
}
