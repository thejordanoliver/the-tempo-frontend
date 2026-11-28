import { CustomHeader } from "@/components/CustomHeader";
import {
  RecruitRankingSummary,
  RecruitRankingsPanel,
  RecruitSchoolsPanel,
  RecruitValuationPanel,
} from "components/League/Recruiting/RecruitProfileSections";
import { GameHeaderPlaceholder } from "components/CustomHeader/GameHeaderPlaceholder";
import RecruitHeader from "@/components/League/Recruiting/RecruitHeader";
import { getMCBBTeam, getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { useRecruit } from "@/hooks/RecruitHooks/useRecruit";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useLayoutEffect, useMemo } from "react";
import { Text, View } from "react-native";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";

export default function RecruitDetailScreen() {
  const { id, league: routeLeague } = useLocalSearchParams<{
    id?: string;
    league?: string;
  }>();
  const league = routeLeague?.toLowerCase() === "cfb" ? "cfb" : "mcbb";
  const recruitId = Number(id);
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
          return <GameHeaderPlaceholder />;
        }

        return (
          <CustomHeader
            logo={teamLogo}
            teamColor={teamColor}
            onBack={() => router.back()}
            teamCode={teamCode}
            isTeamScreen
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
    <PlayerDetailsPager
      key={`${league}-${recruitId}`}
      isDark={isDark}
      overview={
        <>
          <RecruitHeader player={player} isDark={isDark} />
          <RecruitRankingSummary
            recruit={player}
            isDark={isDark}
            teamColor={teamColor}
          />
        </>
      }
      pages={[
        {
          label: "Rankings",
          content: (
            <RecruitRankingsPanel
              recruit={player}
              isDark={isDark}
              league={league}
            />
          ),
        },
        {
          label: "Schools",
          content: (
            <RecruitSchoolsPanel
              recruit={player}
              isDark={isDark}
              league={league}
            />
          ),
        },
        {
          label: "NIL",
          content: <RecruitValuationPanel recruit={player} isDark={isDark} />,
        },
      ]}
    />
  );
}
