import * as Sentry from "@sentry/react-native";

export function isCrashReportingConfigured(
  dsn: string | undefined,
  development: boolean,
) {
  if (development || !dsn?.trim()) return false;
  try {
    const url = new URL(dsn);
    return (
      url.protocol === "https:" &&
      Boolean(url.username && url.hostname && url.pathname !== "/")
    );
  } catch {
    return false;
  }
}

// Retain the exception type and stack needed to locate a crash. Request details,
// console/network breadcrumbs, arbitrary messages and account data are excluded.
export const scrubCrashEvent: NonNullable<
  Sentry.ReactNativeOptions["beforeSend"]
> = (event) => ({
  type: event.type,
  event_id: event.event_id,
  timestamp: event.timestamp,
  platform: event.platform,
  level: event.level,
  release: event.release,
  dist: event.dist,
  environment: event.environment,
  sdk: event.sdk,
  debug_meta: event.debug_meta,
  exception: event.exception
    ? {
        values: event.exception.values?.map((exception) => ({
          type: exception.type,
          value: exception.type ?? "Application error",
          mechanism: exception.mechanism
            ? {
                type: exception.mechanism.type,
                handled: exception.mechanism.handled,
              }
            : undefined,
          stacktrace: exception.stacktrace
            ? {
                frames: exception.stacktrace.frames?.map((frame) => ({
                  filename: frame.filename?.split(/[?#]/, 1)[0],
                  function: frame.function,
                  module: frame.module,
                  lineno: frame.lineno,
                  colno: frame.colno,
                  in_app: frame.in_app,
                })),
              }
            : undefined,
        })),
      }
    : undefined,
});

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const enabled = isCrashReportingConfigured(
  dsn,
  typeof __DEV__ !== "undefined" && __DEV__,
);
let initialized = false;

export function initializeCrashReporting() {
  if (!enabled || initialized) return;
  Sentry.init({
    dsn,
    enabled: true,
    environment:
      process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT?.trim() || "production",
    sendDefaultPii: false,
    enableAutoSessionTracking: false,
    enableAutoPerformanceTracing: false,
    maxBreadcrumbs: 0,
    integrations: (defaults) =>
      defaults.filter((integration) => integration.name !== "Breadcrumbs"),
    enableLogs: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeBreadcrumb: () => null,
    beforeSend: scrubCrashEvent,
  });
  initialized = true;
}

export function reportCrash(error: Error) {
  if (initialized) Sentry.captureException(error);
}
