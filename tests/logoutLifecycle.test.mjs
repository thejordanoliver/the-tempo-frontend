import assert from "node:assert/strict";
import test from "node:test";
import { CanceledError } from "axios";
import { authSessionHarness } from "./helpers/authSessionHarness.mjs";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function setup() {
  const auth = authSessionHarness();
  const revocation = deferred();
  const calls = [];
  const hook = sportsHookHarness();
  Object.assign(hook.modules, {
    "utils/apiClient": auth.api,
    "utils/auth/authSessionLifecycle": auth.lifecycle,
    "@react-native-async-storage/async-storage": auth.asyncStorage,
    axios: {
      CanceledError,
      post: (...args) => {
        calls.push(args);
        return revocation.promise;
      },
    },
    "hooks/useScopedRouter": { useScopedRouter: () => ({ replace() {} }) },
    "services/notificationSocket": { disconnectNotificationSocket() {} },
    "store/badgeNotificationStore": {
      useBadgeNotificationStore: {
        getState: () => ({ clearBadgeNotifications() {} }),
      },
    },
    "store/useLikesStore": {
      useLikesStore: { getState: () => ({ setUser() {} }) },
    },
  });
  hook.start(hook.load("hooks/UserHooks/useAuth.ts").useAuth);
  return { auth, hook, revocation, calls };
}

test("logout clears credentials and resolves while server revocation is still stalled", async () => {
  const { auth, hook, revocation, calls } = setup();
  try {
    await flush();
    assert.equal(hook.state.user.id, 7);
    await hook.state.logout();
    await flush();
    assert.equal(hook.state.user, null);
    assert.equal(hook.state.token, null);
    assert.equal(auth.storage.has("userId"), false);
    assert.deepEqual(auth.tokens, { access: null, refresh: null });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1].refreshToken, "refresh-A");
    assert.equal(calls[0][2].timeout, 15_000);
    assert.equal(calls[0][2].headers, undefined);
    await auth.switchAccount();
    revocation.reject(new Error("offline"));
    await flush();
    assert.equal(hook.state.user.id, 9);
    assert.equal(hook.state.token, "access-B");
    assert.equal(auth.tokens.access, "access-B");
    assert.deepEqual(auth.redirects, []);
  } finally {
    hook.stop();
  }
});
