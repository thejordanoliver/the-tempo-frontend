import { Ionicons } from "@expo/vector-icons";
import { BROWSEABLE_LEAGUES, LEAGUE_CONFIG } from "constants/leagues";
import { Colors, globalStyles } from "constants/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { LeagueType } from "types/types";
import {
  leagueCarouselMotionAction,
  leagueCarouselWindow,
  leagueDistanceFromFront,
  leagueOrbitGeometry,
  leagueOrbitPosition,
  wrapLeagueRotation,
  type LeagueOrbitGeometry,
} from "utils/leagueCarousel";

const COUNT = BROWSEABLE_LEAGUES.length;
const TURN_MS = 5000;
const IS_WEB = Platform.OS === "web";

type Props = {
  isDark: boolean;
  searchQuery: string;
  onSelect: (league: LeagueType) => void;
};

type CardProps = {
  league: LeagueType;
  leagueIndex: number;
  rotation: SharedValue<number>;
  width: number;
  cardWidth: number;
  geometry: LeagueOrbitGeometry;
  isDark: boolean;
  active: boolean;
  onSelect: (league: LeagueType) => void;
};

const OrbitCard = memo(function OrbitCard({
  league,
  leagueIndex,
  rotation,
  width,
  cardWidth,
  geometry,
  isDark,
  active,
  onSelect,
}: CardProps) {
  const config = LEAGUE_CONFIG[league];
  const styles = LeagueCarouselStyles;
  const theme = isDark ? Colors.dark : Colors.light;
  const typography = useMemo(() => globalStyles(isDark), [isDark]);
  const animatedStyle = useAnimatedStyle(() => {
    const orbit = leagueOrbitPosition(
      leagueIndex,
      rotation.value,
      COUNT,
      geometry,
    );
    return {
      opacity: orbit.opacity,
      zIndex: orbit.zIndex,
      // RN web's imperative style path serializes `matrix` as CSS matrix(),
      // which accepts only six values. Use matrix3d explicitly for this path.
      transform: IS_WEB
        ? `matrix3d(${orbit.matrix.join(",")})`
        : [{ matrix: orbit.matrix }],
    };
  });

  return (
    <Animated.View
      pointerEvents={active ? "auto" : "none"}
      aria-hidden={!active}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardWidth * 1.5,
          left: (width - cardWidth) / 2,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${config.label}`}
        onPress={() => onSelect(league)}
        style={[
          styles.cardContent,
          {
            backgroundColor: theme.itemBackground,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.cardVisuals}>
          <LinearGradient
            colors={[config.color, `${config.color}66`, `${config.color}00`]}
            locations={[0, 0.4, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.leagueGradient}
          />
        </View>
        <View style={styles.logoArea}>
          <Image
            source={isDark ? config.logoLight : config.logo}
            style={{ width: cardWidth * 0.44, height: cardWidth * 0.44 }}
            resizeMode="contain"
          />
        </View>
        <Text style={[typography.subheading, styles.title]} numberOfLines={3}>
          {config.label}
        </Text>
        <View style={[styles.open, { borderTopColor: theme.gray }]}>
          <Text style={typography.secondaryText}>Explore league</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={isDark ? Colors.lightGray : Colors.darkGray}
          />
        </View>
        <View
          pointerEvents="none"
          style={[styles.cardBorder, { borderColor: theme.gray }]}
        />
      </Pressable>
    </Animated.View>
  );
});

export default function LeagueCarousel({
  isDark,
  searchQuery,
  onSelect,
}: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const styles = LeagueCarouselStyles;
  const typography = useMemo(() => globalStyles(isDark), [isDark]);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(320);
  const [interacting, setInteracting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );
  const [focused, setFocused] = useState(false);
  const rotation = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const dragging = useSharedValue(false);
  const pendingSearch = useRef<ReturnType<typeof setTimeout> | null>(null);
  const query = searchQuery.trim().toLowerCase();
  const searching = query.length > 0;
  const matches = useMemo(() => {
    if (!query) return [];
    return BROWSEABLE_LEAGUES.filter((league) => {
      const label = LEAGUE_CONFIG[league].label.toLowerCase();
      return `${league} ${label} ${label.replace(/[^a-z0-9 ]/g, "")}`.includes(
        query,
      );
    }).sort((a, b) => Number(b === query) - Number(a === query));
  }, [query]);
  const finishInteraction = useCallback(() => setInteracting(false), []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        cancelAnimation(rotation);
        setFocused(false);
        setInteracting(false);
      };
    }, [rotation]),
  );

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    const app = AppState.addEventListener("change", (state) =>
      setAppActive(state === "active"),
    );
    return () => {
      mounted = false;
      motion.remove();
      app.remove();
      cancelAnimation(rotation);
    };
  }, [rotation]);

  useAnimatedReaction(
    () => wrapLeagueRotation(Math.round(rotation.value), COUNT),
    (next, previous) => {
      if (next !== previous) scheduleOnRN(setIndex, next);
    },
  );

  useEffect(() => {
    const action = leagueCarouselMotionAction({
      focused,
      appActive,
      paused,
      reduceMotion,
      interacting,
      searching,
    });
    // Manual navigation must be allowed to finish even when autoplay is paused.
    if (action === "manual") return;
    if (action === "stop") {
      cancelAnimation(rotation);
      const frame = requestAnimationFrame(finishInteraction);
      return () => cancelAnimationFrame(frame);
    }
    // One uninterrupted revolution; its endpoints are visually identical.
    rotation.set(
      withRepeat(
        withTiming(rotation.value + COUNT, {
          duration: COUNT * TURN_MS,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, [
    appActive,
    finishInteraction,
    focused,
    interacting,
    paused,
    reduceMotion,
    searching,
    rotation,
  ]);

  const settle = useCallback(
    (target: number) => {
      cancelAnimation(rotation);
      setInteracting(true);
      rotation.set(
        withTiming(
          target,
          {
            duration: reduceMotion
              ? 0
              : Math.min(1500, 450 + Math.abs(target - rotation.value) * 85),
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) scheduleOnRN(finishInteraction);
          },
        ),
      );
    },
    [finishInteraction, reduceMotion, rotation],
  );

  const moveToLeague = useCallback(
    (league: LeagueType) => {
      const target = BROWSEABLE_LEAGUES.indexOf(league);
      settle(
        rotation.value + leagueDistanceFromFront(target, rotation.value, COUNT),
      );
    },
    [rotation, settle],
  );

  const step = useCallback(
    (direction: number) => {
      settle(Math.round(rotation.value) + direction);
    },
    [rotation, settle],
  );

  useEffect(() => {
    if (!matches.length) return;
    const timer = setTimeout(() => {
      pendingSearch.current = null;
      moveToLeague(matches[0]);
    }, 250);
    pendingSearch.current = timer;
    return () => {
      clearTimeout(timer);
      if (pendingSearch.current === timer) pendingSearch.current = null;
    };
  }, [matches, moveToLeague]);

  const selectSearchPill = useCallback(
    (league: LeagueType) => {
      if (pendingSearch.current !== null) {
        clearTimeout(pendingSearch.current);
        pendingSearch.current = null;
      }
      moveToLeague(league);
    },
    [moveToLeague],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-15, 15])
        .onStart(() => {
          cancelAnimation(rotation);
          dragStart.set(rotation.value);
          dragging.set(true);
          scheduleOnRN(setInteracting, true);
        })
        .onUpdate((event) => {
          rotation.set(dragStart.value - event.translationX / (width * 0.55));
        })
        .onEnd((event) => {
          // Project a short coast, then settle onto a league. Cap the coast so
          // a fast flick remains predictable and doesn't race across the ring.
          const coast = Math.max(
            -2,
            Math.min(2, (-event.velocityX * 0.18) / (width * 0.55)),
          );
          const target = Math.round(rotation.value + coast);
          const complete = (finished?: boolean) => {
            "worklet";
            if (finished) scheduleOnRN(finishInteraction);
          };
          rotation.set(
            reduceMotion
              ? withTiming(target, { duration: 0 }, complete)
              : withSpring(
                  target,
                  {
                    mass: 0.8,
                    stiffness: 180,
                    damping: 24,
                    velocity: -event.velocityX / (width * 0.55),
                    overshootClamping: true,
                  },
                  complete,
                ),
          );
        })
        .onFinalize((_, success) => {
          if (!success && dragging.value) {
            rotation.set(
              withTiming(
                Math.round(rotation.value),
                { duration: reduceMotion ? 0 : 250 },
                (finished) => {
                  if (finished) scheduleOnRN(finishInteraction);
                },
              ),
            );
          }
          dragging.set(false);
        }),
    [dragging, dragStart, finishInteraction, reduceMotion, rotation, width],
  );

  const openLeague = useCallback(
    (league: LeagueType) => {
      cancelAnimation(rotation);
      onSelect(league);
    },
    [onSelect, rotation],
  );
  const cardWidth = Math.min(270, width * 0.62);
  const geometry = useMemo(
    () => leagueOrbitGeometry(width, cardWidth),
    [width, cardWidth],
  );
  const visibleLeagues = useMemo(
    () => leagueCarouselWindow(index, COUNT),
    [index],
  );
  const selected = BROWSEABLE_LEAGUES[index];

  return (
    <View>
      <View style={styles.heading}>
        <Text style={typography.subheading}>Find your league</Text>
        <Text style={typography.secondaryText}>
          Swipe to explore. Tap to open.
        </Text>
      </View>
      <GestureDetector gesture={gesture}>
        <View
          style={[styles.deck, { height: cardWidth * 1.5 + 64 }]}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
          {visibleLeagues.map((leagueIndex) => (
            <OrbitCard
              key={BROWSEABLE_LEAGUES[leagueIndex]}
              league={BROWSEABLE_LEAGUES[leagueIndex]}
              leagueIndex={leagueIndex}
              rotation={rotation}
              width={width}
              cardWidth={cardWidth}
              geometry={geometry}
              isDark={isDark}
              active={index === leagueIndex}
              onSelect={openLeague}
            />
          ))}
        </View>
      </GestureDetector>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous league"
          onPress={() => step(-1)}
          style={[styles.control, { backgroundColor: theme.itemBackground }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <View style={styles.position}>
          <Text
            style={[typography.subtitle, styles.selectedTitle]}
            numberOfLines={2}
          >
            {LEAGUE_CONFIG[selected].label}
          </Text>
          <Text style={typography.caption}>
            {index + 1} / {COUNT}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next league"
          onPress={() => step(1)}
          style={[styles.control, { backgroundColor: theme.itemBackground }]}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>
      <Pressable
        disabled={reduceMotion || searching}
        accessibilityRole="button"
        accessibilityState={{ disabled: reduceMotion || searching }}
        accessibilityLabel={
          searching
            ? "Rotation paused while searching"
            : paused
              ? "Resume automatic rotation"
              : "Pause automatic rotation"
        }
        onPress={() => setPaused((value) => !value)}
        style={styles.playback}
      >
        <Ionicons
          name={searching ? "pause" : paused || reduceMotion ? "play" : "pause"}
          size={14}
          color={theme.icon}
        />
        <Text style={typography.caption}>
          {reduceMotion
            ? "Reduced motion enabled"
            : searching
              ? "Rotation paused while searching"
              : paused
                ? "Resume"
                : "Pause"}
        </Text>
      </Pressable>
      {query && (
        <View style={styles.results}>
          <Text style={typography.secondaryText}>
            {matches.length
              ? `${matches.length} matching league${matches.length === 1 ? "" : "s"}`
              : "No leagues found. Try another name."}
          </Text>
          <View style={styles.chips}>
            {matches.map((league) => (
              <Pressable
                key={league}
                accessibilityRole="button"
                accessibilityState={{ selected: selected === league }}
                onPress={() => selectSearchPill(league)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.itemBackground,
                    borderColor:
                      selected === league ? theme.text : theme.itemBackground,
                  },
                ]}
              >
                <Text style={typography.text}>
                  {LEAGUE_CONFIG[league].label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const LeagueCarouselStyles = StyleSheet.create({
  heading: { paddingTop: 14, gap: 4 },
  deck: { marginTop: 18, overflow: "hidden" },
  card: {
    position: "absolute",
    top: 28,
    backfaceVisibility: "hidden",
    borderRadius: 22,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 22,
    overflow: "hidden",
  },
  cardVisuals: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    overflow: "hidden",
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 2,
  },
  leagueGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "48%",
  },
  sport: { marginTop: 6, letterSpacing: 1.2 },
  logoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 84,
  },
  title: { textAlign: "center", fontSize: 22, lineHeight: 28, minHeight: 56 },
  open: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  control: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  position: { flex: 1, alignItems: "center", paddingHorizontal: 12, gap: 2 },
  selectedTitle: { textAlign: "center" },
  playback: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
  },
  results: { marginTop: 8, gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
