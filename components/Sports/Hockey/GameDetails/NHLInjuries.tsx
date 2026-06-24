import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import { getNHLTeamByEspnId, getNHLTeamLogo } from "constants/teamsNHL";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import HeadingTwo from "../../../Headings/HeadingTwo";
import FixedWidthTabBar from "../../../TabBars/FixedWidthTabBar";
import TeamInjuriesList from "./TeamInjuriesList";

export interface Injury {
  status: string;
  date?: string;
  athlete: {
    id: string;
    displayName: string;
    shortName?: string;
    headshot?: { href: string };
    position?: { displayName?: string; abbreviation?: string };
    jersey?: string;
  };
  details?: {
    type?: string;
    location?: string;
    returnDate?: string;
  };
}

export interface TeamInjuries {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: Injury[];
}

type Props = {
  injuries: TeamInjuries[];
  loading: boolean;
  error: any;
  awayTeamId?: string;
  homeTeamId?: string;
  isDark: boolean;
};


export default function NHLInjuries({
  injuries,
  loading,
  error,
  awayTeamId,
  homeTeamId,
  isDark,
}: Props) {
  const styles = teamInjuryStyles(isDark);

  const reorderedInjuries = (() => {
    if (!injuries?.length) return [];
    const away = injuries.find((t) => t.team.id === awayTeamId);
    const home = injuries.find((t) => t.team.id === homeTeamId);
    const rest = injuries.filter(
      (t) => t.team.id !== awayTeamId && t.team.id !== homeTeamId,
    );
    return [...(away ? [away] : []), ...(home ? [home] : []), ...rest];
  })();

  const tabs = reorderedInjuries.map((t) => t.team.id);

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // Select the first tab (away) whenever tabs change.
  useEffect(() => {
    if (tabs.length) setSelectedTeamId(tabs[0]);
  }, [tabs]);

  const currentTeam = reorderedInjuries.find(
    (t) => t.team.id === selectedTeamId,
  );

  // ------------------------------------------------------------------
  // Loading / Error / Empty
  // ------------------------------------------------------------------
  if (loading) return <TeamInjuriesSkeleton />;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load injuries</Text>
      </View>
    );
  }

  if (!injuries?.length || !currentTeam) return null;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Injury Report</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          selected={selectedTeamId}
          isDark={isDark}
          onTabPress={setSelectedTeamId}
          renderLabel={(teamId, isSelected, tabStyles) => {
            const team = getNHLTeamByEspnId(teamId);
            const logo = getNHLTeamLogo(Number(team?.id), isDark);

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
                  {team?.code}
                </Text>
              </View>
            );
          }}
        />

        <TeamInjuriesList
          injuries={currentTeam ? [currentTeam] : []}
          isDark={isDark}
        />
      </View>
    </View>
  );
}
