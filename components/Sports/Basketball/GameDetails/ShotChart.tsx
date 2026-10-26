import { gameTeamIdsMatch } from "utils/games/gameTeamIdentity";
import Dropdown from "@/components/Dropdown";
import { Play } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import CourtImage from "assets/Placeholders/CourtPlaceholder.png";
import MCBBCourtImage from "assets/Placeholders/MCBBCourtPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { getNBATeam, getNBATeamLogo } from "constants/teams";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { getWCBBTeam, getWCBBTeamLogo } from "constants/teamsWCBB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useMemo, useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import NBAShotChart from "./Charts/NBAShotChart";

export interface ShotChartProps {
  plays?: Play[];
  homeId: string | number;
  awayId: string | number;
  homeColor: string;
  awayColor: string;
  homeLogo: any;
  awayLogo: any;
  league: string;
  neutralSite?: boolean;
  state: string | null;
}

type ShotChartTab =
  | "All"
  | "1st"
  | "2nd"
  | "3rd"
  | "4th"
  | "1st Half"
  | "2nd Half";

const COURT_LENGTH = 94;
const COURT_WIDTH = 50;
const NBA_BASKET_OFFSET = 5.25;
const SHOT_MARKER_EXTENT = 1.65;

export default function ShotChart(props: ShotChartProps) {
  return props.league === "nba" ? (
    <NBAShotChart {...props} />
  ) : (
    <LegacyShotChart {...props} />
  );
}

