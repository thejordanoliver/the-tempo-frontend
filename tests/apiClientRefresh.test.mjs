import assert from "node:assert/strict";
import test from "node:test";
import {
  authSessionHarness,
  httpError,
} from "./helpers/authSessionHarness.mjs";
import { deferred, flush } from "./helpers/sportsHookHarness.mjs";

const canceled = (error) => error?.code === "ERR_CANCELED";

test("permission errors do not refresh or clear the session", async () => {
  const h = authSessionHarness({
    transport: async (config) => {
      throw httpError(config, 403, { error: "Interaction blocked" });
    },
  });
  await assert.rejects(h.api.apiClient.get("/api/users/7"));
  assert.equal(h.refreshes.length, 0);
  assert.equal(h.clears, 0);
});

test("missing refresh credentials settle every concurrent request", async () => {
  const h = authSessionHarness();
  h.setStoredTokens("access-A", null);
  const results = await Promise.allSettled([
    h.api.apiClient.get("/api/users/7"),
    h.api.apiClient.get("/api/users/7"),
  ]);
  assert.ok(results.every((result) => result.status === "rejected"));
  assert.equal(h.clears, 1);
  assert.deepEqual(h.redirects, ["/login"]);
});

for (const outcome of ["success", "failure"]) {
  test(`a stale refresh ${outcome} cannot replay mutations or affect a new account`, async () => {
    const refresh = deferred();
    const h = authSessionHarness({ post: () => refresh.promise });
    const pending = Promise.allSettled([
      h.api.apiClient.patch("/api/users/me", { fullName: "account A change" }),
      h.api.apiClient.delete("/api/users/me", {
        data: { currentPassword: "mock" },
      }),
    ]);
    await flush();
    assert.equal(h.refreshes.length, 1);
    const signal = h.refreshes[0][2].signal;
    await h.switchAccount();
    assert.equal(signal.aborted, true);
    if (outcome === "success") {
      refresh.resolve({
        data: { accessToken: "old-A", refreshToken: "old-A-refresh" },
      });
    } else {
      refresh.reject({ isAxiosError: true, response: { status: 401 } });
    }
    const results = await pending;
    assert.ok(
      results.every(
        (result) => result.status === "rejected" && canceled(result.reason),
      ),
    );
    assert.equal(h.requests.length, 2);
    assert.deepEqual(h.tokens, { access: "access-B", refresh: "refresh-B" });
    assert.equal(h.storage.get("userId"), "9");
    assert.deepEqual(h.redirects, []);
  });

  test(`a stale refresh ${outcome} can reuse a password rotation within the same session`, async () => {
    const refresh = deferred();
    const h = authSessionHarness({ post: () => refresh.promise });
    const pending = h.api.apiClient.patch("/api/users/me", {
      bio: "same account",
    });
    await flush();
    await h.api.saveTokens("password-access-A", "password-refresh-A");
    if (outcome === "success") {
      refresh.resolve({
        data: { accessToken: "old-A", refreshToken: "old-A-refresh" },
      });
    } else {
      refresh.reject({ isAxiosError: true, response: { status: 401 } });
    }
    const response = await pending;
    assert.equal(
      response.config.headers.Authorization,
      "Bearer password-access-A",
    );
    assert.deepEqual(h.tokens, {
      access: "password-access-A",
      refresh: "password-refresh-A",
    });
    assert.equal(h.clears, 0);
  });
}

test("logout rejects late successes and late unauthorized responses without touching a new login", async () => {
  for (const status of [200, 401]) {
    const response = deferred();
    const h = authSessionHarness({
      transport: (config) =>
        response.promise.then(() => {
          if (status === 401) throw httpError(config, status);
          return {
            data: { id: 7 },
            status,
            statusText: "OK",
            headers: {},
            config,
          };
        }),
    });
    const pending = assert.rejects(
      h.api.apiClient.get("/api/users/7"),
      canceled,
    );
    await flush();
    await h.api.clearAuthSession();
    await h.switchAccount();
    response.resolve();
    await pending;
    assert.equal(h.refreshes.length, 0);
    assert.equal(h.tokens.access, "access-B");
    assert.deepEqual(h.redirects, []);
  }
});

