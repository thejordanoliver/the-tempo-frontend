import { CustomHeader } from "@/components/CustomHeader";
import RecruitDetails from "components/League/Recruiting/RecruitDetails";
import OfferList from "@/components/League/Recruiting/OfferLists";
import RecruitHeader from "@/components/League/Recruiting/RecruitHeader";
import { getMCBBTeam, getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { useRecruit } from "@/hooks/RecruitHooks/useRecruit";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function RecruitDetailScreen() {
  const navigationContentStyle = useNavigationBarContentStyle();
  const { id, league: routeLeague } = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();
  const league = routeLeague?.toLowerCase() === "cfb" ? "cfb" : "mcbb";
  const recruitId = Number(id);
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const { data: player, loading, error } = useRecruit(recruitId, league);
  const teamId =
    player?.committed_team_id == null
      ? undefined
      : String(player.committed_team_id);
  const team =
    league === "cfb" ? getCFBTeam(teamId ?? "") : getMCBBTeam(teamId ?? "");
  const teamCode = team?.code;
  const teamColor = team?.primaryColor ?? Colors.midTone;
  const teamLogo =
    league === "cfb"
      ? getCFBTeamLogo(teamId ?? "", true)
      : getMCBBTeamLogo(teamId ?? "", true);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => {
        if (loading && !player) {
          return null;
        }

        return (
          <CustomHeader
            logo={teamLogo}
            teamColor={teamColor}
            onBack={() => router.back()}
            teamCode={teamCode}
            isPlayerScreen
            league={league}
          />
        );
      },
    });
  }, [
    loading,
    navigation,
    player,
    router,
    teamColor,
    teamCode,
    teamLogo,
    league,
  ]);

  if (loading && !player) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Recruit not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={navigationContentStyle(
        styles.contentContainerStyle,
      )}
    >
      <RecruitHeader player={player} isDark={isDark} />

      <RecruitDetails recruit={player} isDark={isDark} />
      {!!player.offers?.length && (
        <OfferList recruit={player} isDark={isDark} />
      )}
    </ScrollView>
  );
}
