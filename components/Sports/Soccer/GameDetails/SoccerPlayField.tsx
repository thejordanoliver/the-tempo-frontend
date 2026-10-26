import { Colors } from "constants/styles";
import { memo, useId } from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Pattern,
  Polygon,
  Rect,
} from "react-native-svg";
import type { SoccerPlayByPlayEvent } from "types/soccer/playByPlay";

// Project normalized pitch coordinates into one plane so the markings, ball,
// and play trail stay aligned at every phone/tablet width.
function point(x: number, y: number) {
  const near = y / 100;
  const left = 125 - 90 * near;
  const right = 875 + 90 * near;
  return { x: left + ((right - left) * x) / 100, y: 170 + 180 * near };
}
function points(coords: number[][]) {
  return coords
    .map(([x, y]) => {
      const p = point(x, y);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}
function rectangle(x: number, y: number, width: number, height: number) {
  return points([
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ]);
}

function Goal({ side, netId }: { side: "left" | "right"; netId: string }) {
  const x = side === "left" ? 0 : 100;
  const offset = side === "left" ? -2 : 2;
  const a = point(x, 44);
  const b = point(x, 56);
  const c = point(x + offset, 56);
  const d = point(x + offset, 44);
  return (
    <G>
      <Polygon
        points={`${a.x},${a.y} ${b.x},${b.y} ${b.x},${b.y - 12} ${a.x},${a.y - 12}`}
        fill={`url(#${netId})`}
        stroke={Colors.white}
        strokeWidth={0.9}
      />
      <Polygon
        points={`${a.x},${a.y - 12} ${b.x},${b.y - 12} ${c.x},${c.y - 6} ${d.x},${d.y - 6}`}
        fill={`url(#${netId})`}
        stroke={Colors.white}
        strokeWidth={0.9}
      />
      <Polygon
        points={`${b.x},${b.y} ${c.x},${c.y} ${c.x},${c.y - 6} ${b.x},${b.y - 12}`}
        fill={`url(#${netId})`}
        stroke={Colors.white}
        strokeWidth={0.9}
      />
    </G>
  );
}

function SoccerPlayField({ event }: { event?: SoccerPlayByPlayEvent }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const netId = `soccer-net-${id}`;
  const coordinates = event?.coordinates;
  const start =
    coordinates?.x != null && coordinates?.y != null
      ? point(coordinates.x, coordinates.y)
      : null;
  const end =
    coordinates?.endX != null && coordinates?.endY != null
      ? point(coordinates.endX, coordinates.endY)
      : null;
  const ball = end ?? start;
  const circle = Array.from({ length: 49 }, (_, index) => {
    const angle = (index / 48) * Math.PI * 2;
    return [50 + Math.cos(angle) * 8.7, 50 + Math.sin(angle) * 13.5];
  });
  const pentagon = Array.from({ length: 5 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 5 - Math.PI / 2;
    return `${Math.cos(angle) * 4.5},${Math.sin(angle) * 4.5}`;
  }).join(" ");

  return (
    <View style={{ width: "100%", aspectRatio: 1000 / 228 }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 152 1000 228"
        accessibilityRole="image"
        accessibilityLabel={
          ball
            ? `Soccer pitch showing the latest ${event?.typeText ?? "play"}`
            : "Soccer pitch; no position data for the latest play"
        }
      >
        <Defs>
          <Pattern
            id={netId}
            width={3}
            height={3}
            patternUnits="userSpaceOnUse"
          >
            <Rect width={3} height={3} fill={Colors.transparentWhite} />
            <Path d="M0 0H3M0 0V3" stroke={Colors.white} strokeWidth={0.45} />
          </Pattern>
        </Defs>
        <Polygon
          points="100,164 900,164 1000,365 0,365"
          fill={Colors.dark.leafGreen}
        />
        <Rect y={365} width={1000} height={7} fill={Colors.light.green} />
        {Array.from({ length: 6 }, (_, index) => (
          <Polygon
            key={index}
            points={rectangle((index * 100) / 6, 0, 100 / 6, 100)}
            fill={index % 2 ? "#579f50" : "#4e9549"}
          />
        ))}
        <Polygon
          points={rectangle(0, 0, 100, 100)}
          fill="none"
          stroke={Colors.white}
          strokeWidth={1.3}
        />
        <Polygon
          points={points([
            [50, 0],
            [50, 100],
          ])}
          fill="none"
          stroke={Colors.white}
          strokeWidth={1.3}
        />
        <Polygon
          points={points(circle)}
          fill="none"
          stroke={Colors.white}
          strokeWidth={1.2}
        />
        {[0, 84].map((x) => (
          <Polygon
            key={x}
            points={rectangle(x, 20, 16, 60)}
            fill="none"
            stroke={Colors.white}
            strokeWidth={1.2}
          />
        ))}
        {[0, 94.5].map((x) => (
          <Polygon
            key={x}
            points={rectangle(x, 35, 5.5, 30)}
            fill="none"
            stroke={Colors.white}
            strokeWidth={1.2}
          />
        ))}
        {[10.5, 50, 89.5].map((x) => {
          const spot = point(x, 50);
          return (
            <Circle
              key={x}
              cx={spot.x}
              cy={spot.y}
              r={1.5}
              fill={Colors.white}
            />
          );
        })}
        {[false, true].map((right) => {
          const x = right ? 84 : 16;
          const a = point(x, 35);
          const b = point(right ? 75 : 25, 50);
          const c = point(x, 65);
          return (
            <Path
              key={String(right)}
              d={`M${a.x} ${a.y}Q${b.x} ${b.y} ${c.x} ${c.y}`}
              stroke={Colors.white}
              strokeWidth={1.2}
              fill="none"
            />
          );
        })}
        <Goal side="left" netId={netId} />
        <Goal side="right" netId={netId} />
        {start && end ? (
          <>
            <Line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={Colors.white}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <Ellipse
              cx={start.x}
              cy={start.y}
              rx={4.5}
              ry={2.7}
              fill={Colors.light.blue}
              stroke={Colors.white}
              strokeWidth={1.5}
            />
          </>
        ) : null}
        {ball ? (
          <G transform={`translate(${ball.x} ${ball.y})`}>
            <Ellipse cy={6} rx={10} ry={4} fill={Colors.transparentBlack} />
            <Circle
              r={9}
              fill={Colors.white}
              stroke={Colors.black}
              strokeWidth={1}
            />
            <Polygon points={pentagon} fill={Colors.black} />
            {[0, 1, 2, 3, 4].map((index) => {
              const angle = (index * Math.PI * 2) / 5 - Math.PI / 2;
              return (
                <Line
                  key={index}
                  x1={Math.cos(angle) * 4.5}
                  y1={Math.sin(angle) * 4.5}
                  x2={Math.cos(angle) * 9}
                  y2={Math.sin(angle) * 9}
                  stroke={Colors.black}
                  strokeWidth={1.4}
                />
              );
            })}
          </G>
        ) : null}
      </Svg>
    </View>
  );
}

export default memo(SoccerPlayField);
