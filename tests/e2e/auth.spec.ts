import { expect, test } from "@playwright/test";

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
