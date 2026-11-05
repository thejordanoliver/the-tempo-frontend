import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

const item = (description, teamId = 12) => ({
  date: "2026-10-31T07:00Z",
  description,
  teamId,
  team: null,
});
const page = (transactions, pageIndex = 1, pageCount = 2, season = 2026) => ({
  league: "nfl",
  season,
  count: 3,
  pageIndex,
  pageSize: 2,
  pageCount,
  transactions,
});

function harness(league = "nfl", options = {}, now = "2026-11-01T12:00:00Z") {
  class Clock extends Date {
    constructor(value = now) {
      super(value);
    }
  }
  const h = sportsHookHarness({ globals: { Date: Clock } });
  const activity = { active: true, activeRef: { current: true } };
  const requests = [];
  h.modules["hooks/useScreenActivity"] = { useScreenActivity: () => activity };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get(url, config) {
        const pending = deferred();
        requests.push({ url, ...config, ...pending });
        return pending.promise;
      },
    },
  };
  const { useTransactions } = h.load("hooks/LeagueHooks/useTransactions.ts");
  h.start(useTransactions, [league, options]);
  return Object.assign(h, { requests, activity });
}

test("fetches pages for the same calendar year, deduplicates overlaps, and stops at the last page", async () => {
  const h = harness("nfl", { limit: 2 });
  try {
    await flush();
    assert.equal(h.state.loading, true);
    assert.equal(h.requests[0].url, "/api/transactions/nfl");
    assert.equal(h.requests[0].params.page, 1);
    assert.equal(h.requests[0].params.limit, 2);
    h.requests[0].resolve({ data: page([item("first"), item("overlap")]) });
    await flush();
    h.state.loadMore();
    h.state.loadMore();
    assert.equal(h.requests.length, 2);
    assert.equal(h.requests[1].params.page, 2);
    assert.equal(h.requests[1].params.season, 2026);
    h.requests[1].resolve({ data: page([item("overlap"), item("last")], 2) });
    await flush();
    assert.deepEqual(
      Array.from(h.state.transactions, (row) => row.description),
      ["first", "overlap", "last"],
    );
    assert.equal(h.state.hasMore, false);
    h.state.loadMore();
    assert.equal(h.requests.length, 2);
  } finally {
    h.stop();
  }
});

for (const [league, now, year] of [
  ["nfl", "2027-01-10T12:00:00Z", 2027],
  ["nba", "2026-11-01T12:00:00Z", 2026],
  ["mlb", "2027-01-10T12:00:00Z", 2027],
]) {
  test(`${league} requests the calendar year independently of its playing season`, async () => {
    const h = harness(league, {}, now);
    try {
      await flush();
      assert.equal(h.requests[0].url, `/api/transactions/${league}`);
      assert.equal(h.requests[0].params.season, year);
      h.requests[0].resolve({
        data: { ...page([item("signed")], 1, 2, year), league },
      });
      await flush();
      assert.equal(h.state.data.league, league);
      assert.equal(h.state.transactions[0].description, "signed");
      h.state.loadMore();
      assert.equal(h.requests[1].params.season, year);
      assert.equal(h.requests[1].params.page, 2);
    } finally {
      h.stop();
    }
  });
}

test("switching Transactions tabs cancels pagination and preserves visible rows", async () => {
  const h = harness("nba", { enabled: false });
  try {
    await flush();
    assert.equal(h.requests.length, 0);
    h.update(["nba", { enabled: true }]);
    await flush();
    h.requests[0].resolve({
      data: { ...page([item("signed")]), league: "nba" },
    });
    await flush();
    h.state.loadMore();
    h.update(["nba", { enabled: false }]);
    assert.equal(h.requests[1].signal.aborted, true);
    h.state.onRefresh();
    assert.equal(h.requests.length, 2);
    assert.equal(h.state.transactions.length, 1);
    h.requests[1].resolve({ data: page([item("stale")], 2) });
    await flush();
    assert.equal(h.state.transactions.length, 1);
    h.update(["nba", { enabled: true }]);
    await flush();
    assert.equal(h.requests[2].params.page, 1);
  } finally {
    h.stop();
  }
});

