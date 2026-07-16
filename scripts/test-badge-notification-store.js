const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const rootDir = path.resolve(__dirname, "..");

function transpileModule(relativePath) {
  const source = fs.readFileSync(path.join(rootDir, relativePath), "utf8");

  return ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
}

function createStore(initializer) {
  let state;

  const set = (partial) => {
    const next = typeof partial === "function" ? partial(state) : partial;

    if (!next) return;

    state = {
      ...state,
      ...next,
    };
  };

  const get = () => state;

  state = initializer(set, get, undefined);

  const store = (selector) =>
    typeof selector === "function" ? selector(state) : state;

  store.getState = () => state;
  store.setState = set;

  return store;
}

function loadTranspiledModule(relativePath, mocks = {}, extraSandbox = {}) {
  const sandbox = {
    __DEV__: false,
    console,
    Date,
    exports: {},
    module: { exports: {} },
    process: {
      env: {},
    },
    require(moduleName) {
      if (Object.prototype.hasOwnProperty.call(mocks, moduleName)) {
        return mocks[moduleName];
      }

      throw new Error(
        `Unexpected require while loading ${relativePath}: ${moduleName}`,
      );
    },
    ...extraSandbox,
  };

  sandbox.exports = sandbox.module.exports;

  vm.runInNewContext(transpileModule(relativePath), sandbox, {
    filename: relativePath,
  });

  return sandbox.module.exports;
}

function createBadgeNotification(notificationId, badgeId = notificationId) {
  return {
    notificationId,
    userId: 1,
    badge: {
      badgeId,
      name: `Badge ${badgeId}`,
      description: "A badge notification",
      category: "community",
      metric: "totalEngagement",
      tier: "bronze",
      threshold: 1,
      symbol: "*",
      earnedAt: "2026-07-14T00:00:00.000Z",
    },
    createdAt: "2026-07-14T00:00:00.000Z",
  };
}

function assertArrayEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

function loadBadgeStore() {
  return loadTranspiledModule("store/badgeNotificationStore.ts", {
    zustand: { create: createStore },
  }).useBadgeNotificationStore;
}

