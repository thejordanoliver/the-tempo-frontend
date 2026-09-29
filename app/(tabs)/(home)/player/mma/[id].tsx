import { CustomHeader } from "@/components/CustomHeader";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerHeader from "components/Sports/MMA/Player/PlayerHeader";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const { id, league } = useLocalSearchParams<{
    id: string;
    league: string;
  }>();

  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);
  const flag = player?.flag_url;
  const color = player?.citizenship_country_alt_color ?? Colors.midTone;

  useLayoutEffect(() => {
    if (loading || !player) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }
    navigation.setOptions({
      header: () => (
        <CustomHeader
          logo={flag}
          teamColor={color}
          onBack={() => navigation.goBack()}
          isTeamScreen={true}
          isPlayerScreen
          league={league}
        />
      ),
    });
  }, [navigation, flag, color, league, loading, player]);

  if (loading || !player)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader player={player} isDark={isDark} />
    </ScrollView>
  );
}
