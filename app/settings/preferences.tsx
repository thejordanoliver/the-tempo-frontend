import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "app/settings/index";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLayoutEffect } from "react";
import { Pressable, Text, View } from "react-native";

const PreferencesScreen = () => {
  const {
    viewMode,
    setViewMode,
    colorScheme,
    setColorScheme,
    resolvedColorScheme,
  } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);
  const textColor = isDark ? Colors.white : Colors.black;
  const notSelected = isDark
    ? Colors.transparentLightGray
    : Colors.transparentDarkGray;
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="Preferences" onBack={goBack} />,
    });
  }, [navigation, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <HeadingTwo style={styles.heading} isDark={isDark}>
          Gamecard Layout
        </HeadingTwo>
        <View>
          <Pressable
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
          </Pressable>

          <Pressable
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
          </Pressable>
          <Pressable
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
          </Pressable>
        </View>
      </View>

      <View style={styles.wrapper}>
        <HeadingTwo style={styles.heading} isDark={isDark}>
          Theme
        </HeadingTwo>
        <Pressable
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
        </Pressable>

        <Pressable
          onPress={() => setColorScheme("dark")}
          style={styles.optionButton}
        >
          <Text
            style={[
              styles.optionText,
              {
                color:
                  colorScheme === "dark"
                    ? textColor
                    : isDark
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(0,0,0,0.4)",
              },
            ]}
          >
            Dark
          </Text>

          {colorScheme === "dark" && (
            <Ionicons name="checkmark" size={24} color={textColor} />
          )}
        </Pressable>

        <Pressable
          onPress={() => setColorScheme("system")}
          style={styles.optionButton}
        >
          <Text
            style={[
              styles.optionText,
              {
                color:
                  colorScheme === "system"
                    ? textColor
                    : isDark
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(0,0,0,0.4)",
              },
            ]}
          >
            System
          </Text>

          {colorScheme === "system" && (
            <Ionicons name="checkmark" size={24} color={textColor} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default PreferencesScreen;