function testBadgeNotificationStore() {
  const useBadgeNotificationStore = loadBadgeStore();
  const resetStore = () =>
    useBadgeNotificationStore.getState().clearBadgeNotifications();

  resetStore();
  useBadgeNotificationStore.getState().enqueueNotifications(undefined);
  useBadgeNotificationStore.getState().enqueueNotifications(null);
  useBadgeNotificationStore.getState().enqueueNotifications([]);
  useBadgeNotificationStore.getState().enqueueNotifications([
    { notificationId: "malformed" },
  ]);
  assert.equal(useBadgeNotificationStore.getState().currentNotification, null);
  assertArrayEqual(
    useBadgeNotificationStore.getState().queuedNotifications,
    [],
  );

  resetStore();
  useBadgeNotificationStore
    .getState()
    .enqueueNotifications([createBadgeNotification("first")]);
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "first",
  );
  assertArrayEqual(
    useBadgeNotificationStore.getState().queuedNotifications,
    [],
  );
  assertArrayEqual(useBadgeNotificationStore.getState().knownNotificationIds, [
    "first",
  ]);
  assertArrayEqual(useBadgeNotificationStore.getState().knownBadgeIds, [
    "first",
  ]);

  resetStore();
  useBadgeNotificationStore.getState().enqueueNotifications([
    {
      notificationId: 42,
      user_id: "1",
      badge: {
        badge_id: "minimum-badge",
        name: "Minimum Badge",
        metric: "posts_created",
        tier: "gold",
      },
    },
  ]);
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "42",
  );
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.badge.badgeId,
    "minimum-badge",
  );
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.badge.metric,
    "postsCreated",
  );
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.badge.description,
    "You unlocked a new badge.",
  );
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.badge.symbol,
    "🏆",
  );

  resetStore();
  useBadgeNotificationStore.getState().enqueueNotifications([
    createBadgeNotification("first"),
    createBadgeNotification("second"),
    createBadgeNotification("third"),
  ]);
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "first",
  );
  assertArrayEqual(
    useBadgeNotificationStore
      .getState()
      .queuedNotifications.map((notification) => notification.notificationId),
    ["second", "third"],
  );

  useBadgeNotificationStore.getState().dismissCurrentNotification();
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "second",
  );
  assertArrayEqual(
    useBadgeNotificationStore
      .getState()
      .queuedNotifications.map((notification) => notification.notificationId),
    ["third"],
  );

  useBadgeNotificationStore.getState().dismissCurrentNotification();
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "third",
  );
  assertArrayEqual(
    useBadgeNotificationStore.getState().queuedNotifications,
    [],
  );

  useBadgeNotificationStore.getState().dismissCurrentNotification();
  assert.equal(useBadgeNotificationStore.getState().currentNotification, null);

  resetStore();
  useBadgeNotificationStore.getState().enqueueNotifications([
    createBadgeNotification("dupe"),
    createBadgeNotification("dupe"),
  ]);
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "dupe",
  );
  assertArrayEqual(
    useBadgeNotificationStore.getState().queuedNotifications,
    [],
  );

  resetStore();
  useBadgeNotificationStore.getState().enqueueNotifications([
    createBadgeNotification("socket", "same-badge"),
    createBadgeNotification("pending", "same-badge"),
  ]);
  assert.equal(
    useBadgeNotificationStore.getState().currentNotification.notificationId,
    "socket",
  );
  assertArrayEqual(
    useBadgeNotificationStore.getState().queuedNotifications,
    [],
  );

  useBadgeNotificationStore.getState().dismissCurrentNotification();
  useBadgeNotificationStore.getState().enqueueNotifications([
    createBadgeNotification("socket", "same-badge"),
    createBadgeNotification("pending", "same-badge"),
  ]);
  assert.equal(useBadgeNotificationStore.getState().currentNotification, null);
  assertArrayEqual(useBadgeNotificationStore.getState().knownNotificationIds, [
    "socket",
  ]);
  assertArrayEqual(useBadgeNotificationStore.getState().knownBadgeIds, [
    "same-badge",
  ]);

  resetStore();
  useBadgeNotificationStore
    .getState()
    .queueNotificationReadRetry(["read-1", "read-1", "read-2"]);
  assertArrayEqual(
    useBadgeNotificationStore.getState().readRetryNotificationIds,
    ["read-1", "read-2"],
  );
  assertArrayEqual(
    useBadgeNotificationStore.getState().consumeReadRetryNotificationIds(),
    ["read-1", "read-2"],
  );
  assertArrayEqual(
    useBadgeNotificationStore.getState().readRetryNotificationIds,
    [],
  );

  resetStore();
  useBadgeNotificationStore.getState().enqueueNotifications([
    createBadgeNotification("clear-current"),
    createBadgeNotification("clear-queued"),
  ]);
  useBadgeNotificationStore
    .getState()
    .queueNotificationReadRetry("clear-read");
  useBadgeNotificationStore.getState().clearBadgeNotifications();
  assert.equal(useBadgeNotificationStore.getState().currentNotification, null);
  assertArrayEqual(
    useBadgeNotificationStore.getState().queuedNotifications,
    [],
  );
  assertArrayEqual(useBadgeNotificationStore.getState().knownNotificationIds, []);
  assertArrayEqual(useBadgeNotificationStore.getState().knownBadgeIds, []);
  assertArrayEqual(
    useBadgeNotificationStore.getState().readRetryNotificationIds,
    [],
  );
}

