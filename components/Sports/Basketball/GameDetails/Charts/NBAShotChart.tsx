import Dropdown from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { memo, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Ellipse } from "react-native-svg";
import { basketballVisualizationStyles } from "styles/GameDetailStyles/BasketballVisualizationStyles";
import {
  basketballPeriodLabel,
  basketballEventKey,
  orderedBasketballEvents,
} from "utils/sports/basketball/basketballEvents";
import {
  projectBasketballCourtPoint,
  validBasketballPosition,
} from "utils/sports/basketball/basketballCourtGeometry";
import BasketballCourt from "../PlayByPlay/BasketballCourt";
import type { ShotChartProps } from "../ShotChart";

const EMPTY_PLAYS: NonNullable<ShotChartProps["plays"]> = [];
function NBAShotChart({
  plays = EMPTY_PLAYS,
  homeId,
  awayId,
  homeColor,
  awayColor,
  homeLogo,
  neutralSite,
  state,
}: ShotChartProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => basketballVisualizationStyles(isDark), [isDark]);
  const [period, setPeriod] = useState("all");
  const [layout, setLayout] = useState("full");
  const shots = useMemo(
    () =>
      orderedBasketballEvents(plays).filter(
        (play) =>
          play.shootingPlay &&
          validBasketballPosition(play.courtPosition) &&
          [String(homeId), String(awayId)].includes(String(play.team?.id)),
      ),
    [plays, homeId, awayId],
  );
  const periods = useMemo(
    () => [
      { value: "all", label: "All periods" },
      ...[...new Set(shots.map((p) => Number(p.period.number)))]
        .sort((a, b) => a - b)
        .map((p) => ({ value: String(p), label: basketballPeriodLabel(p) })),
    ],
    [shots],
  );
  const markers = useMemo(
    () =>
      shots
        .filter(
          (play) =>
            (period === "all" || String(play.period.number) === period) &&
            (layout === "full" ||
              (layout === "home"
                ? play.courtPosition!.x >= 47
                : play.courtPosition!.x <= 47)),
        )
        .map((play) => {
          const point = projectBasketballCourtPoint(
            play.courtPosition!.x,
            play.courtPosition!.y,
          );
          const color =
            String(play.team.id) === String(homeId) ? homeColor : awayColor;
          return (
            <Ellipse
              key={basketballEventKey(play)}
              cx={point.x}
              cy={point.y}
              rx={6}
              ry={4}
              fill={
                play.scoringPlay ? color : isDark ? Colors.black : Colors.white
              }
              stroke={color}
              strokeWidth={2}
            />
          );
        }),
    [shots, period, layout, homeId, homeColor, awayColor, isDark],
  );
  if (state === "pre") return null;
  return (
    <View>
      <HeadingTwo isDark={isDark}>Shot Chart</HeadingTwo>
      <View style={styles.card}>
        <View style={styles.controls}>
          <Dropdown
            options={periods}
            selectedValue={period}
            onSelect={setPeriod}
            isDark={isDark}
            width={130}
          />
          <Dropdown
            options={[
              { value: "full", label: "Full court" },
              { value: "home", label: "Right half" },
              { value: "away", label: "Left half" },
            ]}
            selectedValue={layout}
            onSelect={setLayout}
            isDark={isDark}
            width={130}
          />
        </View>
        <BasketballCourt
          homeLogo={neutralSite ? undefined : homeLogo}
          homeColor={homeColor}
          isDark={isDark}
          layout={layout === "full" ? "full" : "half"}
          homeHalf={layout !== "away"}
          accessibilityLabel="Shot chart showing reported shot locations; filled markers are makes and outlined markers are misses"
        >
          {markers}
        </BasketballCourt>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: awayColor }]} />
            <Text style={styles.caption}>Away</Text>
          </View>
          <Text style={styles.caption}>Filled: made · Outline: missed</Text>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: homeColor }]} />
            <Text style={styles.caption}>Home</Text>
          </View>
        </View>
        <Text style={styles.caption}>
          {shots.length
            ? "Only shots with reported locations are shown."
            : "Reported shot locations are unavailable for this game."}
        </Text>
      </View>
    </View>
  );
}
export default memo(NBAShotChart);
