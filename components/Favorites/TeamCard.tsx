// ...
import PlaceHolderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { useEffect, useRef,  } from "react";

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import type { LeagueType, Team } from "types/types";
import React from "react";

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

  const secondaryColor =
    "secondary_color" in item
      ? item.secondary_color
      : "secondaryColor" in item
      ? item.secondaryColor
      : undefined;

const selectedColor =
  typeof item.color === "string" && item.color.startsWith("#")
    ? item.color
    : Colors.midTone;

const backgroundColor = selectionAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [
    isDark
      ? Colors.dark.itemBackground || "#121212"
      : Colors.light.itemBackground || "#f5f5f5",
    selectedColor || "#888",
  ],
});


  const textColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? Colors.dark.text : Colors.light.text,
      Colors.dark.text,
    ],
  });


  const resolveLogo = (source: any) => {
  if (!source) return PlaceHolderLogo;

  // If already require() or an object, return directly
  if (typeof source === "number" || typeof source === "object") return source;

  // If a string, convert to URI
  if (typeof source === "string") return { uri: source };

  return PlaceHolderLogo;
};


  // ✅ Always use logoLight in dark mode if available, otherwise fallback
  // ✅ Choose correct logo based on theme and selection
const logoSource = (() => {
  let selected = item.logo;

  if (isDark) {
    selected = item.logoLight || item.logo;
  } else {
    if (isSelected && item.logoLight) selected = item.logoLight;
  }

  return resolveLogo(selected);
})();


  


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
        {/* League Tag for CFB / CBB */}
        {(item.league === "CFB" || item.league === "CBB") && (
          <View
            style={[
              styles.sportTag,
              {
                backgroundColor: item.league === "CFB" ? "#228B22" : "#1E90FF",
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
            source={logoSource}
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
            {item.league === "CFB" || item.league === "CBB" ? item.name : city}{" "}
          </Animated.Text>
          {item.league !== "CFB" && item.league !== "CBB" && (
            <Animated.Text style={[styles.teamName, { color: textColor }]}>
              {nickname}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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