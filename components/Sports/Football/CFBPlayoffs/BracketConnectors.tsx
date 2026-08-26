import { Colors } from "@/constants/styles";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  BYE_CARD_WIDTH,
  BYE_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_WIDTH,
  CHAMPIONSHIP_CARD_HEIGHT,
  CHAMPIONSHIP_X,
  CHAMPIONSHIP_Y,
  FIRST_ROUND_X,
  FIRST_ROUND_Y,
  QUARTERFINAL_X,
  QUARTERFINAL_Y,
  SEMIFINAL_X,
  SEMIFINAL_Y,
  buildMergeConnectorPath,
  getByeCardCenterY,
  getGameCardCenterY,
} from "../../../../utils/cfpBracketLayout";

/*
|--------------------------------------------------------------------------
| Bracket Connectors
|--------------------------------------------------------------------------
*/

export function BracketConnectors() {
  const openingRoundRight = FIRST_ROUND_X + CARD_WIDTH;

  const quarterfinalRight = QUARTERFINAL_X + CARD_WIDTH;

  const semifinalRight = SEMIFINAL_X + CARD_WIDTH;

  const connectorColor = Colors.midTone;

  return (
    <Svg
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {/*
      |--------------------------------------------------------------------------
      | First Round + Bye -> Quarterfinal
      |--------------------------------------------------------------------------
      */}

      {FIRST_ROUND_Y.map((firstRoundY, index) => {
        const gameCenterY = getGameCardCenterY(firstRoundY);

        const byeCenterY = getByeCardCenterY(BYE_Y[index]);

        const quarterfinalCenterY = getGameCardCenterY(QUARTERFINAL_Y[index]);

        return (
          <Path
            key={`opening-quarter-${index}`}
            d={buildMergeConnectorPath(
              openingRoundRight,
              gameCenterY,

              FIRST_ROUND_X + BYE_CARD_WIDTH,
              byeCenterY,

              QUARTERFINAL_X,
              quarterfinalCenterY,
            )}
            stroke={connectorColor}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      })}

      {/*
      |--------------------------------------------------------------------------
      | Quarterfinals 1 + 2 -> Semifinal 1
      |--------------------------------------------------------------------------
      */}

      <Path
        d={buildMergeConnectorPath(
          quarterfinalRight,

          getGameCardCenterY(QUARTERFINAL_Y[0]),

          quarterfinalRight,

          getGameCardCenterY(QUARTERFINAL_Y[1]),

          SEMIFINAL_X,

          getGameCardCenterY(SEMIFINAL_Y[0]),
        )}
        stroke={connectorColor}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/*
      |--------------------------------------------------------------------------
      | Quarterfinals 3 + 4 -> Semifinal 2
      |--------------------------------------------------------------------------
      */}

      <Path
        d={buildMergeConnectorPath(
          quarterfinalRight,

          getGameCardCenterY(QUARTERFINAL_Y[2]),

          quarterfinalRight,

          getGameCardCenterY(QUARTERFINAL_Y[3]),

          SEMIFINAL_X,

          getGameCardCenterY(SEMIFINAL_Y[1]),
        )}
        stroke={connectorColor}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/*
      |--------------------------------------------------------------------------
      | Semifinals -> Championship
      |--------------------------------------------------------------------------
      */}

      <Path
        d={buildMergeConnectorPath(
          semifinalRight,

          getGameCardCenterY(SEMIFINAL_Y[0]),

          semifinalRight,

          getGameCardCenterY(SEMIFINAL_Y[1]),

          CHAMPIONSHIP_X,

          CHAMPIONSHIP_Y + CHAMPIONSHIP_CARD_HEIGHT / 2,
        )}
        stroke={connectorColor}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
