import { getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { RecruitTeamRanking } from "@/hooks/RecruitHooks/useTeamRecruitingRankings";
import { RecruitingTeamCardStyles } from "@/styles/PlayerStyles/RecruitStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Image, Text, View } from "react-native";
import { getSportsCardGradient } from "styles/SportsCardBackgroundStyles";
import RecruitingCardLogo from "./RecruitingCardLogo";

type Props = {
  item: RecruitTeamRanking;
  league: "mcbb" | "cfb";
  isDark: boolean;
  animationIndex?: number;
};

const lightStyles = RecruitingTeamCardStyles(false);
const darkStyles = RecruitingTeamCardStyles(true);

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDecimal(value: string | number | null | undefined, digits = 2) {
  const parsed = toNumber(value);
  return parsed === null ? "—" : parsed.toFixed(digits);
}

const RecruitingTeamCard = memo(function RecruitingTeamCard({
  item,
  league,
  isDark,
  animationIndex,
}: Props) {
  const styles = isDark ? darkStyles : lightStyles;

  const teamId = item.team_id ?? 0;
  const logo =
    league === "cfb"
      ? getCFBTeamLogo(teamId, isDark)
      : getMCBBTeamLogo(teamId, isDark);

  const rankChange =
    item.previous_rank && item.rank ? item.previous_rank - item.rank : 0;

  const movedUp = rankChange > 0;
  const movedDown = rankChange < 0;

  const rankChangeLabel =
    rankChange === 0
      ? "No change"
      : movedUp
        ? `Up ${Math.abs(rankChange)}`
        : `Down ${Math.abs(rankChange)}`;

  return (
    <View style={styles.cardWrapper}>
      {logo && (
        <RecruitingCardLogo animationIndex={animationIndex}>
          <Image
            source={logo}
            style={styles.backgroundLogo}
            resizeMode="contain"
          />
        </RecruitingCardLogo>
      )}

      <LinearGradient
        {...getSportsCardGradient(isDark)}
        style={styles.cardGradient}
      />

      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.rankBlock}>
            <Text style={styles.rank}>#{item.rank}</Text>

            <View
              style={[
                styles.rankChangePill,
                movedUp && styles.rankChangePillUp,
                movedDown && styles.rankChangePillDown,
              ]}
            >
              <Ionicons
                name={
                  rankChange === 0
                    ? "remove"
                    : movedUp
                      ? "arrow-up"
                      : "arrow-down"
                }
                size={10}
                color={
                  movedUp
                    ? isDark
                      ? Colors.dark.leafGreen
                      : Colors.light.green
                    : movedDown
                      ? isDark
                        ? Colors.dark.lightRed
                        : Colors.light.red
                      : isDark
                        ? Colors.dark.secondaryText
                        : Colors.light.secondaryText
                }
                style={[
                  styles.rankChangeText,
                  movedUp && styles.rankChangeTextUp,
                  movedDown && styles.rankChangeTextDown,
                ]}
              />
              <Text
                style={[
                  styles.rankChangeText,
                  movedUp && styles.rankChangeTextUp,
                  movedDown && styles.rankChangeTextDown,
                ]}
              >
                {rankChangeLabel}
              </Text>
            </View>
          </View>
          <View style={styles.teamBlock}>
            <Text numberOfLines={1} style={styles.teamName}>
              {item.team_name}
            </Text>

            <Text style={styles.points}>
              {formatDecimal(item.points)} points
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.total_commits}</Text>
            <Text style={styles.statLabel}>Commits</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.five_stars}</Text>
            <View style={styles.statLabelWrapper}>
              <Text style={styles.statLabel}>5</Text>
              <Ionicons
                name={"star"}
                size={10}
                color={isDark ? Colors.dark.yellow : Colors.light.yellow}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.four_stars}</Text>
            <View style={styles.statLabelWrapper}>
              <Text style={styles.statLabel}>4</Text>
              <Ionicons
                name={"star"}
                size={10}
                color={isDark ? Colors.dark.yellow : Colors.light.yellow}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.three_stars}</Text>
            <View style={styles.statLabelWrapper}>
              <Text style={styles.statLabel}>3</Text>
              <Ionicons
                name={"star"}
                size={10}
                color={isDark ? Colors.dark.yellow : Colors.light.yellow}
              />
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDecimal(item.average_rating)}
            </Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default RecruitingTeamCard;