async function testBadgeApi() {
  const apiCalls = [];
  const badgeApi = loadTranspiledModule("services/badgeApi.ts", {
    axios: {
      isAxiosError: () => false,
    },
    "@/utils/apiClient": {
      apiClient: {
        get: async (url) => {
          apiCalls.push(["get", url]);
          return {
            data: {
              notifications: [
                createBadgeNotification("pending-1"),
                {
                  notification_id: 987,
                  user_id: "1",
                  badge_id: "pending-snake",
                  name: "Pending Snake",
                  metric: "likes_received",
                  tier: "silver",
                  created_at: "2026-07-14T00:00:00.000Z",
                },
                { notificationId: "invalid" },
              ],
            },
          };
        },
        post: async (url, body) => {
          apiCalls.push(["post", url, body]);
          return {
            data: {
              notificationIds: ["pending-1", 2, ""],
            },
          };
        },
      },
    },
  });

  const pending = await badgeApi.getPendingBadgeNotifications();

  assert.equal(pending.length, 2);
  assert.equal(pending[0].notificationId, "pending-1");
  assert.equal(pending[1].notificationId, "987");
  assert.equal(pending[1].badge.metric, "likesReceived");
  assert.equal(pending[1].badge.description, "You unlocked a new badge.");
  assert.equal(pending[1].badge.symbol, "🏆");
  assertArrayEqual(apiCalls[0], ["get", "/api/badges/notifications/pending"]);

  const readIds = await badgeApi.markBadgeNotificationsRead([
    " pending-1 ",
    "",
  ]);

  assertArrayEqual(readIds, ["pending-1", "2"]);
  assertArrayEqual(apiCalls[1], [
    "post",
    "/api/badges/notifications/read",
    { notificationIds: ["pending-1"] },
  ]);
}

function testNotificationSocketSingleton() {
  const sockets = [];
  const notificationSocket = loadTranspiledModule(
    "services/notificationSocket.ts",
    {
      "socket.io-client": {
        io: (url, options) => {
          const socket = {
            url,
            options,
            connected: false,
            connectCalls: 0,
            disconnectCalls: 0,
            io: {
              on() {},
              off() {},
            },
            connect() {
              this.connected = true;
              this.connectCalls += 1;
            },
            disconnect() {
              this.connected = false;
              this.disconnectCalls += 1;
            },
            on() {},
            off() {},
          };

          sockets.push(socket);
          return socket;
        },
      },
    },
    {
      process: {
        env: {
          EXPO_PUBLIC_SOCKET_URL: "http://localhost:4011/api/",
          EXPO_PUBLIC_API_URL: "http://ignored.local",
        },
      },
    },
  );

  assert.equal(notificationSocket.getNotificationSocket(null), null);
  assert.equal(sockets.length, 0);

  const firstSocket = notificationSocket.getNotificationSocket("token-a");

  assert.equal(firstSocket.url, "http://localhost:4011/notifications");
  assert.equal(firstSocket.options.auth.token, "token-a");
  assert.equal(firstSocket.options.reconnection, true);
  assertArrayEqual(firstSocket.options.transports, ["websocket", "polling"]);
  assert.equal(sockets.length, 1);

  firstSocket.connected = false;

  const reusedSocket = notificationSocket.getNotificationSocket("token-a");

  assert.equal(reusedSocket, firstSocket);
  assert.equal(firstSocket.connectCalls, 1);
  assert.equal(sockets.length, 1);

  const secondSocket = notificationSocket.getNotificationSocket("token-b");

  assert.notEqual(secondSocket, firstSocket);
  assert.equal(firstSocket.disconnectCalls, 1);
  assert.equal(secondSocket.options.auth.token, "token-b");
  assert.equal(sockets.length, 2);

  notificationSocket.disconnectNotificationSocket();
  assert.equal(secondSocket.disconnectCalls, 1);

  const thirdSocket = notificationSocket.getNotificationSocket("token-b");

  assert.notEqual(thirdSocket, secondSocket);
  assert.equal(sockets.length, 3);

  notificationSocket.disconnectNotificationSocket("stale-token");
  assert.equal(thirdSocket.disconnectCalls, 0);

  notificationSocket.disconnectNotificationSocket("token-b");
  assert.equal(thirdSocket.disconnectCalls, 1);
}

