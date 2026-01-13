import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import {
  getTeamInfo as getCFBTeamInfo,
  getTeamLogo as getCFBTeamLogo,
} from "constants/teamsCFB";
import {
  getTeamInfo as getNFLTeamInfo,
  getNFLTeamsLogo,
} from "constants/teamsNFL";
import { Athlete, PlayObject } from "hooks/NFLHooks/useNFLGamePossession";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { LeagueType } from "types/types";

type PlayByPlayFieldProps = {
  lastPlay?: string | PlayObject;
  possessionTeamId?: number;
  homeTeamId: number;
  awayTeamId: number;
  league?: LeagueType;
  isDark?: boolean;
};

const PlayByPlayField: React.FC<PlayByPlayFieldProps> = ({
  lastPlay,
  possessionTeamId,
  homeTeamId,
  awayTeamId,
  league = "NFL",
}) => {
  const playAnim = useRef(new Animated.Value(50)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const scoreReveal = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [currentPlay, setCurrentPlay] = useState(lastPlay);
  const [containerWidth, setContainerWidth] = useState(0);
  const [fieldWidth, setFieldWidth] = useState(0);
  const [highlightEndzone, setHighlightEndzone] = useState<
    "home" | "away" | null
  >(null);
  const [scoreAnimation, setScoreAnimation] = useState<{
    team: "home" | "away";
    text: string;
  } | null>(null);

  const isDark = useColorScheme() === "dark";
  const styles = playByPlayFieldStyles(isDark);
  const textColor = isDark ? Colors.white : Colors.black;

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  // Always update current play
  useEffect(() => {
    setCurrentPlay(lastPlay);
  }, [lastPlay]);

  const getTextColor = (text?: string) =>
    text === "Two-minute warning" ? "red" : textColor;

  const isStringPlay = typeof currentPlay === "string";

  // League helpers
  const getTeamInfo =
    league === "NFL" ? getNFLTeamInfo : getCFBTeamInfo || getNFLTeamInfo;
  const getLogo =
    league === "NFL" ? getNFLTeamsLogo : getCFBTeamLogo || getNFLTeamsLogo;

  const homeTeam = getTeamInfo(homeTeamId) ?? {
    code: "HOM",
    color: Colors.lightGray,
    secondaryColor: Colors.light.itemBackground,
    name: "Home",
    id: 0,
    espnID: 0,
  };
  const awayTeam = getTeamInfo(awayTeamId) ?? {
    code: "AWY",
    color: Colors.darkGray,
    secondaryColor: Colors.dark.itemBackground,
    name: "Away",
    id: 0,
    espnID: 0,
  };

  const homeColor = homeTeam.color;
  const awayColor = awayTeam.color;
  const homeEspnID = homeTeam.espnID;
  const awayEspnID = awayTeam.espnID;

  // Endzone glow pulse
  useEffect(() => {
    if (highlightEndzone) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [highlightEndzone]);

  // Compute field position
  const computePercent = (play?: PlayObject) => {
    if (!play) return 50;
    const yardLine = play.end?.yardLine ?? play.start?.yardLine;
    return yardLine != null ? Math.min(100, Math.max(0, Number(yardLine))) : 50;
  };

  // Animate ball marker + detect scores
  useEffect(() => {
    if (typeof lastPlay !== "object") return;

    const play = lastPlay as PlayObject;
    const targetPercent = computePercent(play);

    Animated.spring(playAnim, {
      toValue: targetPercent,
      useNativeDriver: false,
      stiffness: 120,
      damping: 12,
      mass: 1,
    }).start();

    const lastAnimatedRef = (PlayByPlayField as any)._lastAnimatedRef ?? {
      playId: null,
      result: null,
    };
    const playId =
      (play as any).id ??
      (play as any).sequence ??
      (play.start as any)?.playId ??
      Math.random();
    const playResult = play.drive?.result?.toUpperCase();

    if (
      lastAnimatedRef.playId === playId &&
      lastAnimatedRef.result === playResult
    )
      return;
    (PlayByPlayField as any)._lastAnimatedRef = { playId, result: playResult };

    const scoringEspnId =
      play.start?.team?.id ?? play.team?.id ?? possessionTeamId ?? null;
    let endzone: "home" | "away" | null = null;
    let scoreText: string | null = null;

    const scoringIdNum = Number(scoringEspnId);
    const homeIdNum = Number(homeEspnID);
    const awayIdNum = Number(awayEspnID);

    if (playResult === "TD" || playResult === "TOUCHDOWN") {
      endzone =
        scoringIdNum === homeIdNum
          ? "home"
          : scoringIdNum === awayIdNum
          ? "away"
          : null;
      scoreText = "TOUCHDOWN";
    } else if (playResult === "FG" || playResult === "FIELD GOAL") {
      endzone =
        scoringIdNum === homeIdNum
          ? "home"
          : scoringIdNum === awayIdNum
          ? "away"
          : null;
      scoreText = "FIELD GOAL IS GOOD";
    }

    if (endzone) {
      setHighlightEndzone(endzone);

      if (scoreText) {
        setScoreAnimation({ team: endzone, text: scoreText });
        scoreAnim.setValue(0);
        scoreReveal.setValue(0);

        Animated.sequence([
          Animated.spring(scoreAnim, {
            toValue: 1.2,
            useNativeDriver: true,
            friction: 4,
            tension: 80,
          }),
          Animated.spring(scoreAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
          }),
        ]).start();

        Animated.timing(scoreReveal, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }).start();
      }

      const timeout = setTimeout(() => {
        setScoreAnimation(null);
        setHighlightEndzone(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [lastPlay]);

  const yardNumbers = [0, 10, 20, 30, 40, 50, 40, 30, 20, 10, 0];

  return (
    <View>
      <HeadingTwo>Play By Play</HeadingTwo>

      {isStringPlay && currentPlay && (
        <View style={{ marginVertical: 12 }} onLayout={onLayout}>
          <Text
            style={{
              fontFamily: Fonts.OSREGULAR,
              fontSize: 14,
              color: textColor,
            }}
          >
            {currentPlay}
          </Text>
        </View>
      )}

      {!isStringPlay && currentPlay && (
        <View style={styles.wrapper}>
          <View style={styles.lastPlayTextContainer}>
            {currentPlay.athletesInvolved?.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {currentPlay.athletesInvolved.map((athlete: Athlete) => (
                  <View key={athlete.id} style={styles.playerContainer}>
                    {athlete.headshot && (
                      <Image
                        source={{ uri: athlete.headshot }}
                        style={styles.headshot}
                      />
                    )}
                    <View style={styles.playerContainer}>
                      <Text style={styles.name}>{athlete.fullName}</Text>
                      <Text style={styles.posistion}>
                        {athlete.position || ""}
                      </Text>
                      <Text style={styles.number}>{`#${
                        athlete.jersey || ""
                      }`}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <Text
              style={{
                fontFamily: Fonts.OSREGULAR,
                fontSize: 14,
                color: getTextColor(currentPlay.text),
              }}
            >
              {currentPlay.text}
            </Text>

            {currentPlay.drive?.description && (
              <Text style={styles.driveDescription}>
                Drive: {currentPlay.drive.description}
                {currentPlay.drive.timeElapsed?.displayValue
                  ? ` (${currentPlay.drive.timeElapsed.displayValue})`
                  : ""}
              </Text>
            )}
          </View>

          {/* Field rendering */}
          <View style={styles.fieldContainer}>
            {/* Away Endzone */}
            <View
              style={[
                styles.endzone,
                { backgroundColor: awayColor, borderRightColor: Colors.white },
                highlightEndzone === "away" && styles.endzoneHighlight,
              ]}
            >
              {highlightEndzone === "away" && (
                <Animated.View
                  style={[
                    styles.glowOverlay,
                    {
                      backgroundColor: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          "rgba(255,255,255,0)",
                          "rgba(255,255,255,0.52)",
                        ],
                      }),
                    },
                  ]}
                />
              )}
              <Image
                source={getLogo(awayTeam.name, true)}
                style={[
                  styles.endzoneLogo,
                  { transform: [{ rotate: "-90deg" }] },
                ]}
              />
            </View>

            {/* Field */}
            <View
              style={styles.field}
              onLayout={(e) => setFieldWidth(e.nativeEvent.layout.width)}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <View
                  key={`stripe-${i}`}
                  style={[
                    styles.fieldStripe,
                    {
                      left: `${i * 10}%`,
                      backgroundColor:
                        i % 2 === 0
                          ? isDark
                            ? Colors.dark.itemBackground
                            : Colors.light.itemBackground
                          : isDark
                          ? Colors.black
                          : Colors.white,
                    },
                  ]}
                />
              ))}

              {yardNumbers.map((yard, i) => {
                const isMajor = yard % 10 === 0;
                const leftPercent = (i / (yardNumbers.length - 1)) * 100;
                const lineWidth = yard === 50 ? 4 : 2;
                return (
                  <React.Fragment key={`yard-${i}`}>
                    {isMajor && (
                      <View
                        style={[
                          styles.yardLine,
                          {
                            left: `${leftPercent}%`,
                            width: lineWidth,
                            transform: [{ translateX: -lineWidth / 2 }],
                          },
                        ]}
                      />
                    )}
                    {isMajor && yard !== 0 && (
                      <Text
                        style={[
                          styles.yardNumber,
                          {
                            left: `${leftPercent}%`,
                            transform: [{ translateX: -(lineWidth / 2) - 10 }],
                          },
                        ]}
                      >
                        {yard}
                      </Text>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Ball Marker */}
              <Animated.View
                style={[
                  styles.marker,
                  {
                    backgroundColor: isDark
                      ? Colors.dark.lightRed
                      : Colors.light.red,
                    left: playAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: [fieldWidth, 0],
                    }),
                  },
                ]}
              />

              {/* Score Overlay */}
              {scoreAnimation && (
                <Animated.View
                  style={[
                    styles.scoreOverlay,
                    {
                      opacity: scoreAnim,
                      transform: [
                        { translateX: -125 },
                        { translateY: -20 },
                        { scale: scoreAnim },
                      ],
                    },
                  ]}
                >
                  <Animated.View
                    style={{
                      width: scoreReveal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 250],
                      }),
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Image
                        source={getLogo(
                          scoreAnimation.team === "home"
                            ? homeTeam.name
                            : awayTeam.name,
                          isDark
                        )}
                        style={styles.scoreLogo}
                      />
                      <Text
                        style={[
                          styles.scoreText,
                          { color: isDark ? Colors.white : Colors.black },
                        ]}
                      >
                        {scoreAnimation.text}
                      </Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              )}
            </View>

            {/* Home Endzone */}
            <View
              style={[
                styles.endzone,
                { backgroundColor: homeColor, borderLeftColor: Colors.white },
                highlightEndzone === "home" && styles.endzoneHighlight,
              ]}
            >
              {highlightEndzone === "home" && (
                <Animated.View
                  style={[
                    styles.glowOverlay,
                    {
                      backgroundColor: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          "rgba(255,255,255,0)",
                          "rgba(255,255,255,0.52)",
                        ],
                      }),
                    },
                  ]}
                />
              )}
              <Image
                source={getLogo(homeTeam.name, true)}
                style={[
                  styles.endzoneLogo,
                  { transform: [{ rotate: "90deg" }] },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PlayByPlayField;

// Styles
const playByPlayFieldStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      padding: 12,
    },
    lastPlayTextContainer: {
      borderColor: Colors.midTone,
      borderBottomWidth: 1,
      paddingBottom: 12,
    },
    playerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    headshot: {
      width: 40,
      height: 40,
      borderRadius: 100,
      marginRight: 6,
      borderColor: isDark ? Colors.white : Colors.black,
      borderWidth: 0.5,
      paddingTop: 4,
    },
    name: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    posistion: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginLeft: 4,
    },
    number: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginLeft: 2,
    },
    driveDescription: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      marginTop: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    fieldContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      borderWidth: 2,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 4,
      marginTop: 40,
    },
    endzone: {
      width: 40,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    fieldStripe: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: "10%",
      zIndex: 0,
    },
    glowOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 4,
      zIndex: 5,
    },
    endzoneLogo: {
      width: 100,
      height: 100,
      resizeMode: "contain",
      position: "absolute",
      opacity: 0.4,
    },
    endzoneHighlight: { shadowOpacity: 0.9, shadowRadius: 15, elevation: 10 },
    field: {
      flex: 1,
      height: 200,
      backgroundColor: isDark ? Colors.black : Colors.white,
      position: "relative",
    },
    marker: {
      position: "absolute",
      top: 0,
      width: 2,
      height: "100%",
      borderRadius: 2,
      zIndex: 1,
    },
    yardLine: {
      position: "absolute",
      top: 0,
      height: "100%",
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderRadius: 1,
      zIndex: 1,
    },
    yardNumber: {
      position: "absolute",
      top: -22,
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : "#1d1d1d",
      textAlign: "center",
      zIndex: 3,
      width: 20,
    },
    scoreOverlay: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -125 }, { translateY: -20 }],
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5,
    },
    scoreLogo: { width: 40, height: 40, resizeMode: "contain", marginRight: 8 },
    scoreText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      textAlign: "center",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 5,
    },
  });
