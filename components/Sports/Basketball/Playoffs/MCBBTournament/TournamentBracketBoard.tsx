import { useMemo } from "react";
import { View } from "react-native";
import Svg from "react-native-svg";
import { Colors } from "constants/styles";
import { BRACKET_LAYOUT } from "utils/brackets/tournamentBracket.utils";
import {
  getRegionalTeamOrder,
  getOrderedFinalFourGames,
  getFinalFourRegionLayout,
} from "utils/brackets/tournamentBracketGames";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  REGIONAL_ROUNDS,
  REGION_ROUNDS_WIDTH,
  REGION_BLOCK_HEIGHT,
  CARD_LEFT_IN_COLUMN,
  ELITE_8_Y,
  CENTER_STAGE_GAP,
  FINAL_STAGE_WIDTH,
  FINAL_STAGE_HEIGHT,
  FINAL_FOUR_Y,
  QUADRANT_BOARD_WIDTH,
  QUADRANT_BOARD_HEIGHT,
  QUADRANT_VERTICAL_GAP,
  getRoundColumnX,
} from "utils/brackets/tournamentBracketLayout";
import { RegionBracket } from "./RegionBracket";
import { SharedConnector } from "./BracketConnectors";
import { NationalStage, type NationalStageProps } from "./NationalStage";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

export function TournamentBracketBoard({
  regions,
  finalFourGames,
  championshipGame,
  isDark,
  league,
}: NationalStageProps) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const connectorColor = isDark ? Colors.darkGray : Colors.lightGray;
  const regionalTeamOrderById = useMemo(
    () => getRegionalTeamOrder(regions),
    [regions],
  );
  const orderedFinalFour = useMemo(
    () => getOrderedFinalFourGames(finalFourGames, regionalTeamOrderById),
    [finalFourGames, regionalTeamOrderById],
  );
  const orderedRegions = useMemo(
    () =>
      getFinalFourRegionLayout(
        regions,
        orderedFinalFour,
        regionalTeamOrderById,
      ),
    [regions, orderedFinalFour, regionalTeamOrderById],
  );
  const centerStageX = REGION_ROUNDS_WIDTH + CENTER_STAGE_GAP;
  const rightRegionX = centerStageX + FINAL_STAGE_WIDTH + CENTER_STAGE_GAP;
  const bottomRegionY = REGION_BLOCK_HEIGHT + QUADRANT_VERTICAL_GAP;
  const centerStageY = (QUADRANT_BOARD_HEIGHT - FINAL_STAGE_HEIGHT) / 2;
  const regionalWinnerCenterY =
    BRACKET_LAYOUT.regionHeaderHeight + ELITE_8_Y[0] + CARD_HEIGHT / 2;
  const leftRegionWinnerX =
    getRoundColumnX(REGIONAL_ROUNDS.length - 1) +
    CARD_LEFT_IN_COLUMN +
    CARD_WIDTH;
  const rightRegionWinnerX = rightRegionX + CARD_LEFT_IN_COLUMN;
  const leftFinalFourX = centerStageX;
  const rightFinalFourX = centerStageX + FINAL_STAGE_WIDTH;
  const finalFourCenterY = centerStageY + FINAL_FOUR_Y + CARD_HEIGHT / 2;
  const regionalWinnerYs = [
    regionalWinnerCenterY,
    bottomRegionY + regionalWinnerCenterY,
  ] as const;

  const regionPositions = [
    { left: 0, top: 0, direction: "ltr" as const },
    { left: 0, top: bottomRegionY, direction: "ltr" as const },
    { left: rightRegionX, top: 0, direction: "rtl" as const },
    { left: rightRegionX, top: bottomRegionY, direction: "rtl" as const },
  ];

  return (
    <View
      style={[
        styles.bracketBoard,
        {
          width: QUADRANT_BOARD_WIDTH,
          height: QUADRANT_BOARD_HEIGHT,
        },
      ]}
    >
      <Svg
        pointerEvents="none"
        width={QUADRANT_BOARD_WIDTH}
        height={QUADRANT_BOARD_HEIGHT}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      >
        <SharedConnector
          sourceX={leftRegionWinnerX}
          sourceYs={regionalWinnerYs}
          destinationX={leftFinalFourX}
          destinationY={finalFourCenterY}
          color={connectorColor}
        />
        <SharedConnector
          sourceX={rightRegionWinnerX}
          sourceYs={regionalWinnerYs}
          destinationX={rightFinalFourX}
          destinationY={finalFourCenterY}
          color={connectorColor}
        />
      </Svg>

      {orderedRegions.map((region, index) => {
        if (!region) return null;
        const position = regionPositions[index];

        return (
          <View
            key={region.id}
            style={{
              position: "absolute",
              left: position.left,
              top: position.top,
              zIndex: 1,
            }}
          >
            <RegionBracket
              region={region}
              isDark={isDark}
              league={league}
              direction={position.direction}
            />
          </View>
        );
      })}

      <View
        style={{
          position: "absolute",
          left: centerStageX,
          top: centerStageY,
          zIndex: 1,
        }}
      >
        <NationalStage
          regions={regions}
          finalFourGames={finalFourGames}
          championshipGame={championshipGame}
          isDark={isDark}
          league={league}
        />
      </View>
    </View>
  );
}
