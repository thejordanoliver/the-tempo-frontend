import { Colors } from "constants/styles";
import { StyleSheet, View } from "react-native";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  FINALS_HEIGHT,
  FINALS_WIDTH,
  getCenteredX,
  getX,
  nbaPlayoffBracketStyles,
  ROUND2_HEIGHT,
  ROUND2_WIDTH,
  ROUND3_HEIGHT,
  ROUND3_WIDTH,
} from "styles/NBAPlayoffBraketStyles";
import { CardLayout } from "types/basketball";
export const centerY = (layout?: CardLayout) =>
  layout ? layout.y + layout.height / 2 : 0;
export const rightX = (layout: CardLayout) => layout.x + layout.width;

export const COLS = {
  WEST_R1: 0,
  WEST_R2: 1,
  WEST_R3: 2,
  FINALS: 3,
  EAST_R3: 4,
  EAST_R2: 5,
  EAST_R1: 6,
};

export const WEST_ROUND1_LAYOUTS: CardLayout[] = [
  { x: getX(COLS.WEST_R1), y: 84, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.WEST_R1), y: 254, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.WEST_R1), y: 424, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.WEST_R1), y: 594, width: CARD_WIDTH, height: CARD_HEIGHT },
];

export const WEST_ROUND2_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.WEST_R2, ROUND2_WIDTH),
    y: 172,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
  {
    x: getCenteredX(COLS.WEST_R2, ROUND2_WIDTH),
    y: 512,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
];

export const WEST_ROUND3_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.WEST_R3, ROUND3_WIDTH),
    y: 344,
    width: ROUND3_WIDTH,
    height: ROUND3_HEIGHT,
  },
];

export const EAST_ROUND3_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.EAST_R3, ROUND3_WIDTH),
    y: 344,
    width: ROUND3_WIDTH,
    height: ROUND3_HEIGHT,
  },
];

export const EAST_ROUND2_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.EAST_R2, ROUND2_WIDTH),
    y: 172,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
  {
    x: getCenteredX(COLS.EAST_R2, ROUND2_WIDTH),
    y: 512,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
];

export const EAST_ROUND1_LAYOUTS: CardLayout[] = [
  { x: getX(COLS.EAST_R1), y: 84, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.EAST_R1), y: 254, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.EAST_R1), y: 424, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.EAST_R1), y: 594, width: CARD_WIDTH, height: CARD_HEIGHT },
];

export const FINALS_LAYOUT: CardLayout = {
  x: getCenteredX(COLS.FINALS, FINALS_WIDTH),
  y: 322,
  width: FINALS_WIDTH,
  height: FINALS_HEIGHT,
};

export const ConnectorLayer = ({ isDark }: { isDark: boolean }) => {
  const lineColor = isDark ? Colors.darkGray : Colors.lightGray;
  const styles = nbaPlayoffBracketStyles(isDark);
  const renderLeftPair = (source: CardLayout[], target: CardLayout[]) =>
    source.map((layout, index) => {
      const targetIndex = Math.floor(index / 2);
      const targetLayout = target[targetIndex];
      const nextLayout = source[index + 1];
      const styles = nbaPlayoffBracketStyles(isDark);
      // ❌ Skip anything invalid OR non-pair starters
      if (!layout || !targetLayout || index % 2 !== 0 || !nextLayout)
        return null;

      const midX = rightX(layout) + (targetLayout.x - rightX(layout)) / 2;

      return (
        <View key={`left-${index}`}>
          {/* Top horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: rightX(layout),
                top: centerY(layout),
                width: midX - rightX(layout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Bottom horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: rightX(nextLayout),
                top: centerY(nextLayout),
                width: midX - rightX(nextLayout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Vertical join */}
          <View
            style={[
              styles.connectorV,
              {
                left: midX,
                top: centerY(layout),
                height: centerY(nextLayout) - centerY(layout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* To next round */}
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(targetLayout),
                width: targetLayout.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />
        </View>
      );
    });

  const renderRightPair = (source: CardLayout[], target: CardLayout[]) =>
    source.map((layout, index) => {
      const styles = nbaPlayoffBracketStyles(isDark);
      const targetIndex = Math.floor(index / 2);
      const targetLayout = target[targetIndex];
      const nextLayout = source[index + 1];

      // ❌ Skip invalid / non-pairs
      if (!layout || !targetLayout || index % 2 !== 0 || !nextLayout)
        return null;

      const targetRight = rightX(targetLayout);
      const midX = targetRight + (layout.x - targetRight) / 2;

      return (
        <View key={`right-${index}`}>
          {/* Top horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(layout),
                width: layout.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Bottom horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(nextLayout),
                width: nextLayout.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Vertical join */}
          <View
            style={[
              styles.connectorV,
              {
                left: midX,
                top: centerY(layout),
                height: centerY(nextLayout) - centerY(layout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* To next round */}
          <View
            style={[
              styles.connectorH,
              {
                left: targetRight,
                top: centerY(targetLayout),
                width: midX - targetRight,
                backgroundColor: lineColor,
              },
            ]}
          />
        </View>
      );
    });

  const renderFinalsConnectors = () => {
    const westConf = WEST_ROUND3_LAYOUTS[0];
    const eastConf = EAST_ROUND3_LAYOUTS[0];
    const finals = FINALS_LAYOUT;

    if (!westConf || !eastConf) return null;

    return (
      <>
        {/* West conf finals → Finals */}
        <View
          style={[
            styles.connectorH,
            {
              left: rightX(westConf),
              top: centerY(westConf),
              width: finals.x - rightX(westConf),
              backgroundColor: lineColor,
            },
          ]}
        />

        {/* East conf finals → Finals */}
        <View
          style={[
            styles.connectorH,
            {
              left: rightX(finals),
              top: centerY(eastConf),
              width: eastConf.x - rightX(finals),
              backgroundColor: lineColor,
            },
          ]}
        />
      </>
    );
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {renderLeftPair(WEST_ROUND1_LAYOUTS, WEST_ROUND2_LAYOUTS)}
      {renderLeftPair(WEST_ROUND2_LAYOUTS, WEST_ROUND3_LAYOUTS)}
      {renderLeftPair(WEST_ROUND3_LAYOUTS, [FINALS_LAYOUT])}
      {renderRightPair(EAST_ROUND1_LAYOUTS, EAST_ROUND2_LAYOUTS)}
      {renderRightPair(EAST_ROUND2_LAYOUTS, EAST_ROUND3_LAYOUTS)}
      {renderRightPair(EAST_ROUND3_LAYOUTS, [FINALS_LAYOUT])}
      {renderFinalsConnectors()}
    </View>
  );
};
