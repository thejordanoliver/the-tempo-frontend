import assert from "node:assert/strict";
import test from "node:test";
import { authSessionHarness } from "./helpers/authSessionHarness.mjs";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function setup(options = {}) {
  const requests = [];
  const auth = authSessionHarness({
    ...options,
    transport(config) {
      const response = deferred();
      requests.push({ config, ...response });
      return response.promise.then((data) => ({
        data,
        status: 200,
        headers: {},
        config,
      }));
    },
  });
  const hook = sportsHookHarness();
  Object.assign(hook.modules, {
    "utils/apiClient": auth.api,
    "utils/auth/authSessionLifecycle": auth.lifecycle,
    "@react-native-async-storage/async-storage": auth.asyncStorage,
  });
  hook.start(hook.load("hooks/UserHooks/useProfile.ts").useProfile);
  return { hook, auth, requests };
}

const profileA = {
  id: 7,
  username: "new-account-A-name",
  fullName: "A",
  followersCount: 12,
};

test("late profile hydration cannot overwrite the next account's identity or presentation", async () => {
  const { hook, auth, requests } = setup();
  try {
    const pending = hook.state.loadProfile();
    await flush();
    await auth.switchAccount();
    assert.equal(requests[0].config.signal.aborted, true);
    requests[0].resolve(profileA);
    assert.equal(await pending, null);
    await flush();
    assert.equal(auth.storage.get("userId"), "9");
    assert.equal(auth.storage.get("username"), "account-B");
    assert.equal(auth.storage.has("authUser"), false);
    assert.equal(hook.state.currentUserId, null);
    assert.equal(hook.state.username, null);
  } finally {
    hook.stop();
  }
});

for (const action of ["reset", "unmount"]) {
  test(`${action} aborts a profile request and prevents later cache writes`, async () => {
    const { hook, auth, requests } = setup();
    const pending = hook.state.loadProfile();
    await flush();
    if (action === "reset") hook.state.resetProfile();
    else hook.stop();
    assert.equal(requests[0].config.signal.aborted, true);
    requests[0].resolve(profileA);
    assert.equal(await pending, null);
    assert.equal(auth.storage.get("username"), "account-A");
    hook.stop();
  });
}

test("a new profile load wins over an older response", async () => {
  const { hook, auth, requests } = setup();
  try {
    const old = hook.state.loadProfile();
    await flush();
    const fresh = hook.state.loadProfile();
    await flush();
    requests[1].resolve({ ...profileA, username: "latest-A" });
    assert.equal(await fresh, 7);
    requests[0].resolve(profileA);
    assert.equal(await old, null);
    await flush();
    assert.equal(hook.state.username, "latest-A");
    assert.equal(hook.state.followersCount, 12);
    assert.equal(auth.storage.get("username"), "latest-A");
  } finally {
    hook.stop();
  }
});

test("sign-in finishes after an older profile write already in native storage", async () => {
  const write = deferred();
  let writingProfile = false;
  const { hook, auth, requests } = setup({
    beforeWrite: (entries) => {
      if (
        entries.some(
          ([key, value]) => key === "username" && value === profileA.username,
        )
      ) {
        writingProfile = true;
        return write.promise;
      }
    },
  });
  try {
    const pending = hook.state.loadProfile();
    await flush();
    requests[0].resolve(profileA);
    await flush();
    assert.equal(writingProfile, true);
    const signIn = auth.switchAccount();
    await flush();
    write.resolve();
    assert.equal(await pending, null);
    await signIn;
    assert.equal(auth.storage.get("userId"), "9");
    assert.equal(auth.storage.get("username"), "account-B");
    assert.equal(auth.storage.has("authUser"), false);
    assert.equal(auth.tokens.access, "access-B");
  } finally {
    hook.stop();
  }
});

test("profile hydration rejects mismatched identity and keeps the cached account", async () => {
  const { hook, auth, requests } = setup();
  try {
    const pending = hook.state.loadProfile();
    await flush();
    requests[0].resolve({ ...profileA, id: 9 });
    assert.equal(await pending, 7);
    assert.equal(auth.storage.get("userId"), "7");
    assert.equal(auth.storage.get("username"), "account-A");
  } finally {
    hook.stop();
  }
});

test("a pending edit-profile cache read cannot write into a new session", async () => {
  const cacheRead = deferred();
  const { hook, auth, requests } = setup();
  hook.stop();
  const editor = sportsHookHarness();
  let readingCache = false;
  auth.asyncStorage.getItem = async () => {
    readingCache = true;
    return cacheRead.promise;
  };
  const axios = await import("axios");
  Object.assign(editor.modules, {
    "utils/apiClient": auth.api,
    "utils/auth/authSessionLifecycle": auth.lifecycle,
    "@react-native-async-storage/async-storage": auth.asyncStorage,
    axios: {
      isAxiosError: axios.isAxiosError,
      CanceledError: axios.CanceledError,
    },
    "utils/profile/userProfileCache": {
      removeCachedUserProfile: async () => {},
    },
  });
  editor.start(editor.load("hooks/UserHooks/useEditProfile.ts").useEditProfile);
  try {
    const pending = assert.rejects(
      editor.state.saveProfile(new FormData()),
      /Authentication session changed/,
    );
    await flush();
    requests[0].resolve({
      user: { id: 7, username: "edited-A", fullName: "A", bio: "" },
    });
    await flush();
    assert.equal(readingCache, true);
    const signIn = auth.switchAccount();
    cacheRead.resolve(null);
    await pending;
    await signIn;
    assert.equal(auth.storage.get("userId"), "9");
    assert.equal(auth.storage.get("username"), "account-B");
    assert.equal(auth.storage.has("authUser"), false);
  } finally {
    editor.stop();
  }
});
