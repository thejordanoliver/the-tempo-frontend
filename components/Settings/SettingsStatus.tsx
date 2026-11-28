import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { settingsDetailStyles } from "styles/SettingsStyles";

type Props = {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  description?: string;
  onRetry?: () => void;
};

export default function SettingsStatus({
  icon,
  title,
  description,
  onRetry,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const text = globalStyles(isDark);
  const styles = settingsDetailStyles(isDark);

  return (
    <View style={text.emptyContainer}>
      <View style={styles.statusIcon} aria-hidden>
        <Ionicons
          name={icon}
          size={30}
          color={Colors[resolvedColorScheme].text}
        />
      </View>
      <View style={styles.statusCopy}>
        <Text
          accessibilityRole={onRetry ? "alert" : "header"}
          style={text.emptyTitle}
        >
          {title}
        </Text>
        {description && <Text style={text.emptyText}>{description}</Text>}
      </View>
      {onRetry && (
        <Button isDark={isDark} onPress={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </View>
  );
}
