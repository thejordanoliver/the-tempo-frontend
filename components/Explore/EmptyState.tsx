import { Text, useColorScheme, View } from "react-native";
import { exploreStyles } from "styles/Explore.styles";

export default function EmptyState() {
  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);
  return (
    <View style={styles.centerPrompt}>
      <Text style={styles.promptText}>Search for players and teams</Text>
    </View>
  );
}
