import type { Href } from "expo-router";

export type TabGroup = "(home)" | "(league)" | "(explore)" | "(profile)";

const TAB_GROUPS = new Set<TabGroup>([
  "(home)",
  "(league)",
  "(explore)",
  "(profile)",
]);

const UNSCOPED_ROUTES = new Set([
  "/",
  "/league",
  "/explore",
  "/profile",
  "/login",
  "/forgot-password",
  "/signup/success",
]);

export function getTabGroup(segments: readonly string[]): TabGroup | null {
  for (const segment of segments) {
    if (TAB_GROUPS.has(segment as TabGroup)) {
      return segment as TabGroup;
    }
  }

  return null;
}

const TAB_ROUTE_FAMILIES = new Set([
  "badges", "create-post", "edit-favorites", "edit-profile", "followers",
  "game", "league", "messages", "news", "notification-center", "player",
  "post", "recruit", "season-leaders", "settings", "team", "user",
]);

function scopePathname(pathname: string, tabGroup: TabGroup | null) {
  // Match the path separately while retaining the original query and fragment.
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const family = path.split("/")[1];

  if (
    !tabGroup ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    path.startsWith("/(") ||
    UNSCOPED_ROUTES.has(path) ||
    path === "/settings/deleteaccountsplash" ||
    !TAB_ROUTE_FAMILIES.has(family)
  ) {
    return pathname;
  }

  return `/(tabs)/${tabGroup}${pathname}`;
}

export function scopeHrefToTab(href: Href, tabGroup: TabGroup | null): Href {
  if (typeof href === "string") {
    return scopePathname(href, tabGroup) as Href;
  }

  if (!("pathname" in href) || typeof href.pathname !== "string") {
    return href;
  }

  return {
    ...href,
    pathname: scopePathname(href.pathname, tabGroup),
  } as unknown as Href;
}
