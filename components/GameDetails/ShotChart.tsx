import CBBCourtImage from "assets/Placeholders/CBBCourtPlaceholder.png";
import CourtImage from "assets/Placeholders/CourtPlaceholder.png";

import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teams";
import { teams as cbbteams } from "constants/teamsCBB";
import React, { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Play {
  id: string;
  shootingPlay: boolean;
  scoringPlay?: boolean;
  coordinate: { x: number; y: number };
  pointsAttempted?: number;
  scoreValue?: number;
  team?: { id: string };
  text?: string;
  period?: { number: number; displayValue: string };
  type: {
    id: number;
    text: string;
  };
}

interface ShotChartProps {
  plays?: Play[];
  homeTeamId?: string;
  awayTeamId?: string;
  isCBB?: boolean;
  neutralSite?: boolean;
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

  const COURT_LENGTH = isCBB ? 82 : 84;
  const COURT_WIDTH = 50;

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [selectedQuarter, setSelectedQuarter] = useState<
    "All" | "1st" | "2nd" | "3rd" | "4th" | "1st Half" | "2nd Half"
  >("All");

  const teamArray = isCBB ? cbbteams : teams;
  const homeTeam = teamArray.find(
    (t) => t.espnID?.toString() === homeTeamId?.toString()
  );
  const awayTeam = teamArray.find(
    (t) => t.espnID?.toString() === awayTeamId?.toString()
  );

  const homeLogo = homeTeam?.logo;
  const courtImage = isCBB ? CBBCourtImage : CourtImage;

  // Tabs
  const TABS = isCBB
    ? ["All", "1st Half", "2nd Half"]
    : ["All", "1st", "2nd", "3rd", "4th"];

  const PERIOD_MAP: Record<string, number> = isCBB
    ? { "1st Half": 1, "2nd Half": 2 }
    : { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };

  if (plays.length) {
    const xs = plays.map((p) => p.coordinate?.x ?? 0);
    const ys = plays.map((p) => p.coordinate?.y ?? 0);
    console.log("coord x range", Math.min(...xs), Math.max(...xs));
    console.log("coord y range", Math.min(...ys), Math.max(...ys));
  }

  const filteredPlays = plays.filter((p) => {
    if (!p.coordinate || !p.shootingPlay) return false;
    if (selectedQuarter !== "All") {
      return p.period?.number === PERIOD_MAP[selectedQuarter];
    }
    return true;
  });

  const renderShots = filteredPlays.map((p) => {
    const rawX = p.coordinate.x; // 0–50 (half court width)
    const rawY = p.coordinate.y; // 0–94 (full court length)

    let svgX = COURT_LENGTH - (rawY / 94) * COURT_LENGTH; // horizontal
    let svgY = (rawX / 50) * COURT_WIDTH; // vertical

    if (p.team?.id === awayTeamId) {
      svgX = COURT_LENGTH - svgX;
    }
    if (p.team?.id === awayTeamId) {
      svgY = COURT_WIDTH - svgY;
    }

    const made = p.scoringPlay === true;

    let color = "gray";
    if (p.team?.id === homeTeamId) color = homeTeam?.color ?? "#007AFF";
    else if (p.team?.id === awayTeamId) color = awayTeam?.color ?? "#FF3B30";

    const size = 1.2;

    // MADE SHOT = solid circle
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

    // MISSED SHOT = donut + X
    return (
      <React.Fragment key={p.id}>
        {/* Donut white background */}
        <Circle cx={svgX} cy={svgY} r={size} fill="white" opacity={0.95} />

        {/* Colored ring outline */}
        <Circle
          cx={svgX}
          cy={svgY}
          r={size}
          stroke={color}
          strokeWidth={0.9}
          fill="none"
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
          source={courtImage}
          style={styles.courtImage}
          resizeMode="stretch"
        />

        {!neutralSite && homeLogo && layout.width > 0 && layout.height > 0 && (
          <Image
            source={homeLogo}
            style={{
              position: "absolute",
              width: 36,
              height: 36,
              left: layout.width / 2 - 18,
              top: layout.height / 2 - 18,
              opacity: 0.75,
            }}
          />
        )}

        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${COURT_LENGTH} ${COURT_WIDTH}`} // 94 (wide) × 50 (tall)
          style={StyleSheet.absoluteFill}
        >
          {renderShots}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {awayTeam && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorDot,
                {
                  backgroundColor: awayTeam.color ?? Colors.midTone,
                  marginRight: 4,
                },
              ]}
            />
            <Text style={styles.legendText}>{awayTeam.name}</Text>
          </View>
        )}

        {homeTeam && (
          <View style={styles.legendItem}>
            <Text style={styles.legendText}>{homeTeam.name}</Text>
            <View
              style={[
                styles.colorDot,
                {
                  backgroundColor: homeTeam.color ?? Colors.midTone,
                  marginLeft: 4,
                },
              ]}
            />
          </View>
        )}
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
    legendContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
      gap: 18,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    colorDot: {
      width: 20,
      height: 20,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    legendText: {
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
    },
  });
