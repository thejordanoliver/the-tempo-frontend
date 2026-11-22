import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useState } from "react";
import { Image, View } from "react-native";
import { settingsOverviewStyles } from "styles/SettingsStyles";

export default function SettingsAvatar({ uri }: { uri?: string | null }) {
  const { resolvedColorScheme } = usePreferences();
  const styles = settingsOverviewStyles(resolvedColorScheme === "dark");
  const [failedUri, setFailedUri] = useState<string>();

  return (
    <View style={styles.avatar} aria-hidden>
      {uri && uri !== failedUri ? (
        <Image
          source={{ uri }}
          style={styles.avatarImage}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <Ionicons name="person-outline" size={23} color={Colors.white} />
      )}
    </View>
  );
}