async function testRealtimeHelpers() {
  const store = loadBadgeStore();
  const realtime = loadTranspiledModule("hooks/useBadgeRealtimeNotifications.ts", {
    react: {
      useEffect() {},
      useRef: (initialValue) => ({ current: initialValue }),
    },
    "react-native": {
      AppState: {
        currentState: "active",
        addEventListener: () => ({ remove() {} }),
      },
    },
    "@/services/badgeApi": {
      getPendingBadgeNotifications: async () => [
        createBadgeNotification("pending-1"),
      ],
      markBadgeNotificationsRead: async (ids) => ids,
    },
    "@/services/notificationSocket": {
      disconnectNotificationSocket() {},
      getNotificationSocket: () => null,
    },
    "@/store/badgeNotificationStore": {
      useBadgeNotificationStore: store,
    },
  });

  const enqueued = [];
  const accepted = realtime.handleBadgeEarnedSocketPayload(
    {
      recipientUserId: 1,
      notifications: [createBadgeNotification("socket-1")],
      emittedAt: "2026-07-14T00:00:00.000Z",
    },
    1,
    (notifications) => enqueued.push(...notifications),
  );

  assert.equal(accepted, true);
  assertArrayEqual(
    enqueued.map((notification) => notification.notificationId),
    ["socket-1"],
  );

  const acceptedStringUserId = realtime.handleBadgeEarnedSocketPayload(
    {
      recipientUserId: "1",
      notifications: [createBadgeNotification("socket-string-user")],
      emittedAt: "2026-07-14T00:00:00.000Z",
    },
    1,
    (notifications) => enqueued.push(...notifications),
  );

  assert.equal(acceptedStringUserId, true);
  assertArrayEqual(
    enqueued.map((notification) => notification.notificationId),
    ["socket-1", "socket-string-user"],
  );

  const ignored = realtime.handleBadgeEarnedSocketPayload(
    {
      recipientUserId: 2,
      notifications: [createBadgeNotification("socket-2")],
      emittedAt: "2026-07-14T00:00:00.000Z",
    },
    1,
    (notifications) => enqueued.push(...notifications),
  );

  assert.equal(ignored, false);
  assertArrayEqual(
    enqueued.map((notification) => notification.notificationId),
    ["socket-1", "socket-string-user"],
  );

  const pendingLoads = [];
  await realtime.loadPendingBadgeNotifications(
    (notifications) => pendingLoads.push(...notifications),
    async () => [createBadgeNotification("connect-pending")],
  );
  await realtime.loadPendingBadgeNotifications(
    (notifications) => pendingLoads.push(...notifications),
    async () => [createBadgeNotification("reconnect-pending")],
  );
  assertArrayEqual(
    pendingLoads.map((notification) => notification.notificationId),
    ["connect-pending", "reconnect-pending"],
  );

  const retryQueue = [];
  const acknowledgedIds = await realtime.retryBadgeNotificationReadAcks({
    consumeReadRetryNotificationIds: () => ["read-1", "read-2"],
    queueNotificationReadRetry: (ids) => retryQueue.push(ids),
    markRead: async () => ["read-1"],
  });

  assertArrayEqual(acknowledgedIds, ["read-1"]);
  assertArrayEqual(retryQueue, [["read-2"]]);

  const failedRetryQueue = [];
  const failedAcknowledgedIds = await realtime.retryBadgeNotificationReadAcks({
    consumeReadRetryNotificationIds: () => ["read-3"],
    queueNotificationReadRetry: (ids) => failedRetryQueue.push(ids),
    markRead: async () => {
      throw new Error("network");
    },
  });

  assertArrayEqual(failedAcknowledgedIds, []);
  assertArrayEqual(failedRetryQueue, [["read-3"]]);
}

function testBadgeAwardResponsesOnlyRefresh() {
  let refreshCount = 0;
  const badgeNotifications = loadTranspiledModule("hooks/useBadgeNotifications.ts", {
    react: {
      useCallback: (callback) => callback,
    },
    "@/store/badgeNotificationStore": {
      useBadgeNotificationStore: (selector) =>
        selector({
          requestBadgeRefresh: () => {
            refreshCount += 1;
          },
        }),
    },
  });

  const { handleBadgeAwards, requestBadgeDataRefresh } =
    badgeNotifications.useBadgeNotifications();

  handleBadgeAwards([
    {
      badgeId: "legacy-http-award",
      name: "Legacy HTTP Award",
      tier: "bronze",
      earnedAt: "2026-07-14T00:00:00.000Z",
    },
  ]);
  handleBadgeAwards([]);
  requestBadgeDataRefresh();

  assert.equal(refreshCount, 2);
}

(async () => {
  testBadgeNotificationStore();
  await testBadgeApi();
  testNotificationSocketSingleton();
  await testRealtimeHelpers();
  testBadgeAwardResponsesOnlyRefresh();

  console.log("Badge notification tests passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
