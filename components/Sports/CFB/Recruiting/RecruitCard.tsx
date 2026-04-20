// components/CFB/RecruitCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FootballRecruit } from "hooks/CFBHooks/useFootballRecruits";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  recruit: FootballRecruit;
  index: number;
};

export default function RecruitCard({ recruit, index }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();

  const teamId = recruit.projected_team_id;
  const logo = teamId ? getCFBTeamLogo(teamId, isDark) : null;

  /** Animations */
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
  const avatar = recruit.image_url;

  const statusLabel = recruit.signed
    ? "Signed"
    : recruit.committed
      ? "Committed"
      : recruit.predicted
        ? "Prediction"
        : "Uncommitted";

  const statusSchool = recruit.projected_school || recruit.predicted_school;
  const recruitId = recruit.id;
  const recruitInfo = recruit;

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/recruit/cfb/[id]",
            params: { id: recruitId },
          })
        }
      >
        {/* Animated Team Logo */}
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

        {/* Gradient Overlay */}
        <LinearGradient
          colors={
            isDark
              ? [
                  "rgba(29,29,29,0.9)",
                  "rgba(29,29,29,1)",
                  "rgba(29,29,29,1)",
                  "rgba(29,29,29,0.7)",
                  "rgba(29,29,29,0.3)",
                  "rgba(0,0,0,0)",
                ]
              : [
                  "rgba(255,255,255,0.9)",
                  "rgba(255,255,255,1)",
                  "rgba(255,255,255,1)",
                  "rgba(255,255,255,0.7)",
                  "rgba(255,255,255,0.3)",
                  "rgba(255,255,255,0)",
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
              <View style={styles.avatarContainer}>
                {avatar && (
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                )}
              </View>
              <View style={styles.namePosition}>
                <Text style={styles.name}>{recruit.name}</Text>
                <Text style={styles.positionText}>{recruit.position}</Text>
              </View>
            </View>

            {/* National Rank */}
            <View style={styles.rankingBadge}>
              <Text
                style={[styles.rankingText, isFiveStar && { color: "#FFD700" }]}
              >
                #{recruit.national_rank}
              </Text>
            </View>
          </View>

          <View style={styles.contentRow}>
            <Text style={styles.subText}>Nat {recruit.national_rank}</Text>
            <View style={styles.divider} />
            <Text style={styles.subText}>Pos {recruit.position_rank}</Text>
            <View style={styles.divider} />
            <Text style={styles.subText}>St {recruit.state_rank}</Text>
          </View>
          {/* Stars / Meta */}
          <View style={styles.contentRow}>
            {[...Array(5)].map((_, i) => {
              const filled = i < recruit.stars;

              return (
                <Ionicons
                  key={i}
                  name={filled ? "star" : "star-outline"}
                  size={16}
                  color={
                    filled
                      ? isDark
                        ? Colors.dark.yellow
                        : Colors.light.yellow
                      : isDark
                        ? Colors.lightGray
                        : Colors.darkGray
                  }
                  style={{ marginRight: 2 }}
                />
              );
            })}

            <View style={styles.divider} />

            <Text style={styles.subText}>{recruit.score}</Text>
          </View>
          <View style={styles.contentRow}>
            <Text style={styles.subText}>{recruit.high_school}</Text>
            <View style={styles.divider} />
            <Text style={styles.subText}>{recruit.height} ft</Text>
            <View style={styles.divider} />
            <Text style={styles.subText}>{recruit.weight} lbs</Text>
          </View>
          {/* Status */}
          {statusSchool ? (
            <Text style={styles.commitText}>
              {statusLabel}: {statusSchool}
              {recruit.prediction_percentage
                ? ` (${recruit.prediction_percentage})`
                : ""}
            </Text>
          ) : (
            <Text style={styles.uncommittedText}>Uncommitted</Text>
          )}
        </View>
      </TouchableOpacity>
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
      overflow: "hidden",
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "45%",
      justifyContent: "center",
      alignItems: "flex-end",
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
    namePosition: {
      flexDirection: "row",
      alignItems: "baseline",
    },

    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },

    avatar: {
      width: "100%",
      height: "100%",
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

    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    positionText: {
      marginLeft: 6,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
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
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },

    uncommittedText: {
      marginTop: 8,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
      color: isDark ? Colors.dark.yellow : Colors.light.yellow,
    },
  });
