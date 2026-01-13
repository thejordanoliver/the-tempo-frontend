import { Colors } from "constants/Styles";
import { EXPANDED_HEIGHT_THRESHOLD, LEADER_LABELS } from "constants/widgetLeaders";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  StyleSheet,
  UIManager,
  View,
  useColorScheme,
} from "react-native";
import { PlayerLeader } from "types/playerLeader";
import { getTopLeaders } from "utils/widgetUtils";
import CBBGameWidget, { CBBGameWidgetProps } from "./Games/CBBGameWidget";
import CFBGameWidget from "./Games/CFBGameWidget";
import GameWidget, { GameWidgetProps } from "./Games/GameWidget";
import NFLGameWidget, { FootballGameWidgetProps } from "./Games/NFLGameWidget";
import PlayerLeadersSlide from "./Players/PlayerLeadersSlide";

export type WidgetSlide =
  | { type: "NBA"; data: GameWidgetProps }
  | { type: "NFL"; data: FootballGameWidgetProps }
  | { type: "CFB"; data: FootballGameWidgetProps }
  | { type: "CBB" | "WCBB"; data: CBBGameWidgetProps }
  | {
      type: "leaders";
      gameId: number;
      stat: {
        name: string;
        players: PlayerLeader[]; // max 2 (one per team)
      };
    };

