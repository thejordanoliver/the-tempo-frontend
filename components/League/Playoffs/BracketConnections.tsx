import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  BRACKET_CARD_HEIGHT,
  BRACKET_CARD_WIDTH,
  BRACKET_HEADER_HEIGHT,
  type BracketNode,
} from "utils/playoffs/bracketLayout";

type Props = {
  nodes: BracketNode[];
  width: number;
  height: number;
  color: string;
};

function getConnectorPath(source: BracketNode, target: BracketNode) {
  const flowsRight = target.x > source.x;
  const startX = flowsRight ? source.x + BRACKET_CARD_WIDTH : source.x;
  const endX = flowsRight ? target.x : target.x + BRACKET_CARD_WIDTH;
  const startY = source.y + BRACKET_HEADER_HEIGHT + BRACKET_CARD_HEIGHT / 2;
  const endY = target.y + BRACKET_HEADER_HEIGHT + BRACKET_CARD_HEIGHT / 2;
  const turnX = (startX + endX) / 2;
  return `M ${startX} ${startY} H ${turnX} V ${endY} H ${endX}`;
}

export default function BracketConnections({
  nodes,
  width,
  height,
  color,
}: Props) {
  const paths = useMemo(() => {
    const byKey = new Map(nodes.map((node) => [node.key, node]));
    return nodes.flatMap((source) => {
      const target = source.nextKey ? byKey.get(source.nextKey) : undefined;
      return target
        ? [{ key: source.key, path: getConnectorPath(source, target) }]
        : [];
    });
  }, [nodes]);

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessible={false}
    >
      {paths.map(({ key, path }) => (
        <Path key={key} d={path} fill="none" stroke={color} strokeWidth={1.5} />
      ))}
    </Svg>
  );
}
