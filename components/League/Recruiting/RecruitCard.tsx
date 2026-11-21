import {
  getSportsCardGradient,
  sportsCardBackgroundStyles,
} from "styles/SportsCardBackgroundStyles";
import { useScopedRouter } from "hooks/useScopedRouter";
// components/CFB/RecruitCard.tsx
import { getMCBBTeamLogo } from "@/constants/teamsMCBB";
import type { RecruitPredictedSchool } from "@/types/recruiting/players";
import { Recruit } from "@/types/recruiting/players";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
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
import {
  formatRecruitRating,
  getRecruitRanking,
  getRecruitStatus,
  type RecruitRankingSource,
} from "utils/recruiting/recruits";

type Props = {
  recruit: Recruit;
  league: "mcbb" | "cfb";
  index: number;
  rankingSource?: RecruitRankingSource;
};

type LogoDisplayItem = {
  teamId: number | null;
  teamName: string;
  logo: ImageSourcePropType;
};

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

function getTopTiedPredictions(
  predictions: RecruitPredictedSchool[],
): RecruitPredictedSchool[] {
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

export default function RecruitCard({
  recruit,
  index,
  league,
  rankingSource = "industry",
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => RecruitCardStyles(isDark), [isDark]);
  const router = useScopedRouter();

  const sortedPredictions = useMemo(
    () => getSortedPredictions(recruit.predicted_schools),
    [recruit.predicted_schools],
  );

  const topTiedPredictions = useMemo(
    () => getTopTiedPredictions(sortedPredictions),
    [sortedPredictions],
  );

  const isCommittedOrSigned =
    recruit.is_enrolled || recruit.is_signed || recruit.is_committed;

  const isPredictionTie =
    !isCommittedOrSigned &&
    recruit.has_prediction &&
    topTiedPredictions.length > 1;

  const logoItems = useMemo<LogoDisplayItem[]>(() => {
    const primaryPrediction = sortedPredictions[0];

    if (isCommittedOrSigned) {
      const committedTeamId = recruit.committed_team_id;

      const localLogo = committedTeamId
        ? league === "cfb"
          ? getCFBTeamLogo(committedTeamId, isDark)
          : getMCBBTeamLogo(committedTeamId, isDark)
        : null;
      const logo =
        localLogo ??
        (recruit.committed_school_logo_url
          ? { uri: recruit.committed_school_logo_url }
          : null);

      if (!logo) {
        return [];
      }

      return [
        {
          teamId: committedTeamId,
          teamName: recruit.committed_team_name || "Team",
          logo,
        },
      ];
    }

    if (isPredictionTie) {
      return topTiedPredictions
        .slice(0, 2)
        .map((prediction) => {
          if (!prediction.team_id) {
            return null;
          }

          const logo =
            league === "cfb"
              ? getCFBTeamLogo(prediction.team_id, isDark)
              : getMCBBTeamLogo(prediction.team_id, isDark);

          if (!logo) {
            return null;
          }

          return {
            teamId: prediction.team_id,
            teamName: prediction.team_name,
            logo,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
    }

    const teamId = primaryPrediction?.team_id || recruit.predicted_team_id;

    if (!teamId) {
      return [];
    }

    const logo =
      league === "cfb"
        ? getCFBTeamLogo(teamId, isDark)
        : getMCBBTeamLogo(teamId, isDark);

    if (!logo) {
      return [];
    }

    return [
      {
        teamId: teamId,
        teamName:
          recruit.predicted_team_name || primaryPrediction?.team_name || "Team",
        logo,
      },
    ];
  }, [
    isDark,
    isCommittedOrSigned,
    isPredictionTie,
    recruit.committed_team_id,
    recruit.committed_team_name,
    recruit.committed_school_logo_url,
    recruit.predicted_team_id,
    recruit.predicted_team_name,
    sortedPredictions,
    topTiedPredictions,
    league,
  ]);

  const [slideX] = useState(() => new Animated.Value(70));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 650,
        delay: Math.min(index, 8) * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay: Math.min(index, 8) * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, index, slideX]);

  const ranking = getRecruitRanking(recruit, rankingSource);
  const starCount = ranking.stars ?? 0;
  const avatar = recruit.image_url;

  const nationalRankValue = ranking.national ?? "—";
  const positionRankValue = ranking.position ?? "—";
  const stateRankValue = ranking.state ?? "—";
  const scoreValue = formatRecruitRating(ranking.rating);
  const highSchoolValue = recruit.high_school ?? "High school unavailable";
  const heightValue = recruit.height ?? "—";
  const weightValue = recruit.weight ? `${recruit.weight} lbs` : "—";

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open ${recruit.name}`}
        activeOpacity={activeOpacity}
        onPress={() =>
          router.push({
            pathname: "/recruit/[id]",
            params: {
              id: recruit.id,
              teamId: recruit.committed_team_id ?? undefined,
              league: league,
            },
          })
        }
      >
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
                    style={styles.splitLogoPane}
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

        <LinearGradient
          {...getSportsCardGradient(isDark)}
          style={styles.cardGradient}
        />

        <View style={styles.cardContent}>
          <View style={styles.row}>
            <View style={styles.playerHeader}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons
                      name="person"
                      size={26}
                      color={isDark ? Colors.dark.icon : Colors.light.icon}
                    />
                  </View>
                )}
              </View>

              <View style={styles.namePosition}>
                <Text style={styles.name} numberOfLines={1}>
                  {recruit.name}
                </Text>

                <Text style={styles.positionText}>
                  {recruit.position ?? "—"}
                </Text>
              </View>
            </View>
            <View style={styles.rankingBadge}>
              <Text style={styles.rankingText}>#{nationalRankValue}</Text>
              <Text style={styles.rankLabel}>NATIONAL</Text>
            </View>
          </View>

          <View style={styles.contentRow}>
            <Text style={styles.subText}>Nat {nationalRankValue}</Text>

            <View style={styles.divider} />

            <Text style={styles.subText}>Pos {positionRankValue}</Text>

            <View style={styles.divider} />

            <Text style={styles.subText}>St {stateRankValue}</Text>
          </View>

          <View style={styles.contentRow}>
            {[...Array(5)].map((_, starIndex) => {
              const filled = starIndex < starCount;

              return (
                <Ionicons
                  key={starIndex}
                  name={filled ? "star" : "star-outline"}
                  size={16}
                  color={
                    filled
                      ? isDark
                        ? Colors.dark.gold
                        : Colors.light.gold
                      : isDark
                        ? Colors.lightGray
                        : Colors.darkGray
                  }
                  style={styles.star}
                />
              );
            })}

            <View style={styles.divider} />

            <Text style={styles.subText}>
              {ranking.stars === null ? "Unrated · " : ""}
              {scoreValue}
            </Text>
          </View>

          <View style={styles.contentRow}>
            <Text
              style={[styles.subText, styles.highSchoolText]}
              numberOfLines={1}
            >
              {highSchoolValue}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.subText}>{heightValue}</Text>

            <View style={styles.divider} />

            <Text style={styles.subText}>{weightValue}</Text>
          </View>

          <Text
            style={
              isCommittedOrSigned ? styles.commitText : styles.uncommittedText
            }
          >
            {getRecruitStatus(recruit)}
            {isCommittedOrSigned
              ? ` to ${recruit.committed_team_name ?? "School unavailable"}`
              : ""}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export const RecruitCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    cardWrapper: {
      overflow: "hidden",
      position: "relative",
      marginHorizontal: 12,
      marginBottom: 10,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    logoContainer: sportsCardBackgroundStyles.logoContainer,

    splitLogoStack: {
      width: "100%",
      height: "100%",
      overflow: "hidden",
    },

    splitLogoPane: {
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "center",
      overflow: "hidden",
    },

    backgroundLogo: sportsCardBackgroundStyles.backgroundLogo,

    splitBackgroundLogo: {
      height: "190%",
      marginRight: -34,
      opacity: 0.16,
    },

    cardGradient: sportsCardBackgroundStyles.cardGradient,

    cardContent: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
      minWidth: 0,
      gap: 2,
    },

    avatarContainer: {
      width: 50,
      height: 50,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 25,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
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
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },

    positionText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    rankingBadge: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 50,
      marginLeft: 8,
    },
    rankingText: {
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      lineHeight: 30,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    rankLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 9,
      letterSpacing: 0.5,
      color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
    },

    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    highSchoolText: {
      flexShrink: 1,
    },

    star: {
      marginRight: 2,
    },

    divider: {
      width: StyleSheet.hairlineWidth,
      height: 12,
      marginHorizontal: 8,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    subText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },

    commitText: {
      marginTop: 6,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? Colors.dark.transparentGray
        : Colors.light.transparentGray,
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },

    uncommittedText: {
      marginTop: 8,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
    },
  });
