import { CustomHeader } from "@/components/CustomHeader";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { GameHeaderPlaceholder } from "components/CustomHeader/GameHeaderPlaceholder";
import PlayerHeader from "components/Player/PlayerHeader";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { PlayerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const navigationContentStyle = useNavigationBarContentStyle();
  const { id, league } = useLocalSearchParams<{
    id?: string;
    teamId?: string | string[];
    league: string;
  }>();
  const styles = PlayerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);

  useLayoutEffect(() => {
    if (loading) {
      navigation.setOptions({ header: () => <GameHeaderPlaceholder /> });
      return;
    }

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
  }, [navigation, loading]);

  if (loading)
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
    <ScrollView
      contentContainerStyle={navigationContentStyle(
        styles.contentContainerStyle,
      )}
      contentInsetAdjustmentBehavior="automatic"
    >
      <PlayerHeader sport="racing" player={player} isDark={isDark} />
    </ScrollView>
  );
}
