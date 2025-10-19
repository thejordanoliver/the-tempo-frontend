import PlaceHolderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Fonts } from "constants/fonts";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import type { Team } from "types/types";

type Props = {
  item: TeamWithLeague;
  isSelected: boolean;
  isGridView: boolean;
  onPress: () => void;
  itemWidth: number;
  onImageLoad?: () => void;
};

type TeamWithLeague = Team & { league: "NBA" | "NFL" | "CFB" };


export default function TeamCard({
  item,
  isSelected,
  isGridView,
  onPress,
  itemWidth,
  onImageLoad,
}: Props) {
  const isDark = useColorScheme() === "dark";

  const [city, nickname] = (() => {
    const parts = item.fullName?.split(" ");
    return [parts?.slice(0, -1).join(" "), parts?.slice(-1).join(" ")];
  })();

  const teamsWithLightLogoInDark = [
    "Raptors",
    "Jazz",
    "76ers",
    "Rockets",
    "Giants",
    "Jets",
    "Duke",
    "Duquesne",
    "Indiana",
    "Michigan State",
    "Nevada",
    "Northern Arizona",
    "Rice",
    "South Carolina",
    "Texas",
    "Ohio State",
    "Tulsa",
    "Washington",
    "Texas A&M",
    "Tennessee",
    "UNLV",
    "West Virginia",
    "Virginia",
    "Oregon",
    "Oklahoma",
    "Nebraska",
    "Central Michigan",
    "LSU",
    "Iowa",
    "Kansas State",
    "Cincinnati",
    "Clemson",
    "California",
    "BYU",
    "TCU",
    "Auburn",
    "Baylor",
    "Arkansas",
    "Air Force",
    "Alabama",
    "UTEP",
    "Eastern Michigan",
    "Eastern Kentucky",
    "UCLA",
    "Utah",
    "Washington State",
    "Temple",
    "Toledo",
    "Wyoming",
    "Kentucky",
    "Utah State",
    "Alabama A&M",
    "Indiana State",
    "Colgate",
    "Charlotte",
  
  ];

  const shouldShowLight =
    (isDark && teamsWithLightLogoInDark.includes(item.name ?? "")) ||
    (!isDark && isSelected && !!item.logoLight);

  const lightLogoOpacity = useRef(
    new Animated.Value(shouldShowLight ? 1 : 0)
  ).current;
  const previousShouldShowLight = useRef(shouldShowLight);

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

  const selectedColor = isDark
    ? [
        "Grizzlies",
        "Suns",
        "Ravens",
        "Texans",
        "Cowboys",
        "Broncos",
        "Bears",
        "Pelicans",
        "Timberwolves",
        "Jaguars",
        "Charlotte", "North Texas"
      ].includes(item.name ?? "")
      ? secondaryColor ?? "#888"
      : item.color ?? "#888"
    : item.color ?? "#888";
    

  const backgroundColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#222" : "#eee", selectedColor],
  });

  const textColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#fff" : "#000", "#fff"],
  });

  useEffect(() => {
    if (previousShouldShowLight.current !== shouldShowLight) {
      Animated.timing(lightLogoOpacity, {
        toValue: shouldShowLight ? 1 : 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      previousShouldShowLight.current = shouldShowLight;
    }
  }, [shouldShowLight]);

  // ✅ Choose correct logo or fallback
  const logoSource = item.logo || item.logoLight || PlaceHolderLogo;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
          width: isGridView ? itemWidth : "100%",
          marginBottom: 10,
        },
      ]}
    >
  <Animated.View
  style={[
    styles.teamCard,
    {
      width: isGridView ? itemWidth : "100%", // <-- add this
      backgroundColor,
      flexDirection: isGridView ? "column" : "row",
      justifyContent: isGridView ? "center" : "flex-start",
      alignItems: "center",
      paddingHorizontal: isGridView ? 20 : 12,
      paddingVertical: 12,
      height: isGridView ? 130 : "auto",
    },
  ]}
>

  <View style={styles.logoWrapper}>
    <Animated.Image
      source={logoSource}
      style={[
        styles.logo,
        isGridView ? { marginBottom: 8 } : { marginRight: 12 },
      ]}
      onLoad={onImageLoad}
    />
    {item.logoLight && (
      <Animated.Image
        source={item.logoLight}
        style={[
          styles.logo,
          StyleSheet.absoluteFillObject,
          isGridView ? { marginBottom: 8 } : { marginRight: 12 },
          { opacity: lightLogoOpacity },
        ]}
      />
    )}
  </View>

  {isGridView ? (
    <View style={{ alignItems: "center" }}>
      <Animated.Text style={[styles.teamName, { color: textColor }]}>
        {item.league === "CFB" ? item.name : city}
      </Animated.Text>
      {item.league !== "CFB" && (
        <Animated.Text style={[styles.teamName, { color: textColor }]}>
          {nickname}
        </Animated.Text>
      )}
    </View>
  ) : (
    <Animated.Text
      style={[styles.teamName, { color: textColor, marginLeft: 8 }]}
    >
      {item.fullName}
    </Animated.Text>
  )}
</Animated.View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  teamCard: {
    borderRadius: 8,
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
});