test("refresh cancels pagination, keeps visible rows, and replaces the feed", async () => {
  const h = harness();
  try {
    await flush();
    h.requests[0].resolve({ data: page([item("old")]) });
    await flush();
    h.state.loadMore();
    h.state.onRefresh();
    await flush();
    assert.equal(h.requests[1].signal.aborted, true);
    assert.equal(h.state.refreshing, true);
    assert.equal(h.state.transactions[0].description, "old");
    assert.equal(h.requests[2].params.page, 1);
    h.requests[2].resolve({ data: page([item("fresh")]) });
    await flush();
    h.requests[1].resolve({ data: page([item("stale")], 2) });
    await flush();
    assert.deepEqual(
      Array.from(h.state.transactions, (row) => row.description),
      ["fresh"],
    );
    assert.equal(h.state.refreshing, false);
  } finally {
    h.stop();
  }
});

test("a season change hides old data and ignores late responses", async () => {
  const h = harness("nfl", { season: 2026 });
  try {
    await flush();
    h.update(["nfl", { season: 2025 }]);
    assert.equal(h.state.transactions.length, 0);
    assert.equal(h.requests[0].signal.aborted, true);
    await flush();
    h.requests[1].resolve({ data: page([item("2025")], 1, 1, 2025) });
    await flush();
    h.requests[0].resolve({ data: page([item("2026")]) });
    await flush();
    assert.equal(h.state.data.season, 2025);
    assert.equal(h.state.transactions[0].description, "2025");
  } finally {
    h.stop();
  }
});

test("failed pagination retains rows and retries the failed page without an automatic retry loop", async () => {
  const h = harness();
  try {
    await flush();
    h.requests[0].resolve({ data: page([item("first")]) });
    await flush();
    h.state.loadMore();
    h.requests[1].reject(new Error("offline"));
    await flush();
    assert.ok(h.state.error);
    assert.equal(h.state.transactions.length, 1);
    h.state.loadMore();
    assert.equal(h.requests.length, 2);
    h.state.retry();
    assert.equal(h.requests[2].params.page, 2);
    h.requests[2].resolve({ data: page([item("second")], 2) });
    await flush();
    assert.equal(h.state.error, null);
    assert.equal(h.state.transactions.length, 2);
  } finally {
    h.stop();
  }
});

test("initial errors can be retried and an empty result ends pagination", async () => {
  const h = harness();
  try {
    await flush();
    h.requests[0].reject(new Error("offline"));
    await flush();
    assert.equal(h.state.loading, false);
    assert.ok(h.state.error);
    h.state.retry();
    h.requests[1].resolve({ data: page([], 1, 0) });
    await flush();
    assert.equal(h.state.error, null);
    assert.equal(h.state.hasMore, false);
    assert.equal(h.state.transactions.length, 0);
  } finally {
    h.stop();
  }
});

test("requests transactions for the supplied league without a support gate", async () => {
  const h = harness("nba");
  try {
    await flush();
    assert.equal(h.requests[0].url, "/api/transactions/nba");
    assert.equal(h.state.loading, true);
    assert.equal("supported" in h.state, false);
    h.requests[0].reject(new Error("endpoint unavailable"));
    await flush();
    assert.equal(h.state.loading, false);
    assert.ok(h.state.error);
  } finally {
    h.stop();
  }
});

test("disabled hooks do not request data", async () => {
  for (const [league, options] of [["nfl", { enabled: false }]]) {
    const h = harness(league, options);
    try {
      await flush();
      h.state.onRefresh();
      h.state.loadMore();
      assert.equal(h.requests.length, 0);
      assert.equal(h.state.loading, false);
    } finally {
      h.stop();
    }
  }
});

test("blur and unmount cancel requests, while focus resumes fetching", async () => {
  const h = harness();
  await flush();
  h.activity.active = false;
  h.activity.activeRef.current = false;
  h.update();
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[0].resolve({ data: page([item("late")]) });
  await flush();
  assert.equal(h.state.transactions.length, 0);
  h.activity.active = true;
  h.activity.activeRef.current = true;
  h.update();
  await flush();
  assert.equal(h.requests.length, 2);
  h.stop();
  assert.equal(h.requests[1].signal.aborted, true);
});

