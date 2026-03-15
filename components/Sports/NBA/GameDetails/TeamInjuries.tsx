// TeamInjuries.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import FixedWidthTabBar, {
  getLabelStyle,
} from "components/TabBars/FixedWidthTabBar";
import { getTeamByESPNId, getTeamLogo } from "constants/teams";
import { Player } from "hooks/NBAHooks/usePlayersByTeam";
import { useEffect, useState } from "react";
import { Image, Text, useColorScheme, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import TeamInjuriesList from "./TeamInjuriesList";

// ✅ Define type for injuries
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
  lighter?: boolean;
  loading?: boolean;
  teamPlayersMap?: Record<string, Player[]>; // ✅ add this
};

export default function TeamInjuries({
  injuries,
  loading,
  lighter = false,
  teamPlayersMap = {},
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const styles = teamInjuryStyles(isDark, lighter);

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
  }, [tabs]);

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
      <HeadingTwo style={{ marginBottom: 12 }} lighter={lighter}>
        Injury Report
      </HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((t) => t.id)}
          selected={selectedTeamId}
          onTabPress={setSelectedTeamId}
          lighter={lighter}
          renderLabel={(tabId, isSelected) => {
            const tab = tabs.find((t) => t.id === tabId);
            if (!tab) return null;
            const team = getTeamByESPNId(tab.id);
            const teamCode = team?.code;
            const logo = getTeamLogo(Number(team?.id), isDark);

            return (
              <View style={styles.tabLabel}>
                {logo && (
                  <Image
                    source={logo}
                    style={[styles.logo, { opacity: isSelected ? 1 : 0.5 }]}
                    resizeMode="contain"
                  />
                )}

                <Text
                  style={getLabelStyle(isDark, isSelected, lighter, {
                    opacity: isSelected ? 1 : 0.5,
                  })}
                >
                  {teamCode}
                </Text>
              </View>
            );
          }}
        />

        {/* ✅ Pass teamPlayersMap down to the list */}
        <TeamInjuriesList
          injuries={[currentInjuries]}
          teamPlayersMap={teamPlayersMap}
          lighter={lighter}
        />
      </View>
    </View>
  );
}
