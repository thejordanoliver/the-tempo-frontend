// components/CFB/RecruitCard.tsx

import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  FootballRecruit,
  RecruitPredictedSchool,
} from "hooks/FootballHooks/useFootballRecruits";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  recruit: FootballRecruit;
  index: number;
};

type LogoDisplayItem = {
  teamId: number;
  teamName: string;
  logo: ImageSourcePropType;
};

function formatPercentage(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(String(value).replace("%", "").trim());

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Number.isInteger(numericValue)
    ? `${numericValue}%`
    : `${numericValue.toFixed(1)}%`;
}

function getSortedPredictions(
  predictions: RecruitPredictedSchool[] | undefined,
) {
  if (!Array.isArray(predictions)) {
    return [];
  }

  return predictions
    .filter((prediction) => prediction?.team_name)
    .sort((a, b) => {
      const percentageA = a.percentage ?? -1;
      const percentageB = b.percentage ?? -1;

      if (percentageB !== percentageA) {
        return percentageB - percentageA;
      }

      const confidenceA = a.confidence_score ?? -1;
      const confidenceB = b.confidence_score ?? -1;

      return confidenceB - confidenceA;
    });
}

function getTopTiedPredictions(predictions: RecruitPredictedSchool[]) {
  if (!predictions.length) {
    return [];
  }

  const topPercentage = predictions[0]?.percentage;

  if (topPercentage === null || topPercentage === undefined) {
    return [predictions[0]];
  }

  return predictions.filter(
    (prediction) => prediction.percentage === topPercentage,
  );
}

export default function RecruitCard({ recruit, index }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const router = useRouter();

  const sortedPredictions = useMemo(
    () => getSortedPredictions(recruit.predicted_schools),
    [recruit.predicted_schools],
  );

  const topTiedPredictions = useMemo(
    () => getTopTiedPredictions(sortedPredictions),
    [sortedPredictions],
  );

  const isPredictionTie = recruit.predicted && topTiedPredictions.length > 1;

  const logoItems = useMemo<LogoDisplayItem[]>(() => {
    if (isPredictionTie) {
      return topTiedPredictions
        .slice(0, 2)
        .map((prediction) => {
          if (!prediction.team_id) {
            return null;
          }

          const logo = getCFBTeamLogo(prediction.team_id, isDark);

          if (!logo) {
            return null;
          }

          return {
            teamId: prediction.team_id,
            teamName: prediction.team_name,
            logo,
          };
        })
        .filter((item): item is LogoDisplayItem => Boolean(item));
    }

    const primaryPrediction = sortedPredictions[0];

    const fallbackTeamId =
      recruit.committed_team_id ||
      recruit.projected_team_id ||
      primaryPrediction?.team_id ||
      recruit.predicted_team_id;

    if (!fallbackTeamId) {
      return [];
    }

    const logo = getCFBTeamLogo(fallbackTeamId, isDark);

    if (!logo) {
      return [];
    }

    return [
      {
        teamId: fallbackTeamId,
        teamName:
          recruit.projected_school ||
          recruit.predicted_school ||
          primaryPrediction?.team_name ||
          "Team",
        logo,
      },
    ];
  }, [
    isDark,
    isPredictionTie,
    recruit.committed_team_id,
    recruit.predicted_school,
    recruit.predicted_team_id,
    recruit.projected_school,
    recruit.projected_team_id,
    sortedPredictions,
    topTiedPredictions,
  ]);

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
  }, [fade, index, slideX]);

  const isFiveStar = recruit.stars === 5;
  const avatar = recruit.image_url;

  const statusLabel = recruit.signed
    ? "Signed"
    : recruit.committed
      ? "Committed"
      : recruit.predicted
        ? "Prediction"
        : "Uncommitted";

  const statusDisplay = useMemo(() => {
    if (recruit.signed || recruit.committed) {
      const school =
        recruit.projected_school ||
        recruit.predicted_school ||
        sortedPredictions[0]?.team_name ||
        null;

      return {
        school,
        percentage: null,
      };
    }

    if (isPredictionTie) {
      const school = topTiedPredictions
        .map((prediction) => prediction.team_name)
        .join(" / ");

      const percentage = formatPercentage(topTiedPredictions[0]?.percentage);

      return {
        school,
        percentage: percentage ? `${percentage}` : null,
      };
    }

    if (recruit.predicted) {
      const topPrediction = sortedPredictions[0];

      const school =
        topPrediction?.team_name || recruit.predicted_school || null;

      const percentage =
        formatPercentage(topPrediction?.percentage) ||
        formatPercentage(recruit.prediction_percentage);

      return {
        school,
        percentage,
      };
    }

    return {
      school: null,
      percentage: null,
    };
  }, [
    isPredictionTie,
    recruit.committed,
    recruit.predicted,
    recruit.predicted_school,
    recruit.prediction_percentage,
    recruit.projected_school,
    recruit.signed,
    sortedPredictions,
    topTiedPredictions,
  ]);

  const recruitId = recruit.id;

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
        {logoItems.length > 0 && (
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fade,
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            {logoItems.length > 1 ? (
              <View style={styles.splitLogoStack}>
                {logoItems.map((item, logoIndex) => (
                  <View
                    key={`${item.teamId}-${logoIndex}`}
                    style={[styles.splitLogoPane]}
                  >
                    <Image
                      source={item.logo}
                      style={[
                        styles.backgroundLogo,
                        styles.splitBackgroundLogo,
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Image
                source={logoItems[0].logo}
                style={styles.backgroundLogo}
                resizeMode="contain"
              />
            )}
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
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons
                      name="person"
                      size={22}
                      color={isDark ? Colors.lightGray : Colors.darkGray}
                    />
                  </View>
                )}
              </View>

              <View style={styles.namePosition}>
                <Text style={styles.name} numberOfLines={1}>
                  {recruit.name}
                </Text>
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
            <Text style={styles.subText} numberOfLines={1}>
              {recruit.high_school}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.subText}>{recruit.height} ft</Text>
            <View style={styles.divider} />
            <Text style={styles.subText}>{recruit.weight} lbs</Text>
          </View>

          {/* Status */}
          {statusDisplay.school ? (
            <Text
              style={[
                styles.commitText,
                isPredictionTie && styles.predictionTieText,
              ]}
              numberOfLines={2}
            >
              {statusLabel}: {statusDisplay.school}
              {statusDisplay.percentage ? ` (${statusDisplay.percentage})` : ""}
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

    splitLogoStack: {
      width: "100%",
      height: "100%",
      overflow: "hidden",
    },

    splitLogoPane: {
      flex: 1,
      overflow: "hidden",
      alignItems: "flex-end",
      justifyContent: "center",
    },

    backgroundLogo: {
      height: "155%",
      aspectRatio: 1,
      opacity: 0.55,
      marginRight: -40,
    },

    splitBackgroundLogo: {
      height: "190%",
      opacity: 0.48,
      marginRight: -34,
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
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      paddingRight: 8,
    },

    namePosition: {
      flex: 1,
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
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    avatar: {
      width: "100%",
      height: "100%",
    },

    avatarFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    name: {
      flexShrink: 1,
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

    predictionTieText: {
      color: isDark ? Colors.dark.yellow : Colors.light.yellow,
    },

    uncommittedText: {
      marginTop: 8,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
      color: isDark ? Colors.dark.yellow : Colors.light.yellow,
    },
  });
