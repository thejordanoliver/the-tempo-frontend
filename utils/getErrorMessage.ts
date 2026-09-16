import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as
      | { error?: unknown; message?: unknown }
      | undefined;

    if (typeof responseData?.error === "string" && responseData.error.trim()) {
      return responseData.error;
    }

    if (
      typeof responseData?.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }
  }

  if (
    typeof error === "object" && error !== null && "message" in error &&
    typeof error.message === "string" && error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

