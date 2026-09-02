import React, { memo, useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import type {
  BracketCardLayout,
  BracketConnectionLayout,
  BracketPathConnectionLayout,
} from "./tournamentBracket.types";

type BracketConnectorsProps = {
  width: number;
  height: number;
  connections: readonly BracketConnectionLayout[];
  pathConnections?: readonly BracketPathConnectionLayout[];
  championshipConnection?: {
    sourceLayouts: readonly [BracketCardLayout, BracketCardLayout];
    targetLayout: BracketCardLayout;
  } | null;
  lineColor: string;
  lineWidth: number;
};

const centerY = (layout: BracketCardLayout) => layout.y + layout.height / 2;
const centerX = (layout: BracketCardLayout) => layout.x + layout.width / 2;
const rightX = (layout: BracketCardLayout) => layout.x + layout.width;
const bottomY = (layout: BracketCardLayout) => layout.y + layout.height;

function createMergePath(connection: BracketConnectionLayout): string {
  const [topSource, bottomSource] = [...connection.sourceLayouts].sort(
    (first, second) => centerY(first) - centerY(second),
  );
  const topAttachX =
    connection.direction === "reverse" ? topSource.x : rightX(topSource);
  const bottomAttachX =
    connection.direction === "reverse" ? bottomSource.x : rightX(bottomSource);
  const targetAttachX =
    connection.direction === "reverse"
      ? rightX(connection.targetLayout)
      : connection.targetLayout.x;
  const joinX = topAttachX + (targetAttachX - topAttachX) / 2;
  const topSourceY = centerY(topSource);
  const bottomSourceY = centerY(bottomSource);
  const targetY = centerY(connection.targetLayout);

  return [
    `M ${topAttachX} ${topSourceY} H ${joinX}`,
    `M ${bottomAttachX} ${bottomSourceY} H ${joinX}`,
    `M ${joinX} ${topSourceY} V ${bottomSourceY}`,
    `M ${joinX} ${targetY} H ${targetAttachX}`,
  ].join(" ");
}

function createPath(connection: BracketPathConnectionLayout): string {
  const sourceAttachX =
    connection.direction === "reverse"
      ? connection.sourceLayout.x
      : rightX(connection.sourceLayout);
  const targetAttachX =
    connection.direction === "reverse"
      ? rightX(connection.targetLayout)
      : connection.targetLayout.x;
  const sourceY = centerY(connection.sourceLayout);
  const targetY = centerY(connection.targetLayout);
  const joinX = sourceAttachX + (targetAttachX - sourceAttachX) / 2;

  return `M ${sourceAttachX} ${sourceY} H ${joinX} V ${targetY} H ${targetAttachX}`;
}

function createChampionshipPath(
  sourceLayouts: readonly [BracketCardLayout, BracketCardLayout],
  targetLayout: BracketCardLayout,
): string {
  const [topSource, bottomSource] = [...sourceLayouts].sort(
    (first, second) => centerY(first) - centerY(second),
  );
  return [
    `M ${centerX(topSource)} ${bottomY(topSource)} V ${targetLayout.y}`,
    `M ${centerX(bottomSource)} ${bottomSource.y} V ${bottomY(targetLayout)}`,
  ].join(" ");
}

function BracketConnectorsComponent({
  width,
  height,
  connections,
  pathConnections = [],
  championshipConnection = null,
  lineColor,
  lineWidth,
}: BracketConnectorsProps) {
  const regionalPaths = useMemo(
    () => connections.map(createMergePath),
    [connections],
  );
  const centerPaths = useMemo(
    () => pathConnections.map(createPath),
    [pathConnections],
  );
  const championshipPath = useMemo(
    () =>
      championshipConnection
        ? createChampionshipPath(
            championshipConnection.sourceLayouts,
            championshipConnection.targetLayout,
          )
        : null,
    [championshipConnection],
  );

  return (
    <Svg
      width={width}
      height={height}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {regionalPaths.map((path, index) => (
        <Path
          key={connections[index].id}
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {centerPaths.map((path, index) => (
        <Path
          key={pathConnections[index].id}
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {championshipPath ? (
        <Path
          d={championshipPath}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}

export const BracketConnectors = memo(BracketConnectorsComponent);
