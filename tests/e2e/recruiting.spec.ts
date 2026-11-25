import { expect, test, type Page } from "@playwright/test";

for (const league of ["cfb", "mcbb"]) {
  async function openRecruitsTab(page: Page) {
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
      height: "6-5.5",
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
      if (url.pathname === `/api/teams/${league}`) {
        await route.fulfill({
          json: {
            teams: [
              {
                id: 153,
                name: "North Carolina Tar Heels",
                shortName: "North Carolina",
              },
              { id: 150, name: "Duke Blue Devils", shortName: "Duke" },
            ],
          },
        });
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
              predicted_team_id: 153,
            },
            {
              ...recruit,
              id: 1000000003,
              name: "Enrolled Recruit",
              is_committed: false,
              is_signed: false,
              is_enrolled: true,
              committed_team_id: null,
            },
            {
              ...recruit,
              id: 1000000004,
              name: "Other Commitment",
              committed_team_id: 150,
              committed_team_name: "Duke",
              projected_team_id: 153,
              predicted_schools: [
                { team_id: 153, team_name: "North Carolina" },
              ],
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
  }

  test(`${league} team dropdown shows only that team's commitments`, async ({
    page,
  }) => {
    await openRecruitsTab(page);
    const dropdown = page.getByRole("button", {
      name: "Recruiting team",
      exact: true,
    });
    async function selectTeam(name: string) {
      await dropdown.click();
      const option = page.getByRole("button", { name, exact: true });
      await option.click();
      await expect(option).toBeHidden();
    }
    const names = page.getByRole("button", {
      name: /^Open (DeMarcus Henry|Industry Leader|Enrolled Recruit|Other Commitment)$/,
    });
    await expect(names).toHaveCount(4);
    await selectTeam("North Carolina");
    await expect(names).toHaveCount(2);
    await expect(names.nth(0)).toHaveAccessibleName("Open DeMarcus Henry");
    await expect(names.nth(1)).toHaveAccessibleName("Open Enrolled Recruit");
    await selectTeam("Duke");
    await expect(names).toHaveCount(1);
    await expect(names).toHaveAccessibleName("Open Other Commitment");
    await selectTeam("All Teams");
    await expect(names).toHaveCount(4);
  });

  test(`${league} industry rankings, class selection and player-style profile`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 850 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openRecruitsTab(page);
    await expect(
      page.getByRole("button", { name: "Open Industry Leader", exact: true }),
    ).toBeVisible();
    const names = page.getByRole("button", {
      name: /^Open (Industry Leader|DeMarcus Henry)$/,
    });
    await expect(names.first()).toHaveAccessibleName("Open Industry Leader");
    await expect(
      page.getByText("Status unavailable", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Recruiting class", exact: true })
      .click();
    await page.getByRole("button", { name: "2026", exact: true }).click();
    await page
      .getByRole("button", { name: "Open DeMarcus Henry", exact: true })
      .click();
    await expect(
      page.getByText("DeMarcus Henry", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Industry", { exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.getByLabel("Industry stars: 5", { exact: true }),
    ).toBeVisible();
    const statLabels = [
      "HEIGHT: 6-5.5",
      "LBS: 200",
      "CLASS: 2027",
      "Industry rating: 98.73",
    ];
    const statBounds = await Promise.all(
      statLabels.map((label) =>
        page.getByLabel(label, { exact: true }).boundingBox(),
      ),
    );
    for (const bounds of statBounds) {
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
      expect(bounds!.height).toBeLessThan(65);
      expect(Math.abs(bounds!.width - statBounds[0]!.width)).toBeLessThan(2);
    }

    await expect(page.getByText("Signed", { exact: true })).toBeVisible();
    await expect(page.getByText("Oct 30", { exact: true })).toBeVisible();
    await page
      .getByRole("tab", { name: "Switch to Schools tab", exact: true })
      .click();
    await expect(
      page.getByText("No predictions available", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("School interests", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("tab", { name: "Switch to NIL tab", exact: true })
      .click();
    await expect(
      page.getByText("NIL valuation unavailable.", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("tab", { name: "Switch to Rankings tab", exact: true })
      .click();
    await page.screenshot({
      path: testInfo.outputPath(`tempo-on3-${league}-profile.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
