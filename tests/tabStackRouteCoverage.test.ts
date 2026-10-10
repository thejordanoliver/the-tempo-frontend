import assert from "node:assert/strict";
import type { Href } from "expo-router";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  getTabGroup,
  scopeHrefToTab,
} from "../utils/tabStackNavigation";

const root = process.cwd();

const routeExists = (routePath: string) =>
  existsSync(path.join(root, routePath));

const expectRoutes = (label: string, routePaths: string[]) => {
  test(label, () => {
    const missing = routePaths.filter((routePath) => !routeExists(routePath));

    assert.deepEqual(
      missing,
      [],
      `Missing tab-stack routes:\n${missing.join("\n")}`,
    );
  });
};

const sharedAuthenticatedRoutes = [
  "badges.tsx",
  "fan-prediction-rankings.tsx",
  "create-post.tsx",
  "edit-favorites.tsx",
  "edit-profile.tsx",
  "followers.tsx",
  "messages/index.tsx",
  "messages/[id].tsx",
  "news/[id].tsx",
  "notification-center.tsx",
  "post/[postId].tsx",
  "recruit/[id].tsx",
  "season-leaders/[league].tsx",
  "settings/index.tsx",
  "settings/accountdetails.tsx",
  "settings/blocked-users.tsx",
  "settings/deleteaccountsplash.tsx",
  "settings/preferences.tsx",
].map(
  (routePath) =>
    `app/(tabs)/(home,league,explore,profile)/${routePath}`,
);

expectRoutes(
  "all four tab stacks expose shared authenticated screens",
  sharedAuthenticatedRoutes,
);

expectRoutes("Home exposes every reusable detail-screen family", [
  "app/(tabs)/(home)/league/[sport].tsx",
  "app/(tabs)/(home)/game/baseball/[game].tsx",
  "app/(tabs)/(home)/game/basketball/[game].tsx",
  "app/(tabs)/(home)/game/football/[game].tsx",
  "app/(tabs)/(home)/game/hockey/[game].tsx",
  "app/(tabs)/(home)/game/mma/[game].tsx",
  "app/(tabs)/(home)/game/racing/[game].tsx",
  "app/(tabs)/(home)/game/soccer/[game].tsx",
  "app/(tabs)/(home)/game/tennis/[game].tsx",
  "app/(tabs)/(home)/player/baseball/[id].tsx",
  "app/(tabs)/(home)/player/basketball/[id].tsx",
  "app/(tabs)/(home)/player/football/[id].tsx",
  "app/(tabs)/(home)/player/hockey/[id].tsx",
  "app/(tabs)/(home)/player/mma/[id].tsx",
  "app/(tabs)/(home)/player/racing/[id].tsx",
  "app/(tabs)/(home)/player/soccer/[id].tsx",
  "app/(tabs)/(home)/team/[teamId].tsx",
  "app/(tabs)/(home)/team/cb/[teamId].tsx",
  "app/(tabs)/(home)/team/mcbb/[teamId].tsx",
  "app/(tabs)/(home)/team/cfb/[teamId].tsx",
  "app/(tabs)/(home)/team/gleague/[teamId].tsx",
  "app/(tabs)/(home)/team/mlb/[teamId].tsx",
  "app/(tabs)/(home)/team/nfl/[teamId].tsx",
  "app/(tabs)/(home)/team/nhl/[teamId].tsx",
  "app/(tabs)/(home)/team/sb/[teamId].tsx",
  "app/(tabs)/(home)/team/soccer/[teamId].tsx",
  "app/(tabs)/(home)/team/ufl/[teamId].tsx",
  "app/(tabs)/(home)/team/wcbb/[teamId].tsx",
  "app/(tabs)/(home)/team/wnba/[teamId].tsx",
  "app/(tabs)/(home,league)/user/[id].tsx",
]);

