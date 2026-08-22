import { Colors } from "constants/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { RACING_LEAGUE_CONFIG, resolveRacingLeague } from "./racingConfig";
import { customHeaderStyles } from "./styles";
import type { HeaderImageSource, RacingLeague } from "./types";
import { resolveImage } from "./utils";

type GameHeaderProps = {
  tabName?: string;
  homeTeam?: unknown;
  awayTeam?: unknown;
  homeCode?: string;
  awayCode?: string;
  homeLogo?: HeaderImageSource;
  awayLogo?: HeaderImageSource;
  homeColor?: string | null;
  awayColor?: string | null;
  isEvent: boolean;
  isNeutralSite: boolean;
  racingLeague?: RacingLeague | null;
  eventTitle?: string;
  eventLogo?: HeaderImageSource;
};

export function GameHeader({
  tabName,
  homeTeam,
  awayTeam,
  homeCode,
  awayCode,
  homeLogo,
  awayLogo,
  homeColor,
  awayColor,
  isNeutralSite,
  isEvent,
  racingLeague,
  eventTitle,
  eventLogo,
}: GameHeaderProps) {
  const styles = customHeaderStyles;
  const dividerText = isNeutralSite ? "vs" : "@";

  const scaleHome = useRef(new Animated.Value(0.6)).current;
  const scaleAway = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0.8)).current;

  const getTeamCodeLetters = useCallback(
    (value: unknown, fallback: string): string[] => {
      const team = value as
        | {
            code?: unknown;
            abbreviation?: unknown;
            shortDisplayName?: unknown;
            name?: unknown;
          }
        | null
        | undefined;

      const code =
        typeof value === "string"
          ? value
          : team?.code ||
            team?.abbreviation ||
            team?.shortDisplayName ||
            team?.name ||
            fallback;

      return String(code || fallback)
        .toUpperCase()
        .slice(0, 4)
        .split("");
    },
    [],
  );

  const resolvedRacingLeague = useMemo(
    () => resolveRacingLeague(racingLeague, tabName),
    [racingLeague, tabName],
  );

  const racingConfig = resolvedRacingLeague
    ? RACING_LEAGUE_CONFIG[resolvedRacingLeague]
    : null;

  const isRacingHeader = Boolean(isEvent && racingConfig);

  const isTeamGameHeader = Boolean(
    tabName === "Game" && homeTeam && awayTeam && !isRacingHeader,
  );

  const awayLetters = useMemo(
    () => getTeamCodeLetters(awayCode, "AWY"),
    [awayCode, getTeamCodeLetters],
  );

  const homeLetters = useMemo(
    () => getTeamCodeLetters(homeCode, "HOM"),
    [getTeamCodeLetters, homeCode],
  );

  const eventLetters = useMemo(
    () =>
      String(racingConfig?.shortLabel ?? "RACE")
        .toUpperCase()
        .split(""),
    [racingConfig?.shortLabel],
  );

  const awayLetterAnims = useMemo(
    () => awayLetters.map(() => new Animated.Value(0)),
    [awayLetters],
  );

  const homeLetterAnims = useMemo(
    () => homeLetters.map(() => new Animated.Value(0)),
    [homeLetters],
  );

  const eventLetterAnims = useMemo(
    () => eventLetters.map(() => new Animated.Value(0)),
    [eventLetters],
  );

  useEffect(() => {
    opacity.setValue(0);
    dividerScale.setValue(0.8);
    scaleHome.setValue(0.6);
    scaleAway.setValue(0.6);

    awayLetterAnims.forEach((animation) => {
      animation.setValue(0);
    });

    homeLetterAnims.forEach((animation) => {
      animation.setValue(0);
    });

    eventLetterAnims.forEach((animation) => {
      animation.setValue(0);
    });

    if (isRacingHeader) {
      const racingAnimation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.spring(scaleHome, {
          toValue: 1,
          damping: 14,
          stiffness: 130,
          mass: 0.8,
          useNativeDriver: true,
        }),

        Animated.stagger(
          70,
          eventLetterAnims.map((animation) =>
            Animated.timing(animation, {
              toValue: 1,
              duration: 450,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ),
      ]);

      racingAnimation.start();

      return () => {
        racingAnimation.stop();
      };
    }

    if (!isTeamGameHeader) {
      return;
    }

    const gameAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.timing(dividerScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.parallel([
          Animated.timing(scaleAway, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),

          Animated.timing(scaleHome, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.stagger(
            100,
            awayLetterAnims.map((animation) =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ),
          ),

          Animated.stagger(
            100,
            homeLetterAnims.map((animation) =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ),
          ),
        ]),
      ]),
    ]);

    gameAnimation.start();

    return () => {
      gameAnimation.stop();
    };
  }, [
    awayLetterAnims,
    dividerScale,
    eventLetterAnims,
    homeLetterAnims,
    isRacingHeader,
    isTeamGameHeader,
    opacity,
    scaleAway,
    scaleHome,
  ]);

  if (!isRacingHeader && !isTeamGameHeader) {
    return null;
  }

  if (isRacingHeader && racingConfig) {
    const eventColor = racingConfig.accentColor;
    const eventLogoSource = resolveImage(eventLogo ?? homeLogo);

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.racingHeader,
          {
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={[eventColor, "#171717", Colors.black]}
          locations={[0, 0.48, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0.8,
          }}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          style={[
            styles.racingAccent,
            {
              backgroundColor: eventColor,
            },
          ]}
        />

        <View style={styles.racingCheckeredPattern}>
          {Array.from({
            length: 24,
          }).map((_, index) => {
            const columns = 6;
            const row = Math.floor(index / columns);
            const column = index % columns;
            const isFilled = (row + column) % 2 === 0;

            return (
              <View
                key={`checkered-cell-${index}`}
                style={[
                  styles.racingCheckeredCell,
                  isFilled
                    ? styles.racingCheckeredCellFilled
                    : styles.racingCheckeredCellEmpty,
                ]}
              />
            );
          })}
        </View>

        {eventLogoSource ? (
          <Animated.View
            style={[
              styles.racingLogoWrapper,
              {
                transform: [
                  {
                    scale: scaleHome,
                  },
                ],
              },
            ]}
          >
            <Image
              source={eventLogoSource}
              style={styles.racingLogo}
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}

        <View style={styles.racingHeaderContent}>
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.racingEventTitle,
              {
                opacity,
                transform: [
                  {
                    scale: scaleHome,
                  },
                ],
              },
            ]}
          >
            {eventTitle}
          </Animated.Text>
        </View>
      </Animated.View>
    );
  }

  const resolvedAwayColor = awayColor || Colors.midTone;
  const resolvedHomeColor = homeColor || Colors.darkGray;

  const awayLogoSource = resolveImage(awayLogo);
  const homeLogoSource = resolveImage(homeLogo);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          flexDirection: "row",
          zIndex: -10,
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={[
          resolvedAwayColor,
          resolvedAwayColor,
          resolvedHomeColor,
          resolvedHomeColor,
        ]}
        locations={[0, 0.5, 0.5, 1]}
        start={{
          x: 0,
          y: -2,
        }}
        end={{
          x: 1.08,
          y: 1.2,
        }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.teamHalfWrapper}>
        <Animated.View
          style={[
            styles.teamHalfContent,
            {
              transform: [
                {
                  scale: scaleAway,
                },
              ],
            },
          ]}
        >
          {awayLogoSource ? (
            <Image
              source={awayLogoSource}
              style={styles.bgLogo}
              resizeMode="contain"
            />
          ) : null}

          <View style={styles.teamCodeRow}>
            {awayLetters.map((character, index) => {
              const animation = awayLetterAnims[index];

              return (
                <Animated.Text
                  key={`away-${character}-${index}`}
                  style={[
                    styles.teamCode,
                    {
                      opacity: animation,
                      transform: [
                        {
                          scale: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {character}
                </Animated.Text>
              );
            })}
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.dividerWrapper,
          {
            opacity,
            transform: [
              {
                scale: dividerScale,
              },
            ],
          },
        ]}
      >
        <Text style={styles.dividerText}>{dividerText}</Text>
      </Animated.View>

      <View style={styles.teamHalfWrapper}>
        <Animated.View
          style={[
            styles.teamHalfContent,
            {
              transform: [
                {
                  scale: scaleHome,
                },
              ],
            },
          ]}
        >
          {homeLogoSource ? (
            <Image
              source={homeLogoSource}
              style={styles.bgLogo}
              resizeMode="contain"
            />
          ) : null}

          <View style={styles.teamCodeRow}>
            {homeLetters.map((character, index) => {
              const animation = homeLetterAnims[index];

              return (
                <Animated.Text
                  key={`home-${character}-${index}`}
                  style={[
                    styles.teamCode,
                    {
                      opacity: animation,
                      transform: [
                        {
                          scale: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {character}
                </Animated.Text>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
