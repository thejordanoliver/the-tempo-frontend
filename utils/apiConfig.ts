const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!rawApiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured. Set it in .env and restart Expo.",
  );
}

let parsedApiUrl: URL;

try {
  parsedApiUrl = new URL(rawApiUrl);
} catch {
  throw new Error("EXPO_PUBLIC_API_URL must be a valid absolute http(s) URL.");
}

if (parsedApiUrl.protocol !== "http:" && parsedApiUrl.protocol !== "https:") {
  throw new Error("EXPO_PUBLIC_API_URL must use http:// or https://.");
}

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");
export const SOCKET_ORIGIN = parsedApiUrl.origin;

const isDevelopment = typeof __DEV__ !== "undefined" && __DEV__;

export const getSocketNamespaceUrl = (namespace: string) => {
  const normalizedNamespace = namespace
    ? `/${namespace.replace(/^\/+|\/+$/g, "")}`
    : "";

  return `${SOCKET_ORIGIN}${normalizedNamespace}`;
};

export const logSocketConfig = (socketName: string, namespace: string) => {
  if (!isDevelopment) return;

  console.log("[Socket Config]", {
    socketName,
    resolvedOrigin: SOCKET_ORIGIN,
    namespace: namespace || "/",
    fullConnectionUrl: getSocketNamespaceUrl(namespace),
  });
};
