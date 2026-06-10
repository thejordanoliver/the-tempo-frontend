import HeadingThree from "components/Headings/HeadingThree";
import ResultItemSkeleton from "components/Skeletons/ResultItemSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import type { ResultItem } from "types/explore";
import ResultItemRow from "./ResultItemRow";

type Props = {
  data: ResultItem[];
  loading: boolean;
  error: string | null;
  onSelect: (item: ResultItem) => void;
  onDelete?: (item: ResultItem) => void;
  query: string;
  onSeeAll?: () => void;
  showAll?: boolean;
  isSearching?: boolean;
};

export default function SearchResultsList({
  data,
  loading,
  error,
  onSelect,
  onDelete,
  query,
  onSeeAll,
  showAll = false,
  isSearching,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);
  const global = globalStyles(isDark);

  function getTeamLeagueKey(item: any) {
    if (item.isNFL) return "nfl";
    if (item.isWNBA) return "wnba";
    if (item.isMLB) return "mlb";
    if (item.isNHL) return "nhl";
    if (item.isCFB) return "cfb";
    if (item.isCBB) return "cbb";
    if (item.isWCBB) return "wcbb";
    if (item.isNBA) return "nba";
    return null;
  }

  const trimmedQuery = query.trim();
  const visibleData = showAll ? data : data.slice(0, 5);

  const handleSelect = (item: ResultItem) => {
    Keyboard.dismiss();
    onSelect(item);
  };

  const SeeAllRow = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSeeAll}
      style={styles.seeAllRow}
      accessibilityRole="button"
      accessibilityLabel={`See all ${data.length} search results`}
    >
      <Text style={styles.seeAllText}>See all results ({data.length})</Text>
    </TouchableOpacity>
  );

  if (isSearching)
    return (
      <View>
        {Array.from({ length: 4 }).map((_, idx) => (
          <ResultItemSkeleton key={idx} />
        ))}
      </View>
    );

  if (error) return <Text style={global.errorText}>{error}</Text>;

  if (!loading && data.length === 0 && trimmedQuery.length > 0)
    return <Text style={global.emptyText}>No results found.</Text>;

  return (
    <>
      {trimmedQuery.length === 0 && data.length > 0 && (
        <HeadingThree>Recents</HeadingThree>
      )}

      <FlatList
        data={visibleData}
        keyExtractor={(item, index) => {
          if (item.type === "team") {
            const league = getTeamLeagueKey(item);
            const teamKey =
              item.id != null
                ? String(item.id)
                : item.wid != null
                  ? String(item.wid)
                  : `idx-${index}`;

            return `team-${league}-${teamKey}`;
          }

          return `${item.type}-${item.id}-${index}`;
        }}
        renderItem={({ item }) => (
          <ResultItemRow
            item={item}
            onSelect={handleSelect}
            onDelete={onDelete}
            query={query}
          />
        )}
        ListFooterComponent={!showAll && data.length > 5 ? <SeeAllRow /> : null}
        contentContainerStyle={searchResultsListStyles.content}
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
}

const searchResultsListStyles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
});
