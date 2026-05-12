import { Ionicons } from "@expo/vector-icons";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLayoutEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { settingsStyles } from "styles/SettingsStyles";

const PreferencesScreen = () => {
  const {
    viewMode,
    setViewMode,
    colorScheme,
    setColorScheme,
    resolvedColorScheme,
  } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = settingsStyles(isDark);
  const navigation = useNavigation();
  const textColor = isDark ? Colors.white : Colors.black;
  const notSelected = isDark
    ? Colors.transparentLightGray
    : Colors.transparentDarkGray;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="Preferences" onBack={goBack} />,
    });
  }, [navigation, isDark]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <HeadingTwo isDark={isDark}>Gamecard Layout</HeadingTwo>
        <View>
          <View style={styles.optionButtonContainer}>
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              style={styles.optionButton}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: viewMode === "list" ? textColor : notSelected,
                  },
                ]}
              >
                List
              </Text>
              {viewMode === "list" && (
                <Ionicons name="checkmark" size={24} color={textColor} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.optionButtonContainer}>
            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              style={styles.optionButton}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: viewMode === "grid" ? textColor : notSelected,
                  },
                ]}
              >
                Grid
              </Text>
              {viewMode === "grid" && (
                <Ionicons name="checkmark" size={24} color={textColor} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.optionButtonContainer}>
            <TouchableOpacity
              onPress={() => setViewMode("stacked")}
              style={styles.optionButton}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: viewMode === "stacked" ? textColor : notSelected,
                  },
                ]}
              >
                Stacked
              </Text>
              {viewMode === "stacked" && (
                <Ionicons name="checkmark" size={24} color={textColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.seperator} />

        <HeadingTwo isDark={isDark}>Theme</HeadingTwo>
        <View style={styles.optionButtonContainer}>
          <TouchableOpacity
            onPress={() => setColorScheme("light")}
            style={styles.optionButton}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: colorScheme === "light" ? textColor : notSelected,
                },
              ]}
            >
              Light
            </Text>

            {colorScheme === "light" && (
              <Ionicons name="checkmark" size={24} color={textColor} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.optionButtonContainer}>
          <TouchableOpacity
            onPress={() => setColorScheme("dark")}
            style={styles.optionButton}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: colorScheme === "dark" ? textColor : notSelected,
                },
              ]}
            >
              Dark
            </Text>

            {colorScheme === "dark" && (
              <Ionicons name="checkmark" size={24} color={textColor} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.optionButtonContainer}>
          <TouchableOpacity
            onPress={() => setColorScheme("system")}
            style={styles.optionButton}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: colorScheme === "system" ? textColor : notSelected,
                },
              ]}
            >
              System
            </Text>

            {colorScheme === "system" && (
              <Ionicons name="checkmark" size={24} color={textColor} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferencesScreen;
