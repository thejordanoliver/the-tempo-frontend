// TeamInjuries.tsx
import { Player } from "@/hooks/LeagueHooks/useRoster";
import HeadingTwo from "components/Headings/HeadingTwo";
import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { getTeamByESPNId, getTeamLogo } from "constants/teams";
import { getWNBATeamByESPNId, getWNBATeamLogo } from "constants/teamsWNBA";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import TeamInjuriesList from "./TeamInjuriesList";

export type TeamInjury = {
  team: {
    id: string | number;
    displayName: string;
    abbreviation: string;
  };
  injuries: {
    athlete: {
      id: string | number;
      fullName: string;
      headshot?: string;
      position?: string;
      jersey?: string;
    };
    status: string;
    details?: {
      detail?: string;
      returnDate?: string;
    };
  }[];
};

type Props = {
  injuries: TeamInjury[];
  isDark: boolean;
  loading?: boolean;
  league: string;
  teamPlayersMap?: Record<string, Player[]>;
};

export default function TeamInjuries({
  injuries,
  loading,
  league,
  isDark,
  teamPlayersMap = {},
}: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const styles = teamInjuryStyles(isDark);
  const isWNBA = league === "wnba";

  const reorderedInjuries =
    injuries?.length === 2 ? [injuries[1], injuries[0]] : (injuries ?? []);

  // Generate tabs for the tab bar
  const tabs = reorderedInjuries.map((inj) => {
    return {
      id: String(inj.team.id),
    };
  });

  useEffect(() => {
    if (!selectedTeamId && tabs.length) {
      setSelectedTeamId(tabs[0].id);
    }
  }, [tabs, selectedTeamId]);

  const currentInjuries = reorderedInjuries.find(
    (t) => String(t.team.id) === selectedTeamId,
  );

  if (loading) {
    return <TeamInjuriesSkeleton />;
  }

  if (!injuries || injuries.length === 0 || !currentInjuries) {
    return null;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Injury Report</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((t) => t.id)}
          selected={selectedTeamId}
          onTabPress={setSelectedTeamId}
          isDark={isDark}
          renderLabel={(tabId, isSelected, tabStyles) => {
            const team = isWNBA
              ? getWNBATeamByESPNId(tabId)
              : getTeamByESPNId(tabId);
            const teamCode = team?.code;
            const logo = isWNBA
              ? getWNBATeamLogo(Number(team?.id), isDark)
              : getTeamLogo(Number(team?.id), isDark);

            return (
              <View style={styles.tabLabel}>
                {logo && (
                  <Image
                    source={logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {teamCode}
                </Text>
              </View>
            );
          }}
        />

        <TeamInjuriesList
          injuries={[currentInjuries]}
          teamPlayersMap={teamPlayersMap}
          isDark={isDark}
          league={league}
        />
      </View>
    </View>
  );
}
