import { expect, test } from "@playwright/test";

for (const league of ["cfb", "mcbb"]) {
  test(`${league} On3 rankings, class selection and full-name profile`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(
      (theme) => {
        localStorage.setItem("accessToken", "tempo-e2e-token");
        localStorage.setItem("userId", "1");
        localStorage.setItem("username", "tempo-e2e");
        localStorage.setItem("@color_scheme_preference", theme);
      },
      league === "cfb" ? "dark" : "light",
    );
    await page.routeWebSocket(/.*/, (socket) => socket.close());
    const recruit = {
      id: 1000000001,
      on3_person_id: "245329",
      year: 2027,
      name: "DeMarcus Henry",
      position: "SF",
      high_school: "High School",
      hometown: "Raleigh, NC",
      height: "6-7",
      weight: "200",
      image_url: null,
      national_rank: 1,
      position_rank: 1,
      state_rank: 1,
      score: "98",
      stars: 5,
      industry_national_rank: 2,
      industry_position_rank: 1,
      industry_state_rank: 1,
      industry_rating: "98.7284946236559",
      industry_stars: 5,
      is_committed: true,
      is_signed: true,
      is_enrolled: false,
      committed_team_id: 153,
      committed_team_name: "North Carolina",
      commitment_date: "2026-10-30T15:09:00",
      predicted_schools: null,
      interest_count: 27,
    };
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === "http://127.0.0.1:4173") {
        await route.continue();
        return;
      }
      if (url.pathname === `/api/recruits/${league}/player/${recruit.id}`) {
        await route.fulfill({ json: recruit });
        return;
      }
      if (new RegExp(`/api/recruits/${league}/[0-9]+$`).test(url.pathname)) {
        const year = Number(url.pathname.split("/").at(-1));
        await route.fulfill({
          json: [
            { ...recruit, year },
            {
              ...recruit,
              id: 1000000002,
              name: "Industry Leader",
              national_rank: 5,
              industry_national_rank: 1,
              is_committed: null,
              is_signed: null,
            },
          ],
        });
        return;
      }
      if (url.pathname === `/api/recruits/${league}/team/2027`) {
        await route.fulfill({ json: [] });
        return;
      }
      await route.fulfill({
        json: {
          games: [],
          calendar: [],
          items: [],
          notifications: [],
          subscriptions: [],
          nextCursor: null,
          hasMore: false,
          unreadCount: 0,
          favorites: [],
          favoriteTeams: [],
          favoriteSports: [],
          teams: [],
          conversations: [],
          groups: [],
          standings: [],
        },
      });
    });
    await page.goto(
      `/league/${league === "cfb" ? "football" : "basketball"}?league=${league}`,
    );
    await page
      .getByRole("tab", { name: "Switch to recruits tab", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Open Industry Leader", exact: true }),
    ).toBeVisible();
    const names = page.getByRole("button", {
      name: /^Open (Industry Leader|DeMarcus Henry)$/,
    });
    await expect(names.first()).toHaveAccessibleName("Open Industry Leader");
    await page.getByRole("button", { name: "On3", exact: true }).click();
    await expect(names.first()).toHaveAccessibleName("Open DeMarcus Henry");
    await expect(
      page.getByText("Status unavailable", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Recruiting class", exact: true })
      .click();
    await page.getByRole("button", {name:"2026",exact:true}).click();
    await page
      .getByRole("button", { name: "Open DeMarcus Henry", exact: true })
      .click();
    await expect(
      page.getByText("DEMARCUS HENRY", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Industry", { exact: true })).toBeVisible();
    await expect(
      page.getByText("5 stars · Rating 98.73", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Committed 2026-10-30", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("No offers yet", { exact: true })).toHaveCount(
      0,
    );
    await page.screenshot({
      path: `/private/tmp/tempo-on3-${league}-profile.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
