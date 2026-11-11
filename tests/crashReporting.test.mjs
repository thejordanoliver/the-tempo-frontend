import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load({ dsn, development = false, environment } = {}) {
  const calls = { init: [], capture: [] };
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync("utils/observability/crashReporting.ts", "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    URL,
    __DEV__: development,
    process: {
      env: {
        EXPO_PUBLIC_SENTRY_DSN: dsn,
        EXPO_PUBLIC_SENTRY_ENVIRONMENT: environment,
      },
    },
    require: (name) => {
      assert.equal(name, "@sentry/react-native");
      return {
        init: (options) => calls.init.push(options),
        captureException: (error) => calls.capture.push(error),
      };
    },
  });
  return { ...exports, calls };
}

test("crash reporting stays off without a valid DSN and during development", () => {
  for (const options of [
    {},
    { dsn: "invalid" },
    { dsn: "http://key@errors.example/1" },
    { dsn: "https://key@errors.example/1", development: true },
  ]) {
    const reporting = load(options);
    reporting.initializeCrashReporting();
    reporting.reportCrash(new Error("private error text"));
    assert.equal(reporting.calls.init.length, 0);
    assert.equal(reporting.calls.capture.length, 0);
  }
});

test("configured release reporting initializes once with personal data and replay disabled", () => {
  const reporting = load({ dsn: "https://key@errors.example/1" });
  reporting.initializeCrashReporting();
  reporting.initializeCrashReporting();
  assert.equal(reporting.calls.init.length, 1);
  const options = reporting.calls.init[0];
  assert.equal(options.environment, "production");
  for (const key of [
    "sendDefaultPii",
    "enableAutoSessionTracking",
    "enableAutoPerformanceTracing",
    "enableLogs",
  ])
    assert.equal(options[key], false);
  assert.equal(options.maxBreadcrumbs, 0);
  assert.deepEqual(
    Array.from(
      options.integrations([
        { name: "Breadcrumbs" },
        { name: "ReactNativeErrorHandlers" },
      ]),
      (item) => item.name,
    ),
    ["ReactNativeErrorHandlers"],
  );
  for (const key of [
    "tracesSampleRate",
    "replaysSessionSampleRate",
    "replaysOnErrorSampleRate",
  ])
    assert.equal(options[key], 0);
  assert.equal(options.beforeBreadcrumb({ message: "private" }), null);
  const error = new Error("test crash");
  reporting.reportCrash(error);
  assert.equal(reporting.calls.capture[0], error);
});

test("verification and preview builds keep errors in their configured environment", () => {
  for (const environment of ["setup-verification", "preview"]) {
    const reporting = load({
      dsn: "https://key@errors.example/1",
      environment,
    });
    reporting.initializeCrashReporting();
    assert.equal(reporting.calls.init[0].environment, environment);
  }
});

test("JavaScript crash events retain useful stack locations without account or request contents", () => {
  const reporting = load();
  const event = reporting.scrubCrashEvent({
    type: "error",
    event_id: "event-1",
    release: "tempo@1.0.0",
    user: { email: "private@example.com" },
    request: {
      headers: { Authorization: "secret" },
      url: "https://api.example/private",
    },
    extra: { password: "secret" },
    breadcrumbs: [{ message: "private" }],
    message: "private@example.com",
    tags: { account: "private" },
    exception: {
      values: [
        {
          type: "TypeError",
          value: "private@example.com",
          stacktrace: {
            frames: [
              {
                filename: "https://app.example/bundle.js?token=secret#private",
                lineno: 42,
                colno: 3,
                function: "render",
                vars: { password: "secret" },
              },
            ],
          },
        },
      ],
    },
  });
  assert.equal(event.event_id, "event-1");
  assert.equal(event.exception.values[0].value, "TypeError");
  assert.equal(
    event.exception.values[0].stacktrace.frames[0].filename,
    "https://app.example/bundle.js",
  );
  assert.equal(event.exception.values[0].stacktrace.frames[0].lineno, 42);
  assert.doesNotMatch(
    JSON.stringify(event),
    /private|secret|password|Authorization/,
  );
});

test("native upload build phases are opt-in and never embed the auth token", () => {
  const code = ts.transpileModule(fs.readFileSync("app.config.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const configFor = (env) => {
    const exports = {};
    vm.runInNewContext(code, { exports, process: { env } });
    return exports.default({
      config: { name: "Tempo", slug: "tempo", plugins: ["expo-router"] },
    });
  };
  assert.equal(configFor({}).plugins.length, 1);
  assert.equal(
    configFor({ EXPO_PUBLIC_SENTRY_DSN: "https://key@errors.example/1" })
      .plugins.length,
    1,
  );
  const config = configFor({
    EXPO_PUBLIC_SENTRY_DSN: "https://key@errors.example/1",
    SENTRY_ORG: "tempo",
    SENTRY_PROJECT: "mobile",
    SENTRY_AUTH_TOKEN: "private-build-token",
  });
  assert.equal(config.plugins.length, 2);
  assert.equal(config.plugins[1][0], "@sentry/react-native/expo");
  assert.doesNotMatch(JSON.stringify(config), /private-build-token|authToken/);
});