type WidgetSliderProps = {
  games: WidgetSlide[];
  leadersMap?: Record<number, PlayerLeader[]>;
  initialHeight?: number;
  initialWidth?: number;
};

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WidgetSlider({
  games,
  leadersMap = {},
  initialHeight = 150,
  initialWidth = 200,
}: WidgetSliderProps) {
  const isDark = useColorScheme() === "dark";
  const styles = sliderStyles(isDark);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const aspectRatio = initialWidth / initialHeight;

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const currentOffset = useRef(0);

  const [slideHeight, setSlideHeight] = useState(initialHeight);
  const [slideWidth, setSlideWidth] = useState(initialWidth);
  const slideHeightRef = useRef(initialHeight);

  const [currentIndex, setCurrentIndex] = useState(0);
  const showPlayers = slideHeight >= 300;
  const isExpanded = slideHeight >= EXPANDED_HEIGHT_THRESHOLD;

  // Lock index during resizing to prevent jump
  const isResizing = useRef(false);
  const lockedIndex = useRef(0);

  // Update slide height with ref
  const setHeight = (height: number) => {
    slideHeightRef.current = height;
    setSlideHeight(height);
  };

  // Layout animation for expand/collapse
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isExpanded]);

  // -------------------------------
  // Flatten games + leader slides
  // -------------------------------
  const slides = useMemo<WidgetSlide[]>(() => {
    const result: WidgetSlide[] = [];

    games.forEach((game) => {
      if (!("data" in game)) return;

      result.push(game); // Game slide

      const leaders = leadersMap[game.data.id];
      if (!leaders?.length) return;

      // Group leaders by stat
      const grouped = leaders.reduce<Record<string, PlayerLeader[]>>((acc, player) => {
        const statName = player.leaderStat?.name;
        if (!statName) return acc;
        (acc[statName] ??= []).push(player);
        return acc;
      }, {});

      Object.entries(grouped).forEach(([statName, statPlayers]) => {
        const topPlayers = getTopLeaders(statPlayers, isExpanded);
        if (!topPlayers.length) return;

        result.push({
          type: "leaders",
          gameId: game.data.id,
          stat: {
            name: statName,
            players: topPlayers,
          },
        });
      });
    });

    return result;
  }, [games, leadersMap, isExpanded]);


    const enableAutoSlide = false; // toggle this to true when ready

  // -----------------------
  // Auto-slide every 15s with smooth looping
  // -----------------------
  useEffect(() => {
    if (!enableAutoSlide || slides.length <= 1 || !flatListRef.current) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      const from = currentOffset.current;

      // If at the last slide, loop smoothly back to top
      const to = nextIndex < slides.length ? nextIndex * slideHeight : 0; // loop to top

      let start: number | null = null;
      const duration = 600; // ms

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = progress * progress; // ease-in quad
        const offset = from + (to - from) * eased;

        flatListRef.current?.scrollToOffset({ offset, animated: false });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentOffset.current = to;
          setCurrentIndex(nextIndex >= slides.length ? 0 : nextIndex);
        }
      };

      requestAnimationFrame(animate);
    }, 15000);

    return () => clearInterval(interval);
  }, [currentIndex, slides.length, slideHeight]);

  

  // -------------------------------
  // Handle scroll events
  // -------------------------------
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isResizing.current) return; // ignore scroll during resize

        const offsetY = event.nativeEvent.contentOffset.y;
        currentOffset.current = offsetY;
        const index = Math.round(offsetY / slideHeight);
        setCurrentIndex(index);
      },
    }
  );

  // -------------------------------
  // Snap to current slide
  // -------------------------------
  const snapToCurrentSlide = () => {
    if (!flatListRef.current) return;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: lockedIndex.current * slideHeightRef.current,
        animated: true,
      });
    });
  };

  // -------------------------------
  // PanResponder for resizing
  // -------------------------------
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        isResizing.current = true;
        lockedIndex.current = currentIndex; // lock index at start
      },

      onPanResponderMove: (_, gestureState) => {
        const minHeight = 100;
        const maxHeight = screenHeight;
        const minWidth = screenWidth * 0.48;
        const maxWidth = screenWidth;

        let newHeight = slideHeightRef.current + gestureState.dy;
        let newWidth = newHeight * aspectRatio;

        // Clamp values
        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / aspectRatio;
        }
        if (newWidth < minWidth) {
          newWidth = minWidth;
          newHeight = newWidth / aspectRatio;
        }
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }
        if (newHeight < minHeight) {
          newHeight = minHeight;
          newWidth = newHeight / aspectRatio;
        }

        setHeight(newHeight);
        setSlideWidth(newWidth);
      },

      onPanResponderRelease: () => {
        isResizing.current = false;
        snapToCurrentSlide();
      },

      onPanResponderTerminate: () => {
        isResizing.current = false;
        snapToCurrentSlide();
      },
    })
  ).current;

  // -------------------------------
  // Progress bar animation
  // -------------------------------
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const progressHeight = scrollY.interpolate({
    inputRange: [0, (slides.length - 1) * slideHeight],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  const showProgress = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }

    Animated.timing(progressOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const hideProgress = () => {
    hideTimeout.current = setTimeout(() => {
      Animated.timing(progressOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, 400);
  };

  const scaleX = progressOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95], // shrink slightly when progress appears
  });

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <Animated.View
      style={{
        height: slideHeight,
        minWidth: "48%",
        maxWidth: "100%",
        transform: [{ scaleX }],
      }}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(_, index) => index.toString()}
          pagingEnabled
          snapToInterval={slideHeight}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: slideHeight,
            offset: slideHeight * index,
            index,
          })}
          onScrollBeginDrag={showProgress}
          onMomentumScrollBegin={showProgress}
          onMomentumScrollEnd={hideProgress}
          onScrollEndDrag={hideProgress}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => {
            switch (item.type) {
              case "NBA":
                return (
                  <View style={{ height: slideHeight }}>
                    <GameWidget {...item.data} height={slideHeight} />
                  </View>
                );
              case "NFL":
                return (
                  <View style={{ height: slideHeight }}>
                    <NFLGameWidget {...item.data} height={slideHeight} />
                  </View>
                );
              case "CFB":
                return (
                  <View style={{ height: slideHeight }}>
                    <CFBGameWidget {...item.data} height={slideHeight} />
                  </View>
                );
              case "CBB":
                return (
                  <View style={{ height: slideHeight }}>
                    <CBBGameWidget {...item.data} height={slideHeight} isWomen={false} />
                  </View>
                );
              case "WCBB":
                return (
                  <View style={{ height: slideHeight }}>
                    <CBBGameWidget {...item.data} height={slideHeight} isWomen={true} />
                  </View>
                );
              case "leaders": {
                const statName = item.stat.name;
                const leaderLabel = LEADER_LABELS[statName] ?? statName;
                return (
                  <PlayerLeadersSlide
                    header={leaderLabel}
                    players={item.stat.players}
                    slideWidth={slideWidth}
                    slideHeight={slideHeight}
                    visible={showPlayers}
                  />
                );
              }
              default:
                return null;
            }
          }}
        />
        <View style={styles.resizeHandle} {...panResponder.panHandlers} />
      </View>

      <Animated.View style={[styles.progressContainer, { opacity: progressOpacity }]}>
        <Animated.View style={[styles.progressBar, { height: progressHeight }]} />
      </Animated.View>
    </Animated.View>
  );
}

// -------------------------------
// Styles
// -------------------------------
const sliderStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderRadius: 8,
      flexDirection: "row",
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark ? Colors.dark.itemBackground : Colors.light.itemBackground,
      position: "relative",
      overflow: "hidden",
      padding: 4,
    },
    progressContainer: {
      position: "absolute",
      right: -14,
      top: "25%",
      height: "50%",
      width: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
      overflow: "hidden",
    },
    progressBar: {
      width: "100%",
      borderRadius: 2,
      backgroundColor: isDark ? Colors.dark.white : Colors.light.black,
    },
    resizeHandle: {
      width: 20,
      height: 20,
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: isDark ? Colors.dark.white : Colors.light.black,
      borderTopLeftRadius: 8,
      zIndex: 10,
    },
  });
