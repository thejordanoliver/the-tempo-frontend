import HeadingThree from "components/Headings/HeadingThree";
import {
  ActivityIndicator,
  FlatList,
  Text,
  useColorScheme,
} from "react-native";
import { exploreStyles } from "styles/ExploreStyles";
import type { ResultItem } from "types/types";
import ResultItemRow from "./ResultItemRow";

type Props = {
  data: ResultItem[];
  loading: boolean;
  error: string | null;
  onSelect: (item: ResultItem) => void;
  onDelete?: (item: ResultItem) => void;
  query: string;
};

export default function SearchResultsList({
  data,
  loading,
  error,
  onSelect,
  onDelete,
  query,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);

  function getTeamLeagueKey(item: any) {
    if (item.isNFL) return "nfl";
    if (item.isMLB) return "mlb";
    if (item.isCFB) return "cfb";
    if (item.isCBB) return "cbb";
    return "nba"; // default
  }

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
        data={data}
        keyExtractor={(item, index) => {
          if (item.type === "team") {
            const league = getTeamLeagueKey(item);
            return `team-${league}-${item.id}`;
          }

          // players + users already have unique IDs
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
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </>
  );
}
