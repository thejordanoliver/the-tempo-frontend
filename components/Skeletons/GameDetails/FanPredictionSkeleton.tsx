import FanPredictionFooter from "@/components/FanPrediction/FanPredictionFooter";
import FanPredictionHeader from "@/components/FanPrediction/FanPredictionHeader";
import FanPredictionSection from "@/components/FanPrediction/FanPredictionSection";
import PredictionGradient from "@/components/FanPrediction/PredictionGradient";
import { FanPredictionStyles } from "@/styles/FanPredictionStyles/FanPredictionStyles";
import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View, type TextStyle } from "react-native";
import type { FanPredictionScoring } from "types/fanPredictions";

export default function FanPredictionSkeleton({
  isDark,
  isLive = false,
  canVote = false,
  resultsRevealed = !canVote,
  hasPick = false,
  subtitle = canVote
    ? "Pick a team to reveal fan votes"
    : "Predictions are locked",
  scoring,
  scoringError,
  retryScoring,
  children,
}: {
  isDark: boolean;
  isLive?: boolean;
  canVote?: boolean;
  resultsRevealed?: boolean;
  hasPick?: boolean;
  subtitle?: string;
  scoring?: FanPredictionScoring | null;
  scoringError?: boolean;
  retryScoring?: () => void;
  children?: ReactNode;
}) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

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
        {["away", "home"].map((team) => (
          <View key={team} style={[styles.predictionCard, styles.matchupCard]}>
            <PredictionGradient
              color={Colors.midTone}
              fillPercentage={0}
              isSelected={false}
              isDark={isDark}
            />
            <View style={[styles.cardContent, styles.matchupCardContent]}>
              <View style={styles.matchupIdentity}>
                <SkeletonCircle size={styles.teamLogo.width} />
                <SkeletonBlock
                  width={44}
                  height={styles.matchupTeamLabel.lineHeight}
                />
              </View>
              {resultsRevealed ? (
                <View>
                  <SkeletonBlock
                    width={60}
                    height={styles.matchupPercentage.lineHeight}
                  />
                  <SkeletonText textStyle={styles.matchupPercentageLabel}>
                    of fan picks
                  </SkeletonText>
                </View>
              ) : (
                <View style={styles.matchupAction}>
                  <SkeletonCircle size={14} />
                  <SkeletonBlock width={48} height={12} />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusCopy}>
          <SkeletonCircle size={14} />
          <SkeletonText textStyle={styles.subtitle}>{subtitle}</SkeletonText>
        </View>
        {resultsRevealed && (
          <SkeletonText textStyle={styles.totalVotesText}>
            000 votes
          </SkeletonText>
        )}
      </View>

      {!isLive && <FanPredictionFooter />}
    </FanPredictionSection>
  );
}

function SkeletonText({
  children,
  textStyle,
}: {
  children: ReactNode;
  textStyle: TextStyle;
}) {
  return (
    <View
      style={placeholderStyles.textContainer}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Text style={[textStyle, placeholderStyles.hiddenText]}>{children}</Text>
      <SkeletonBlock
        height={textStyle.fontSize}
        style={placeholderStyles.textBlock}
      />
    </View>
  );
}

const placeholderStyles = StyleSheet.create({
  textContainer: {
    position: "relative",
    flexShrink: 1,
    justifyContent: "center",
  },
  hiddenText: {
    opacity: 0,
  },
  textBlock: {
    position: "absolute",
    // Native percentage widths can resolve against the wider row.
    left: 0,
    right: 0,
    width: "auto",
  },
});
