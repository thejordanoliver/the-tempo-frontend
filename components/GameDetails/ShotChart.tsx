import CourtImage from "assets/Placeholders/CourtPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBar";
import { teams } from "constants/teams";
import { teams as cbbteams } from "constants/teamsCBB";
import React, { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

interface Play {
  id: string;
  shootingPlay: boolean;
  coordinate: { x: number; y: number };
  pointsAttempted?: number;
  scoreValue?: number;
  team?: { id: string };
  text?: string;
  period?: { number: number; displayValue: string };
}

interface ShotChartProps {
  plays?: Play[];
  homeTeamId?: string;
  awayTeamId?: string; // Added away team
  isCBB?: boolean;
  neutralSite?: boolean; // ← NEW
}

export default function ShotChart({
  plays = [],
  homeTeamId,
  awayTeamId,
  isCBB = false,
  neutralSite = false,
}: ShotChartProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const COURT_LENGTH = 94;
  const COURT_WIDTH = 50;

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [selectedQuarter, setSelectedQuarter] = useState<
    "All" | "1st" | "2nd" | "3rd" | "4th"
  >("All");

  const teamArray = isCBB ? cbbteams : teams;
  const homeTeam = teamArray.find(
    (t) => t.espnID?.toString() === homeTeamId?.toString()
  );
  const awayTeam = teamArray.find(
    (t) => t.espnID?.toString() === awayTeamId?.toString()
  );

  const homeLogo = homeTeam?.logo;

  // Determine tabs
  const TABS = isCBB
    ? ["All", "1st Half", "2nd Half"]
    : ["All", "1st", "2nd", "3rd", "4th"];

  // Map tabs to ESPN period numbers
  const PERIOD_MAP: Record<string, number> = isCBB
    ? { "1st Half": 1, "2nd Half": 2 }
    : { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };

  // Filter plays by selected period
  const filteredPlays = plays.filter((p) => {
    if (!p.shootingPlay || !p.coordinate) return false;

    if (selectedQuarter === "All") return true;

    return p.period?.number === PERIOD_MAP[selectedQuarter];
  });

  const renderShots = filteredPlays.map((p) => {
    // Convert ESPN coordinates to SVG coordinates
    const svgX = (p.coordinate.x / 50) * COURT_LENGTH;
    const svgY = COURT_WIDTH - (p.coordinate.y / 47) * COURT_WIDTH;

    const made = (p.scoreValue ?? 0) > 0;

    // Determine color by team
    let color = "gray"; // fallback
    if (p.team?.id === homeTeamId) color = homeTeam?.color ?? "";
    else if (p.team?.id === awayTeamId) color = awayTeam?.color ?? "";

    if (made) {
      return (
        <Circle
          key={p.id}
          cx={svgX}
          cy={svgY}
          r={1.8}
          fill={color}
          opacity={0.9}
        />
      );
    }

    // Missed shot = X with team color
    const size = 2.5;
    return (
      <React.Fragment key={p.id}>
        <Line
          x1={svgX - size}
          y1={svgY - size}
          x2={svgX + size}
          y2={svgY + size}
          stroke={color}
          strokeWidth={0.9}
          opacity={0.9}
        />
        <Line
          x1={svgX + size}
          y1={svgY - size}
          x2={svgX - size}
          y2={svgY + size}
          stroke={color}
          strokeWidth={0.9}
          opacity={0.9}
        />
      </React.Fragment>
    );
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View style={styles.container}>
      <HeadingTwo>Shot Chart</HeadingTwo>

      {/* TabBar for quarters */}
      <TabBar
        tabs={TABS}
        selected={selectedQuarter}
        onTabPress={(tab) => setSelectedQuarter(tab as any)}
      />

      <View style={styles.chartWrapper} onLayout={onLayout}>
        <Image
          source={CourtImage}
          style={styles.courtImage}
          resizeMode="stretch"
        />

      {!neutralSite && homeLogo && layout.width > 0 && layout.height > 0 && (

          <Image
            source={homeLogo}
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              left: layout.width / 2 - 22,
              top: layout.height / 2 - 22,
              opacity: 0.75,
            }}
          />
        )}

        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${COURT_LENGTH} ${COURT_WIDTH}`}
          style={StyleSheet.absoluteFill}
        >
          {renderShots}
        </Svg>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { width: "100%", marginTop: 20 },
    chartWrapper: {
      width: "100%",
      aspectRatio: 94 / 50,
      overflow: "hidden",
      position: "relative",
    },
    courtImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
    },
  });
