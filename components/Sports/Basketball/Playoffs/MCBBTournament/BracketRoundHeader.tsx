import { Text, View } from "react-native";
import {
  BRACKET_LAYOUT,
  type RegionalRoundCode,
} from "utils/brackets/tournamentBracket.utils";
import {
  REGIONAL_ROUNDS,
  ROUND_LABELS,
  REGION_ROUNDS_WIDTH,
  CENTER_STAGE_GAP,
  FINAL_STAGE_WIDTH,
  CARD_WIDTH,
  QUADRANT_BOARD_WIDTH,
} from "utils/brackets/tournamentBracketLayout";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

export function BracketRoundHeader({ isDark }: { isDark: boolean }) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const centerStageX = REGION_ROUNDS_WIDTH + CENTER_STAGE_GAP;
  const rightRegionX = centerStageX + FINAL_STAGE_WIDTH + CENTER_STAGE_GAP;
  const championshipX = centerStageX + (FINAL_STAGE_WIDTH - CARD_WIDTH) / 2;

  const renderRegionalHeaders = (
    rounds: readonly RegionalRoundCode[],
    left: number,
  ) => (
    <View
      style={{
        position: "absolute",
        left,
        top: 0,
        width: REGION_ROUNDS_WIDTH,
        height: BRACKET_LAYOUT.roundTitleHeight,
        flexDirection: "row",
        gap: BRACKET_LAYOUT.horizontalRoundGap,
      }}
    >
      {rounds.map((round) => (
        <Text
          key={`${left}-${round}`}
          style={[
            styles.roundLabel,
            { width: BRACKET_LAYOUT.roundColumnWidth },
          ]}
        >
          {ROUND_LABELS[round]}
        </Text>
      ))}
    </View>
  );

  return (
    <View
      style={{
        position: "relative",
        width: QUADRANT_BOARD_WIDTH,
        height: BRACKET_LAYOUT.roundTitleHeight,
      }}
    >
      {renderRegionalHeaders(REGIONAL_ROUNDS, 0)}
      {renderRegionalHeaders([...REGIONAL_ROUNDS].reverse(), rightRegionX)}

      <Text
        style={[
          styles.roundLabel,
          { position: "absolute", left: centerStageX, width: CARD_WIDTH },
        ]}
      >
        Final Four
      </Text>
      <Text
        style={[
          styles.roundLabel,
          { position: "absolute", left: championshipX, width: CARD_WIDTH },
        ]}
      >
        Championship
      </Text>
      <Text
        style={[
          styles.roundLabel,
          {
            position: "absolute",
            left: centerStageX + FINAL_STAGE_WIDTH - CARD_WIDTH,
            width: CARD_WIDTH,
          },
        ]}
      >
        Final Four
      </Text>
    </View>
  );
}
