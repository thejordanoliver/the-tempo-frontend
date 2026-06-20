import { useMMAFighter } from "@/hooks/MMAHooks/useMMAFighter";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/MMA/Player/PlayerHeader";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { player, loading } = useMMAFighter(id);
  const flag = player?.flag_url;
  const color = player?.citizenship_country_alt_color ?? Colors.midTone;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={flag}
          teamColor={color}
          onBack={() => navigation.goBack()}
          isTeamScreen={true}
          isPlayerScreen
          league="MMA"
        />
      ),
    });
  }, [navigation, flag, color]);

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader player={player} isDark={isDark} />
    </ScrollView>
  );
}
