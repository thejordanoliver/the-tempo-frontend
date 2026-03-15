import { useState } from "react";
import { LEAGUE_TABS, League, LeagueTab } from "utils/leagueTabs";

export function useLeagueTabs<L extends League>(league: L) {
  const tabs = LEAGUE_TABS[league];

  const [selectedTab, setSelectedTab] = useState<LeagueTab<L>>(tabs[0]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}
