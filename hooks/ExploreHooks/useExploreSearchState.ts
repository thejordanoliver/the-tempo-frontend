import { useCallback, useEffect, useMemo, useState } from "react";
import type { ResultItem } from "types/explore";

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

type UseExploreSearchStateOptions = {
  query: string;
  setQuery: (query: string) => void;
  results: ResultItem[];
  recentSearches: ResultItem[];
};

export function useExploreSearchState({
  query,
  setQuery,
  results,
  recentSearches,
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
    setShowAll(false);
  }, [normalizedQuery, selectedTab, searchVisible]);

  const closeSearch = useCallback(() => {
    setSearchVisible(false);
    setQuery("");
    setSelectedTab("All");
    setShowAll(false);
  }, [setQuery]);

  const toggleSearch = useCallback(() => {
    setSearchVisible((prev) => {
      if (prev) {
        setQuery("");
        setSelectedTab("All");
        setShowAll(false);
      }

      return !prev;
    });
  }, [setQuery]);

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
