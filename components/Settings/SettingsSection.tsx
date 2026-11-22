import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { settingsOverviewStyles } from "styles/SettingsStyles";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = settingsOverviewStyles(isDark);
  const text = globalStyles(isDark);

  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[text.label, styles.sectionLabel]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
