import { TopThreeTeamsStyles } from "@/styles/LeagueStyles/AwardTableSyles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

type TeamStat = {
  team: {
    id: number;
    code: string;
    color?: string;
  };
  value: number;
  logo?: any;
};

type Props = {
  teams: TeamStat[];
  limit?: number;
};

function TeamBubble({
  value,
  label,
  logo,
  teamCount,
}: {
  value: number;
  label: string;
  logo?: any;
  teamCount: number;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = TopThreeTeamsStyles(isDark, teamCount);

  const [scale] = useState(() => new Animated.Value(0.85));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.itemWrapper}>
      <View style={styles.teamContainer}>
        <Animated.View
          style={[styles.logoWrapper, { transform: [{ scale }], opacity }]}
        >
          {logo && (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          )}
        </Animated.View>

        <View style={styles.teamRow}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TopThreeTeams({ teams, limit = 3 }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const visibleTeams = teams.slice(0, limit);
  const styles = TopThreeTeamsStyles(isDark, visibleTeams.length);

  return (
    <View style={styles.container}>
      {visibleTeams.map((item, index) => (
        <React.Fragment key={item.team.id}>
          <TeamBubble
            value={item.value}
            label={item.team.code}
            logo={item.logo}
            teamCount={visibleTeams.length}
          />

          {index !== visibleTeams.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}