test("a session change during token lookup cancels before dispatch", async () => {
  const read = deferred();
  const h = authSessionHarness({ beforeReadAccess: () => read.promise });
  const pending = assert.rejects(
    h.api.apiClient.get("/api/users/me"),
    canceled,
  );
  await flush();
  await h.switchAccount();
  read.resolve();
  await pending;
  assert.equal(h.requests.length, 0);
});

test("new-session requests do not wait on an obsolete refresh", async () => {
  const staleRefresh = deferred();
  let calls = 0;
  const h = authSessionHarness({
    post: () =>
      ++calls === 1
        ? staleRefresh.promise
        : {
            data: { accessToken: "new-B", refreshToken: "new-B-refresh" },
          },
  });
  const old = assert.rejects(h.api.apiClient.get("/api/users/7"), canceled);
  await flush();
  await h.switchAccount();
  const fresh = await h.api.apiClient.get("/api/users/9");
  assert.equal(fresh.config.headers.Authorization, "Bearer new-B");
  staleRefresh.reject({ isAxiosError: true, response: { status: 401 } });
  await old;
  assert.equal(h.tokens.access, "new-B");
});

test("requests have a finite default timeout and uploads can override it", async () => {
  const h = authSessionHarness({
    transport: async (config) => ({
      data: {},
      status: 200,
      headers: {},
      config,
    }),
  });
  const normal = await h.api.apiClient.get("/api/users/me");
  const upload = await h.api.apiClient.post(
    "/api/upload",
    {},
    { timeout: 60_000 },
  );
  assert.equal(normal.config.timeout, 15_000);
  assert.equal(upload.config.timeout, 60_000);
});

test("signed-out requests remove inherited credentials", async () => {
  const h = authSessionHarness({
    transport: async (config) => ({
      data: {},
      status: 200,
      headers: {},
      config,
    }),
  });
  await h.api.clearAuthSession();
  const response = await h.api.apiClient.get("/public", {
    headers: { Authorization: "Bearer stale" },
  });
  assert.equal(response.config.headers.Authorization, undefined);
});

test("transient refresh failures preserve the session and back off", async () => {
  const h = authSessionHarness({
    post: async () => {
      throw { isAxiosError: true, response: { status: 503 } };
    },
  });
  await assert.rejects(h.api.apiClient.get("/api/users/me"));
  await assert.rejects(h.api.apiClient.get("/api/users/me"));
  assert.equal(h.refreshes.length, 1);
  assert.equal(h.clears, 0);
  assert.equal(h.tokens.access, "access-A");
});

test("concurrent authentication failures share one refresh and each retry once", async () => {
  const refresh = deferred();
  const h = authSessionHarness({ post: () => refresh.promise });
  const pending = Promise.all([
    h.api.apiClient.get("/api/users/me"),
    h.api.apiClient.patch("/api/users/me", { bio: "same account" }),
  ]);
  await flush();
  assert.equal(h.refreshes.length, 1);
  refresh.resolve({
    data: { accessToken: "fresh-A", refreshToken: "fresh-refresh-A" },
  });
  const responses = await pending;
  assert.equal(h.requests.length, 4);
  assert.ok(
    responses.every(
      (response) => response.config.headers.Authorization === "Bearer fresh-A",
    ),
  );
  assert.equal(h.clears, 0);
});

test("public auth, optional analytics and invalid-password errors never refresh", async () => {
  const h = authSessionHarness({
    transport: async (config) => {
      throw httpError(config, 401, {
        error:
          config.url === "/api/users/me/password"
            ? "Invalid current password"
            : "Invalid password",
      });
    },
  });
  for (const path of [
    "/api/login",
    "/api/signup",
    "/api/forgot-password",
    "/api/reset-password",
    "/api/verify-reset-code",
    "/api/explore/search/events",
    "/api/users/me/password",
    "/api/users/me",
  ]) {
    await assert.rejects(h.api.apiClient.post(path));
  }
  assert.equal(h.refreshes.length, 0);
  assert.equal(h.clears, 0);
  assert.deepEqual(h.redirects, []);
});

test("a request queued immediately before switching accounts is never dispatched as the new user", async () => {
  const h = authSessionHarness();
  const pending = assert.rejects(
    h.api.apiClient.patch("/api/users/me", { bio: "old account" }),
    canceled,
  );
  await h.switchAccount();
  await pending;
  assert.equal(h.requests.length, 0);
  assert.equal(h.tokens.access, "access-B");
});
