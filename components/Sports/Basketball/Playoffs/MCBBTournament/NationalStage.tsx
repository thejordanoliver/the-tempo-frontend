import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "constants/styles";
import type {
  TournamentGame,
  TournamentRegion,
} from "hooks/BasketballHooks/useTournamentBracket";
import {
  getFinalFourDisplayTeams,
  getSourceGameDisplayTeams,
  getWinnerTeam,
} from "utils/brackets/tournamentBracket.utils";
import {
  getRegionalTeamOrder,
  getOrderedFinalFourGames,
} from "utils/brackets/tournamentBracketGames";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  FINAL_STAGE_WIDTH,
  FINAL_STAGE_HEIGHT,
  FINAL_FOUR_Y,
} from "utils/brackets/tournamentBracketLayout";
import { ChampionPanel } from "./ChampionPanel";
import { MatchupCard } from "./MatchupCard";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

export type NationalStageProps = {
  regions: TournamentRegion[];
  finalFourGames: TournamentGame[];
  championshipGame: TournamentGame | null;
  isDark: boolean;
  league: string;
};
export function NationalStage({
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

  const semifinalOne = orderedFinalFour[0];
  const semifinalTwo = orderedFinalFour[1];
  const champion = getWinnerTeam(championshipGame);
  const semifinalOneDisplayTeams = semifinalOne
    ? getFinalFourDisplayTeams(semifinalOne, regionalTeamOrderById)
    : undefined;
  const semifinalTwoDisplayTeams = semifinalTwo
    ? getFinalFourDisplayTeams(semifinalTwo, regionalTeamOrderById)
    : undefined;
  const championshipDisplayTeams = championshipGame
    ? getSourceGameDisplayTeams(championshipGame, semifinalOne, semifinalTwo)
    : undefined;

  const semifinalOneX = 0;
  const semifinalTwoX = FINAL_STAGE_WIDTH - CARD_WIDTH;
  const championshipX = (FINAL_STAGE_WIDTH - CARD_WIDTH) / 2;
  const championPanelWidth = CARD_WIDTH + 22;
  const championPanelX = (FINAL_STAGE_WIDTH - championPanelWidth) / 2;
  const championPanelY = FINAL_FOUR_Y + CARD_HEIGHT + 48;

  return (
    <View
      style={[
        styles.bracketBoard,
        {
          width: FINAL_STAGE_WIDTH,
          height: FINAL_STAGE_HEIGHT,
        },
      ]}
    >
      <Svg
        pointerEvents="none"
        width={FINAL_STAGE_WIDTH}
        height={FINAL_STAGE_HEIGHT}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Path
          d={`M ${semifinalOneX + CARD_WIDTH} ${
            FINAL_FOUR_Y + CARD_HEIGHT / 2
          } H ${championshipX}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />

        <Path
          d={`M ${semifinalTwoX} ${
            FINAL_FOUR_Y + CARD_HEIGHT / 2
          } H ${championshipX + CARD_WIDTH}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />

        <Path
          d={`M ${championshipX + CARD_WIDTH / 2} ${
            FINAL_FOUR_Y + CARD_HEIGHT
          } V ${championPanelY}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={2}
        />
      </Svg>

      <View
        style={{
          position: "absolute",
          top: FINAL_FOUR_Y,
          left: semifinalOneX,
        }}
      >
        <MatchupCard
          game={semifinalOne}
          displayTeams={semifinalOneDisplayTeams}
          isDark={isDark}
          league={league}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: FINAL_FOUR_Y,
          left: semifinalTwoX,
        }}
      >
        <MatchupCard
          game={semifinalTwo}
          displayTeams={semifinalTwoDisplayTeams}
          isDark={isDark}
          league={league}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: FINAL_FOUR_Y,
          left: championshipX,
        }}
      >
        <MatchupCard
          game={championshipGame}
          displayTeams={championshipDisplayTeams}
          isDark={isDark}
          championship
          league={league}
        />
      </View>

      <View
        style={[
          styles.championPanelOverlay,
          {
            top: championPanelY,
            left: championPanelX,
            right: undefined,
            width: championPanelWidth,
          },
        ]}
      >
        <ChampionPanel champion={champion} isDark={isDark} league={league} />
      </View>
    </View>
  );
}
