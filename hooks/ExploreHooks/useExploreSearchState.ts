import { useCallback, useEffect, useMemo, useState } from "react";
import type { ResultItem } from "types/explore";
import type { ExploreSearchScope } from "./useExplore";

export const EXPLORE_SEARCH_TABS = [
  "All",
  "Teams",
  "Players",
  "Accounts",
] as const;

export type ExploreSearchTab = (typeof EXPLORE_SEARCH_TABS)[number];

const tabToTypeMap: Partial<Record<ExploreSearchTab, ResultItem["type"]>> = {
  Teams: "team",
  Players: "player",
  Accounts: "user",
};

const tabToScopeMap: Record<ExploreSearchTab, ExploreSearchScope> = {
  All: "all",
  Teams: "teams",
  Players: "players",
  Accounts: "users",
};

type UseExploreSearchStateOptions = {
  query: string;
  setQuery: (query: string) => void;
  results: ResultItem[];
  recentSearches: ResultItem[];
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
};

export function useExploreSearchState({
  query,
  setQuery,
  results,
  recentSearches,
  onSearchOpen,
  onSearchClose,
}: UseExploreSearchStateOptions) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ExploreSearchTab>("All");
  const [showAll, setShowAll] = useState(false);
  const normalizedQuery = query.trim();

  const baseResults = normalizedQuery ? results : recentSearches;

  const filteredResults = useMemo(
    () =>
      baseResults.filter((item) => {
        if (selectedTab === "All") return true;
        return item.type === tabToTypeMap[selectedTab];
      }),
    [baseResults, selectedTab],
  );

  const searchResultsData = filteredResults;

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      setShowAll(false);
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedQuery, selectedTab, searchVisible]);

  const closeSearch = useCallback(() => {
    onSearchClose?.();
    setSearchVisible(false);
    setQuery("");
    setSelectedTab("All");
    setShowAll(false);
  }, [onSearchClose, setQuery]);

  const toggleSearch = useCallback(() => {
    if (searchVisible) {
      closeSearch();
      return;
    }

    onSearchOpen?.();
    setSearchVisible(true);
  }, [closeSearch, onSearchOpen, searchVisible]);

  const handleChangeText = useCallback(
    (text: string) => {
      if (!searchVisible) return;
      setQuery(text);
    },
    [searchVisible, setQuery],
  );

  const handleTabPress = useCallback((tab: string) => {
    if (!EXPLORE_SEARCH_TABS.includes(tab as ExploreSearchTab)) return;
    setSelectedTab(tab as ExploreSearchTab);
  }, []);

  const handleSeeAll = useCallback(() => {
    setShowAll(true);
  }, []);

  return {
    searchVisible,
    selectedTab,
    selectedScope: tabToScopeMap[selectedTab],
    showAll,
    tabs: EXPLORE_SEARCH_TABS,
    filteredResults,
    searchResultsData,
    hasQuery: normalizedQuery.length > 0,
    setSearchVisible,
    toggleSearch,
    closeSearch,
    handleChangeText,
    handleTabPress,
    handleSeeAll,
  };
}