expectRoutes("Leagues exposes every reusable detail-screen family", [
  "app/(tabs)/(league)/league/[sport].tsx",
  "app/(tabs)/(league,explore,profile)/game/[sport]/[game].tsx",
  "app/(tabs)/(league,profile)/player/[sport]/[id].tsx",
  "app/(tabs)/(league)/team/[teamId].tsx",
  "app/(tabs)/(league)/team/[teamType]/[teamId].tsx",
  "app/(tabs)/(home,league)/user/[id].tsx",
]);

expectRoutes("Explore exposes every reusable detail-screen family", [
  "app/(tabs)/(explore)/league/[sport].tsx",
  "app/(tabs)/(league,explore,profile)/game/[sport]/[game].tsx",
  "app/(tabs)/(explore)/player/[sport]/[id].tsx",
  "app/(tabs)/(explore)/team/[teamId].tsx",
  "app/(tabs)/(explore)/team/[teamType]/[teamId].tsx",
  "app/(tabs)/(explore)/user/[id].tsx",
]);

expectRoutes("Profile exposes every reusable detail-screen family", [
  "app/(tabs)/(profile)/league/[sport].tsx",
  "app/(tabs)/(league,explore,profile)/game/[sport]/[game].tsx",
  "app/(tabs)/(league,profile)/player/[sport]/[id].tsx",
  "app/(tabs)/(profile)/team/[teamId].tsx",
  "app/(tabs)/(profile)/team/[teamType]/[teamId].tsx",
  "app/(tabs)/(profile)/user/[id].tsx",
]);

test("unqualified detail routes stay inside their active tab stack", () => {
  assert.equal(
    scopeHrefToTab("/team/nfl/12", "(league)"),
    "/(tabs)/(league)/team/nfl/12?league=nfl",
  );

  assert.deepEqual(
    scopeHrefToTab(
      {
        pathname: "/player/football/[id]",
        params: { id: "42", league: "nfl" },
      },
      "(profile)",
    ),
    {
      pathname: "/(tabs)/(profile)/player/football/[id]",
      params: { id: "42", league: "nfl" },
    },
  );
});

test("tab roots, auth routes, and qualified routes are not rewritten", () => {
  assert.equal(scopeHrefToTab("/profile", "(home)"), "/profile");
  assert.equal(scopeHrefToTab("/login", "(profile)"), "/login");
  assert.equal(
    scopeHrefToTab("/(tabs)/(explore)/game/football/1", "(home)"),
    "/(tabs)/(explore)/game/football/1",
  );
});

test("the active group is derived from route segments", () => {
  assert.equal(getTabGroup(["(tabs)", "(explore)", "player"]), "(explore)");
  assert.equal(getTabGroup(["login"]), null);
});

test("query strings, fragments, and trailing slashes preserve root routes", () => {
  for (const route of ["/profile?tab=posts", "/login?next=%2Fteam%2F12",
    "/explore#search", "/league/", "/settings/deleteaccountsplash"]) {
    assert.equal(scopeHrefToTab(route as Href, "(home)"), route);
  }
});

test("detail query strings and object params stay intact inside the active tab", () => {
  assert.equal(scopeHrefToTab("/team/nfl/12?season=2026#games", "(league)"),
    "/(tabs)/(league)/team/nfl/12?season=2026&league=nfl#games");
  assert.deepEqual(scopeHrefToTab({
    pathname: "/news/[id]", params: { id: "42", source: "feed" },
  }, "(explore)"), {
    pathname: "/(tabs)/(explore)/news/[id]", params: { id: "42", source: "feed" },
  });
});

test("external, relative, qualified, and unsupported paths remain unchanged", () => {
  for (const route of ["https://example.com/news", "//example.com/news",
    "../team/12", "/unknown-screen", "/(other)/news/12"]) {
    assert.equal(scopeHrefToTab(route as Href, "(home)"), route);
  }
  assert.equal(scopeHrefToTab("/team/nfl/12", null), "/team/nfl/12?league=nfl");
});
