import type { useNFLBracketModel } from "hooks/FootballHooks/useNFLBracketModel";
import { View } from "react-native";
import { NFLPlayoffBracketStyles } from "styles/PlayoffStyles/NFLPlayoffBracketStyles";
import { COLS, getColCenter } from "../../../../../utils/nflBracketLayout";
import { ConferenceBracket } from "./ConferenceBracket";
import { MatchupCard } from "./MatchupCard";
import { RoundLabel } from "./RoundLabel";

export function NFLBracketCanvas({
  model,
  isDark,
}: {
  model: ReturnType<typeof useNFLBracketModel>;
  isDark: boolean;
}) {
  const styles = NFLPlayoffBracketStyles(isDark);
  const { superBowlGame, FINALS_LAYOUT } = model;
  return (
    <View style={styles.canvas}>
      <RoundLabel
        title="WILD CARD"
        x={getColCenter(COLS.AFC_R1)}
        isDark={isDark}
      />

      <RoundLabel
        title="DIVISIONAL ROUND"
        x={getColCenter(COLS.AFC_R2)}
        isDark={isDark}
      />

      <RoundLabel
        title="CONFERENCE CHAMPIONSHIP"
        x={getColCenter(COLS.AFC_R3)}
        isDark={isDark}
      />

      <RoundLabel
        title="SUPER BOWL"
        x={getColCenter(COLS.FINALS)}
        isDark={isDark}
      />

      <RoundLabel
        title="CONFERENCE CHAMPIONSHIP"
        x={getColCenter(COLS.NFC_R3)}
        isDark={isDark}
      />

      <RoundLabel
        title="DIVISIONAL ROUND"
        x={getColCenter(COLS.NFC_R2)}
        isDark={isDark}
      />

      <RoundLabel
        title="WILD CARD"
        x={getColCenter(COLS.NFC_R1)}
        isDark={isDark}
      />

      <ConferenceBracket model={model} conference="AFC" isDark={isDark} />
      <ConferenceBracket model={model} conference="NFC" isDark={isDark} />

      <MatchupCard
        game={superBowlGame}
        layout={FINALS_LAYOUT}
        isDark={isDark}
        finals
      />
    </View>
  );
}
