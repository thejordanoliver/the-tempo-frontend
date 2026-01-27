// components/CFB/TeamRankCard.tsx
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogoESPN } from "constants/teamsCFB";
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
  item: {
    team: string;
    rank: number;
    points: number;
    teamInfo: {
      id: number
    }
  };
  index: number;
};

export default function TeamRankCard({ item, index }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Same as RecruitCard animations
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

const teamId = item?.teamInfo?.id ?? null;
const logo = teamId ? getTeamLogoESPN(teamId, isDark) : null;

const displayName =
  item.team === "Southeastern Louisiana"
    ? "SE Louisiana"
    : item.team;


  return (
    <View style={styles.cardWrapper}>
      {/* Watermark Logo */}
      {logo && (
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fade, transform: [{ translateX: slideX }] },
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
          <Text style={styles.rank}>#{item.rank}</Text>
          <Text style={styles.teamName}>{item.team}</Text>
        </View>

        <Text style={styles.points}>{item.points.toFixed(2)} points</Text>
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
      height: "205%",
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
      paddingVertical: 10,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },

    rank: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 26,
      color: isDark ? Colors.white : Colors.black,
    },

    teamName: {
      fontFamily: Fonts.OSBOLD,
     fontSize: 26,
      color: isDark ? Colors.white : Colors.black,
    },

    points: {
      marginTop: 6,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
