import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";
import type { FanPredictionRanking } from "types/fanPredictions";
import FanRankingRow from "./FanRankingRow";

type Props = {
  isDark: boolean;
  me: FanPredictionRanking | null;
  rankings: FanPredictionRanking[];
  showLeaderboard: boolean;
  onOpenUser: (userId: number) => void;
};

const RANKING_RULES = [
  "Pick a winner before the game starts. Each correct pregame pick earns one point.",
  "Picks close when the game goes live. Team pick percentages and your selected team remain visible.",
  "Fans with the same number of correct picks share a rank. Accuracy is based on scored picks only.",
  "Draws, canceled games, and fights without a winner don’t affect accuracy.",
  "Only new verified pregame picks count. Ranking points and accuracy update after games finish.",
];

export default function FanRankingsHeader({
  isDark,
  me,
  rankings,
  showLeaderboard,
  onOpenUser,
}: Props) {
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const styles = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const colors = isDark ? Colors.dark : Colors.light;
 

  return (
    <View style={styles.header}>
      <View style={styles.intro}>
        <View style={styles.introHeader}>
          <View style={styles.trophy}>
            <Ionicons
              name="trophy-outline"
              size={24}
              color={isDark ? Colors.gold : Colors.light.gold}
              accessible={false}
            />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.eyebrow}>ALL-TIME</Text>
            <Text style={styles.title}>Fan predictions</Text>
          </View>
        </View>
        <Text style={styles.description}>
          Pick the winners. Earn points. See where you stand.
        </Text>
        <Pressable
          onPress={() => setRulesExpanded((expanded) => !expanded)}
          accessibilityRole="button"
          accessibilityState={{ expanded: rulesExpanded }}
          style={({ pressed }) => [
            styles.rulesToggle,
            pressed && global.pressed,
          ]}
        >
          <Text style={styles.rulesLabel}>How rankings work</Text>
          <Ionicons
            name={rulesExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.icon}
            accessible={false}
          />
        </Pressable>
        {rulesExpanded ? (
          <View style={styles.rules}>
            {RANKING_RULES.map((rule) => (
              <Text key={rule} style={styles.description}>
                {rule}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      {me ? (
        <View style={styles.record}>
          <Text style={styles.sectionTitle}>Your record</Text>
          <FanRankingRow
            entry={me}
            isDark={isDark}
            isCurrentUser
            onPress={() => onOpenUser(me.userId)}
          />

          {me.rank == null ? (
            <Text style={styles.note}>
              Your rank appears after your first scored prediction.
            </Text>
          ) : null}
        </View>
      ) : null}

      {showLeaderboard ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          <Text style={styles.sectionNote}>Ranked by correct picks</Text>
        </View>
      ) : null}
    </View>
  );
}
