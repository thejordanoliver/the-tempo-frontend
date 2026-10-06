import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

export type DefaultMessagingApp = { name: string; iconUri: string };

type MessagingModule = {
  getDefaultSmsApp: () => Promise<DefaultMessagingApp | null>;
};

export async function getDefaultMessagingApp(): Promise<DefaultMessagingApp | null> {
  if (Platform.OS !== "android") return null;
  // Expo Go and older native builds continue working with a generic SMS icon.
  const native = requireOptionalNativeModule<MessagingModule>("TempoMessaging");
  if (!native) return null;
  try {
    const app = await native.getDefaultSmsApp();
    return app?.name && app.iconUri?.startsWith("data:image/png;base64,") ? app : null;
  } catch {
    return null;
  }
}
