import { Fonts } from "constants/fonts";
import { getNFLTeamsLogo, getTeamInfo } from "constants/teamsNFL";
import { PlayObject } from "hooks/NFLHooks/useNFLGamePossession";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

type PlayByPlayFieldProps = {
  lastPlay?: string | PlayObject;
  possessionTeamId?: number;
  homeTeamId: number;
  awayTeamId: number;
  isDark?: boolean;
};

const PlayByPlayField: React.FC<PlayByPlayFieldProps> = ({
  lastPlay,
  possessionTeamId,
  homeTeamId,
  awayTeamId,
}) => {
  const playAnim = useRef(new Animated.Value(50)).current;
  const [fieldWidth, setFieldWidth] = useState(0);
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const [firstDownPercent, setFirstDownPercent] = useState<number | null>(null);
  const [highlightEndzone, setHighlightEndzone] = useState<
    "home" | "away" | null
  >(null);

  const homeTeam = getTeamInfo(homeTeamId) ?? {
    code: "HOM",
    color: "#888",
    name: "Home",
    id: 0,
  };
  const awayTeam = getTeamInfo(awayTeamId) ?? {
    code: "AWY",
    color: "#444",
    name: "Away",
    id: 0,
  };

  const homeColor = homeTeam.color;
  const awayColor = awayTeam.color;
  const markerColor = possessionTeamId
    ? getTeamInfo(possessionTeamId)?.color || "#FFF"
    : "#FFF";
  const textColor = isDark ? "#fff" : "#000";

  // ✅ Compute marker position (0-100%) accounting for yardLineSide
  const computePercent = (play?: PlayObject) => {
    if (!play) return 50;

    const yardLine = play.end?.yardLine ?? play.start?.yardLine;
    const yardSide = play.end?.yardLineSide ?? play.start?.yardLineSide;
    if (yardLine == null) return 50;

    const home = getTeamInfo(homeTeamId);
    const away = getTeamInfo(awayTeamId);

    if (!home || !away) return 50;

    // Determine percent based on possession
    if (possessionTeamId === homeTeamId) {
      // Home has ball: 0 = away endzone, 100 = home endzone
      if (yardSide === home.code || yardSide === home.name) {
        // Ball is on own side
        return 100 - yardLine;
      } else {
        // Ball on opponent side
        return 100 - yardLine; // Actually same formula works if we assume 0=away, 100=home
      }
    } else if (possessionTeamId === awayTeamId) {
      // Away has ball: 0 = away endzone, 100 = home endzone
      if (yardSide === away.code || yardSide === away.name) {
        return yardLine;
      } else {
        return yardLine;
      }
    }

    return 50; // fallback
  };

  const glowAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (highlightEndzone) {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        delay: 2200,
        useNativeDriver: false,
      }),
    ]).start();
  }
}, [highlightEndzone]);


