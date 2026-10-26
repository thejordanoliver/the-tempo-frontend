import { Colors } from "constants/styles";
import { memo, useId, useMemo, type ReactNode } from "react";
import { type ImageSourcePropType, View } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  Image,
  Line,
  Path,
  Polygon,
  Polyline,
} from "react-native-svg";
import {
  BASKETBALL_RIM_HEIGHT,
  basketballBasketPoint,
  basketballCourtViewport,
  projectBasketballRaisedPoint,
  projectBasketballCourtPoint as project,
} from "utils/sports/basketball/basketballCourtGeometry";

function points(coords: number[][]) {
  return coords
    .map(([x, y]) => {
      const p = project(x, y);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}
function arc(
  x: number,
  y: number,
  radius: number,
  start = 0,
  end = Math.PI * 2,
) {
  return Array.from({ length: 65 }, (_, i) => {
    const angle = start + ((end - start) * i) / 64;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  });
}
const boundary = points([
  [0, 0],
  [94, 0],
  [94, 50],
  [0, 50],
]);

const center = project(47, 25);

const centerTop = project(47, 0);

const centerBottom = project(47, 50);

function BasketballCourt({
  homeLogo,
  homeColor,
  isDark = false,
  layout = "full",
  homeHalf = true,
  accessibilityLabel = "Basketball court",
  children,
}: {
  homeLogo?: ImageSourcePropType;
  homeColor: string;
  isDark?: boolean;
  layout?: "full" | "half";
  homeHalf?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
}) {
  const clip = `basketball-court-${useId().replace(/[^\w-]/g, "")}`;
  const wood = isDark ? "#79694f" : "#dec8a9";
  const marking = isDark ? "#c0ae90" : "#91836e";
  const lane = isDark ? "#4f463b" : "#ad9f89";
  const edge = isDark ? "#514535" : "#9d8c75";
  const viewport = basketballCourtViewport(layout, homeHalf);
  const surface = useMemo(
    () => (
      <>
        <Defs>
          <ClipPath id={clip}>
            <Polygon points={boundary} />
          </ClipPath>
        </Defs>
        <Polygon points={boundary} transform="translate(0 10)" fill={edge} />
        <Polygon points={boundary} fill={wood} />
        <G clipPath={`url(#${clip})`}>
          {[28, 66].flatMap((x) =>
            [0, 49].map((y) => (
              <Polyline
                key={`sideline-${x}-${y}`}
                points={points([
                  [x, y],
                  [x, y + 1],
                ])}
                fill="none"
                stroke={marking}
                strokeWidth={2.5}
              />
            )),
          )}
          <Line
            x1={centerTop.x}
            y1={centerTop.y}
            x2={centerBottom.x}
            y2={centerBottom.y}
            stroke={marking}
            strokeWidth={2.5}
          />
          <Polygon
            points={points(arc(47, 25, 6))}
            fill="none"
            stroke={marking}
            strokeWidth={1.5}
            opacity={0.08}
          />
          {homeLogo ? (
            <G transform={`translate(${center.x} ${center.y}) scale(1 0.52)`}>
              <Image
                href={homeLogo}
                x={-78}
                y={-78}
                width={156}
                height={156}
                opacity={0.95}
                preserveAspectRatio="xMidYMid meet"
              />
            </G>
          ) : null}
          {[false, true].map((right) => {
            const reflect = (coords: number[][]) =>
              coords.map(([x, y]) => [right ? 94 - x : x, y]);
            const cornerAngle = Math.asin(22 / 23.75);
            const three = arc(5.25, 25, 23.75, -cornerAngle, cornerAngle);
            return (
              <G key={String(right)}>
                <Polygon
                  points={points(
                    reflect([
                      [0, 17],
                      [19, 17],
                      [19, 33],
                      [0, 33],
                    ]),
                  )}
                  fill={lane}
                  fillOpacity={0.6}
                  stroke={marking}
                  strokeWidth={2.2}
                />
                <Polyline
                  points={points(reflect([[0, 3], ...three, [0, 47]]))}
                  fill="none"
                  stroke={marking}
                  strokeWidth={2.4}
                />
                <Polyline
                  points={points(
                    reflect(arc(19, 25, 6, Math.PI / 2, Math.PI * 1.5)),
                  )}
                  fill="none"
                  stroke={marking}
                  strokeWidth={1.8}
                  strokeDasharray="5 5"
                />
                <Polyline
                  points={points(
                    reflect(arc(19, 25, 6, -Math.PI / 2, Math.PI / 2)),
                  )}
                  fill="none"
                  stroke={marking}
                  strokeWidth={2}
                />
                <Polyline
                  points={points(
                    reflect(arc(5.25, 25, 4, -Math.PI / 2, Math.PI / 2)),
                  )}
                  fill="none"
                  stroke={marking}
                  strokeWidth={1.8}
                />
                {[7, 8, 11, 14].flatMap((x) =>
                  [17, 33].map((y) => (
                    <Polyline
                      key={`${x}-${y}`}
                      points={points(
                        reflect([
                          [x, y],
                          [x, y + (y === 17 ? -0.8 : 0.8)],
                        ]),
                      )}
                      fill="none"
                      stroke={marking}
                      strokeWidth={1.3}
                    />
                  )),
                )}
              </G>
            );
          })}
        </G>
        {[false, true].map((right) => {
          const rim = basketballBasketPoint(right);
          const rimY = rim.y;
          const boardA = projectBasketballRaisedPoint(
            right ? 90 : 4,
            22,
            BASKETBALL_RIM_HEIGHT,
          );
          const boardB = projectBasketballRaisedPoint(
            right ? 90 : 4,
            28,
            BASKETBALL_RIM_HEIGHT,
          );
          const support = project(right ? 96 : -2, 27);
          const inward = right ? -1 : 1;
          const supportTop = support.y - BASKETBALL_RIM_HEIGHT - 2;
          const boardTop = boardA.y - 22;
          const boardBottom = boardA.y + 12;
          return (
            <G key={String(right)}>
              <Polygon
                points={`${support.x - 8},${support.y} ${support.x + 8},${support.y} ${support.x + 8},${supportTop} ${support.x - 8},${supportTop + 4}`}
                fill={homeColor}
              />
              <Polygon
                points={`${support.x + inward * 8},${support.y} ${support.x + inward * 22},${support.y - 26} ${support.x + inward * 12},${supportTop + 18} ${support.x + inward * 8},${supportTop}`}
                fill={homeColor}
              />
              <Polygon
                points={`${support.x - inward * 8},${support.y} ${support.x + inward * 8},${support.y} ${support.x + inward * 8},${supportTop} ${support.x - inward * 8},${supportTop + 4}`}
                fill={Colors.black}
                fillOpacity={0.18}
              />
              <Polyline
                points={`${support.x},${supportTop} ${support.x},${supportTop - 6} ${boardA.x},${boardA.y - 8}`}
                fill="none"
                stroke={Colors.lightGray}
                strokeWidth={4}
              />
              <Line
                x1={boardA.x}
                y1={boardTop}
                x2={boardA.x}
                y2={boardBottom}
                stroke={Colors.lightGray}
                strokeWidth={2}
              />
              <Polygon
                points={`${boardA.x},${boardTop} ${boardB.x},${boardB.y - 22} ${boardB.x},${boardB.y + 12} ${boardA.x},${boardBottom}`}
                fill={Colors.transparentWhite}
                stroke={Colors.lightGray}
                strokeWidth={1.5}
              />
              <Polygon
                points={`${boardA.x + inward * 3},${boardTop + 4} ${boardA.x + inward * 6},${boardTop + 7} ${boardA.x + inward * 6},${boardBottom - 3} ${boardA.x + inward * 3},${boardBottom}`}
                fill={Colors.white}
                fillOpacity={0.7}
              />
              <Path
                d={`M${rim.x - 8} ${rimY + 1} L${rim.x - 5} ${rimY + 15} H${rim.x + 5} L${rim.x + 8} ${rimY + 1} M${rim.x - 5} ${rimY + 2} L${rim.x + 3} ${rimY + 15} M${rim.x} ${rimY + 2} L${rim.x - 4} ${rimY + 15} M${rim.x + 5} ${rimY + 2} L${rim.x - 2} ${rimY + 15} M${rim.x - 7} ${rimY + 6} H${rim.x + 7} M${rim.x - 6} ${rimY + 11} H${rim.x + 6}`}
                fill="none"
                stroke={Colors.white}
                strokeWidth={1.3}
              />
              <Ellipse
                cx={rim.x}
                cy={rimY}
                rx={9}
                ry={3.2}
                fill={Colors.transparentWhite}
                stroke={Colors.light.orange}
                strokeWidth={2.2}
              />
            </G>
          );
        })}
      </>
    ),
    [clip, wood, marking, lane, edge, homeLogo, homeColor],
  );
  return (
    <View style={{ width: "100%", aspectRatio: viewport.aspectRatio }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={viewport.viewBox}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        {surface}
        {children}
      </Svg>
    </View>
  );
}
export default memo(BasketballCourt);
