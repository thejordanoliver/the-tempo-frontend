import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { credentialRequirementsStyles } from "styles/CredentialRequirementsStyles";

type Props = {
  title: string;
  value: string;
  rules: readonly { label: string; test: (value: string) => boolean }[];
};

export default function CredentialRequirements({ title, value, rules }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = credentialRequirementsStyles(isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rules.map((rule) => {
        const met = rule.test(value);
        return (
          <View key={rule.label} style={styles.row}
            accessible accessibilityLabel={`${rule.label}: ${met ? "met" : "not met"}`}>
            <Ionicons name={met ? "checkmark-circle" : "ellipse-outline"} size={16}
              color={met ? (isDark ? Colors.dark.green : Colors.light.green) : Colors.midTone} />
            <Text style={[styles.text, met && styles.met]}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
