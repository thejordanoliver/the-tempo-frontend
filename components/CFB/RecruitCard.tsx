// components/CFB/RecruitCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

type Props = {
  recruit: any;
  index: number;
};

const formatHeight = (inches?: number) => {
  if (!inches || isNaN(inches)) return "N/A";
  const ft = Math.floor(inches / 12);
  const inch = Math.round(inches % 12);
  return `${ft}'${inch}"`;
};

export default function RecruitCard({ recruit, index }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const logo = getTeamLogo(recruit.committedTo, isDark);

  // Animation
  const slideX = useRef(new Animated.Value(70)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 650,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isFiveStar = recruit.stars === 5;

  const getPlayerHeadShot = (athleteId?: number | string) => {
    return athleteId
      ? `https://a.espncdn.com/i/headshots/college-football/players/full/${athleteId}.png`
      : null;
  };

  const headshot = getPlayerHeadShot(recruit.athleteId);

  return (
    <View style={styles.cardWrapper}>
      {/* Animated Logo */}
      {logo && (
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fade,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <Image source={logo} style={styles.backgroundLogo} />
        </Animated.View>
      )}

      {/* Gradient */}
     <LinearGradient
           colors={
             isDark
               ? [
                   "rgba(29,29,29,0.90)",
                   "rgba(29, 29, 29, 1)",
                   "rgba(29, 29, 29, 1)",
                   "rgba(29, 29, 29, 0.69)",
                   "rgba(29, 29, 29, 0.29)",
                   "rgba(0,0,0,0.0)",
                 ]
               : [
                   "rgba(255, 255, 255, 0.9)",
                   "rgba(255, 255, 255, 1)",
                   "rgba(255, 255, 255, 1)",
                   "rgba(255, 255, 255, 0.69)",
                   "rgba(255, 255, 255, 0.29)",
                   "rgba(255, 255, 255, 0)",
                 ]
           }
           locations={[0, 0.35, 0.60, 0.75,  0.85, 1]}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 0 }}
           style={styles.cardGradient}
         />

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={styles.playerHeader}>
            {headshot && (
              <Image
                source={{ uri: headshot }}
                style={styles.headshot}
                resizeMode="cover"
              />
            )}

            <Text style={styles.name}>{recruit.name}</Text>
          </View>

          {/* ⭐ Ranking Badge With Shadow + Gold For 5 Stars */}
          <View style={styles.rankingBadge}>
            <Text
              style={[
                styles.rankingText,
                isFiveStar && { color: "#FFD700" }, // gold rank for 5-star
              ]}
            >
              #{recruit.ranking}
            </Text>
          </View>
        </View>

        <View style={styles.starRow}>
          {[...Array(recruit.stars)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={16}
              color={isDark ? Colors.dark.white : Colors.light.black}
              style={{ marginRight: 2 }}
            />
          ))}

          <Text style={styles.positionText}>{recruit.position}</Text>
          <View style={styles.divider} />

          <Text style={styles.subText}>
            {formatHeight(recruit.height)} • {recruit.weight} lbs
          </Text>
        </View>

        <Text style={styles.subText}>
          {recruit.school} — {recruit.city}, {recruit.stateProvince}
        </Text>

        {recruit.committedTo ? (
          <Text style={styles.commitText}>
            Committed: {recruit.committedTo}
          </Text>
        ) : (
          <Text style={styles.uncommittedText}>Uncommitted</Text>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    cardWrapper: {
      overflow: "hidden",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      position: "relative",
    },

    logoContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "45%",
      justifyContent: "center",
      alignItems: "flex-end",
       overflow: "hidden",
    },

    backgroundLogo: {
      height: "155%",
      aspectRatio: 1,
      opacity: 0.55,
      marginRight: -40,
    },

    cardGradient: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "120%",
    },

    cardContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    headshot: {
      width: 50,
      height: 50,
      borderRadius: 25,
      paddingTop: 4,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    name: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },

    /* ⭐ Ranking badge now has shadow */
    rankingBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: Colors.darkGray,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },

    rankingText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: Colors.white,
    },

    starRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    positionText: {
      marginLeft: 6,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
      fontSize: 14,
    },

    divider: {
      width: 1,
      height: 18,
      marginHorizontal: 6,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginBottom: 4,
    },

    commitText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },

    uncommittedText: {
      marginTop: 8,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
      color: isDark ? Colors.dark.yellow : Colors.light.yellow,
    },
  });
