import { useState } from "react";
import {
  LEAGUE_TABS,
  League,
  LeagueTab,
  TEAM_TABS,
  Team,
  TeamTab,
} from "utils/tabs";

export function useLeagueTabs<L extends League>(league: L) {
  const tabs = LEAGUE_TABS[league];

  const [selectedTab, setSelectedTab] = useState<LeagueTab<L>>(tabs[0]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}

export function useTeamTabs<T extends Team>(Team: T) {
  const tabs = TEAM_TABS[Team];

  const [selectedTab, setSelectedTab] = useState<TeamTab<T>>(tabs[0]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}
