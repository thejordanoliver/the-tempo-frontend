import { useEffect, useState } from "react";
import {
  LEAGUE_TABS,
  League,
  LeagueTab,
  TEAM_TABS,
  Team,
  TeamTab,
} from "utils/tabs";

const FALLBACK_LEAGUE_TABS = ["scores", "news", "standings", "forum"] as const;

export function useLeagueTabs<L extends League>(league: L) {
  const tabs = (LEAGUE_TABS[league] ??
    FALLBACK_LEAGUE_TABS) as readonly LeagueTab<L>[];

  const [selectedTab, setSelectedTab] = useState<LeagueTab<L>>(
    tabs[0],
  );

  useEffect(() => {
    setSelectedTab(tabs[0]);
  }, [league, tabs]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}

export function useTeamTabs<T extends Team>(team: T) {
  const tabs = TEAM_TABS[team] as readonly TeamTab<T>[];

  const [selectedTab, setSelectedTab] = useState<TeamTab<T>>(
    tabs[0],
  );

  useEffect(() => {
    setSelectedTab(tabs[0]);
  }, [team, tabs]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}