test("transaction rows tolerate missing teams and use theme-specific database logos", () => {
  const h = sportsHookHarness();
  const jsx = (type, props) => ({ type, props });
  h.modules["react/jsx-runtime"] = { jsx, jsxs: jsx };
  h.modules["react-native"] = { View: "View", Text: "Text", Image: "Image" };
  h.modules["@/styles/LeagueStyles/TransactionsStyles"] = {
    TransactionsStyles: () => ({}),
  };
  h.modules["@/utils/common/dateUtils"] = { formatDate: () => "Oct 31" };
  const TransactionItem = h.load(
    "components/League/Transactions/TransactionItem.tsx",
  ).default;
  const descendants = (node) => {
    if (!node?.props) return [];
    return [node, ...[node.props.children].flat().flatMap(descendants)];
  };
  const missing = TransactionItem({ data: item("missing"), isDark: true });
  assert.equal(
    descendants(missing).some((node) => node.type === "Image"),
    false,
  );
  const unknown = TransactionItem({
    data: item("missing", null),
    isDark: false,
  });
  assert.ok(
    descendants(unknown).some((node) => node.props.children === "Unknown team"),
  );
  const team = { name: "Chiefs", logo: "light.png", logoDark: "dark.png" };
  for (const [isDark, logo] of [
    [false, "light.png"],
    [true, "dark.png"],
  ]) {
    const row = TransactionItem({ data: { ...item("signed"), team }, isDark });
    assert.equal(
      descendants(row).find((node) => node.type === "Image").props.source.uri,
      logo,
    );
    assert.ok(
      descendants(row).some((node) => node.props.children === "Oct 31"),
    );
  }
});

test("the list wires rows, refresh, pagination, skeletons, and retry feedback", () => {
  const h = sportsHookHarness();
  const jsx = (type, props) => ({ type, props });
  let retries = 0;
  const state = {
    transactions: [item("signed")],
    loading: false,
    refreshing: false,
    loadingMore: false,
    error: null,
    loadMore() {},
    onRefresh() {},
    retry() {
      retries++;
    },
  };
  h.modules["react/jsx-runtime"] = { jsx, jsxs: jsx };
  h.modules["react-native"] = Object.fromEntries(
    [
      "FlatList",
      "View",
      "Text",
      "Pressable",
      "ActivityIndicator",
      "RefreshControl",
    ].map((name) => [name, name]),
  );
  h.modules["constants/styles"] = { Colors: {}, globalStyles: () => ({}) };
  h.modules["contexts/PreferencesContext"] = {
    usePreferences: () => ({ resolvedColorScheme: "dark" }),
  };
  h.modules["hooks/LeagueHooks/useTransactions"] = {
    useTransactions: () => state,
    getTransactionKey: () => "key",
  };
  h.modules["hooks/useNavigationBarContentStyle"] = {
    useNavigationBarContentStyle: () => (style) => [
      style,
      { paddingBottom: 80 },
    ],
  };
  h.modules["styles/LeagueStyles/TransactionsStyles"] = {
    TransactionsStyles: () => ({ contentContainerStyle: { flexGrow: 1 } }),
  };
  h.modules["./TransactionItem"] = { default: "TransactionItem" };
  h.modules["components/Skeletons/ResultItemSkeleton"] = {
    default: "Skeleton",
  };
  const TransactionList = h.load(
    "components/League/Transactions/TransactionList.tsx",
  ).default;
  const render = () => TransactionList({ league: "nfl" }).props;
  const list = render();
  assert.equal(
    list.renderItem({ item: state.transactions[0] }).props.data,
    state.transactions[0],
  );
  assert.equal(
    list.renderItem({ item: state.transactions[0] }).props.isDark,
    true,
  );
  assert.equal(list.refreshControl.props.onRefresh, state.onRefresh);
  assert.equal(list.onEndReached, state.loadMore);
  assert.equal(list.contentContainerStyle[1].paddingBottom, 80);
  state.loadingMore = true;
  assert.equal(render().ListFooterComponent.type, "ActivityIndicator");
  state.loadingMore = false;
  state.error = "Request failed";
  render().ListFooterComponent.props.children[1].props.onPress();
  assert.equal(retries, 1);
  state.transactions = [];
  assert.equal(
    render().ListEmptyComponent.props.children[0].props.children,
    "Request failed",
  );
  state.error = null;
  state.loading = true;
  assert.equal(render().ListEmptyComponent.props.children.length, 6);
  state.loading = false;
  assert.equal(
    render().ListEmptyComponent.props.children[0].props.children,
    "No transactions",
  );
});
