import type { DeviceGameWidgetProps } from "types/deviceGameWidget";

// Expo Widgets in SDK 57 only renders iOS widgets. Keep other platforms inert.
export const deviceGameWidgetsSupported = false;

export function updateDeviceGameWidgets(_props: DeviceGameWidgetProps): void {}
