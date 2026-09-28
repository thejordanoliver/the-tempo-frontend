import { useCallback, useMemo, useState } from "react";
import {
  blockUser,
  reportContent,
  reportUser,
  unblockUser,
  type ReportReason,
  type ReportTargetType,
} from "services/usersApi";

export type SafetyModalStep = "actions" | "report" | "block" | "status";

export type SafetyActionsModalProps = {
  visible: boolean;
  step: SafetyModalStep;
  username?: string | null;
  canBlock: boolean;
  isBlocked: boolean;
  pending: boolean;
  statusTitle: string;
  statusMessage: string;
  onClose: () => void;
  onBack: () => void;
  onChooseReport: () => void;
  onChooseBlock: () => void;
  onSubmitReport: (reason: ReportReason) => Promise<void>;
  onConfirmBlock: () => Promise<void>;
};

export function useSafetyActions(options: {
  userId: string | number | null | undefined;
  username?: string | null;
  targetType: ReportTargetType;
  targetId: string | number;
  onBlocked?: () => void;
  onBlockChanged?: () => void | Promise<void>;
  isBlocked?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<SafetyModalStep>("actions");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState({ title: "", message: "" });

  const close = useCallback(() => {
    if (!pending) setVisible(false);
  }, [pending]);

  const open = useCallback(() => {
    if (pending) return;
    setStep("actions");
    setVisible(true);
  }, [pending]);

  const back = useCallback(() => {
    if (!pending) setStep("actions");
  }, [pending]);

  const showStatus = useCallback((title: string, message: string) => {
    setStatus({ title, message });
    setStep("status");
  }, []);

  const submitReport = useCallback(
    async (reason: ReportReason) => {
      if (pending) return;
      setPending(true);
      try {
        if (options.targetType === "user") {
          await reportUser(options.targetId, reason);
        } else {
          await reportContent(options.targetType, options.targetId, reason);
        }
        showStatus("Report received", "Thanks for helping keep Tempo safe.");
      } catch {
        showStatus("Could not submit report", "Please try again later.");
      } finally {
        setPending(false);
      }
    },
    [options.targetId, options.targetType, pending, showStatus],
  );

  const confirmBlock = useCallback(async () => {
    if (!options.userId || pending) return;
    setPending(true);
    try {
      if (options.isBlocked) await unblockUser(options.userId);
      else await blockUser(options.userId);
      setVisible(false);
      if (!options.isBlocked) options.onBlocked?.();
      await options.onBlockChanged?.();
    } catch {
      showStatus("Could not block account", "Please try again later.");
    } finally {
      setPending(false);
    }
  }, [options, pending, showStatus]);

  const modalProps = useMemo<SafetyActionsModalProps>(
    () => ({
      visible,
      step,
      username: options.username,
      canBlock: Boolean(options.userId),
      isBlocked: options.isBlocked === true,
      pending,
      statusTitle: status.title,
      statusMessage: status.message,
      onClose: close,
      onBack: back,
      onChooseReport: () => setStep("report"),
      onChooseBlock: () => setStep("block"),
      onSubmitReport: submitReport,
      onConfirmBlock: confirmBlock,
    }),
    [back, close, confirmBlock, options.isBlocked, options.userId, options.username, pending, status, step, submitReport, visible],
  );

  return { open, pending, modalProps };
}
