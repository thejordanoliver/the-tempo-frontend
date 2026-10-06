import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { FlatList, Image, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { BROWSEABLE_LEAGUES, LEAGUE_CONFIG } from "constants/leagues";
import { Colors, globalStyles } from "constants/styles";
import { LeagueScreenStyles } from "styles/LeagueStyles/LeagueStyles";
import type { LeagueType } from "types/types";

type Props = {
  isDark: boolean;
  searchQuery: string;
  onSelect: (league: LeagueType) => void;
  contentContainerStyle: StyleProp<ViewStyle>;
};

export default function LeagueList({ isDark, searchQuery, onSelect, contentContainerStyle }: Props) {
  const styles = useMemo(() => LeagueScreenStyles(isDark), [isDark]);
  const typography = useMemo(() => globalStyles(isDark), [isDark]);
  const leagues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return BROWSEABLE_LEAGUES.filter(league => {
      const label = LEAGUE_CONFIG[league].label;
      return [league, label, label.replace(/[^a-zA-Z0-9 ]/g, "")].join(" ").toLowerCase().includes(query);
    });
  }, [searchQuery]);
  return (
    <FlatList
      data={leagues}
      keyExtractor={league => league}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={<View style={typography.emptyContainer}><Text style={typography.emptySubText}>No leagues found.</Text></View>}
      renderItem={({ item: league, index }) => {
        const config = LEAGUE_CONFIG[league];
        return (
          <View style={[styles.buttonContainer, index === leagues.length - 1 && { borderBottomWidth: 0 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={config.label}
              onPress={() => onSelect(league)}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <View style={styles.buttonWrapper}>
                <Image source={isDark ? config.logoLight : config.logo} style={styles.logo} resizeMode="contain" />
                <Text style={styles.buttonText}>{config.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? Colors.white : Colors.black} />
            </Pressable>
          </View>
        );
      }}
    />
  );
}
