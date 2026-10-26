import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { useBasketballAnimation } from "hooks/BasketballHooks/useBasketballAnimation";
import { memo, useCallback, useId, useMemo, useState } from "react";
import {
  Text,
  Pressable,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { basketballVisualizationStyles } from "styles/GameDetailStyles/BasketballVisualizationStyles";
import type { BasketballChartPoint } from "types/basketball/visualizations";
import {
  basketballPeriodBoundaries,
  basketballStepPath,
  nearestBasketballChartPoint,
} from "utils/sports/basketball/basketballCharts";
import { basketballPeriodLabel } from "utils/sports/basketball/basketballEvents";

const AnimatedGroup = Animated.createAnimatedComponent(G);

function BasketballTimelineChart({
  points,
  mode,
  homeCode,
  awayCode,
  homeColor,
  awayColor,
  isDark,
  active,
  scope,
}: {
  points: readonly BasketballChartPoint[];
  mode: "probability" | "margin";
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  isDark: boolean;
  active: boolean;
  scope: string;
}) {
  const styles = useMemo(() => basketballVisualizationStyles(isDark), [isDark]);
  const [width, setWidth] = useState(340);
  const [selection, setSelection] = useState<{
    scope: string;
    key: string;
  } | null>(null);
  const id = useId().replace(/[^\w-]/g, "");
  const last = points[points.length - 1];
  const selected =
    selection?.scope === scope
      ? (points.find((p) => p.key === selection.key) ?? last)
      : last;
  const probability = mode === "probability";
  const text = isDark ? Colors.white : Colors.black;
  const grid = isDark ? Colors.darkGray : Colors.lightGray;
  const { progress } = useBasketballAnimation(
    `${scope}:${mode}:${last?.key}:${last?.home}:${last?.away}`,
    active,
  );
  const transition = useAnimatedProps(() => ({
    opacity: 0.65 + progress.value * 0.35,
  }));
  const geometry = useMemo(() => {
    const periods = Math.max(4, ...points.map((point) => point.period));
    const boundaries = basketballPeriodBoundaries(periods);
    const end = boundaries[boundaries.length - 1];
    const left = 36,
      right = Math.max(100, width - 8),
      top = 16,
      bottom = 172;
    const max = probability
      ? 100
      : Math.max(5, ...points.map((p) => Math.abs(p.home)));
    const x = (time: number) => left + (time / end) * (right - left);
    const y = (value: number) =>
      probability
        ? bottom - (value / 100) * (bottom - top)
        : (top + bottom) / 2 - ((value / max) * (bottom - top)) / 2;
    const homePath = basketballStepPath(points, "home", x, y);
    const awayPath = probability
      ? basketballStepPath(points, "away", x, y)
      : "";
    const first = points[0];
    const area =
      first && last
        ? `${homePath} L${x(last.seconds)} ${y(0)} H${x(first.seconds)} Z`
        : "";
    return {
      boundaries,
      left,
      right,
      top,
      bottom,
      max,
      x,
      y,
      homePath,
      awayPath,
      area,
    };
  }, [points, probability, width, last]);
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) setWidth(nextWidth);
  }, []);
  const selectAt = useCallback(
    (event: GestureResponderEvent) => {
      const end = geometry.boundaries[geometry.boundaries.length - 1];
      const time =
        Math.max(
          0,
          Math.min(
            1,
            (event.nativeEvent.locationX - geometry.left) /
              (geometry.right - geometry.left),
          ),
        ) * end;
      const point = nearestBasketballChartPoint(points, time);
      if (point)
        setSelection((previous) =>
          previous?.scope === scope && previous.key === point.key
            ? previous
            : { scope, key: point.key },
        );
    },
    [geometry, points, scope],
  );
  const currentIndex = selected ? points.indexOf(selected) : 0;
  return (
    <View>
      <HeadingTwo isDark={isDark}>
        {probability ? "Win Probability" : "Game Flow"}
      </HeadingTwo>
      <View style={styles.card}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: awayColor }]} />
            <Text style={styles.score}>
              {awayCode}
              {probability && last ? ` ${last.away.toFixed(1)}%` : ""}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: homeColor }]} />
            <Text style={styles.score}>
              {homeCode}
              {probability && last ? ` ${last.home.toFixed(1)}%` : ""}
            </Text>
          </View>
        </View>
        {selection?.scope === scope ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Show latest chart observation"
            onPress={() => setSelection(null)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Latest</Text>
          </Pressable>
        ) : null}
        {!points.length ? (
          <View style={styles.empty}>
            <Text style={styles.caption}>
              {probability
                ? "Win probability history is unavailable for this game."
                : "Scoring progression is unavailable for this game."}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.tooltip} accessibilityLiveRegion="polite">
              <Text style={styles.score}>
                {selected
                  ? `${basketballPeriodLabel(selected.period)} ${selected.clock} · `
                  : ""}
                {probability
                  ? `${awayCode} ${selected?.away.toFixed(1)}% · ${homeCode} ${selected?.home.toFixed(1)}%`
                  : `${awayCode} ${selected?.awayScore} – ${homeCode} ${selected?.homeScore} · ${selected?.home === 0 ? "Tied" : `${(selected?.home ?? 0) > 0 ? homeCode : awayCode} +${Math.abs(selected?.home ?? 0)}`}`}
              </Text>
              <Text style={styles.caption} numberOfLines={2}>
                {selected?.description}
              </Text>
            </View>
            <View
              style={styles.chart}
              onLayout={handleLayout}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={`${probability ? "Win probability" : "Scoring margin"} timeline. Swipe up or down to select a recorded play.`}
              accessibilityValue={{
                min: 0,
                max: points.length - 1,
                now: currentIndex,
                text: selected
                  ? `${basketballPeriodLabel(selected.period)} ${selected.clock}, ${homeCode} ${selected.home.toFixed(1)}, ${awayCode} ${selected.away.toFixed(1)}`
                  : "",
              }}
              accessibilityActions={[
                { name: "increment", label: "Next recorded play" },
                { name: "decrement", label: "Previous recorded play" },
              ]}
              onAccessibilityAction={({ nativeEvent }) => {
                const point =
                  points[
                    Math.max(
                      0,
                      Math.min(
                        points.length - 1,
                        currentIndex +
                          (nativeEvent.actionName === "increment" ? 1 : -1),
                      ),
                    )
                  ];
                if (point) setSelection({ scope, key: point.key });
              }}
              onStartShouldSetResponder={() => true}
              onResponderGrant={selectAt}
              onResponderMove={selectAt}
              onResponderTerminationRequest={() => true}
            >
              <Svg
                pointerEvents="none"
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} 210`}
              >
                <Defs>
                  <ClipPath id={`${id}-home`}>
                    <Rect
                      x={geometry.left}
                      y={geometry.top}
                      width={geometry.right - geometry.left}
                      height={geometry.y(0) - geometry.top}
                    />
                  </ClipPath>
                  <ClipPath id={`${id}-away`}>
                    <Rect
                      x={geometry.left}
                      y={geometry.y(0)}
                      width={geometry.right - geometry.left}
                      height={geometry.bottom - geometry.y(0)}
                    />
                  </ClipPath>
                </Defs>
                {(probability
                  ? [0, 50, 100]
                  : [-geometry.max, 0, geometry.max]
                ).map((value) => (
                  <G key={value}>
                    <Line
                      x1={geometry.left}
                      x2={geometry.right}
                      y1={geometry.y(value)}
                      y2={geometry.y(value)}
                      stroke={grid}
                      strokeWidth={0.5}
                    />
                    <SvgText
                      x={geometry.left - 5}
                      y={geometry.y(value) + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill={text}
                    >
                      {probability ? `${value}%` : value}
                    </SvgText>
                  </G>
                ))}
                {geometry.boundaries.slice(0, -1).map((time, index) => (
                  <G key={time}>
                    <Line
                      x1={geometry.x(time)}
                      x2={geometry.x(time)}
                      y1={geometry.top}
                      y2={geometry.bottom}
                      stroke={grid}
                      strokeDasharray="3 4"
                      strokeWidth={0.6}
                    />
                    <SvgText
                      x={geometry.x(
                        (time + geometry.boundaries[index + 1]) / 2,
                      )}
                      y={195}
                      textAnchor="middle"
                      fontSize={10}
                      fill={text}
                    >
                      {basketballPeriodLabel(index + 1)}
                    </SvgText>
                  </G>
                ))}
                <AnimatedGroup animatedProps={transition}>
                  <Path
                    d={geometry.homePath}
                    fill="none"
                    stroke={isDark ? Colors.white : Colors.black}
                    strokeOpacity={0.25}
                    strokeWidth={3.5}
                  />
                  {probability ? (
                    <Path
                      d={geometry.awayPath}
                      fill="none"
                      stroke={isDark ? Colors.white : Colors.black}
                      strokeOpacity={0.25}
                      strokeWidth={3.5}
                      strokeDasharray="5 3"
                    />
                  ) : null}
                  {!probability ? (
                    <>
                      <Path
                        d={geometry.area}
                        fill={homeColor}
                        fillOpacity={0.2}
                        clipPath={`url(#${id}-home)`}
                      />
                      <Path
                        d={geometry.area}
                        fill={awayColor}
                        fillOpacity={0.2}
                        clipPath={`url(#${id}-away)`}
                      />
                    </>
                  ) : null}
                  <Path
                    d={geometry.homePath}
                    fill="none"
                    stroke={homeColor}
                    strokeWidth={2}
                    clipPath={probability ? undefined : `url(#${id}-home)`}
                  />
                  {!probability ? (
                    <Path
                      d={geometry.homePath}
                      fill="none"
                      stroke={awayColor}
                      strokeWidth={2}
                      clipPath={`url(#${id}-away)`}
                    />
                  ) : (
                    <Path
                      d={geometry.awayPath}
                      fill="none"
                      stroke={awayColor}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                    />
                  )}
                </AnimatedGroup>
                {selected ? (
                  <G>
                    <Line
                      x1={geometry.x(selected.seconds)}
                      x2={geometry.x(selected.seconds)}
                      y1={geometry.top}
                      y2={geometry.bottom}
                      stroke={text}
                      strokeWidth={0.8}
                    />
                    <Circle
                      cx={geometry.x(selected.seconds)}
                      cy={geometry.y(selected.home)}
                      r={4}
                      fill={homeColor}
                      stroke={isDark ? Colors.black : Colors.white}
                      strokeWidth={1.5}
                    />
                    {probability ? (
                      <Circle
                        cx={geometry.x(selected.seconds)}
                        cy={geometry.y(selected.away)}
                        r={4}
                        fill={awayColor}
                        stroke={isDark ? Colors.black : Colors.white}
                        strokeWidth={1.5}
                      />
                    ) : null}
                  </G>
                ) : null}
              </Svg>
            </View>
            <Text style={styles.caption}>
              {probability
                ? "Recorded observations · ESPN Analytics"
                : "Scoring margin at recorded scoring plays"}{" "}
              · Touch the chart to inspect
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
export default memo(BasketballTimelineChart);
