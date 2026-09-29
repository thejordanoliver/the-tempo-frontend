import { Stack } from "expo-router";
import { CustomHeader } from "components/CustomHeader";

export const unstable_settings = {
  initialRouteName: "profile",
};

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={({ route, navigation }) => ({
        header: ({ options }) => (
          <CustomHeader
            title={options.title ?? route.name}
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        ),
        freezeOnBlur: true,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      })}
    />
  );
}
