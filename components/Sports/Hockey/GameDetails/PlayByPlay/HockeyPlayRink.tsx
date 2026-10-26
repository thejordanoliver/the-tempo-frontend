import { Colors } from "constants/styles";
import type { Play } from "hooks/HockeyHooks/useHockeyGameDetails";
import { memo, useId } from "react";
import { type ImageSourcePropType, View } from "react-native";
import PlayLocationPulse from "components/Sports/PlayByPlay/PlayLocationPulse";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Image,
  Line,
  Path,
  Pattern,
  Polygon,
  Rect,
} from "react-native-svg";
import {
  hockeyPlayLocation,
  projectHockeyRinkPoint as project,
} from "utils/sports/hockey/hockeyPlayByPlay";

function points(coords: number[][]) {
  return coords
    .map(([x, y]) => {
      const p = project(x, y);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function circle(x: number, y: number, radius: number) {
  return points(
    Array.from({ length: 49 }, (_, index) => {
      const angle = (index / 48) * Math.PI * 2;
      return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
    }),
  );
}

const rinkOutline = points(
  [
    [72, 14.5, 0],
    [-72, 14.5, 90],
    [-72, -14.5, 180],
    [72, -14.5, 270],
  ].flatMap(([x, y, start]) =>
    Array.from({ length: 13 }, (_, index) => {
      const angle = ((start + (index * 90) / 12) * Math.PI) / 180;
      return [x + Math.cos(angle) * 28, y + Math.sin(angle) * 28];
    }),
  ),
);

function HockeyPlayRink({
  play,
  homeLogo,
  puckColor = Colors.light.blue,
}: {
  play?: Play | null;
  homeLogo: ImageSourcePropType;
  puckColor?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clip = `hockey-rink-${id}`;
  const net = `hockey-net-${id}`;
  const puck = hockeyPlayLocation(play);
  const center = project(0, 0);
  const line = (x: number, color: string, width: number) => {
    const a = project(x, 42.5);
    const b = project(x, -42.5);
    return (
      <Line
        key={x}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={color}
        strokeWidth={width}
      />
    );
  };
  return (
    <View style={{ width: "100%", aspectRatio: 1000 / 260 }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 260"
        accessibilityRole="image"
        accessibilityLabel={
          puck
            ? "Hockey rink showing the latest play location"
            : "Hockey rink; no position data for the latest play"
        }
      >
        <Defs>
          <ClipPath id={clip}>
            <Polygon points={rinkOutline} />
          </ClipPath>
          <Pattern id={net} width={4} height={4} patternUnits="userSpaceOnUse">
            <Rect width={4} height={4} fill={Colors.transparentWhite} />
            <Path d="M0 0H4M0 0V4" stroke={Colors.midTone} strokeWidth={0.6} />
          </Pattern>
        </Defs>
        <Polygon
          points={rinkOutline}
          transform="translate(0 7)"
          fill={Colors.lightGray}
        />
        <Polygon
          points={rinkOutline}
          fill={Colors.white}
          stroke={Colors.lightGray}
          strokeWidth={2}
        />
        <G clipPath={`url(#${clip})`}>
          {[-25, 25].map((x) => line(x, Colors.light.blue, 6))}
          {line(0, Colors.light.red, 3)}
          {[-89, 89].map((x) => line(x, Colors.light.red, 1.8))}
          <Polygon
            points={circle(0, 0, 15)}
            fill="none"
            stroke={Colors.light.blue}
            strokeWidth={2}
          />
          <G transform={`translate(${center.x} ${center.y}) scale(1 0.56)`}>
            <Image
              href={homeLogo}
              x={-148}
              y={-80}
              width={296}
              height={160}
              opacity={0.75}
              preserveAspectRatio="xMidYMid meet"
            />
          </G>
          {[-69, 69].flatMap((x) =>
            [-22, 22].map((y) => {
              const center = project(x, y);
              return (
                <G key={`${x}-${y}`}>
                  <Polygon
                    points={circle(x, y, 15)}
                    fill="none"
                    stroke={Colors.light.red}
                    strokeWidth={1.5}
                  />
                  <Ellipse
                    cx={center.x}
                    cy={center.y}
                    rx={3}
                    ry={1.5}
                    fill={Colors.light.red}
                  />
                </G>
              );
            }),
          )}
          {[-20, 20].flatMap((x) =>
            [-22, 22].map((y) => {
              const p = project(x, y);
              return (
                <Ellipse
                  key={`${x}-${y}`}
                  cx={p.x}
                  cy={p.y}
                  rx={3}
                  ry={1.5}
                  fill={Colors.light.red}
                />
              );
            }),
          )}
          {[-89, 89].map((x) => {
            const crease = Array.from({ length: 25 }, (_, index) => {
              const angle = (index / 24) * Math.PI;
              return [
                x + (x < 0 ? 1 : -1) * 6 * Math.sin(angle),
                6 * Math.cos(angle),
              ];
            });
            const back = x < 0 ? x - 5 : x + 5;
            return (
              <G key={x}>
                <Polygon
                  points={points(crease)}
                  fill="#b8e1ef"
                  stroke={Colors.light.red}
                  strokeWidth={1}
                />
                <Polygon
                  points={points([
                    [x, 3],
                    [back, 3],
                    [back, -3],
                    [x, -3],
                  ])}
                  fill={`url(#${net})`}
                  stroke={Colors.light.red}
                  strokeWidth={2}
                />
              </G>
            );
          })}
          <Circle
            cx={center.x}
            cy={center.y}
            r={2.5}
            fill={Colors.light.blue}
          />
          {puck ? (
            <G>
              <PlayLocationPulse
                key={play?.id}
                x={puck.x}
                y={puck.y}
                color={puckColor}
              />
              <Ellipse
                cx={puck.x}
                cy={puck.y + 4}
                rx={10}
                ry={4}
                fill={Colors.transparentBlack}
              />
              <Ellipse
                cx={puck.x}
                cy={puck.y}
                rx={13}
                ry={8}
                fill="none"
                stroke={puckColor}
                strokeWidth={2.5}
              />
              <Ellipse
                cx={puck.x}
                cy={puck.y}
                rx={7}
                ry={4.5}
                fill={Colors.black}
                stroke={Colors.white}
                strokeWidth={1.5}
              />
            </G>
          ) : null}
        </G>
      </Svg>
    </View>
  );
}

export default memo(HockeyPlayRink);