function LegacyShotChart({
  plays = [],
  homeId,
  awayId,
  homeColor,
  awayColor,
  homeLogo,
  awayLogo,
  league,
  neutralSite = false,
  state,
}: ShotChartProps) {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = shotChartStyles(isDark);

  const isMensMCBB = league === "mcbb";
  const isWCBB = league === "wcbb";
  const isCollegeBasketball = isMensMCBB || isWCBB;
  const isWNBA = league === "wnba";

  const homeColorValue = homeColor || Colors.midTone;
  const awayColorValue = awayColor || Colors.midTone;

  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<ShotChartTab>("All");

  const homeTeam = useMemo(() => {
    if (isWCBB) {
      return getWCBBTeam(homeId);
    }

    if (isMensMCBB) {
      return getMCBBTeam(homeId);
    }

    if (isWNBA) {
      return getWNBATeam(homeId);
    }

    return getNBATeam(homeId);
  }, [homeId, isMensMCBB, isWCBB, isWNBA]);

  const awayTeam = useMemo(() => {
    if (isWCBB) {
      return getWCBBTeam(awayId);
    }

    if (isMensMCBB) {
      return getMCBBTeam(awayId);
    }

    if (isWNBA) {
      return getWNBATeam(awayId);
    }

    return getNBATeam(awayId);
  }, [awayId, isMensMCBB, isWCBB, isWNBA]);

  const courtLogo = useMemo(() => {
    if (isWCBB) {
      return getWCBBTeamLogo(homeId, false);
    }

    if (isMensMCBB) {
      return getMCBBTeamLogo(homeId, false);
    }

    if (isWNBA) {
      return getWNBATeamLogo(homeId, false);
    }

    return getNBATeamLogo(homeId, false);
  }, [homeId, isMensMCBB, isWCBB, isWNBA]);

  const courtImage = isCollegeBasketball ? MCBBCourtImage : CourtImage;

  const tabs: ShotChartTab[] = isCollegeBasketball
    ? ["All", "1st Half", "2nd Half"]
    : ["All", "1st", "2nd", "3rd", "4th"];

  const periodOptions = tabs.map((tab) => ({
    label: tab,
    value: tab,
  }));

  const filteredPlays = useMemo(() => {
    const periodMap: Partial<Record<ShotChartTab, number>> = isCollegeBasketball
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

    return plays.filter((play) => {
      if (!play.coordinate || !play.shootingPlay) {
        return false;
      }

      if (selectedPeriod === "All") {
        return true;
      }

      return play.period?.number === periodMap[selectedPeriod];
    });
  }, [plays, selectedPeriod, isCollegeBasketball]);

  const renderShots = filteredPlays.map((play, index) => {
    if (play.coordinate?.x == null || play.coordinate?.y == null) {
      return null;
    }

    const rawX = Number(play.coordinate.x);
    const rawY = Number(play.coordinate.y);

    if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) {
      return null;
    }

    const playTeamId = play.team?.id;

    const matchesHomeId = gameTeamIdsMatch(playTeamId, homeId);
    const matchesAwayId = gameTeamIdsMatch(playTeamId, awayId);

    const isHomeShot = matchesHomeId;
    const isAwayShot = matchesAwayId;

    const basketOffset = league === "nba" ? NBA_BASKET_OFFSET : 0;
    let svgX = COURT_LENGTH - basketOffset - rawY;
    let svgY = rawX;

    if (isAwayShot) {
      svgX = COURT_LENGTH - svgX;
      svgY = COURT_WIDTH - svgY;
    }

    svgX = Math.max(
      SHOT_MARKER_EXTENT,
      Math.min(COURT_LENGTH - SHOT_MARKER_EXTENT, svgX),
    );
    svgY = Math.max(
      SHOT_MARKER_EXTENT,
      Math.min(COURT_WIDTH - SHOT_MARKER_EXTENT, svgY),
    );

    const color = isHomeShot
      ? homeColorValue
      : isAwayShot
        ? awayColorValue
        : Colors.midTone;

    const made = play.scoringPlay === true;
    const shotKey = `${play.id ?? "shot"}-${index}`;

    if (made) {
      return (
        <Circle
          key={shotKey}
          cx={svgX}
          cy={svgY}
          r={1.4}
          fill={color}
          opacity={0.9}
        />
      );
    }

    return (
      <React.Fragment key={shotKey}>
        <Circle
          cx={svgX}
          cy={svgY}
          r={1.4}
          fill={Colors.white}
          opacity={0.95}
        />

        <Circle
          cx={svgX}
          cy={svgY}
          r={1.2}
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
      style={[
        styles.madeMarker,
        {
          backgroundColor: color,
        },
      ]}
    />
  );

  const MissView = ({ color }: { color: string }) => (
    <View
      style={[
        styles.missedMarker,
        {
          borderColor: color,
        },
      ]}
    />
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setLayout({
      width,
      height,
    });
  };

  const handlePeriodSelect = (value: string) => {
    if (tabs.includes(value as ShotChartTab)) {
      setSelectedPeriod(value as ShotChartTab);
    }
  };

  if (state === "pre") {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Shot Chart</HeadingTwo>

      <View style={styles.wrapper}>
        <View style={styles.dropdownRow}>
          <Dropdown
            options={periodOptions}
            selectedValue={selectedPeriod}
            onSelect={handlePeriodSelect}
            isDark={isDark}
          />
        </View>

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
                style={[
                  styles.courtLogo,
                  {
                    left: layout.width / 2 - 75,
                    top: layout.height / 2 - 75,
                  },
                ]}
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
              {MadeView({ color: awayColorValue })}

              <Text style={styles.legendText}>Miss</Text>
              {MissView({ color: awayColorValue })}
            </View>
          )}

          {homeTeam && (
            <View style={styles.legendItem}>
              <Text style={styles.legendText}>Make</Text>
              {MadeView({ color: homeColorValue })}

              <Text style={styles.legendText}>Miss</Text>
              {MissView({ color: homeColorValue })}

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

export const shotChartStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },

    wrapper: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },

    dropdownRow: {
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
    },

    chartWrapper: {
      position: "relative",
      width: "100%",
      aspectRatio: COURT_LENGTH / COURT_WIDTH,
      overflow: "hidden",
    },

    courtImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },

    courtLogo: {
      position: "absolute",
      width: 150,
      height: 150,
    },

    legendContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 10,
      padding: 12,
    },

    legendItem: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    legendText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },

    legendLogo: {
      width: 20,
      height: 20,
    },

    divider: {
      width: 1,
      height: 14,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    madeMarker: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },

    missedMarker: {
      width: 14,
      height: 14,
      borderWidth: 4,
      borderRadius: 7,
      backgroundColor: Colors.white,
    },
  });
