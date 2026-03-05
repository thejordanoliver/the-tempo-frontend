import CBBCourtImage from "assets/Placeholders/CBBCourtPlaceholder.png";
import CourtImage from "assets/Placeholders/CourtPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBar";
import { Colors, Fonts } from "constants/Styles";
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
  league?: "NBA" | "CBB" | "WCBB";
  neutralSite?: boolean;
}

export default function ShotChart({
  plays = [],
  homeTeamId,
  awayTeamId,
  league,
  neutralSite = false,
}: ShotChartProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const COURT_LENGTH = league === "CBB" || "WCBB" ? 82 : 84;
  const COURT_WIDTH = 50;

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [selectedQuarter, setSelectedQuarter] = useState<
    "All" | "1st" | "2nd" | "3rd" | "4th" | "1st Half" | "2nd Half"
  >("All");

  const isCBB = league === "CBB" || league === "WCBB";
  const isWomen = league === "WCBB";

  const teamArray = isCBB ? cbbteams : teams;

  const homeTeam = isCBB
    ? cbbteams.find((t) => t.espnID?.toString() === homeTeamId?.toString())
    : teams.find((t) => t.espnID?.toString() === homeTeamId?.toString());

  const awayTeam = isCBB
    ? cbbteams.find((t) => t.espnID?.toString() === awayTeamId?.toString())
    : teams.find((t) => t.espnID?.toString() === awayTeamId?.toString());

  const getLogo = (team?: typeof homeTeam, isDark?: boolean) => {
    if (!team) return undefined;

    if (isWomen && "wLogo" in team && team.wLogo) {
      return team.wLogo;
    }

    return isDark ? (team.logoLight ?? team.logo) : team.logo;
  };

  const homeLogo = getLogo(homeTeam, isDark);
  const awayLogo = getLogo(awayTeam, isDark);

  const courtLogo = getLogo(homeTeam, false);
  const courtImage = league === "CBB" || "WCBB" ? CBBCourtImage : CourtImage;

  // Tabs
  const TABS =
    league === "CBB"
      ? ["All", "1st Half", "2nd Half"]
      : ["All", "1st", "2nd", "3rd", "4th"];

  const PERIOD_MAP: Record<string, number> =
    league === "CBB"
      ? { "1st Half": 1, "2nd Half": 2 }
      : { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };

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
  const MadeView = ({ color }: { color: string }) => (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: color,
        opacity: 1,
      }}
    />
  );

  const MissView = ({ color }: { color: string }) => (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.white,
        opacity: 1,
        borderWidth: 4,
        borderColor: color,
      }}
    />
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View style={styles.container}>
      <HeadingTwo>Shot Chart</HeadingTwo>
      <View style={styles.wrapper}>
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

          {!neutralSite &&
            courtLogo &&
            layout.width > 0 &&
            layout.height > 0 && (
              <Image
                source={courtLogo}
                style={{
                  position: "absolute",
                  width: 150,
                  height: 150,
                  left: layout.width / 2 - 75,
                  top: layout.height / 2 - 75,
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

        <View style={styles.legendContainer}>
          {awayTeam && (
            <View style={styles.legendItem}>
              <Image source={awayLogo} style={styles.legendLogo} />
              <View style={styles.divider} />
              <Text style={styles.legendText}>Make</Text>
              <MadeView color={awayTeam.color ?? Colors.midTone} />
              <Text style={styles.legendText}>Miss</Text>
              <MissView color={awayTeam.color ?? Colors.midTone} />
            </View>
          )}

          {homeTeam && (
            <View style={styles.legendItem}>
              <Text style={styles.legendText}>Make</Text>
              <MadeView color={homeTeam.color ?? Colors.midTone} />
              <Text style={styles.legendText}>Miss</Text>
              <MissView color={homeTeam.color ?? Colors.midTone} />
              <View style={styles.divider} />
              <Image source={homeLogo} style={styles.legendLogo} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { width: "100%" },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
    },
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
      padding: 12,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center", // <-- centers icons & text vertically
      gap: 6,
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
    legendLogo: {
      width: 20,
      height: 20,
    },
    divider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
  });
