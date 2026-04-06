import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeam } from "constants/teamsCFB";
import { getNFLTeam } from "constants/teamsNFL";
import { Athlete, PlayObject } from "hooks/NFLHooks/useGameDetails";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { playByPlayFieldStyles } from "styles/GameDetailStyles/PlayByPlayFieldStyles";
import { emptyNFLAwayTeam, emptyNFLHomeTeam } from "types/nfl";
import { LeagueType } from "types/types";

type PlayByPlayFieldProps = {
  lastPlay?: string | PlayObject;
  possessionTeamId?: number | null;
  homeTeamId: number;
  awayTeamId: number;
  league?: LeagueType;
  isDark?: boolean;
  firstDownYardLine?: number; // NEW
};

const normalizeYardLine = (yard: number, isHomeOffense: boolean) => {
  return isHomeOffense ? yard : 100 - yard;
};

const PlayByPlayField: React.FC<PlayByPlayFieldProps> = ({
  lastPlay,
  possessionTeamId,
  homeTeamId,
  awayTeamId,
  league = "NFL",
  firstDownYardLine,
}) => {
  const isDark = useColorScheme() === "dark";
  const styles = playByPlayFieldStyles(isDark);
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
  const getTeamInfo = league === "NFL" ? getNFLTeam : getCFBTeam;

  const homeTeam = getTeamInfo(homeTeamId) ?? emptyNFLHomeTeam;
  const awayTeam = getTeamInfo(awayTeamId) ?? emptyNFLAwayTeam;

  const homeColor = homeTeam.color ?? emptyNFLHomeTeam.color;
  const awayColor = awayTeam.color ?? emptyNFLAwayTeam.color;
  const homeEspnID = homeTeam.espnID;
  const awayEspnID = awayTeam.espnID;
  const homeLogo = homeTeam.logoLight || homeTeam.logo;
  const awayLogo = awayTeam.logoLight || awayTeam.logo;
  const touchdownHome = isDark
    ? homeTeam.logoLight || homeTeam.logo
    : homeTeam.logo;
  const touchdownAway = isDark
    ? awayTeam.logoLight || awayTeam.logo
    : awayTeam.logo;

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
        ]),
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

  const firstDownAnim = useRef(
    new Animated.Value(firstDownYardLine || 50),
  ).current;

  const isHomeOffense = Number(possessionTeamId) === Number(homeEspnID);
  useEffect(() => {
    if (firstDownYardLine == null) return;

    const normalized = normalizeYardLine(firstDownYardLine, isHomeOffense);

    Animated.timing(firstDownAnim, {
      toValue: normalized,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [firstDownYardLine, isHomeOffense]);

  // Animate ball marker + detect scores
  useEffect(() => {
    if (typeof lastPlay !== "object") return;

    const play = lastPlay as PlayObject;
    const raw = computePercent(play);
    const targetPercent = normalizeYardLine(raw, isHomeOffense);

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
    const playResult = play.result?.toUpperCase();

    if (
      lastAnimatedRef.playId === playId &&
      lastAnimatedRef.result === playResult
    )
      return;
    (PlayByPlayField as any)._lastAnimatedRef = { playId, result: playResult };

    const scoringEspnId =
      play.team?.id ?? play.team?.id ?? possessionTeamId ?? null;
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
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>

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

            {currentPlay?.description && (
              <Text style={styles.driveDescription}>
                Drive: {currentPlay.description}
                {currentPlay.timeElapsed?.displayValue
                  ? ` (${currentPlay.timeElapsed.displayValue})`
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
                source={awayLogo}
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
              {/* First Down Marker */}
              {firstDownYardLine != null && fieldWidth > 0 && (
                <Animated.View
                  style={[
                    styles.firstDownMarker,
                    {
                      left: firstDownAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: [fieldWidth, 0], // match ball marker
                      }),
                    },
                  ]}
                />
              )}

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
                    <View style={styles.touchdownAnimation}>
                      <Image
                        source={
                          scoreAnimation.team === "home"
                            ? touchdownHome
                            : touchdownAway
                        }
                        style={styles.scoreLogo}
                      />

                      <Text style={styles.scoreText}>
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
                source={homeLogo}
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
