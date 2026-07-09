import React, { memo } from "react";
import { View } from "react-native";

import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketCardLayout,
  BracketConnectionLayout,
  BracketPathConnectionLayout,
} from "./tournamentBracket.types";

type BracketConnectorsProps = {
  connections: readonly BracketConnectionLayout[];
  pathConnections?: readonly BracketPathConnectionLayout[];
  championshipConnection?: {
    sourceLayouts: readonly [BracketCardLayout, BracketCardLayout];
    targetLayout: BracketCardLayout;
  } | null;
  lineColor: string;
  lineWidth: number;
  isDark: boolean;
};

const centerY = (layout: BracketCardLayout) => layout.y + layout.height / 2;
const centerX = (layout: BracketCardLayout) => layout.x + layout.width / 2;
const rightX = (layout: BracketCardLayout) => layout.x + layout.width;
const positive = (value: number) => Math.max(1, Math.abs(value));

function horizontalLine(
  left: number,
  top: number,
  width: number,
  lineWidth: number,
  lineColor: string,
) {
  return {
    left,
    top: top - lineWidth / 2,
    width: positive(width),
    height: lineWidth,
    backgroundColor: lineColor,
  };
}

function verticalLine(
  left: number,
  top: number,
  height: number,
  lineWidth: number,
  lineColor: string,
) {
  return {
    left: left - lineWidth / 2,
    top,
    width: lineWidth,
    height: positive(height),
    backgroundColor: lineColor,
  };
}

function getJoinX(
  direction: BracketConnectionLayout["direction"],
  firstSource: BracketCardLayout,
  targetLayout: BracketCardLayout,
) {
  if (direction === "reverse") {
    const targetAttachX = rightX(targetLayout);
    return targetAttachX + (firstSource.x - targetAttachX) / 2;
  }

  const sourceAttachX = rightX(firstSource);
  return sourceAttachX + (targetLayout.x - sourceAttachX) / 2;
}

function BracketConnectorsComponent({
  connections,
  pathConnections = [],
  championshipConnection = null,
  lineColor,
  lineWidth,
  isDark,
}: BracketConnectorsProps) {
  const styles = tournamentBracketStyles(isDark);

  return (
    <View pointerEvents="none" style={styles.connectorLayer}>
      {connections.flatMap((connection) => {
        const [firstSource, secondSource] = connection.sourceLayouts;
        const firstCenterY = centerY(firstSource);
        const secondCenterY = centerY(secondSource);
        const targetCenterY = centerY(connection.targetLayout);
        const topY = Math.min(firstCenterY, secondCenterY);
        const joinX = getJoinX(
          connection.direction,
          firstSource,
          connection.targetLayout,
        );

        const firstAttachX =
          connection.direction === "reverse"
            ? firstSource.x
            : rightX(firstSource);
        const secondAttachX =
          connection.direction === "reverse"
            ? secondSource.x
            : rightX(secondSource);
        const targetAttachX =
          connection.direction === "reverse"
            ? rightX(connection.targetLayout)
            : connection.targetLayout.x;

        return [
          <View
            key={`${connection.id}-source-a`}
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(firstAttachX, joinX),
                firstCenterY,
                joinX - firstAttachX,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
          <View
            key={`${connection.id}-source-b`}
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(secondAttachX, joinX),
                secondCenterY,
                joinX - secondAttachX,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
          <View
            key={`${connection.id}-join`}
            style={[
              styles.connectorV,
              verticalLine(
                joinX,
                topY,
                secondCenterY - firstCenterY,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
          <View
            key={`${connection.id}-target`}
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(joinX, targetAttachX),
                targetCenterY,
                targetAttachX - joinX,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
        ];
      })}

      {pathConnections.flatMap((connection) => {
        const sourceAttachX =
          connection.direction === "reverse"
            ? connection.sourceLayout.x
            : rightX(connection.sourceLayout);
        const targetAttachX =
          connection.direction === "reverse"
            ? rightX(connection.targetLayout)
            : connection.targetLayout.x;
        const sourceCenterY = centerY(connection.sourceLayout);
        const targetCenterY = centerY(connection.targetLayout);
        const joinX = sourceAttachX + (targetAttachX - sourceAttachX) / 2;
        const topY = Math.min(sourceCenterY, targetCenterY);

        return [
          <View
            key={`${connection.id}-source`}
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(sourceAttachX, joinX),
                sourceCenterY,
                joinX - sourceAttachX,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
          <View
            key={`${connection.id}-join`}
            style={[
              styles.connectorV,
              verticalLine(
                joinX,
                topY,
                targetCenterY - sourceCenterY,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
          <View
            key={`${connection.id}-target`}
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(joinX, targetAttachX),
                targetCenterY,
                targetAttachX - joinX,
                lineWidth,
                lineColor,
              ),
            ]}
          />,
        ];
      })}

      {championshipConnection ? (
        <>
          <View
            style={[
              styles.connectorV,
              verticalLine(
                centerX(championshipConnection.targetLayout),
                centerY(championshipConnection.sourceLayouts[0]),
                centerY(championshipConnection.sourceLayouts[1]) -
                  centerY(championshipConnection.sourceLayouts[0]),
                lineWidth,
                lineColor,
              ),
            ]}
          />
          <View
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(
                  centerX(championshipConnection.sourceLayouts[0]),
                  centerX(championshipConnection.targetLayout),
                ),
                centerY(championshipConnection.sourceLayouts[0]),
                centerX(championshipConnection.targetLayout) -
                  centerX(championshipConnection.sourceLayouts[0]),
                lineWidth,
                lineColor,
              ),
            ]}
          />
          <View
            style={[
              styles.connectorH,
              horizontalLine(
                Math.min(
                  centerX(championshipConnection.sourceLayouts[1]),
                  centerX(championshipConnection.targetLayout),
                ),
                centerY(championshipConnection.sourceLayouts[1]),
                centerX(championshipConnection.targetLayout) -
                  centerX(championshipConnection.sourceLayouts[1]),
                lineWidth,
                lineColor,
              ),
            ]}
          />
        </>
      ) : null}
    </View>
  );
}

export const BracketConnectors = memo(BracketConnectorsComponent);
