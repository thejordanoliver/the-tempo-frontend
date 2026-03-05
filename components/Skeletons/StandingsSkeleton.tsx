import { Colors } from "constants/Styles";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, useColorScheme, View } from "react-native";

const ROWS = 16;
const ROW_HEIGHT = 60;
const RANK_WIDTH = 20;

export const StandingsSkeleton = () => {
  const isDark = useColorScheme() === "dark";
  const bg = isDark ? Colors.dark.itemBackground : Colors.light.itemBackground;

  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const StatBar = () => (
    <Animated.View
      style={{
        width: 40,
        height: 14,
        borderRadius: 4,
        backgroundColor: bg,
        opacity: pulse,
      }}
    />
  );

  /** Left fixed team row */
  const TeamColumnRow = () => (
    <Animated.View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        opacity: pulse,
        paddingHorizontal: 12,
      }}
    >
      <Animated.View
        style={{
          width: RANK_WIDTH,
          height: RANK_WIDTH,
          backgroundColor: bg,
          borderRadius: 4,
        }}
      />

      <View
        style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
      >
        <Animated.View
          style={{
            width: 28,
            height: 28,
            backgroundColor: bg,
            borderRadius: 14,
          }}
        />
        <Animated.View
          style={{
            width: 60,
            height: 14,
            backgroundColor: bg,
            marginLeft: 8,
            borderRadius: 4,
          }}
        />
      </View>
    </Animated.View>
  );

  /** LEFT fixed header */
  const TeamColumnHeader = () => (
    <Animated.View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        opacity: pulse,
        paddingHorizontal: 12,
      }}
    >
      <Animated.View
        style={{
          width: RANK_WIDTH,
          height: RANK_WIDTH,
          backgroundColor: bg,
          borderRadius: 4,
        }}
      />
      <Animated.View
        style={{
          width: 60,
          height: 14,
          backgroundColor: bg,
          marginLeft: 12,
          borderRadius: 4,
        }}
      />
    </Animated.View>
  );

  /** Scrollable stat header */
  const StatHeader = () => (
    <Animated.View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        paddingLeft: 16,
        opacity: pulse,
      }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <View key={n} style={{ marginRight: 20 }}>
          <StatBar />
        </View>
      ))}
    </Animated.View>
  );

  /** One row of scrollable stats */
  const StatRow = () => (
    <Animated.View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        paddingLeft: 16,
        opacity: pulse,
      }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <View key={n} style={{ marginRight: 20 }}>
          <StatBar />
        </View>
      ))}
    </Animated.View>
  );

  return (
    <ScrollView
      style={{ paddingTop: 16, marginTop: 12 }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
    >
      {/* ---------- HEADER ABOVE TABLE ---------- */}
      <Animated.View
        style={{
          opacity: pulse,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        }}
      >
        <View
          style={{
            width: 120,
            height: 22,
            borderRadius: 4,
            backgroundColor: bg,
          }}
        />
      </Animated.View>

      {/* ---------- TABLE ---------- */}
      <View style={{ flexDirection: "row" }}>
        {/* LEFT FIXED COLUMN */}
        <View style={{ width: 180 }}>
          <TeamColumnHeader />
          {Array.from({ length: ROWS }).map((_, i) => (
            <TeamColumnRow key={i} />
          ))}
        </View>

        {/* RIGHT SCROLLABLE COLUMN */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <StatHeader />
            {Array.from({ length: ROWS }).map((_, i) => (
              <StatRow key={i} />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ---------- HEADER ABOVE TABLE ---------- */}
      <Animated.View
        style={{
          opacity: pulse,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        }}
      >
        <View
          style={{
            width: 120,
            height: 22,
            borderRadius: 4,
            backgroundColor: bg,
          }}
        />
      </Animated.View>
      {/* ---------- TABLE ---------- */}
      <View style={{ flexDirection: "row" }}>
        {/* LEFT FIXED COLUMN */}
        <View style={{ width: 180 }}>
          <TeamColumnHeader />
          {Array.from({ length: ROWS }).map((_, i) => (
            <TeamColumnRow key={i} />
          ))}
        </View>

        {/* RIGHT SCROLLABLE COLUMN */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <StatHeader />
            {Array.from({ length: ROWS }).map((_, i) => (
              <StatRow key={i} />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};
