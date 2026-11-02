import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function setup(error) {
  const logs = [];
  const exports = {};
  const modules = {
    "utils/apiClient": {
      apiClient: {
        get: async () => {
          throw error;
        },
      },
    },
    "utils/messages/messageTheme": {
      normalizeMessageThemePreference: () => null,
    },
  };
  const source = ts.transpileModule(
    fs.readFileSync("services/messagesApi.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
    __DEV__: true,
    console: { error: (...args) => logs.push(args) },
  });
  return { getConversations: exports.getConversations, logs };
}

test("conversation preloads propagate session expiration without a dev error", async () => {
  for (const response of [
    { status: 401, data: { error: "Access token required" } },
    { status: 403, data: { code: "ACCESS_TOKEN_INVALID" } },
    { status: 403, data: { error: "Invalid or expired token" } },
    { status: 403, data: { error: "Invalid or expired refresh token" } },
  ]) {
    const error = { response, message: "Session expired" };
    const { getConversations, logs } = setup(error);
    await assert.rejects(getConversations(), (received) => received === error);
    assert.equal(logs.length, 0);
  }
});

test("unexpected conversation failures remain visible and propagate unchanged", async () => {
  for (const response of [
    { status: 403, data: { error: "Interaction blocked" } },
    { status: 500, data: { error: "Internal server error" } },
    undefined,
  ]) {
    const error = { response, message: "Request failed" };
    const { getConversations, logs } = setup(error);
    await assert.rejects(getConversations(), (received) => received === error);
    assert.equal(logs.length, 1);
    assert.equal(logs[0][0], "Failed to fetch conversations");
    assert.equal(logs[0][1].status, response?.status);
    assert.equal(logs[0][1].data, response?.data);
  }
});
