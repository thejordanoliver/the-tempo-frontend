import { Stack } from "expo-router";
import { CustomHeader } from "components/CustomHeader";
import { GameHeaderPlaceholder } from "components/CustomHeader/GameHeaderPlaceholder";

export const unstable_settings = {
  anchor: "league",
};

export default function LeagueStackLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        header: ({ back, navigation, options }) =>
          /^(game|player|team|league)\//.test(route.name) ? (
            <GameHeaderPlaceholder />
          ) : (
            <CustomHeader
              title={options.title ?? route.name}
              onBack={back ? navigation.goBack : undefined}
            />
          ),
        freezeOnBlur: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      })}
    />
  );
}
