import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FORGOT_PASSWORD_CODE_FIELDS,
  FORGOT_PASSWORD_EMAIL_FIELDS,
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "schemas/auth/forgotPasswordSchema";
import { forgotPassword, resetPassword, verifyResetCode } from "utils/apiClient";
import { getErrorMessage } from "utils/getErrorMessage";

const RESEND_COOLDOWN_SECONDS = 60;

export type ResetStep = "email" | "code" | "password";
type RequestAction = "requesting" | "resending" | "verifying" | null;

const INITIAL_VALUES: ForgotPasswordFormValues = {
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
};

export function useForgotPasswordForm(onComplete: () => void) {
  const [step, setStep] = useState<ResetStep>("email");
  const [requestAction, setRequestAction] = useState<RequestAction>(null);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  const {
    clearErrors,
    control,
    formState: { isSubmitting, isValid, isValidating },
    getValues,
    handleSubmit,
    reset,
    setError: setFieldError,
    trigger,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: INITIAL_VALUES,
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(forgotPasswordSchema),
    shouldUnregister: false,
  });

  const isRequestBusy = requestAction !== null || isSubmitting || shouldRedirectToLogin;
  const isBusy = isRequestBusy || isValidating;

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (!shouldRedirectToLogin) return;

    const timeout = setTimeout(() => {
      reset(INITIAL_VALUES);
      onComplete();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [onComplete, reset, shouldRedirectToLogin]);

  const requestCode = async ({ isResend = false } = {}) => {
    if (isBusy || (isResend && resendCooldown > 0)) return;
    setGlobalError("");
    setSuccess("");

    const fieldsAreValid = await trigger(FORGOT_PASSWORD_EMAIL_FIELDS, {
      shouldFocus: !isResend,
    });

    if (!fieldsAreValid) return;

    const normalizedEmail = getValues("email").trim().toLowerCase();

    try {
      setRequestAction(isResend ? "resending" : "requesting");
      await forgotPassword(normalizedEmail);
      clearErrors("code");
      setStep("code");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccess(
        isResend
          ? "A new code has been sent."
          : "Check your email for a 6-digit code.",
      );
    } catch (error: unknown) {
      setGlobalError(
        getErrorMessage(
          error,
          "Unable to send reset code. Please try again.",
        ),
      );
    } finally {
      setRequestAction(null);
    }
  };

  const verifyCode = async () => {
    if (isBusy) return;
    setGlobalError("");
    setSuccess("");

    const fieldsAreValid = await trigger(FORGOT_PASSWORD_CODE_FIELDS, {
      shouldFocus: true,
    });

    if (!fieldsAreValid) return;

    const normalizedEmail = getValues("email").trim().toLowerCase();
    const trimmedCode = getValues("code").trim();

    try {
      setRequestAction("verifying");
      await verifyResetCode(normalizedEmail, trimmedCode);
      setStep("password");
      setSuccess("Code verified. Enter a new password.");
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Unable to verify the code. Please try again.",
      );

      if (message === "Invalid or expired reset code") {
        setFieldError("code", { type: "server", message });
      } else {
        setGlobalError(message);
      }
    } finally {
      setRequestAction(null);
    }
  };

  const updatePassword = async (values: ForgotPasswordFormValues) => {
    setGlobalError("");
    setSuccess("");

    try {
      await resetPassword(values.email, values.code, values.password);
      setSuccess("Password updated. Redirecting to login...");

      setShouldRedirectToLogin(true);
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Unable to update password. Please try again.",
      );

      if (message === "Invalid or expired reset code") {
        setFieldError("code", { type: "server", message });
        setStep("code");
        return;
      }

      if (message.startsWith("Password")) {
        setFieldError("password", { type: "server", message });
        return;
      }

      setGlobalError(message);
    }
  };

  return {
    control,
    step,
    requestAction,
    isRequestBusy,
    isBusy,
    isValid,
    isSubmitting,
    globalError,
    success,
    resendCooldown,
    requestCode,
    verifyCode,
    submitPassword: handleSubmit(updatePassword),
    clearFeedback: () => {
      setGlobalError("");
      setSuccess("");
    },
  };
}
