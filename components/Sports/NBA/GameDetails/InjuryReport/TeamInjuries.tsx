// TeamInjuries.tsx
import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { Player } from "@/hooks/LeagueHooks/useRoster";
import HeadingTwo from "components/Headings/HeadingTwo";
import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import { useEffect, useState } from "react";
import { View } from "react-native";
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
  homeLogo: any;
  awayLogo: any;
  homeCode: string;
  awayCode: string;
  homeId: string | number;
  awayId: string | number;
  teamPlayersMap?: Record<string, Player[]>;
};

export default function TeamInjuries({
  injuries,
  loading,
  league,
  homeLogo,
  awayLogo,
  homeCode,
  awayCode,
  homeId,
  awayId,
  isDark,
  teamPlayersMap = {},
}: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const styles = teamInjuryStyles(isDark);
  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

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
        <HomeAwayTabBar
          awayTeam={{
            id: awayId,
            name: awayCode || "AWAY",
            logo: awayLogo,
          }}
          homeTeam={{
            id: homeId,
            name: homeCode || "HOME",
            logo: homeLogo,
          }}
          selected={selectedTab}
          onTabPress={setSelectedTab}
          isDark={isDark}
          showAllTab={false}
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
