import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { View } from "react-native";

export function LeagueLoadingScreen({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={[
        globalStyles(isDark).emptyContainer,
        {
          backgroundColor: isDark
            ? Colors.dark.background
            : Colors.light.background,
        },
      ]}
    >
      <CustomActivityIndicator />
    </View>
  );
}
