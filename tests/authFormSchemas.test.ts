import { passwordRules, usernameRules } from "../schemas/auth/credentialRules";
import assert from "node:assert/strict";
import test from "node:test";

import { changePasswordSchema } from "../schemas/auth/changePasswordSchema";
import { forgotPasswordSchema } from "../schemas/auth/forgotPasswordSchema";
import { signupSchema } from "../schemas/auth/signupSchema";

const validSignup = {
  fullName: "Tempo Fan",
  username: "tempo.fan",
  email: "fan@example.com",
  password: "TempoFan123!",
  confirmPassword: "TempoFan123!",
  favoriteTeams: ["nba:1"],
  favoriteSports: ["nba"],
  profileImage: null,
  bannerImage: null,
};

test("signup schema normalizes submitted identity fields", () => {
  const result = signupSchema.parse({
    ...validSignup,
    fullName: "  Tempo Fan  ",
    username: "  TEMPO.FAN  ",
    email: "  FAN@EXAMPLE.COM  ",
  });

  assert.equal(result.fullName, "Tempo Fan");
  assert.equal(result.username, "tempo.fan");
  assert.equal(result.email, "fan@example.com");
});

test("signup schema requires a nonblank display name", () => {
  for (const fullName of [undefined, null, "", "   ", "a".repeat(81)]) {
    assert.equal(signupSchema.safeParse({ ...validSignup, fullName }).success, false);
  }
  assert.equal(signupSchema.parse({ ...validSignup, fullName: "  Fan  " }).fullName, "Fan");
});

test("signup schema enforces backend limits and matching passwords", () => {
  const result = signupSchema.safeParse({
    ...validSignup,
    username: "no spaces allowed",
    password: "short",
    confirmPassword: "different",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path[0]);

    assert.ok(paths.includes("username"));
    assert.ok(paths.includes("password"));
    assert.ok(paths.includes("confirmPassword"));
  }
});

test("signup schema requires a strong password for new accounts", () => {
  const missingUppercase = signupSchema.safeParse({
    ...validSignup,
    password: "tempofan123!",
    confirmPassword: "tempofan123!",
  });
  const missingLowercase = signupSchema.safeParse({
    ...validSignup,
    password: "TEMPOFAN123!",
    confirmPassword: "TEMPOFAN123!",
  });
  const missingNumber = signupSchema.safeParse({
    ...validSignup,
    password: "TempoFanPass!",
    confirmPassword: "TempoFanPass!",
  });
  const missingSymbol = signupSchema.safeParse({
    ...validSignup,
    password: "TempoFan1234",
    confirmPassword: "TempoFan1234",
  });

  assert.equal(missingUppercase.success, false);
  assert.equal(missingLowercase.success, false);
  assert.equal(missingNumber.success, false);
  assert.equal(missingSymbol.success, false);
});

test("forgot-password schema validates and normalizes the recovery payload", () => {
  const result = forgotPasswordSchema.parse({
    email: "  FAN@EXAMPLE.COM ",
    code: " 123456 ",
    password: "NewPassword123!",
    confirmPassword: "NewPassword123!",
  });

  assert.equal(result.email, "fan@example.com");
  assert.equal(result.code, "123456");
});

test("forgot-password schema rejects malformed codes and password mismatch", () => {
  const result = forgotPasswordSchema.safeParse({
    email: "fan@example.com",
    code: "12345",
    password: "NewPassword123!",
    confirmPassword: "different-password",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path[0]);

    assert.ok(paths.includes("code"));
    assert.ok(paths.includes("confirmPassword"));
  }
});

const validPasswordChange = {
  currentPassword: "current-password",
  newPassword: "NewPassword123!",
  confirmPassword: "NewPassword123!",
};

test("change-password schema accepts backend-compatible values", () => {
  assert.deepEqual(changePasswordSchema.parse(validPasswordChange), {
    currentPassword: "current-password",
    newPassword: "NewPassword123!",
    confirmPassword: "NewPassword123!",
  });
});

test("change-password schema rejects a short new password", () => {
  const result = changePasswordSchema.safeParse({
    ...validPasswordChange,
    newPassword: "short",
    confirmPassword: "short",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(
      result.error.issues.some((issue) => issue.path[0] === "newPassword"),
    );
  }
});

test("change-password schema rejects a password confirmation mismatch", () => {
  const result = changePasswordSchema.safeParse({
    ...validPasswordChange,
    confirmPassword: "different-password",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(
      result.error.issues.some(
        (issue) => issue.path[0] === "confirmPassword",
      ),
    );
  }
});

test("change-password schema requires the current password", () => {
  const result = changePasswordSchema.safeParse({
    ...validPasswordChange,
    currentPassword: "",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(
      result.error.issues.some(
        (issue) => issue.path[0] === "currentPassword",
      ),
    );
  }
});

test("change-password schema requires a different new password", () => {
  const result = changePasswordSchema.safeParse({
    ...validPasswordChange,
    newPassword: validPasswordChange.currentPassword,
    confirmPassword: validPasswordChange.currentPassword,
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(
      result.error.issues.some((issue) => issue.path[0] === "newPassword"),
    );
  }
});

test("visible signup requirements agree with schema validation", () => {
  for (const password of ["", "short", "lowercase123!", "UPPERCASE123!",
    "NoNumbersHere!", "NoSymbols1234", "ValidPassword123!", "A".repeat(129)]) {
    const meetsRules = passwordRules.every((rule) => rule.test(password));
    assert.equal(signupSchema.safeParse({
      ...validSignup, password, confirmPassword: password,
    }).success, meetsRules);
  }
});

test("username requirements accept the same normalized usernames as signup", () => {
  for (const username of ["ab", "tempo_fan", "TEMPO.FAN", "has space",
    "a".repeat(30), "a".repeat(31)]) {
    assert.equal(signupSchema.safeParse({ ...validSignup, username }).success,
      usernameRules.every((rule) => rule.test(username)));
  }
});

test("reset and password change reject passwords that fail signup requirements", () => {
  for (const password of ["short", "lowercase123!", "UPPERCASE123!",
    "NoNumbersHere!", "NoSymbols1234"]) {
    assert.equal(forgotPasswordSchema.safeParse({
      email: "fan@example.com", code: "123456", password, confirmPassword: password,
    }).success, false);
    assert.equal(changePasswordSchema.safeParse({
      currentPassword: "legacy-password", newPassword: password, confirmPassword: password,
    }).success, false);
  }
});
