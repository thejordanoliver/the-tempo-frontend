import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/MMA/Player/PlayerHeader";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import useMMAFighter from "hooks/MMAHooks/useMMAFighter";
import { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";
import { emptyFighter } from "types/mma";
import { calculateAge } from "utils/dateUtils";

export default function PlayerDetailScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const { fighter, loading, error } = useMMAFighter(id ?? 0);
  const flag = fighter?.flag_url;
  const color = fighter?.color ?? fighter?.alternate_color ?? "";
  // console.log(JSON.stringify(fighter, null, 2))
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
  }, [navigation, flag]);

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader
        fighter={fighter ?? emptyFighter}
        isDark={isDark}
        calculateAge={calculateAge}
      />
    </ScrollView>
  );
}
