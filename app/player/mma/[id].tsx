import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/MMA/Player/PlayerHeader";
import { useLocalSearchParams, useNavigation } from "expo-router";
import useMMAFighter from "hooks/MMAHooks/useMMAFighter";
import { useLayoutEffect } from "react";
import { ScrollView, useColorScheme } from "react-native";
import { emptyFighter } from "types/mma";
import { calculateAge } from "utils/dateUtils";

export default function PlayerDetailScreen() {
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const { fighter, loading, error } = useMMAFighter(id ?? 0);
  const flag = fighter?.flag_url;
  const color = fighter?.color ?? fighter?.alternate_color ?? "";
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

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <PlayerHeader
        fighter={fighter ?? emptyFighter}
        isDark={isDark}
        calculateAge={calculateAge}
      />
    </ScrollView>
  );
}
