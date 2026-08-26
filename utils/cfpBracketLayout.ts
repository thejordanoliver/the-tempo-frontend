/*
|--------------------------------------------------------------------------
| Layout
|--------------------------------------------------------------------------
*/

export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 1150;

export const CARD_WIDTH = 250;
export const CARD_HEIGHT = 128;

export const BYE_CARD_WIDTH = CARD_WIDTH;
export const BYE_CARD_HEIGHT = 88;

export const CHAMPIONSHIP_CARD_WIDTH = 250;
export const CHAMPIONSHIP_CARD_HEIGHT = 260;

export const FIRST_ROUND_X = 30;
export const QUARTERFINAL_X = 430;
export const SEMIFINAL_X = 825;
export const CHAMPIONSHIP_X = 1220;

export const FIRST_ROUND_Y = [90, 330, 570, 810];

export const BYE_Y = [225, 465, 705, 945];

export const QUARTERFINAL_Y = [150, 390, 630, 870];

export const SEMIFINAL_Y = [270, 750];

export const CHAMPIONSHIP_Y = 439;

const HORIZONTAL_SNAP_OFFSET = 20;

export const snapBracketOffsets = [
  FIRST_ROUND_X,
  QUARTERFINAL_X,
  SEMIFINAL_X,
  CHAMPIONSHIP_X,
].map((x) => Math.max(0, x - HORIZONTAL_SNAP_OFFSET));


/*
|--------------------------------------------------------------------------
| Layout Helpers
|--------------------------------------------------------------------------
*/

export function getGameCardCenterY(y: number) {
  return y + CARD_HEIGHT / 2;
}

export function getByeCardCenterY(y: number) {
  return y + BYE_CARD_HEIGHT / 2;
}

export function buildMergeConnectorPath(
  topStartX: number,
  topStartY: number,
  bottomStartX: number,
  bottomStartY: number,
  endX: number,
  endY: number,
) {
  const furthestStartX = Math.max(topStartX, bottomStartX);

  const mergeX = furthestStartX + (endX - furthestStartX) * 0.5;

  return `
    M ${topStartX} ${topStartY}
    H ${mergeX}

    M ${bottomStartX} ${bottomStartY}
    H ${mergeX}

    M ${mergeX} ${topStartY}
    V ${bottomStartY}

    M ${mergeX} ${endY}
    H ${endX}
  `;
}
