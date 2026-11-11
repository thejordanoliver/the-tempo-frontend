import { expect, test } from "@playwright/test";

for (const league of ["mcvb", "wcvb"]) {
  test(`${league} standings and rankings open the correct team screen`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Synthetic account and API fixtures; this test never signs into a real account.
    await page.addInitScript(() => {
      localStorage.setItem("accessToken", "tempo-e2e-token");
      localStorage.setItem("userId", "1");
      localStorage.setItem("username", "tempo-e2e");
    });
    const team = {
      id: "221",
      name: "Pittsburgh Panthers",
      shortName: "Pitt",
      fullName: "Pittsburgh Panthers",
      code: "PITT",
      league,
      primaryColor: "#003594",
      secondaryColor: null,
      logo: null,
      logoDark: null,
    };
    await page.routeWebSocket(/.*/, (socket) => socket.close());
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === "http://127.0.0.1:4173") {
        await route.continue();
        return;
      }
      const path = url.pathname;
      let body: unknown = {
        games: [],
        calendar: [],
        items: [],
        notifications: [],
        unreadCount: 0,
        favorites: [],
        favoriteTeams: [],
        favoriteSports: [],
        teams: [],
        conversations: [],
      };
      if (path === `/api/standings/${league}`)
        body = {
          league,
          groups: [],
          standings: [
            {
              team,
              stats: [
                { name: "wins", label: "W", value: 15, displayValue: "15" },
              ],
            },
          ],
        };
      if (path === `/api/standings/${league}/rankings`)
        body = {
          available: true,
          rankings: {
            all: [
              {
                id: "avca",
                name: "AVCA",
                date: null,
                ranks: [
                  { current: 4, previous: 5, recordSummary: "15-2", team },
                ],
              },
            ],
          },
        };
      if (path === `/api/games/volleyball/team/${league}/221`)
        body = {
          league,
          team,
          games: [],
          months: [],
          season: { year: 2026, type: 2, slug: "regular-season" },
        };
      if (path === `/api/teams/${league}/221`)
        body = { success: true, league, team };
      await route.fulfill({ json: body });
    });
    await page.goto(`/league/volleyball?league=${league}`);
    await page
      .getByRole("tab", { name: "Switch to standings tab", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Open Pitt", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("tab", { name: "Switch to rankings tab", exact: true })
      .click();
    await expect(page.getByText("AVCA", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open Pitt", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/team/${league}/221`));
    await expect(
      page.getByRole("tab", { name: "Switch to schedule tab", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pitt", exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}
