import HeadingThree from "components/Headings/HeadingThree";
import ResultItemSkeleton from "components/Skeletons/ResultItemSkeleton";
import { activeOpacity, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { FlatList, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import type { ResultItem } from "types/explore";
import ResultItemRow from "./ResultItemRow";
import SearchBar from "./SearchBar";

type Props = {
  data: ResultItem[];
  loading: boolean;
  error: string | null;
  onSelect: (item: ResultItem) => void;
  onDelete?: (item: ResultItem) => void;
  handleChangeText: (text: string) => void;
  handleTabPress: (tab: string) => void;
  onSeeAll?: () => void;
  query: string;
  searchVisible: boolean;
  selectedTab: string;
  tabs: readonly string[];
  showAll?: boolean;
  canExpandResults?: boolean;
  isSearching?: boolean;
};

function getTeamLeagueKey(item: any) {
  if (item.isNFL) return "nfl";
  if (item.isWNBA) return "wnba";
  if (item.isMLB) return "mlb";
  if (item.isNHL) return "nhl";
  if (item.isCFB) return "cfb";
  if (item.isCBB) return "cbb";
  if (item.isWCBB) return "wcbb";
  if (item.isNBA) return "nba";
  if (item.isSOCC) return "mls";

  return item.leagueKey ?? item.league ?? null;
}

function getResultKey(item: ResultItem, index: number) {
  const result = item as any;

  if (result.type === "team") {
    const league = getTeamLeagueKey(result) ?? "unknown";

    const teamKey =
      result.id != null
        ? String(result.id)
        : result.slug != null
          ? String(result.slug)
          : `idx-${index}`;

    return `team-${league}-${teamKey}`;
  }

  const id =
    result.id != null
      ? String(result.id)
      : result.uid != null
        ? String(result.uid)
        : result.slug != null
          ? String(result.slug)
          : `idx-${index}`;

  return `${result.type ?? "result"}-${id}-${index}`;
}

export default function SearchResultsList({
  data,
  loading,
  error,
  onSelect,
  onDelete,
  query,
  onSeeAll,
  handleChangeText,
  searchVisible,
  selectedTab,
  tabs,
  handleTabPress,
  showAll = false,
  canExpandResults = false,
  isSearching = false,
}: Props) {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);
  const global = globalStyles(isDark);

  const trimmedQuery = query.trim();
  const visibleData = showAll ? data : data.slice(0, 5);
  const showLoadingState = loading || isSearching;
  const showRecentsTitle = trimmedQuery.length === 0 && data.length > 0;
  const showEmptyState =
    !showLoadingState && !error && data.length === 0 && trimmedQuery.length > 0;

  const handleSelect = (item: ResultItem) => {
    Keyboard.dismiss();
    onSelect(item);
  };

  const renderFooter = () => {
    if (showAll || (!canExpandResults && data.length <= 5)) return null;

    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onSeeAll}
        style={styles.seeAllRow}
        accessibilityRole="button"
        accessibilityLabel={`See all ${data.length} search results`}
      >
        <Text style={styles.seeAllText}>See all results ({data.length})</Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (showLoadingState) {
      return (
        <View>
          {Array.from({ length: 4 }).map((_, index) => (
            <ResultItemSkeleton key={`search-skeleton-${index}`} />
          ))}
        </View>
      );
    }

    if (error) {
      return <Text style={global.errorText}>{error}</Text>;
    }

    if (showEmptyState) {
      return <Text style={global.emptyText}>No results found.</Text>;
    }

    return (
      <FlatList
        data={visibleData}
        keyExtractor={getResultKey}
        renderItem={({ item }) => {
      
          return (
            <ResultItemRow
              item={item}
              onSelect={handleSelect}
              onDelete={onDelete}
              query={query}
            />
          );
        }}
        ListHeaderComponent={
          showRecentsTitle ? <HeadingThree>Recents</HeadingThree> : null
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.resultListContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.wrapper}>
      <SearchBar
        value={query}
        placeholder="Explore Teams, Players and Accounts..."
        onChangeText={handleChangeText}
        visible={searchVisible}
        onFocus={() => {}}
        onBlur={() => {}}
        tabs={[...tabs]}
        selectedTab={selectedTab}
        onTabPress={handleTabPress}
      />

      {renderContent()}
    </View>
  );
}
