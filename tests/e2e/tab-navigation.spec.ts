import { expect, test } from "@playwright/test";

test("Home preserves its stack across tab switches and returns to its root on reselect", async ({
  page,
}) => {
  // Synthetic session and API fixtures; no real account or backend is used.
  await page.addInitScript(() => {
    localStorage.setItem("accessToken", "tempo-e2e-token");
    localStorage.setItem("userId", "1");
    localStorage.setItem("username", "tempo-e2e");
  });
  await page.routeWebSocket(/.*/, (socket) => socket.close());
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === "http://127.0.0.1:4173") {
      await route.continue();
      return;
    }
    let body: unknown = {
      games: [],
      calendar: [],
      items: [],
      notifications: [],
      unreadCount: 0,
      favorites: [],
      favoriteTeams: [],
      favoriteSports: ["wcvb"],
      teams: [],
      conversations: [],
      groups: [],
      standings: [],
    };
    if (url.pathname === "/api/users/id/1") {
      body = { id: 1, username: "tempo-e2e" };
    }
    await route.fulfill({ json: body });
  });

  await page.goto("/");
  const homeTab = page.getByRole("tab", {
    name: "Go to Home tab",
    exact: true,
  });
  const profileTab = page.getByRole("tab", {
    name: "Go to Profile tab",
    exact: true,
  });
  await expect(homeTab).toBeVisible();
  const homeUrl = page.url();
  await page
    .getByRole("button", { name: "Open W. College Volleyball", exact: true })
    .click();
  await expect(page).toHaveURL(/\/league\/volleyball\?/);
  const leagueUrl = page.url();
  const standingsTab = page.getByRole("tab", {
    name: "Switch to standings tab",
    exact: true,
  });
  await standingsTab.click();
  const standings = page.getByText("No standings available", { exact: true });
  await expect(standings).toBeVisible();

  // Repeat to catch stack resets as well as loss of the league's local UI state.
  for (let visit = 0; visit < 2; visit += 1) {
    await profileTab.click();
    await expect(page).toHaveURL(/\/profile$/);
    await homeTab.click();
    await expect(page).toHaveURL(leagueUrl);
    await expect(standings).toBeVisible();
  }

  await homeTab.click();
  await expect(page).toHaveURL(homeUrl);
  await expect(
    page.getByRole("tab", { name: "Switch to scores tab", exact: true }),
  ).toBeVisible();

  // Reselecting the root is safe and future tab switches keep that root active.
  await homeTab.click();
  await expect(page).toHaveURL(homeUrl);
  await profileTab.click();
  await expect(page).toHaveURL(/\/profile$/);
  await homeTab.click();
  await expect(page).toHaveURL(homeUrl);
});
