import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import {
  FootballTeamInjury,
  Team,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import { useState } from "react";
import { View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import TeamInjuriesList from "./TeamInjuriesList";

type Props = {
  injuries?: FootballTeamInjury[];
  loading?: boolean;
  league: string;
  isDark: boolean;
  homeLogo: any;
  awayLogo: any;
  homeCode: string;
  awayCode: string;
  homeId: string | number;
  awayId: string | number;
};

const matchesTeam = (
  team: Team | undefined,
  selectedTeamId: string | number,
) => {
  if (!team) return false;

  return [team.id, team.espnId].some(
    (id) =>
      id !== null &&
      id !== undefined &&
      String(id) === String(selectedTeamId),
  );
};

export default function TeamInjuries({
  injuries = [],
  loading = false,
  league,
  isDark,
  homeLogo,
  awayLogo,
  homeCode,
  awayCode,
  homeId,
  awayId,
}: Props) {
  const styles = teamInjuryStyles(isDark);
  const [selectedTab, setSelectedTab] =
    useState<HomeAwayTabValue>("away");

  if (loading) {
    return <TeamInjuriesSkeleton />;
  }

  if (league.toLowerCase() !== "nfl") {
    return null;
  }

  const hasInjuries = injuries.some(
    (team) => team.injuries?.length > 0,
  );

  if (!hasInjuries) {
    return null;
  }

  const selectedTeamId =
    selectedTab === "away" ? awayId : homeId;

  const selectedInjuries =
    injuries.find((teamInjury) =>
      matchesTeam(teamInjury.team, selectedTeamId),
    )?.injuries ?? [];

  return (
    <View>
      <HeadingTwo isDark={isDark}>
        Injury Report
      </HeadingTwo>

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
          injuries={selectedInjuries}
          isDark={isDark}
        />
      </View>
    </View>
  );
}