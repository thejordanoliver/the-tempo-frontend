import CBBCourtImage from "assets/Placeholders/CBBCourtPlaceholder.png";
import CourtImage from "assets/Placeholders/CourtPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import TabBar from "components/TabBars/TabBar";
import { Colors, Fonts } from "constants/styles";
import { getTeamByESPNId, getTeamLogo } from "constants/teams";
import { getCBBTeamByESPNId, getCBBTeamLogo } from "constants/teamsCBB";
import { getWNBATeamByESPNId, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useMemo, useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Play {
  id: string;
  shootingPlay: boolean;
  scoringPlay?: boolean;
  coordinate: { x: number; y: number };
  pointsAttempted?: number;
  scoreValue?: number;
  team?: { id: string | number };
  text?: string;
  period?: { number: number; displayValue: string };
  type: {
    id: number;
    text: string;
  };
}

interface ShotChartProps {
  plays?: Play[];
  homeId: string | number;
  awayId: string | number;
  homeEspnId: string | number;
  awayEspnId: string | number;
  homeLogo: any;
  awayLogo: any;
  league: string;
  neutralSite?: boolean;
  state: string | undefined;
}

type ShotChartTab =
  | "All"
  | "1st"
  | "2nd"
  | "3rd"
  | "4th"
  | "1st Half"
  | "2nd Half";

export default function ShotChart({
  plays = [],
  homeId,
  awayId,
  homeEspnId = "0",
  awayEspnId = "0",
  homeLogo,
  awayLogo,
  league,
  neutralSite = false,
  state,
}: ShotChartProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = shortChartStyles(isDark);

  const normalizedLeague = league.toLowerCase();

  const isMensCBB = normalizedLeague === "cbb";
  const isWCBB = normalizedLeague === "wcbb";
  const isCollegeBasketball = isMensCBB || isWCBB;
  const isWNBA = normalizedLeague === "wnba";

  /**
   * ESPN shot coordinates are based on a 94x50 court.
   * Keep the SVG viewBox matching the real coordinate system.
   */
  const COURT_LENGTH = 94;
  const COURT_WIDTH = 50;

  const homeEspnIdString = String(homeEspnId);
  const awayEspnIdString = String(awayEspnId);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [selectedQuarter, setSelectedQuarter] = useState<ShotChartTab>("All");

  const homeTeam = useMemo(() => {
    if (isCollegeBasketball) return getCBBTeamByESPNId(homeEspnId);
    if (isWNBA) return getWNBATeamByESPNId(homeEspnId);
    return getTeamByESPNId(homeEspnId);
  }, [homeEspnId, isCollegeBasketball, isWNBA]);

  const awayTeam = useMemo(() => {
    if (isCollegeBasketball) return getCBBTeamByESPNId(awayEspnId);
    if (isWNBA) return getWNBATeamByESPNId(awayEspnId);
    return getTeamByESPNId(awayEspnId);
  }, [awayEspnId, isCollegeBasketball, isWNBA]);

  const courtLogo = useMemo(() => {
    if (isCollegeBasketball) {
      return getCBBTeamLogo(homeId, false, isWCBB);
    }

    if (isWNBA) {
      return getWNBATeamLogo(homeId, false);
    }

    return getTeamLogo(homeId, false);
  }, [homeId, isCollegeBasketball, isWCBB, isWNBA]);

  const courtImage = isCollegeBasketball ? CBBCourtImage : CourtImage;

  const TABS: ShotChartTab[] = isCollegeBasketball
    ? ["All", "1st Half", "2nd Half"]
    : ["All", "1st", "2nd", "3rd", "4th"];

  const PERIOD_MAP: Record<string, number> = isCollegeBasketball
    ? {
        "1st Half": 1,
        "2nd Half": 2,
      }
    : {
        "1st": 1,
        "2nd": 2,
        "3rd": 3,
        "4th": 4,
      };

  const filteredPlays = plays.filter((p) => {
    if (!p.coordinate || !p.shootingPlay) return false;

    if (selectedQuarter !== "All") {
      return p.period?.number === PERIOD_MAP[selectedQuarter];
    }

    return true;
  });

  const renderShots = filteredPlays.map((p) => {
    const rawX = p.coordinate.x; // 0-50 court width
    const rawY = p.coordinate.y; // 0-94 court length

    let svgX = COURT_LENGTH - (rawY / COURT_LENGTH) * COURT_LENGTH;
    let svgY = (rawX / COURT_WIDTH) * COURT_WIDTH;

    const playTeamId = String(p.team?.id ?? "");

    const isHomeShot = playTeamId === homeEspnIdString;
    const isAwayShot = playTeamId === awayEspnIdString;

    /**
     * Flip away team shots so both teams are oriented correctly.
     */
    if (isAwayShot) {
      svgX = COURT_LENGTH - svgX;
      svgY = COURT_WIDTH - svgY;
    }

    const made = p.scoringPlay === true;

    let color = Colors.midTone;

    if (isHomeShot) {
      color = homeTeam?.color ?? "#00274c";
    } else if (isAwayShot) {
      color = awayTeam?.color ?? "#FF3B30";
    }

    const missSize = 1.2;

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
        <Circle cx={svgX} cy={svgY} r={missSize} fill="white" opacity={0.95} />

        <Circle
          cx={svgX}
          cy={svgY}
          r={missSize}
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

  if (state === "pre") {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Shot Chart</HeadingTwo>

      <View style={styles.wrapper}>
        <TabBar
          tabs={TABS}
          selected={selectedQuarter}
          onTabPress={(tab) => setSelectedQuarter(tab as ShotChartTab)}
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
                  width: 150,
                  height: 150,
                  left: layout.width / 2 - 75,
                  top: layout.height / 2 - 75,
                }}
                resizeMode="contain"
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

        <View style={styles.legendContainer}>
          {awayTeam && (
            <View style={styles.legendItem}>
              <Image
                source={awayLogo}
                style={styles.legendLogo}
                resizeMode="contain"
              />

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

              <Image
                source={homeLogo}
                style={styles.legendLogo}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export const shortChartStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },

    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
      overflow: "hidden",
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
      gap: 12,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
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
