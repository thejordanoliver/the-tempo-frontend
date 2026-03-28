// components/CFB/RecruitCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/Styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
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

type PortalPlayer = {
  season: number;
  firstName: string;
  lastName: string;
  position: string;
  origin: string;
  destination: string;
  transferDate: "2025-05-01T05:00:00.000Z";
  rating: number;
  stars: number;
  eligibility: "Immediate";
  originInfo: null;
  destinationInfo: {
    id: number;
    school: string;
    mascot: string;
    abbreviation: string;
    alternateNames: string[];
    conference: string;
    division: string;
    classification: string;
    color: string;
    alternateColor: string;
    logos: string[];
  } | null;
};

type Props = {
  recruit: PortalPlayer;
  index: number;
};

export default function TransferPlayerCard({ recruit, index }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  /** Safe destination reference */
  const destination = recruit.destinationInfo ?? null;

  /** Safe team logo lookup */
  const logo = destination ? getCFBTeamLogo(destination.id, isDark) : null;
  console.log(destination?.school);
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
        locations={[0, 0.35, 0.6, 0.75, 0.85, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardGradient}
      />

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={styles.playerHeader}>
            <Text style={styles.name}>
              {recruit.firstName} {recruit.lastName}
            </Text>
          </View>

          {/* ⭐ Ranking Badge */}
          <View style={styles.rankingBadge}>
            <Text
              style={[
                styles.rankingText,
                isFiveStar && { color: "#FFD700" }, // gold for 5-star
              ]}
            >
              #{recruit.stars}
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
        </View>

        {/* Future additional player info */}
        <Text style={styles.subText}></Text>

        {/* Commit Status */}
        {destination ? (
          <Text style={styles.commitText}>
            Committed To: {destination.school}
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

    name: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },

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
