import HeadingThree from "components/Headings/HeadingThree";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import type { ResultItem } from "types/types";
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
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);

  function getTeamLeagueKey(item: any) {
    if (item.isNFL) return "nfl";
    if (item.isMLB) return "mlb";
    if (item.isCFB) return "cfb";
    if (item.isCBB) return "cbb";
    if (item.isWCBB) return "wcbb";
    return "nba";
  }

  const visibleData = showAll ? data : data.slice(0, 5);
  const remainingCount = data.length - visibleData.length;

  const SeeAllRow = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSeeAll}
      style={styles.seeAllRow}
    >
      <Text style={styles.seeAllText}>See all results ({data.length})</Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
    );

  if (error) return <Text style={styles.errorText}>{error}</Text>;

  if (!loading && data.length === 0 && query.length > 0)
    return <Text style={styles.emptyText}>No results found.</Text>;

  return (
    <>
      {query.length === 0 && data.length > 0 && (
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
            onSelect={onSelect}
            onDelete={onDelete}
            query={query}
          />
        )}
        ListFooterComponent={!showAll && data.length > 5 ? <SeeAllRow /> : null}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </>
  );
}
