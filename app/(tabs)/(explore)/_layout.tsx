import { Stack } from "expo-router";
import { CustomHeader } from "components/CustomHeader";

export const unstable_settings = {
  initialRouteName: "explore",
};

export default function ExploreStackLayout() {
  return (
    <Stack
      screenOptions={({ route, navigation }) => ({
        header: ({ options }) => (
          <CustomHeader
            title={options.title ?? route.name}
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        ),
        freezeOnBlur: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      })}
    />
  );
}
