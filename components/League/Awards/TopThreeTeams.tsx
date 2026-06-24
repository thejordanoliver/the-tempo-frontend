import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

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
  limit?: number; // ✅ NEW
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
  const styles = topThreeTeamsStyles(isDark, teamCount);

  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
  const styles = topThreeTeamsStyles(isDark, visibleTeams.length);

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

export const topThreeTeamsStyles = (isDark: boolean, teamCount: number) => {
  const logoSize = teamCount > 4 ? 40 : teamCount > 3 ? 44 : 50;
  const fontSize = teamCount > 4 ? 16 : 20;

  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    itemWrapper: {
      flexGrow: 1, // ✅ key change
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },

    logoWrapper: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      borderWidth: 1,
      borderColor: Colors.midTone,
      justifyContent: "center",
      alignItems: "center",
    },

    logo: {
      width: logoSize * 0.65,
      height: logoSize * 0.65,
    },

    teamContainer: {
      alignItems: "center",
    },

    teamRow: {
      flexDirection: "row",
      marginTop: 6,
      alignItems: "center",
    },

    value: {
      fontFamily: Fonts.OSBOLD,
      fontSize,
      color: isDark ? Colors.white : Colors.black,
      marginRight: 4,
    },

    label: {
      fontFamily: Fonts.OSBOLD,
      fontSize,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    divider: {
      alignSelf: "stretch", // ✅ dynamic height
      width: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.white : Colors.black,
      marginVertical: 6,
    },
  });
};
