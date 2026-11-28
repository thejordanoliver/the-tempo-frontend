import { expect, test } from "@playwright/test";
import type {
  PlayoffBracketData,
  PlayoffLeague,
  PlayoffTeam,
} from "../../types/playoffs";

const sports: Record<PlayoffLeague, string> = {
  nba: "basketball",
  wnba: "basketball",
  mlb: "baseball",
  nfl: "football",
  nhl: "hockey",
};
const makeTeam = (
  id: number,
  name: string,
  wins: number,
  isWinner: boolean,
): PlayoffTeam => ({
  id,
  alt_id: id + 100,
  name,
  fullName: name,
  shortName: name,
  code: name.slice(0, 3),
  logo: null,
  logoDark: null,
  wins,
  isWinner,
});
function bracket(season: number, league: PlayoffLeague): PlayoffBracketData {
  const alpha = makeTeam(1, "Alpha", league === "nfl" ? 1 : 4, true);
  const beta = makeTeam(2, "Beta", 0, false);
  return {
    season,
    rounds: [
      {
        id: "first",
        name: "First Round",
        order: 1,
        matchups: [
          {
            id: "a",
            name: "First Round",
            league: "East",
            bestOf: league === "nfl" ? 1 : 7,
            status: "complete",
            winnerId: 1,
            winnerAltId: 101,
            nextSeriesId: "b",
            teams: [alpha, beta],
            games:
              league === "nfl"
                ? [
                    {
                      id: "g1",
                      number: 1,
                      date: null,
                      status: "FINAL",
                      home: { teamAltId: 101, score: 21 },
                      away: { teamAltId: 102, score: 0 },
                    },
                  ]
                : [],
          },
        ],
        byeTeams:
          league === "nfl"
            ? [{ ...makeTeam(3, "Gamma", 0, false), nextSeriesId: "b" }]
            : [],
      },
      {
        id: "final",
        name: "Final",
        order: 2,
        matchups: [
          {
            id: "b",
            name: "Final",
            league: null,
            bestOf: league === "nfl" ? 1 : 7,
            status: "scheduled",
            winnerId: null,
            winnerAltId: null,
            nextSeriesId: null,
            teams: [{ ...alpha, wins: 0, isWinner: false }, null],
            games: [],
          },
        ],
      },
    ],
  };
}
for (const league of Object.keys(sports) as PlayoffLeague[]) {
  test(`${league} bracket renders, recovers from errors and changes seasons`, async ({
    page,
  }, testInfo) => {
    const headerCount = league === "wnba" ? 5 : 7;
    const finalRound = league === "wnba" ? 2 : 3;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(
      (theme) => {
        localStorage.setItem("accessToken", "tempo-e2e-token");
        localStorage.setItem("userId", "1");
        localStorage.setItem("username", "tempo-e2e");
        localStorage.setItem("@color_scheme_preference", theme);
      },
      league === "nhl" ? "dark" : "light",
    );
    await page.routeWebSocket(/.*/, (socket) => socket.close());
    const requests: number[] = [];
    const futureYear = new Date().getUTCFullYear() + 1;
    let failOnce = true;
    let releaseLoading = () => {};
    const loadingResponse = new Promise<void>((resolve) => {
      releaseLoading = resolve;
    });
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (
        !url.pathname.startsWith("/api/") &&
        url.origin === new URL(testInfo.project.use.baseURL!).origin
      ) {
        await route.continue();
        return;
      }
      if (url.pathname.endsWith("/playoffs")) {
        const season = Number(url.searchParams.get("season"));
        requests.push(season);
        if (failOnce) {
          failOnce = false;
          await loadingResponse;
          await route.fulfill({
            status: 502,
            json: { error: "Playoff provider temporarily unavailable" },
          });
          return;
        }
        if (season === futureYear && league === "nba") {
          await route.fulfill({
            status: 502,
            json: { error: "Upcoming season unavailable" },
          });
          return;
        }
        await route.fulfill({
          json:
            season === futureYear
              ? { season, rounds: [] }
              : bracket(season, league),
        });
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
    await page.goto(`/league/${sports[league]}?league=${league}`);
    await page
      .getByRole("tab", { name: "Switch to playoffs tab", exact: true })
      .click();
    const skeleton = page.getByTestId("playoff-bracket-skeleton");
    await expect(skeleton).toBeVisible();
    await expect(
      skeleton.locator('[data-testid^="bracket-skeleton-heading-"]'),
    ).toHaveCount(headerCount);
    expect(await skeleton.locator("svg path").count()).toBeGreaterThan(0);
    await page.screenshot({
      path: testInfo.outputPath(`${league}-loading.png`),
    });
    releaseLoading();
    await expect(skeleton).toHaveCount(0);
    await expect(
      page.getByText(
        "Playoff data is temporarily unavailable. Pull to refresh.",
        {
          exact: true,
        },
      ),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Retry loading playoffs" }),
    ).toHaveCount(0);
    await page.reload();
    await page
      .getByRole("tab", { name: "Switch to playoffs tab", exact: true })
      .click();
    await expect(page.getByTestId("bracket-0:matchup:a")).toBeVisible();
    await expect(
      page.getByTestId("bracket-0:matchup:a").getByText("Alp", { exact: true }),
    ).toBeVisible();
    if (league === "nfl") {
      await expect(
        page.getByText("First-round bye", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("bracket-0:matchup:a")
          .getByText("21", { exact: true }),
      ).toBeVisible();
    }
    // The board is wider than a phone and scrolls independently of the league pager.
    const board = page.getByLabel(
      "Playoff bracket. Scroll horizontally to see later rounds.",
      { exact: true },
    );
    expect(
      await board.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    ).toBe(true);
    await board.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await expect(page.getByTestId("bracket-1:matchup:b")).toBeVisible();
    await expect(
      page.getByText(`${league.toUpperCase()} Playoffs`, { exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`${league}-bracket.png`),
    });
    await page
      .getByRole("button", { name: "Playoff season", exact: true })
      .click();
    const year = requests[0] - 1;
    const label =
      league === "nba"
        ? `${year}–${String(year + 1).slice(-2)}`
        : league === "nhl"
          ? `${year - 1}–${String(year).slice(-2)}`
          : String(year);
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect.poll(() => requests.includes(year)).toBe(true);
    await expect(page.getByTestId("bracket-0:matchup:a")).toBeAttached();
    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Playoff season", exact: true })
      .click();
    const futureLabel =
      league === "nba"
        ? `${futureYear}–${String(futureYear + 1).slice(-2)}`
        : league === "nhl"
          ? `${futureYear - 1}–${String(futureYear).slice(-2)}`
          : String(futureYear);
    await page.getByRole("button", { name: futureLabel, exact: true }).click();
    const placeholder = page.getByTestId(`bracket-0:matchup:tbd-${league}-0-0`);
    await expect(placeholder).toBeVisible();
    await expect(placeholder.getByText("TBD", { exact: true })).toHaveCount(2);
    await expect(placeholder.locator("img")).toHaveCount(2);
    await expect(
      page.getByText("No playoff matchups available for this season."),
    ).toHaveCount(0);
    const rightSlot =
      league === "mlb" || league === "wnba" ? 2 : league === "nfl" ? 3 : 4;
    const championship = page.getByTestId(
      `bracket-${finalRound}:matchup:tbd-${league}-${finalRound}-0`,
    );
    const rightBranch = page.getByTestId(
      `bracket-0:matchup:tbd-${league}-0-${rightSlot}`,
    );
    const leftBox = (await placeholder.boundingBox())!;
    const finalBox = (await championship.boundingBox())!;
    const rightBox = (await rightBranch.boundingBox())!;
    expect(leftBox.x).toBeLessThan(finalBox.x);
    expect(rightBox.x).toBeGreaterThan(finalBox.x);
    expect(
      Math.abs(
        finalBox.x +
          finalBox.width / 2 -
          (leftBox.x + rightBox.x + rightBox.width) / 2,
      ),
    ).toBeLessThan(1);
    await expect(page.locator('[data-testid^="bracket-heading-"]')).toHaveCount(
      headerCount,
    );
    await expect(
      page.locator('[data-testid^="bracket-heading-"]').first(),
    ).toHaveCSS("align-items", "center");
    await expect(
      page.getByRole("button", { name: futureLabel, exact: true }),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 1840, height: 900 });
    await page.screenshot({
      path: testInfo.outputPath(`${league}-upcoming.png`),
    });
    expect(errors).toEqual([]);
  });
}
