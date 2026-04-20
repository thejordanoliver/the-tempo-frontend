import RinkImage from "assets/Placeholders/NHLRinkPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBars/TabBar";
import { Colors, Fonts } from "constants/styles";
import { getNHLTeamByEspnId, getNHLTeamLogo } from "constants/teamsNHL";
import React, { useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Play {
  id: string;
  shootingPlay: boolean;
  scoringPlay?: boolean;
  coordinate: { x: number; y: number };
  team?: { id: string };
  period?: { number: number };
  type: {
    id: number;
    text: string;
  };
}

interface ShotChartProps {
  plays?: Play[];
  homeTeamId?: string;
  awayTeamId?: string;
  neutralSite?: boolean;
  isDark: boolean;
}

export default function ShotChart({
  plays = [],
  homeTeamId,
  awayTeamId,
  neutralSite = false,
  isDark,
}: ShotChartProps) {
  const styles = getStyles(isDark);

  const RINK_LENGTH = 200;
  const RINK_WIDTH = 85;

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [selectedQuarter, setSelectedQuarter] = useState<
    "All" | "1st" | "2nd" | "3rd"
  >("All");

  const homeTeam = getNHLTeamByEspnId(homeTeamId ?? 0);
  const awayTeam = getNHLTeamByEspnId(awayTeamId ?? 0);

  const homeLogo = getNHLTeamLogo(homeTeam?.id ?? 0, isDark);
  const awayLogo = getNHLTeamLogo(awayTeam?.id ?? 0, isDark);

  const courtLogo = getNHLTeamLogo(homeTeam?.id ?? 0, false);
  const courtImage = RinkImage;

  const TABS = ["All", "1st", "2nd", "3rd"];
  const PERIOD_MAP: Record<string, number> = { "1st": 1, "2nd": 2, "3rd": 3 };

  const filteredPlays = plays.filter((p) => {
    if (!p.coordinate || !p.shootingPlay) return false;
    if (selectedQuarter !== "All") {
      return p.period?.number === PERIOD_MAP[selectedQuarter];
    }
    return true;
  });

  const renderShots = filteredPlays.map((p) => {
    let rawX = p.coordinate.x;
    let rawY = p.coordinate.y;

    // Clamp coordinates inside rink bounds
    rawX = Math.max(-100, Math.min(100, rawX));
    rawY = Math.max(-42.5, Math.min(42.5, rawY));

    // Flip only X for away team (correct NHL orientation)
    if (p.team?.id === awayTeamId) {
      rawX = -rawX;
    }

    const svgX = ((rawX + 100) / 200) * RINK_LENGTH;
    const svgY = ((rawY + 42.5) / 85) * RINK_WIDTH;

    const made = p.scoringPlay === true;

    let color = "gray";
    if (p.team?.id === homeTeamId) color = homeTeam?.color ?? "#007AFF";
    else if (p.team?.id === awayTeamId) color = awayTeam?.color ?? "#FF3B30";

    const size = 1.2;

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

    return (
      <React.Fragment key={p.id}>
        <Circle cx={svgX} cy={svgY} r={size} fill="white" opacity={0.95} />
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
    <View style={[styles.madeView, { backgroundColor: color }]} />
  );

  const MissView = ({ color }: { color: string }) => (
    <View style={[styles.missView, { borderColor: color }]} />
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Shot Chart</HeadingTwo>

      <View style={styles.wrapper}>
        <TabBar
          tabs={TABS}
          selected={selectedQuarter}
          onTabPress={(tab) => setSelectedQuarter(tab as any)}
          isDark={isDark}
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
                  width: 40,
                  height: 40,
                  left: layout.width / 2 - 20,
                  top: layout.height / 2 - 20,
                }}
              />
            )}

          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${RINK_LENGTH} ${RINK_WIDTH}`}
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
      aspectRatio: 175 / 85,
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
      alignItems: "center",
      gap: 6,
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

    madeView: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },

    missView: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: Colors.white,
      borderWidth: 4,
    },
  });
