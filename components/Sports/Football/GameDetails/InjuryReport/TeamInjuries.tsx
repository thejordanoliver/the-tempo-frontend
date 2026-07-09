// TeamInjuries.tsx

import TeamInjuriesList from "@/components/Sports/Baseball/GameDetails/InjuryReport/TeamInjuriesList";
import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { Player } from "@/hooks/LeagueHooks/useRoster";
import HeadingTwo from "components/Headings/HeadingTwo";
import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";

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
      headshot?: {
        alt: string;
        href: string;
      };
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
  loading?: boolean;
  league: string;
  isDark: boolean;
  teamPlayersMap?: Record<string, Player[]>;
  homeLogo: any;
  awayLogo: any;
  homeCode: string;
  awayCode: string;
  homeId: string | number;
  awayId: string | number;
};

export default function TeamInjuries({
  injuries,
  loading = false,
  league,
  isDark,
  teamPlayersMap = {},
  homeLogo,
  awayLogo,
  homeCode,
  awayCode,
  homeId,
  awayId,
}: Props) {
  const styles = teamInjuryStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

  const normalizedAwayId = awayId;
  const normalizedHomeId = homeId;

  const normalizedInjuries = useMemo(() => {
    return Array.isArray(injuries) ? injuries : [];
  }, [injuries]);

  const selectedTeamId =
    selectedTab === "away" ? normalizedAwayId : normalizedHomeId;

  const currentInjuries = useMemo(() => {
    return normalizedInjuries.find((teamInjury) => {
      return teamInjury.team.id === selectedTeamId;
    });
  }, [normalizedInjuries, selectedTeamId]);

  if (loading) {
    return <TeamInjuriesSkeleton />;
  }

  if (league !== "nfl") return null;
  if (!currentInjuries) return null;

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
        />

        <TeamInjuriesList
          injuries={[currentInjuries]}
          teamPlayersMap={teamPlayersMap}
          isDark={isDark}
        />
      </View>
    </View>
  );
}