useEffect(() => {
  if (typeof lastPlay === "object") {
    const targetPercent = computePercent(lastPlay);
    Animated.spring(playAnim, {
      toValue: targetPercent,
      useNativeDriver: false,
      stiffness: 120,
      damping: 12,
      mass: 1,
    }).start();

    const playTextLower = lastPlay.text?.toLowerCase() ?? "";
    if (playTextLower.includes("touchdown")) {
      if (possessionTeamId === homeTeamId) setHighlightEndzone("home");
      else if (possessionTeamId === awayTeamId) setHighlightEndzone("away");
      setTimeout(() => setHighlightEndzone(null), 3000);
    }
  }
}, [lastPlay, possessionTeamId]);

  const playText =
    typeof lastPlay === "string" ? lastPlay : lastPlay?.text ?? "";

  const yardNumbers = [0, 10, 20, 30, 40, 50, 40, 30, 20, 10, 0];

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainer}>
        {/* Away Endzone */}
        <View
          style={[
            styles.endzone,
            {
              backgroundColor: awayColor,
              borderRightColor: "#fff",
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
            },
            highlightEndzone === "away" && styles.endzoneHighlight,
          ]}
        >
{highlightEndzone === "away" && (
  <Animated.View
    style={[
      styles.glowOverlay,
      { backgroundColor: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["rgba(255,255,0,0)", "rgba(255,255,0,0.4)"],
        }),
      },
    ]}
  />
)}


          <Image
            source={getNFLTeamsLogo(awayTeam.name, isDark)}
            style={[styles.endzoneLogo, { transform: [{ rotate: "-90deg" }] }]}
          />
          <Text
            style={[styles.endzoneText, { transform: [{ rotate: "-90deg" }] }]}
          >
            {awayTeam.code}
          </Text>
        </View>

        {/* Field */}
        <View
          style={styles.field}
          onLayout={(e) => setFieldWidth(e.nativeEvent.layout.width)}
        >
          {/* 10-yard lines + numbers */}
          {yardNumbers.map((yard, i) => {
            const isMajorMarker = yard % 10 === 0;
            const leftPercent = (i / (yardNumbers.length - 1)) * 100;
            const lineWidth = yard === 50 ? 4 : 2;

            return (
              <React.Fragment key={`major-${i}`}>
                {isMajorMarker && (
                  <View
                    style={[
                      styles.yardLine,
                      {
                        left: `${leftPercent}%`,
                        width: lineWidth,
                        opacity: yard === 50 ? 1 : 0.85,
                        transform: [{ translateX: -lineWidth / 2 }],
                      },
                    ]}
                  />
                )}
                {isMajorMarker && yard !== 0 && (
                  <Text
                    style={[
                      styles.yardNumber,
                      {
                        left: `${leftPercent}%`,
                        transform: [{ translateX: -8 }],
                      },
                    ]}
                  >
                    {yard}
                  </Text>
                )}
              </React.Fragment>
            );
          })}

          {/* 5-yard lines */}
          {Array.from({ length: 21 }, (_, i) => i * 5).map((yard) => {
            if (yard === 0 || yard === 100) return null;
            const leftPercent = (yard / 100) * 100;
            return (
              <View
                key={`five-yard-${yard}`}
                style={[styles.fiveYardLine, { left: `${leftPercent}%` }]}
              />
            );
          })}

          {/* Hash marks every yard */}
          {Array.from({ length: 101 }, (_, yard) => {
            if (yard === 0 || yard === 100) return null;
            const leftPercent = (yard / 100) * 100;
            const tickWidth = 1;
            const tickHeight = 6;
            const verticalOffset = 30;
            return (
              <React.Fragment key={`hash-${yard}`}>
                <View
                  style={[
                    styles.tickMark,
                    {
                      left: `${leftPercent}%`,
                      top: verticalOffset,
                      height: tickHeight,
                      width: tickWidth,
                      transform: [{ translateX: -tickWidth / 2 }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.tickMark,
                    {
                      left: `${leftPercent}%`,
                      bottom: verticalOffset,
                      height: tickHeight,
                      width: tickWidth,
                      transform: [{ translateX: -tickWidth / 2 }],
                    },
                  ]}
                />
              </React.Fragment>
            );
          })}

          {/* First Down Line */}
          {firstDownPercent !== null && (
            <View
              style={[styles.firstDownLine, { left: `${firstDownPercent}%` }]}
            />
          )}

          {/* Animated marker */}
          <Animated.View
            style={[
              styles.marker,
              {
                backgroundColor: isDark ? "#ff0000" : "#ff0000",
                left: playAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, fieldWidth],
                }),
              },
            ]}
          />
        </View>

        {/* Home Endzone */}
        <View
          style={[
            styles.endzone,
            {
              backgroundColor: homeColor,
              borderLeftColor: "#fff",
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
            },
            highlightEndzone === "home" && styles.endzoneHighlight,
          ]}
        >
{highlightEndzone === "home" && (
  <Animated.View
    style={[
      styles.glowOverlay,
      { backgroundColor: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["rgba(255,255,0,0)", "rgba(255,255,0,0.4)"],
        }),
      },
    ]}
  />
)}

          <Image
            source={getNFLTeamsLogo(homeTeam.name, isDark)}
            style={[styles.endzoneLogo, { transform: [{ rotate: "90deg" }] }]}
          />
          <Text
            style={[styles.endzoneText, { transform: [{ rotate: "90deg" }] }]}
          >
            {homeTeam.code}
          </Text>
        </View>
      </View>

      {/* <Text style={[styles.playText, { color: textColor }]}>{playText}</Text> */}
    </View>
  );
};

export default PlayByPlayField;

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginTop: 12, alignItems: "center" },
    fieldContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: isDark ? "#fff" : "#ccc",
      borderRadius: 4,
    },
    endzone: {
      width: 40,
      height: 120,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    glowOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 4,
  zIndex: 2,
},

    endzoneLogo: {
      width: 80,
      height: 80,
      resizeMode: "contain",
      position: "absolute",
      opacity: 0.2,
    },
    endzoneText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      textTransform: "uppercase",
      color: "#fff",
    },
    endzoneHighlight: {
      shadowColor: "yellow",
      shadowOpacity: 0.9,
      shadowRadius: 15,
      elevation: 10,
      borderWidth: 2,
      borderColor: "yellow",
    },
    field: {
      flex: 1,
      height: 120,
      backgroundColor: isDark ? "#1d1d1d" : "#ffff",
      position: "relative",
    },
    marker: {
      position: "absolute",
      top: 0,
      width: 2,
      height: "100%",
      borderRadius: 2,
      zIndex: 1, // ensure it's below firstDownLine
    },
    firstDownLine: {
      position: "absolute",
      top: 0,
      height: "100%",
      width: 3,
      backgroundColor: "yellow",
      opacity: 0.9,
      zIndex: 2, // now above marker
    },

    playText: { fontFamily: Fonts.OSREGULAR, marginTop: 4 },
    yardLine: {
      position: "absolute",
      top: 0,
      height: "100%",
      backgroundColor: "#fff",
      borderRadius: 1,
      zIndex: 1,
    },
    yardNumber: {
      position: "absolute",
      top: -18,
      fontSize: 10,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "#fff" : "#1d1d1d",
      textAlign: "center",
      zIndex: 3,
      width: 20,
    },
    tickMark: {
      position: "absolute",
      backgroundColor: isDark ? "#fff" : "#1d1d1d",
      opacity: 0.9,
      zIndex: 2,
      borderRadius: 1,
    },

    fiveYardLine: {
      position: "absolute",
      top: 0,
      height: "100%",
      width: 2,
      backgroundColor: isDark ? "#fff" : "#1d1d1d",
      opacity: 0.5,
      zIndex: 1,
      borderRadius: 1,
    },
  });
