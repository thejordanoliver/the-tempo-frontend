import { CustomHeader } from "components/CustomHeader";
import type { HeaderImageSource } from "components/CustomHeader/types";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useNotifications } from "contexts/NotificationContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { usePagerTabScrollProgress } from "hooks/usePagerTabScrollProgress";
import useTeamDetails from "hooks/useTeams";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

type TeamHeaderConfig = {
  league: string;
  teamId: number;
  notificationTeamId?: number;
  teamName?: string | null;
  teamColor: string;
  logo: HeaderImageSource;
  favorite?: { lookupId: number; toggleId: number };
  favoriteLeague?: string;
  infoEnabled?: boolean;
};

type TeamDetailConfig = {
  tabLeague: string;
  header: TeamHeaderConfig;
};

export function useTeamDetailScreen({ tabLeague, header }: TeamDetailConfig) {
  const navigation = useNavigation();
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const { toggleNotifications, isNotified } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setModalVisible(false);
    });
    return () => { cancelled = true; };
  }, [header.league, header.teamId]);
  const detailsLeague = ["socc", "msoc", "wsoc"].includes(tabLeague.trim().toLowerCase())
    ? "socc"
    : header.league;
  const {
    teamDetails,
    loading: teamDetailsLoading,
    error: teamDetailsError,
    refetch: refreshTeamDetails,
  } = useTeamDetails(detailsLeague, header.teamId);
  const { tabs, selectedTab, setSelectedTab, hasVisitedTab } = useTeamTabs(tabLeague);
  const { scrollProgress, handlePageScroll, syncPageScrollProgress } =
    usePagerTabScrollProgress();

  const handleTabPress = useCallback((tab: string) => {
    const index = tabs.indexOf(tab);
    if (index < 0) return;
    setSelectedTab(tab);
  }, [setSelectedTab, tabs]);

  const handlePageChange = useCallback((index: number) => {
    const tab = tabs[index];
    if (!tab) return;
    syncPageScrollProgress(index);
    setSelectedTab(tab);
  }, [setSelectedTab, syncPageScrollProgress, tabs]);

  const runRefresh = useCallback(async (refresh: () => Promise<void>) => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const favoriteLookupId = header.favorite?.lookupId;
  const favoriteToggleId = header.favorite?.toggleId;
  const notificationTeamId = header.notificationTeamId ?? header.teamId;
  const favoriteLeague = header.favoriteLeague ?? header.league;
  const favorited = favoriteLookupId !== undefined
    ? isFavorite(favoriteLeague, favoriteLookupId)
    : false;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          teamId={header.teamId}
          logo={header.logo}
          teamName={header.teamName}
          teamColor={header.teamColor}
          onBack={router.back}
          isTeamScreen
          isFavorite={favorited}
          onToggleFavorite={favoriteToggleId === undefined ? undefined :
            () => toggleFavorite(favoriteLeague, favoriteToggleId)}
          onToggleNotifications={() =>
            void toggleNotifications(header.league, notificationTeamId)}
          isNotified={isNotified(header.league, notificationTeamId)}
          onOpenInfo={header.infoEnabled ? () => setModalVisible(true) : undefined}
          league={header.league}
        />
      ),
    });
  }, [navigation, router, isDark, header.league, header.teamId, notificationTeamId, header.logo,
    header.teamName, header.teamColor, header.infoEnabled,
    favoriteLeague, favoriteToggleId, favorited, toggleFavorite, toggleNotifications, isNotified]);

  return {
    teamDetails, teamDetailsLoading, teamDetailsError, refreshTeamDetails,
    teamInfo: {
      enabled: header.infoEnabled,
      league: detailsLeague,
      teamId: header.teamId,
      teamLogo: header.logo,
      teamColor: header.teamColor,
    },
    isDark, tabs, selectedTab, hasVisitedTab,
    scrollProgress, handlePageScroll, handleTabPress, handlePageChange,
    refreshing, runRefresh, modalVisible, setModalVisible,
  };
}
