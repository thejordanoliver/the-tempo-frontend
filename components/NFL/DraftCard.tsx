// components/NFL/DraftCard.tsx
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getNFLESPNTeamsLogo } from "constants/teamsNFL";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  player: any;
  index: number;
};

const formatHeight = (inches?: number) => {
  if (!inches || isNaN(inches)) return "N/A";
  const ft = Math.floor(inches / 12);
  const inch = Math.round(inches % 12);
  return `${ft}'${inch}"`;
};

export default function DraftCard({ player, index }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const logo = getNFLESPNTeamsLogo(player.nflTeamId, isDark);
  const router = useRouter();
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

  const isFiveStar = player.stars === 5;
  const getPlayerHeadShot = (athleteId?: number | string) => {
    return athleteId
      ? `https://a.espncdn.com/i/headshots/nfl/players/full/${athleteId}.png`
      : null;
  };

  const headshot = getPlayerHeadShot(player.collegeAthleteId);

  const shortenPosition = (pos?: string): string => {
    if (!pos) return "N/A";

    const map: Record<string, string> = {
      Quarterback: "QB",
      "Running Back": "RB",
      "Wide Receiver": "WR",
      "Tight End": "TE",
      "Offensive Tackle": "OT",
      "Offensive Guard": "OG",
      Center: "C",
      "Defensive Edge": "EDGE",
      "Defensive End": "DE",
      "Defensive Tackle": "DT",
      "Defensive Lineman": "DL",
      Linebacker: "LB",
      "Inside Linebacker": "ILB",
      "Outside Linebacker": "OLB",
      Cornerback: "CB",
      "Defensive Back": "DB",
      Safety: "S",
      "Free Safety": "FS",
      "Strong Safety": "SS",
      Kicker: "K",
      Punter: "P",
      "Long Snapper": "LS",
    };

    return map[pos] || pos; // fallback to original if unknown
  };

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
            {headshot && (
              <Image
                source={{ uri: headshot }}
                style={styles.headshot}
                resizeMode="cover"
              />
            )}

            <Text style={styles.name}>{player.name}</Text>

            <View style={styles.divider} />
            <Text style={styles.positionText}>
              {shortenPosition(player.position)}
            </Text>
          </View>

          {/* ⭐ Ranking Badge With Shadow + Gold For 5 Stars */}
          <View style={styles.rankingBadge}>
            <Text
              style={[
                styles.rankingText,
                isFiveStar && { color: "#FFD700" }, // gold rank for 5-star
              ]}
            >
              #{player.overall}
            </Text>
          </View>
        </View>

        <View style={styles.playerBioRow}>
          <Text style={styles.subText}>{player.collegeTeam}</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>{formatHeight(player.height)}</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>{player.weight} lbs</Text>
        </View>
        <View style={styles.playerBioRow}>
          <Text style={styles.subText}>RD: {player.round}</Text>
          <View style={styles.divider} />

          <Text style={styles.subText}>Pick: {player.pick}</Text>
        </View>
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
      height: "185%",
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
      marginTop: 8,
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

    playerBioRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    positionText: {
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
