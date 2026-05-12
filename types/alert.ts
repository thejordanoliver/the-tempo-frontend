export interface AlertConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  variant?: "default" | "danger";
  showCancel?: boolean;
  confirmDisabled?: boolean;
}
