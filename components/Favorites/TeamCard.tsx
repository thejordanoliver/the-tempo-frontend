// ...
import { Colors } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { teamCardStyles } from "styles/TeamStyles/TeamCardStyles";
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
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamCardStyles;

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
            {isGridView ? item.name : item.fullName}
          </Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(TeamCard);
