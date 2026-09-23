import { useCallback, useState } from "react";
import { Alert } from "react-native";
import {
  blockUser,
  reportContent,
  type ReportReason,
  type ReportTargetType,
} from "services/usersApi";

type ContentTarget = Exclude<ReportTargetType, "user">;

export function useSafetyActions(options: {
  userId: string | number | null | undefined;
  username?: string | null;
  targetType: ContentTarget;
  targetId: string | number;
  onBlocked?: () => void;
}) {
  const [pending, setPending] = useState(false);

  const submitReport = useCallback(async (reason: ReportReason) => {
    if (pending) return;
    setPending(true);
    try {
      await reportContent(options.targetType, options.targetId, reason);
      Alert.alert("Report received", "Thanks for helping keep Tempo safe.");
    } catch {
      Alert.alert("Could not submit report", "Please try again later.");
    } finally {
      setPending(false);
    }
  }, [options.targetId, options.targetType, pending]);

  const report = useCallback(() => {
    Alert.alert("Report content", "Why are you reporting this?", [
      { text: "Spam", onPress: () => void submitReport("spam") },
      { text: "Harassment", onPress: () => void submitReport("harassment") },
      { text: "Hate or threats", onPress: () => void submitReport("hate") },
      { text: "Other", onPress: () => void submitReport("other") },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [submitReport]);

  const confirmBlock = useCallback(() => {
    if (!options.userId || pending) return;
    const label = options.username ? `@${options.username}` : "this user";
    Alert.alert(
      `Block ${label}?`,
      "You won't be able to follow, message, or see each other's activity. They won't be notified.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            setPending(true);
            try {
              await blockUser(options.userId!);
              options.onBlocked?.();
            } catch {
              Alert.alert("Could not block account", "Please try again later.");
            } finally {
              setPending(false);
            }
          },
        },
      ],
    );
  }, [options, pending]);

  const open = useCallback(() => {
    Alert.alert(
      options.username ? `@${options.username}` : "Safety actions",
      undefined,
      [
        { text: "Report", onPress: report },
        ...(options.userId
          ? [{ text: "Block user", style: "destructive" as const, onPress: confirmBlock }]
          : []),
        { text: "Cancel", style: "cancel" },
      ],
    );
  }, [confirmBlock, options.userId, options.username, report]);

  return { open, pending };
}
