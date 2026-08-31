import { useEffect, useMemo, useState } from "react";

import { LEAGUE_TABS, TEAM_TABS } from "utils/tabs";

const FALLBACK_LEAGUE_TABS = ["scores", "news", "standings", "forum"] as const;

const FALLBACK_TEAM_TABS = [
  "schedule",
  "news",
  "roster",
  "stats",
  "standings",
  "forum",
] as const;

export function useLeagueTabs(league: string) {
  const tabs = useMemo<readonly string[]>(() => {
    return (
      LEAGUE_TABS[league as keyof typeof LEAGUE_TABS] ?? FALLBACK_LEAGUE_TABS
    );
  }, [league]);

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

  useEffect(() => {
    setSelectedTab(tabs[0]);
  }, [tabs]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}

export function useTeamTabs(team: string) {
  const normalizedTeam = team.toUpperCase();

  const tabs = useMemo<readonly string[]>(() => {
    return (
      TEAM_TABS[normalizedTeam as keyof typeof TEAM_TABS] ?? FALLBACK_TEAM_TABS
    );
  }, [normalizedTeam]);

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

  useEffect(() => {
    setSelectedTab(tabs[0]);
  }, [tabs]);

  return {
    tabs,
    selectedTab,
    setSelectedTab,
  };
}
