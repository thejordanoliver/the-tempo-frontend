import { requireOptionalNativeModule } from "expo";
import type { Widget } from "expo-widgets";
import type {
  DeviceGameWidgetConfiguration,
  DeviceGameWidgetProps,
} from "types/deviceGameWidget";
import { buildDeviceGameWidgetTimeline } from "utils/widgets/deviceGameWidget";

// Expo Go and older development builds do not include this native extension.
export const deviceGameWidgetsSupported = Boolean(
  requireOptionalNativeModule("ExpoWidgets"),
);

const widget: Widget<
  DeviceGameWidgetProps,
  DeviceGameWidgetConfiguration
> | null = deviceGameWidgetsSupported
  ? // Load the native widget only after checking availability, so Expo Go can still open the app.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("../components/DeviceWidgets/FavoriteGamesWidget").default
  : null;

export function updateDeviceGameWidgets(props: DeviceGameWidgetProps): void {
  widget?.updateTimeline(buildDeviceGameWidgetTimeline(props));
}
