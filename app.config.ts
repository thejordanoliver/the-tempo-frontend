import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "the-tempo",
  slug: config.slug ?? "the-tempo",
  plugins: [
    ...(config.plugins ?? []),
    // The SDK autolinks without upload build phases. Add those phases only
    // when reporting and source-map credentials have both been configured.
    ...(process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() &&
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT
      ? [
          [
            "@sentry/react-native/expo",
            {
              organization: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
            },
          ] as [string, { organization: string; project: string }],
        ]
      : []),
  ],
});
