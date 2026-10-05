import { Colors } from "constants/styles";
import { useCallback } from "react";
import { View } from "react-native";
import { NFLPlayoffBracketStyles } from "styles/PlayoffStyles/NFLPlayoffBracketStyles";
import type {
  CardLayout,
  ConnectorTarget,
} from "../../../../../types/football/nflBracketTypes";
import { centerY } from "../../../../../utils/nflBracketLayout";

export const BracketConnectors = ({
  isDark,
  connections,
}: {
  isDark: boolean;
  connections: ConnectorTarget[];
}) => {
  const styles = NFLPlayoffBracketStyles(isDark);

  const lineColor = isDark ? Colors.darkGray : Colors.lightGray;

  const renderConnectionGroup = useCallback(
    (key: string, sources: CardLayout[], target: CardLayout) => {
      const sourceIsRight = sources[0].x > target.x;
      const targetEdge = sourceIsRight ? target.x + target.width : target.x;
      const sourceEdge = sourceIsRight
        ? sources[0].x
        : sources[0].x + sources[0].width;
      const branchX = (sourceEdge + targetEdge) / 2;
      const mergeY = centerY(target);

      return (
        <View key={key} pointerEvents="none">
          {sources.map((source, index) => {
            const edge = sourceIsRight ? source.x : source.x + source.width;
            const y = centerY(source);
            return (
              <View key={index}>
                <View
                  style={[
                    styles.connectorH,
                    {
                      left: Math.min(edge, branchX),
                      top: y,
                      width: Math.abs(branchX - edge),
                      backgroundColor: lineColor,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.connectorV,
                    {
                      left: branchX,
                      top: Math.min(y, mergeY),
                      height: Math.abs(mergeY - y),
                      backgroundColor: lineColor,
                    },
                  ]}
                />
              </View>
            );
          })}
          <View
            style={[
              styles.connectorH,
              {
                left: Math.min(branchX, targetEdge),
                top: mergeY,
                width: Math.abs(targetEdge - branchX),
                backgroundColor: lineColor,
              },
            ]}
          />
        </View>
      );
    },
    [lineColor, styles.connectorH, styles.connectorV],
  );

  // Sources feeding the same card share one horizontal output.
  const groups = new Map<
    string,
    { target: CardLayout; sources: CardLayout[] }
  >();
  connections.forEach(({ source, target }) => {
    if (!source || !target) return;
    const key = `${target.x}:${target.y}:${target.width}:${target.height}`;
    const group = groups.get(key) ?? { target, sources: [] };
    group.sources.push(source);
    groups.set(key, group);
  });

  return (
    <>
      {[...groups].map(([key, { sources, target }]) =>
        renderConnectionGroup(key, sources, target),
      )}
    </>
  );
};
