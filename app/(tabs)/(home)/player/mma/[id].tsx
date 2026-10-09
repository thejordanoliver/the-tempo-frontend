import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";
import FighterCareerStats from "components/Sports/MMA/Player/FighterCareerStats";
import FighterFightLog from "components/Sports/MMA/Player/FighterFightLog";
import PlayerHeader from "components/Sports/MMA/Player/PlayerHeader";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useFighterFightLog } from "hooks/MMAHooks/useFighterFightLog";
import { useFighterLatestGame } from "hooks/MMAHooks/useFighterLatestGame";
import { useLayoutEffect, useMemo } from "react";
import { Text, View } from "react-native";

export default function PlayerDetailScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const { id, league = "mma" } = useLocalSearchParams<{
    id: string;
    league?: "mma" | "ufc";
  }>();

  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, "mma");
  const fightLog = useFighterFightLog(playerId);
  const latestFight = useFighterLatestGame(fightLog.data);
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
  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error ?? "Fighter not found"}</Text>
      </View>
    );

  return (
    <PlayerDetailsPager
      key={`mma:${playerId}`}
      isDark={isDark}
      overview={
        <>
          <PlayerHeader player={player} isDark={isDark} />
          <LatestGame
            game={latestFight.game}
            loading={fightLog.loading || latestFight.loading}
            error={fightLog.error || latestFight.error}
            isDark={isDark}
            league={league}
          />
        </>
      }
      pages={[
        {
          label: "Career Stats",
          content: (
            <FighterCareerStats
              data={fightLog.data}
              loading={fightLog.loading}
              error={fightLog.error}
              isDark={isDark}
            />
          ),
        },
        {
          label: "Fight Log",
          content: (
            <FighterFightLog
              data={fightLog.data}
              loading={fightLog.loading}
              error={fightLog.error}
              onRetry={fightLog.refetch}
            />
          ),
        },
      ]}
    />
  );
}
