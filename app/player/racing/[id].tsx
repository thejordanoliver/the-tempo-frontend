import { CustomHeader } from "@/components/CustomHeader";
import PlayerHeader from "@/components/Sports/Soccer/Player/PlayerHeader";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { id, league } = useLocalSearchParams<{
    id?: string;
    teamId?: string | string[];
    league: string;
  }>();
  const styles = playerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          logo={null}
          onBack={() => navigation.goBack()}
          isTeamScreen
          isPlayerScreen
        />
      ),
    });
  }, [navigation]);

  if (!playerId)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Athlete Not Found</Text>
      </View>
    );

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error ?? "Athlete not found"}</Text>
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
      contentInsetAdjustmentBehavior="automatic"
    >
      <PlayerHeader player={player} isDark={isDark} />
    </ScrollView>
  );
}
