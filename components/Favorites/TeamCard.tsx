// ...
import { Colors, Fonts } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import type { LeagueType, Team } from "types/types";

type TeamWithLeague = Team & { league: LeagueType };

type Props = {
  item: TeamWithLeague;
  isSelected: boolean;
  isGridView: boolean;
  onPress: () => void;
  itemWidth: number;
  onImageLoad?: () => void;
};

function TeamCard({
  item,
  isSelected,
  isGridView,
  onPress,
  itemWidth,
  onImageLoad,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = teamCardStyles;
  // Split fullName into city + nickname
  const [city, nickname] = (() => {
    const parts = item.fullName?.split(" ");
    return [parts?.slice(0, -1).join(" "), parts?.slice(-1).join(" ")];
  })();

  const selectionAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const previousSelected = useRef(isSelected);

  useEffect(() => {
    if (previousSelected.current !== isSelected) {
      Animated.timing(selectionAnim, {
        toValue: isSelected ? 1 : 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      previousSelected.current = isSelected;
    }
  }, [isSelected]);

  const selectedColor =
    typeof item.color === "string" && item.color.startsWith("#")
      ? item.color
      : Colors.midTone;

  const backgroundColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? Colors.dark.itemBackground : Colors.light.itemBackground,
      selectedColor,
    ],
  });

  const textColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? Colors.dark.text : Colors.light.text,
      Colors.dark.text,
    ],
  });

  const logo =
    item.league === "CFB"
      ? getCFBTeamLogo(item.id, isDark || isSelected)
      : item.league === "CBB"
        ? getCBBTeamLogo(item.id, isDark || isSelected, false)
        : item.league === "WCBB"
          ? getCBBTeamLogo(item.id, isDark || isSelected, true)
          : item.league === "MLB"
            ? getMLBTeamLogo(item.id, isDark || isSelected)
            : item.league === "NBA"
              ? getTeamLogo(item.id, isDark || isSelected)
              : item.league === "WNBA"
                ? getWNBATeamLogo(item.id, isDark || isSelected)
                : item.league === "NFL"
                  ? getNFLTeamLogo(item.id, isDark || isSelected)
                  : getNHLTeamLogo(item.id, isDark || isSelected);

  const logoSize = isGridView ? 50 : 40;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
          width: isGridView ? itemWidth : "100%",
          marginBottom: isGridView ? 0 : 12,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.teamCard,
          {
            width: isGridView ? itemWidth : "100%",
            backgroundColor,
            flexDirection: isGridView ? "column" : "row",
            justifyContent: isGridView ? "center" : "flex-start",
            alignItems: "center",
            paddingHorizontal: isGridView ? 0 : 12,
            paddingVertical: 12,
            height: isGridView ? 130 : "auto",
          },
        ]}
      >
        {/* League Tag for CFB / CBB / WCBB */}
        {(item.league === "CFB" ||
          item.league === "CBB" ||
          item.league === "WCBB") && (
          <View
            style={[
              styles.sportTag,
              {
                backgroundColor:
                  item.league === "CFB"
                    ? "#228B22"
                    : item.league === "WCBB"
                      ? "#C2185B" // 🎀 WCBB color
                      : "#1E90FF", // CBB
              },
            ]}
          >
            <Animated.Text style={styles.sportTagText}>
              {item.league}
            </Animated.Text>
          </View>
        )}

        {/* Logo */}
        <View
          style={[
            styles.logoWrapper,
            !isGridView && {
              marginRight: 12,
              width: logoSize,
              height: logoSize,
            },
          ]}
        >
          <Animated.Image
            source={logo}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            onLoad={onImageLoad}
          />
        </View>

        {/* Team Name */}
        <View
          style={{
            alignItems: isGridView ? "center" : "flex-start",
            flexDirection: isGridView ? "column" : "row",
          }}
        >
          <Animated.Text style={[styles.teamName, { color: textColor }]}>
            {item.league === "CFB" ||
            item.league === "CBB" ||
            item.league === "WCBB"
              ? item.name
              : city}{" "}
          </Animated.Text>

          {item.league !== "CFB" &&
            item.league !== "CBB" &&
            item.league !== "WCBB" && (
              <Animated.Text style={[styles.teamName, { color: textColor }]}>
                {nickname}
              </Animated.Text>
            )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const teamCardStyles = StyleSheet.create({
  teamCard: {
    borderRadius: 8,
    overflow: "hidden",
  },
  teamName: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 12,
    textAlign: "center",
  },
  logoWrapper: {
    position: "relative",
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  sportTag: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 100,
    zIndex: 2,
  },
  sportTagText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.OSBOLD,
  },
});
export default React.memo(TeamCard);
