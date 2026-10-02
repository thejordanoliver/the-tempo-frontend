import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

export const PASSWORD_REQUIREMENTS =
  "Use 12–128 characters with uppercase, lowercase, a number, and a symbol.";

export const passwordRules = [
  { label: "12–128 characters", message: "Password must be 12–128 characters.",
    test: (value: string) => value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH },
  { label: "A lowercase letter", message: "Password must include a lowercase letter.", test: (value: string) => /[a-z]/.test(value) },
  { label: "An uppercase letter", message: "Password must include an uppercase letter.", test: (value: string) => /[A-Z]/.test(value) },
  { label: "A number", message: "Password must include a number.", test: (value: string) => /\d/.test(value) },
  { label: "A symbol", message: "Password must include a symbol.", test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
];

export const usernameRules = [
  { label: "3–30 characters", test: (value: string) =>
    value.trim().length >= USERNAME_MIN_LENGTH && value.trim().length <= USERNAME_MAX_LENGTH },
  { label: "Letters, numbers, dots, underscores, or hyphens", test: (value: string) =>
    USERNAME_PATTERN.test(value.trim().toLowerCase()) },
];

export const passwordSchema = z.string().min(1, "Password is required.")
  .superRefine((value, context) => {
    for (const rule of passwordRules) {
      if (!rule.test(value)) context.addIssue({ code: "custom", message: rule.message });
    }
  });
