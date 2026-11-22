import { expect, test } from "@playwright/test";

test("wrong-password alert keeps its error text while closing", async ({
  page,
}) => {
  const message = "Incorrect password";
  await page.route("**/api/login", (route) =>
    route.fulfill({ status: 401, json: { error: message } }),
  );
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "Username", exact: true })
    .fill("tester");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  const modal = page.getByTestId("confirm-modal");
  await expect(modal.getByText(message)).toBeVisible();
  // Capture transient renders that a single assertion after the click could miss.
  const displayedText = await modal.evaluateHandle((element) => {
    const seen = new Set([element.textContent]);
    new MutationObserver(() => {
      if (element.isConnected) seen.add(element.textContent);
    }).observe(element, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return seen;
  });
  await modal.getByRole("button", { name: "OK" }).click();
  await expect(modal).toBeHidden();
  for (const text of await displayedText.evaluate((seen) => [...seen])) {
    expect(text).toContain("Login failed");
    expect(text).toContain(message);
  }
});

test("auth tabs work on mobile web and validate empty submissions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/login");
  await expect(
    page.getByRole("textbox", { name: "Username", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByText("Please enter your username.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "OK", exact: true }).click();
  await page
    .getByRole("tab", { name: "Switch to sign up tab", exact: true })
    .click();
  await expect(page.getByPlaceholder("Display name")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByText("Display name is required.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Display name")).toBeVisible();
  await expect(page.getByPlaceholder("johndoe@example.com")).not.toBeVisible();
  await page
    .getByRole("tab", { name: "Switch to sign in tab", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Username", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("password recovery opens from sign in without an account", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Forgot Password?", exact: true })
    .click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByPlaceholder("Email", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
