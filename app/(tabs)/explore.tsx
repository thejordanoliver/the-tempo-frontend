import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AddWidgetModal from "components/Explore/AddWidgetModal";
import EmptyState from "components/Explore/EmptyState";
import SearchResultsList from "components/Explore/SearchResultsList";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { useExplore } from "hooks/useExplore";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import { ResultItem } from "types/explore";
import {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import SearchBar from "../../components/Explore/SearchBar";

const tabs = ["All", "Teams", "Players", "Accounts"] as const;

const tabToTypeMap = {
  Teams: "team",
  Players: "player",
  Accounts: "user",
};

const EXPLORE_WIDGETS_KEY_PREFIX = "exploreWidgets";
const getExploreWidgetsKey = (userId: string | number) =>
  `${EXPLORE_WIDGETS_KEY_PREFIX}:${userId}`;

const isExploreWidgetType = (value: unknown): value is ExploreWidgetType =>
  typeof value === "string" &&
  [
    "nba_games",
    "nfl_games",
    "mlb_games",
    "nhl_games",
    "wnba_games",
    "cbb_games",
    "wcbb_games",
    "cfb_games",
    "favorite_games",
    "favorite_teams",
    "trending_news",
    "player_leaders",
    "standings",
  ].includes(value);

const isExploreWidgetSize = (value: unknown): value is ExploreWidgetSize =>
  value === "small" || value === "medium" || value === "large";

const getDefaultWidgetSize = (
  type: ExploreWidgetType,
): ExploreWidgetSize => {
  switch (type) {
    case "trending_news":
    case "standings":
      return "medium";
    case "favorite_games":
    case "nba_games":
    case "nfl_games":
    case "mlb_games":
    case "nhl_games":
    case "wnba_games":
    case "cbb_games":
    case "wcbb_games":
    case "cfb_games":
      return "medium";
    default:
      return "medium";
  }
};

const withSequentialOrder = (widgets: ExploreWidgetConfig[]) =>
  widgets
    .slice()
    .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
    .map((widget, index) => ({ ...widget, order: index }));

const normalizeStoredWidgets = (value: unknown): ExploreWidgetConfig[] => {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .filter(
      (widget): widget is Partial<ExploreWidgetConfig> =>
        Boolean(widget) &&
        typeof widget === "object" &&
        isExploreWidgetType((widget as ExploreWidgetConfig).type),
    )
    .map((widget) => ({
      id:
        typeof widget.id === "string"
          ? widget.id
          : `${widget.type}:${Date.now()}`,
      type: widget.type as ExploreWidgetType,
      title:
        typeof widget.title === "string" && widget.title
          ? widget.title
          : String(widget.type),
      createdAt:
        typeof widget.createdAt === "number" ? widget.createdAt : Date.now(),
      size: isExploreWidgetSize(widget.size)
        ? widget.size
        : getDefaultWidgetSize(widget.type as ExploreWidgetType),
      order: typeof widget.order === "number" ? widget.order : Number.MAX_SAFE_INTEGER,
    }));

  return withSequentialOrder(normalized);
};

export default function ExplorePage() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("All");
  const [showAll, setShowAll] = useState(false);
  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const [widgets, setWidgets] = useState<ExploreWidgetConfig[]>([]);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const [widgetUserId, setWidgetUserId] = useState<string | null>(null);
  const widgetLoadRequestId = useRef(0);
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);
  const {
    query,
    setQuery,
    results,
    recentSearches,
    loading,
    error,
    isSearching,
    saveToRecentSearches,
    deleteRecentSearch,
  } = useExplore();

  const filteredResults = (query.trim() ? results : recentSearches).filter(
    (item) => {
      if (selectedTab === "All") return true;
      return item.type === tabToTypeMap[selectedTab];
    },
  );

  const handleSelectItem = (item: ResultItem) => {
    saveToRecentSearches(item);

    switch (item.type) {
      case "team":
        if (item.isNFL) router.push(`/team/nfl/${item.id}`);
        else if (item.isMLB) router.push(`/team/mlb/${item.id}`);
        else if (item.isWNBA) router.push(`/team/wnba/${item.id}`);
        else if (item.isNHL) router.push(`/team/nhl/${item.id}`);
        else if (item.isCFB) router.push(`/team/cfb/${item.id}`);
        else if (item.isCBB) router.push(`/team/cbb/${item.id}`);
        else if (item.isWCBB) router.push(`/team/wcbb/${item.wid}`);
        else router.push(`/team/${item.id}`);
        break;
      case "player":
        if (item.isNFL)
          router.push({
            pathname: "/player/nfl/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isCFB)
          router.push({
            pathname: "/player/cfb/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isMMA)
          router.push({
            pathname: "/player/mma/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isMLB)
          router.push({
            pathname: "/player/mlb/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isWNBA)
          router.push({
            pathname: "/player/wnba/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isCBB || item.isWCBB)
          router.push({
            pathname: "/player/cbb/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
              league: item.isWCBB ? "WCBB" : "CBB",
            },
          });
        else
          router.push({
            pathname: "/player/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        break;
      case "user":
        router.push(`/user/${item.id}`);
        break;
    }
  };

  const loadWidgets = useCallback(async () => {
    const requestId = ++widgetLoadRequestId.current;
    setWidgetsReady(false);

    try {
      const userId = await AsyncStorage.getItem("userId");

      if (requestId !== widgetLoadRequestId.current) return;

      if (!userId) {
        setWidgetUserId(null);
        setWidgets([]);
        return;
      }

      setWidgetUserId(userId);
      AsyncStorage.removeItem(EXPLORE_WIDGETS_KEY_PREFIX).catch(() => {});

      const storedWidgets = await AsyncStorage.getItem(
        getExploreWidgetsKey(userId),
      );

      if (requestId !== widgetLoadRequestId.current) return;

      setWidgets(
        storedWidgets ? normalizeStoredWidgets(JSON.parse(storedWidgets)) : [],
      );
    } catch (err) {
      if (requestId !== widgetLoadRequestId.current) return;
      console.error("Failed to load Explore widgets", err);
      setWidgets([]);
    } finally {
      if (requestId === widgetLoadRequestId.current) {
        setWidgetsReady(true);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWidgets();
    }, [loadWidgets]),
  );

  useEffect(() => {
    if (!widgetsReady || !widgetUserId) return;

    AsyncStorage.setItem(
      getExploreWidgetsKey(widgetUserId),
      JSON.stringify(widgets),
    ).catch((err) => console.error("Failed to save Explore widgets", err));
  }, [widgetUserId, widgets, widgetsReady]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Explore"
          title="Explore"
          onSearchToggle={() => {
            setSearchVisible((prev) => {
              if (prev) {
                setQuery(""); // clear text
                setSelectedTab("All"); // reset tabs
              }
              return !prev;
            });
          }}

        />
      ),
    });
  }, [navigation, setQuery]);

  const handleAddWidget = (
    type: ExploreWidgetType,
    title: string,
    size: ExploreWidgetSize,
  ) => {
    setWidgets((prev) => {
      if (prev.some((widget) => widget.type === type)) return prev;
      const ordered = withSequentialOrder(prev);

      return [
        ...ordered,
        {
          id: `${type}:${Date.now()}`,
          type,
          title,
          createdAt: Date.now(),
          size,
          order: ordered.length,
        },
      ];
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) =>
      withSequentialOrder(prev.filter((widget) => widget.id !== widgetId)),
    );
  };

  const handleResizeWidget = (
    widgetId: string,
    size: ExploreWidgetSize,
  ) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === widgetId ? { ...widget, size } : widget,
      ),
    );
  };

  const handleMoveWidget = (widgetId: string, direction: -1 | 1) => {
    setWidgets((prev) => {
      const ordered = withSequentialOrder(prev);
      const currentIndex = ordered.findIndex((widget) => widget.id === widgetId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) {
        return ordered;
      }

      const next = ordered.slice();
      [next[currentIndex], next[nextIndex]] = [
        next[nextIndex],
        next[currentIndex],
      ];

      return withSequentialOrder(next);
    });
  };

  const handleChangeText = (text: string) => {
    if (!searchVisible) return;
    setQuery(text); // only update state, search is handled by debounce
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        placeholder="Explore Teams, Players and Accounts..."
        onChangeText={handleChangeText}
        visible={searchVisible}
        onFocus={() => {}}
        onBlur={() => {}}
        tabs={[...tabs]}
        selectedTab={selectedTab}
        onTabPress={(tab) => setSelectedTab(tab as typeof selectedTab)}
      />

      {!searchVisible && (
        <EmptyState
          isDark={isDark}
          selectedWidgets={widgets}
          onAddWidget={() => setWidgetModalVisible(true)}
          onRemoveWidget={handleRemoveWidget}
          onResizeWidget={handleResizeWidget}
          onMoveWidget={handleMoveWidget}
        />
      )}

      {searchVisible && (
        <SearchResultsList
          data={filteredResults.length ? filteredResults : recentSearches}
          loading={loading}
          error={error}
          onSelect={handleSelectItem}
          onDelete={deleteRecentSearch}
          query={query}
          onSeeAll={() => setShowAll(true)}
          showAll={showAll}
          isSearching={isSearching}
        />
      )}

      <AddWidgetModal
        visible={widgetModalVisible}
        isDark={isDark}
        selectedWidgets={widgets}
        onClose={() => setWidgetModalVisible(false)}
        onAddWidget={handleAddWidget}
      />
    </View>
  );
}
