// components/Players/PlayerLeadersSlide.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Styles";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, useColorScheme, View } from "react-native";
import Animated, { SlideInDown, SlideOutUp } from "react-native-reanimated";
import { PlayerLeadersSlideProps } from "types/playerLeader";
import PlayerItem from "./PlayerItem";

export default function PlayerLeadersSlide({
  header,
  players,
  slideWidth,
  slideHeight,
}: PlayerLeadersSlideProps) {
  const isDark = useColorScheme() === "dark";

  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 32;

  const availableHeight = slideHeight - HEADER_HEIGHT;
  const visibleCount = Math.max(1, Math.floor(availableHeight / ROW_HEIGHT));
  const listHeight = useMemo(() => visibleCount * ROW_HEIGHT, [visibleCount]);
  const styles = playersSlide(isDark);
  return (
    <View style={[styles.container, { height: slideHeight }]}>
      <HeadingTwo style={styles.header}>{header}</HeadingTwo>

      {/* This view clips rows without removing them */}
      <View style={{ height: listHeight, overflow: "hidden" }}>
        <FlatList
          data={players} // ✅ ALL players stay mounted
          keyExtractor={(player) => player.id.toString()}
          scrollEnabled={false}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => {
            const distanceFromCutoff = index - (visibleCount - 1);
            const opacity = Math.max(
              0,
              Math.min(1, 1 - distanceFromCutoff * 0.6)
            );
            return (
              <Animated.View
                style={{ opacity }}
                entering={SlideInDown.duration(250)}
                exiting={SlideOutUp.duration(200)}
              >
                <PlayerItem
                  id={item.id}
                  firstName={item.firstName}
                  lastName={item.lastName}
                  headshot={item.headshot_url}
                  jerseyNumber={item.jersey_number}
                  team={item.team}
                  stats={[
                    {
                      label: item.leaderStat?.name ?? "",
                      value: item.leaderStat?.value ?? 0,
                    },
                  ]}
                  isLast={index === players.length - 1}
                  width={slideWidth}
                  height={ROW_HEIGHT}
                />
              </Animated.View>
            );
          }}
        />
      </View>
    </View>
  );
}

const playersSlide = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      borderRadius: 8,
      overflow: "hidden", // ✅ clips cleanly
    },
    header: {
      marginTop: 4,
      marginBottom: 2,
      fontSize: 16,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
  });
