import SearchItemSkeleton from "components/Skeletons/ResultItemSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import {
  getTransactionKey,
  useTransactions,
} from "hooks/LeagueHooks/useTransactions";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { TransactionsStyles } from "styles/LeagueStyles/TransactionsStyles";
import TransactionItem from "./TransactionItem";

type Props = {
  league: string;
  isDark?: boolean;
  season?: number;
  active?: boolean;
};

export default function TransactionList({
  league,
  isDark: theme,
  season,
  active = true,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = theme ?? resolvedColorScheme === "dark";
  const styles = TransactionsStyles(isDark);
  const global = globalStyles(isDark);
  const navigationContentStyle = useNavigationBarContentStyle();

  const {
    transactions,
    loading,
    refreshing,
    loadingMore,
    error,
    loadMore,
    onRefresh,
    retry,
  } = useTransactions(league, { season, enabled: active });

  const feedback = error ? (
    <View style={global.emptyContainer}>
      <Text style={global.errorText} accessibilityRole="alert">
        {error}
      </Text>
      <Pressable
        onPress={retry}
        accessibilityRole="button"
        style={({ pressed }) => [styles.retryButton, pressed && global.pressed]}
      >
        <Text style={global.textMedium}>Try again</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <FlatList
      key={JSON.stringify([league, season])}
      style={styles.list}
      data={transactions}
      keyExtractor={getTransactionKey}
      renderItem={({ item }) => <TransactionItem data={item} isDark={isDark} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={navigationContentStyle(
        styles.contentContainerStyle,
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        loading ? (
          <View accessibilityLabel="Loading transactions">
            {Array.from({ length: 6 }, (_, index) => (
              <SearchItemSkeleton key={index} />
            ))}
          </View>
        ) : (
          (feedback ?? (
            <View style={global.emptyContainer}>
              <Text style={global.emptyTitle}>No transactions</Text>
              <Text style={global.emptyText}>
                No transactions were found for this year.
              </Text>
            </View>
          ))
        )
      }
      ListFooterComponent={
        transactions.length ? (
          loadingMore ? (
            <ActivityIndicator
              style={styles.footer}
              color={isDark ? Colors.white : Colors.black}
              accessibilityLabel="Loading more transactions"
            />
          ) : (
            feedback ?? undefined
          )
        ) : undefined
      }
    />
  );
}
