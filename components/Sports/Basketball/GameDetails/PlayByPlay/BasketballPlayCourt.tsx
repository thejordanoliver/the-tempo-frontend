import PlayLocationPulse from "components/Sports/PlayByPlay/PlayLocationPulse";
import { Colors } from "constants/styles";
import { useBasketballAnimation } from "hooks/BasketballHooks/useBasketballAnimation";
import type { Play } from "hooks/BasketballHooks/useBasketballGameDetails";
import { memo, useMemo } from "react";
import { View, type ImageSourcePropType } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { Circle, Ellipse, G, Path, Text as SvgText } from "react-native-svg";
import { basketballAnimationScene } from "utils/sports/basketball/basketballAnimationScene";
import { projectBasketballCourtPoint as project } from "utils/sports/basketball/basketballCourtGeometry";
import BasketballCourt from "./BasketballCourt";

const AnimatedGroup = Animated.createAnimatedComponent(G);

function BasketballPlayCourt({
  play,
  homeId,
  awayId,
  homeLogo,
  homeColor,
  awayColor = Colors.light.blue,
  markerColor,
  isDark = false,
  active = false,
  eventKey = "",
  layout = "full",
}: {
  play?: Play | null;
  homeId: string | number;
  awayId: string | number;
  homeLogo: ImageSourcePropType;
  homeColor: string;
  awayColor?: string;
  markerColor: string;
  isDark?: boolean;
  active?: boolean;
  eventKey?: string;
  layout?: "full" | "half";
}) {
  const scene = useMemo(
    () => basketballAnimationScene(play, homeId, awayId),
    [play, homeId, awayId],
  );
  const { progress, reducedMotion } = useBasketballAnimation(eventKey, active);
  const trajectory = scene.trajectory;
  const startX = trajectory?.start.x ?? scene.point?.x ?? 500;
  const startY = trajectory?.start.y ?? scene.point?.y ?? 140;
  const endX = trajectory?.end.x ?? startX;
  const endY = trajectory?.end.y ?? startY;
  const controlX = trajectory?.control.x ?? startX;
  const controlY = trajectory?.control.y ?? startY;
  const movingBall = useAnimatedProps(() => {
    const t = progress.value,
      inverse = 1 - t;
    const rimOffset = 7 * Math.max(0, (t - 0.85) / 0.15);
    const x =
      inverse * inverse * startX + 2 * inverse * t * controlX + t * t * endX;
    const y =
      inverse * inverse * startY +
      2 * inverse * t * controlY +
      t * t * endY -
      rimOffset;
    return { matrix: [1, 0, 0, 1, x, y], opacity: 1 };
  }, [startX, startY, endX, endY, controlX, controlY]);
  const eventGlow = useAnimatedProps(() => ({
    opacity: 0.12 + (1 - progress.value) * 0.24,
  }));
  const possessionOut = useAnimatedProps(() => ({
    opacity: 0.32 * (1 - progress.value),
  }));
  const possessionIn = useAnimatedProps(() => ({
    opacity: 0.06 + 0.26 * progress.value,
  }));
  const possessionChange = scene.kind === "steal" || scene.kind === "turnover";
  const changedHome = scene.kind === "turnover" ? !scene.home : scene.home;
  const color =
    scene.kind === "turnover" && scene.knownTeam
      ? changedHome
        ? homeColor
        : awayColor
      : markerColor;
  const textColor = isDark ? Colors.white : Colors.black;
  const result = scene.isShot
    ? scene.blocked
      ? "BLOCKED"
      : scene.made
        ? `+${scene.points}`
        : "MISS"
    : scene.stolen
      ? "STEAL / TURNOVER"
      : scene.label.toUpperCase();
  const point = scene.point;
  return (
    <View style={{ width: "100%" }}>
      <BasketballCourt
        key={eventKey}
        homeLogo={homeLogo}
        homeColor={homeColor}
        isDark={isDark}
        layout={layout}
        homeHalf={
          scene.isShot && scene.knownTeam
            ? scene.home
            : point
              ? point.x >= 500
              : scene.home
        }
        accessibilityLabel={`Basketball court. ${scene.label}. ${scene.locationLabel}`}
      >
        <G key={eventKey}>
          {possessionChange && scene.knownTeam ? (
            <G>
              <AnimatedGroup animatedProps={possessionOut}>
                <Ellipse
                  cx={project(changedHome ? 23 : 71, 25).x}
                  cy={140}
                  rx={170}
                  ry={70}
                  fill={scene.home ? homeColor : awayColor}
                />
              </AnimatedGroup>
              <AnimatedGroup animatedProps={possessionIn}>
                <Ellipse
                  cx={project(changedHome ? 71 : 23, 25).x}
                  cy={140}
                  rx={170}
                  ry={70}
                  fill={color}
                />
              </AnimatedGroup>
            </G>
          ) : null}
          {point && !scene.located ? (
            <AnimatedGroup animatedProps={eventGlow}>
              <Ellipse
                cx={point.x}
                cy={point.y}
                rx={scene.kind === "free-throw" ? 32 : 70}
                ry={28}
                fill={color}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 5"
              />
            </AnimatedGroup>
          ) : null}
          {trajectory ? (
            <G>
              <Path
                d={trajectory.path}
                fill="none"
                stroke={isDark ? Colors.lightGray : Colors.darkGray}
                strokeOpacity={isDark ? 1 : 0.85}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <AnimatedGroup
                animatedProps={movingBall}
                transform={`translate(${endX} ${endY - 7})`}
              >
                <Circle
                  r={7}
                  fill={Colors.light.orange}
                  stroke={Colors.black}
                  strokeWidth={0.65}
                />
                <Path
                  d="M-7 0H7M0-7V7M-5-5Q3 0-5 5M5-5Q-3 0 5 5"
                  fill="none"
                  stroke={Colors.black}
                  strokeWidth={0.6}
                />
              </AnimatedGroup>
              {!scene.made ? (
                <SvgText
                  x={endX + (scene.home ? -12 : 12)}
                  y={endY - 12}
                  textAnchor={scene.home ? "end" : "start"}
                  fill={textColor}
                  stroke={isDark ? Colors.black : Colors.white}
                  strokeWidth={0.3}
                  fontWeight="bold"
                  fontSize={17}
                >
                  {result}
                </SvgText>
              ) : null}
              {scene.assisted && scene.made ? (
                <SvgText
                  x={startX}
                  y={startY - 18}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize={15}
                >
                  ASSIST
                </SvgText>
              ) : null}
            </G>
          ) : null}
          {point && scene.located ? (
            <G>
              {active && !reducedMotion ? (
                <PlayLocationPulse
                  key={eventKey}
                  x={point.x}
                  y={point.y}
                  color={Colors.white}
                  radiusX={24}
                  radiusY={9}
                />
              ) : null}
              <Ellipse
                cx={point.x}
                cy={point.y}
                rx={24}
                ry={9}
                fill={Colors.black}
                stroke={Colors.white}
                strokeWidth={5}
              />
            </G>
          ) : null}
          {!trajectory && scene.kind !== "other" ? (
            <G>
              <AnimatedGroup animatedProps={eventGlow}>
                <Ellipse
                  cx={
                    point?.x ??
                    (layout === "half" ? (scene.home ? 730 : 270) : 500)
                  }
                  cy={point?.y ?? 140}
                  rx={80}
                  ry={35}
                  fill={color}
                />
              </AnimatedGroup>
              <SvgText
                x={
                  point?.x ??
                  (layout === "half" ? (scene.home ? 730 : 270) : 500)
                }
                y={(point?.y ?? 140) - 18}
                textAnchor="middle"
                fill={textColor}
                fontWeight="bold"
                fontSize={16}
              >
                {result}
              </SvgText>
            </G>
          ) : null}
        </G>
      </BasketballCourt>
    </View>
  );
}
export default memo(BasketballPlayCourt);
