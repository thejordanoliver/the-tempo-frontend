import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function setup({ refreshToken = "refresh", post } = {}) {
  let requestInterceptor, rejectResponse;
  let access = "access", refresh = refreshToken, clears = 0, redirects = 0;
  const client = async (config) => ({ config });
  client.defaults = { headers: { common: {} } };
  client.interceptors = {
    request: { use(fn) { requestInterceptor = fn; } },
    response: { use(_success, failure) { rejectResponse = failure; } },
  };
  const modules = {
    axios: { create: () => client, post, isAxiosError: (err) => err?.isAxiosError === true },
    "@react-native-async-storage/async-storage": { getAllKeys: async () => [], multiRemove: async () => {} },
    "utils/secureAuthStorage": {
      getSecureAccessToken: async () => access, getSecureRefreshToken: async () => refresh,
      saveSecureTokens: async (a, r) => { access = a; refresh = r; },
      clearSecureTokens: async () => { clears++; access = refresh = null; },
    },
    "expo-router": { router: { replace() { redirects++; } } },
    "utils/apiConfig": { API_BASE_URL: "https://api.example.test" },
    "utils/authSessionRace": { isRefreshResponseForCurrentSession: (a, b) => a === b },
    "utils/userProfileCache": { USER_PROFILE_CACHE_KEY_PREFIX: "profile:" },
  };
  const source = ts.transpileModule(fs.readFileSync("utils/apiClient.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports: {}, require: (name) => modules[name], URL, console });
  return {
    fail: (status = 401, data = {}) => rejectResponse({
      config: { url: "/api/users/7", headers: {} }, response: { status, data },
    }),
    setSession: (a, r) => { access = a; refresh = r; },
    counts: () => ({ clears, redirects }), request: (config) => requestInterceptor(config),
  };
}

test("permission errors do not refresh or clear the session", async () => {
  let calls = 0;
  const state = setup({ post: async () => { calls++; } });
  await assert.rejects(state.fail(403, { error: "Interaction blocked" }));
  assert.equal(calls, 0);
  assert.deepEqual(state.counts(), { clears: 0, redirects: 0 });
});

test("missing refresh credentials settle every concurrent request", async () => {
  const state = setup({ refreshToken: null });
  const results = await Promise.allSettled([state.fail(), state.fail()]);
  assert.ok(results.every((result) => result.status === "rejected"));
  assert.deepEqual(state.counts(), { clears: 1, redirects: 1 });
});

test("a failed stale refresh preserves and retries with the newer session", async () => {
  let rejectRefresh;
  const state = setup({ post: () => new Promise((_resolve, reject) => { rejectRefresh = reject; }) });
  const first = state.fail();
  const second = state.fail();
  while (!rejectRefresh) await Promise.resolve();
  state.setSession("new-access", "new-refresh");
  rejectRefresh({ isAxiosError: true, response: { status: 401 } });
  const results = await Promise.all([first, second]);
  assert.ok(results.every((result) =>
    result.config.headers.Authorization === "Bearer new-access" && result.config._retry));
  assert.deepEqual(state.counts(), { clears: 0, redirects: 0 });
});

test("requests remove inherited credentials when no session exists", async () => {
  const state = setup();
  state.setSession(null, null);
  const result = await state.request({ headers: { Authorization: "Bearer stale" } });
  assert.equal(result.headers.Authorization, undefined);
});
