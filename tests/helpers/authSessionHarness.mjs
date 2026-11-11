import fs from "node:fs";
import vm from "node:vm";
import axios, { AxiosError, create } from "axios";
import ts from "typescript";

export function authSessionHarness(options = {}) {
  let access = "access-A";
  let refresh = "refresh-A";
  let clears = 0;
  const redirects = [];
  const requests = [];
  const refreshes = [];
  const storage = new Map([
    ["userId", "7"],
    ["username", "account-A"],
  ]);
  const asyncStorage = {
    getItem: async (key) => storage.get(key) ?? null,
    multiGet: async (keys) =>
      keys.map((key) => [key, storage.get(key) ?? null]),
    getAllKeys: async () => [...storage.keys()],
    multiRemove: async (keys) => {
      keys.forEach((key) => storage.delete(key));
    },
    multiSet: async (entries) => {
      await options.beforeWrite?.(entries);
      entries.forEach(([key, value]) => storage.set(key, value));
    },
  };
  const modules = {
    axios: {
      ...axios,
      create: (config) =>
        create({
          ...config,
          adapter: async (request) => {
            requests.push(request);
            if (options.transport) return options.transport(request);
            if (!request._retry) throw httpError(request, 401);
            return {
              data: {},
              status: 200,
              statusText: "OK",
              headers: {},
              config: request,
            };
          },
        }),
      post: async (...args) => {
        refreshes.push(args);
        return (
          options.post?.(...args) ?? {
            data: {
              accessToken: "rotated-access-A",
              refreshToken: "rotated-refresh-A",
            },
          }
        );
      },
    },
    "@react-native-async-storage/async-storage": asyncStorage,
    "utils/auth/secureAuthStorage": {
      getSecureAccessToken: async () => {
        const token = access;
        await options.beforeReadAccess?.();
        return token;
      },
      getSecureRefreshToken: async () => refresh,
      saveSecureTokens: async (a, r) => {
        access = a;
        refresh = r;
      },
      clearSecureTokens: async () => {
        clears++;
        access = refresh = null;
      },
    },
    "utils/apiConfig": { API_BASE_URL: "https://api.example.test" },
    "utils/profile/userProfileCache": {
      USER_PROFILE_CACHE_KEY_PREFIX: "profile:",
    },
    "expo-router": { router: { replace: (route) => redirects.push(route) } },
  };
  function load(path) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      URL,
      AbortController,
      console: { warn() {} },
      require(name) {
        if (!(name in modules)) modules[name] = load(`${name}.ts`);
        return modules[name];
      },
    });
    return exports;
  }
  const api = load("utils/apiClient.ts");
  modules["utils/apiClient"] = api;
  return {
    api,
    lifecycle: modules["utils/auth/authSessionLifecycle"],
    asyncStorage,
    storage,
    requests,
    refreshes,
    redirects,
    get clears() {
      return clears;
    },
    get tokens() {
      return { access, refresh };
    },
    setStoredTokens(a, r) {
      access = a;
      refresh = r;
    },
    switchAccount: () =>
      api.startAuthSession("access-B", "refresh-B", [
        ["userId", "9"],
        ["username", "account-B"],
      ]),
  };
}

export function httpError(config, status, data = {}) {
  return new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, {
    config,
    status,
    data,
    headers: {},
    statusText: "Error",
  });
}
