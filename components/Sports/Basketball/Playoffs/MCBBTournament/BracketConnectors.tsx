import { Path } from "react-native-svg";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CARD_LEFT_IN_COLUMN,
  getRoundColumnX,
} from "utils/brackets/tournamentBracketLayout";

type SharedConnectorProps = {
  sourceX: number;
  sourceYs: readonly [number, number];
  destinationX: number;
  destinationY: number;
  color: string;
};

export function SharedConnector({
  sourceX,
  sourceYs,
  destinationX,
  destinationY,
  color,
}: SharedConnectorProps) {
  const elbowX = sourceX + (destinationX - sourceX) / 2;

  return (
    <Path
      d={`M ${sourceX} ${sourceYs[0]} H ${elbowX} V ${sourceYs[1]} H ${sourceX} M ${elbowX} ${destinationY} H ${destinationX}`}
      fill="none"
      stroke={color}
      strokeWidth={1}
    />
  );
}

type ConnectorPairProps = {
  sourceYs: readonly number[];
  destinationYs: readonly number[];
  sourceColumnIndex: number;
  destinationColumnIndex: number;
  color: string;
  direction: "ltr" | "rtl";
};
export function ConnectorPair({
  sourceYs,
  destinationYs,
  sourceColumnIndex,
  destinationColumnIndex,
  color,
  direction,
}: ConnectorPairProps) {
  const sourceColumnX = getRoundColumnX(sourceColumnIndex);
  const destinationColumnX = getRoundColumnX(destinationColumnIndex);

  const sourceX =
    sourceColumnX +
    CARD_LEFT_IN_COLUMN +
    (direction === "ltr" ? CARD_WIDTH : 0);
  const destinationX =
    destinationColumnX +
    CARD_LEFT_IN_COLUMN +
    (direction === "rtl" ? CARD_WIDTH : 0);

  return (
    <>
      {destinationYs.map((destinationY, destinationIndex) => {
        const firstSourceY = sourceYs[destinationIndex * 2];
        const secondSourceY = sourceYs[destinationIndex * 2 + 1];

        if (firstSourceY === undefined || secondSourceY === undefined) {
          return null;
        }

        const firstCenterY = firstSourceY + CARD_HEIGHT / 2;
        const secondCenterY = secondSourceY + CARD_HEIGHT / 2;
        const destinationCenterY = destinationY + CARD_HEIGHT / 2;

        return (
          <SharedConnector
            key={`connector-${destinationIndex}`}
            sourceX={sourceX}
            sourceYs={[firstCenterY, secondCenterY]}
            destinationX={destinationX}
            destinationY={destinationCenterY}
            color={color}
          />
        );
      })}
    </>
  );
}
