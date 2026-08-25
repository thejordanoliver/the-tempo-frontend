import { CustomHeader } from "@/components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  getActivityStatusPreference,
  updateActivityStatusPreference,
} from "services/usersApi";
import { settingsStyles } from "styles/SettingsStyles";

const PreferencesScreen = () => {
  const {
    viewMode,
    setViewMode,
    colorScheme,
    resolvedColorScheme,
    setColorScheme,
  } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = settingsStyles(isDark);
  const navigation = useNavigation();
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [isUpdatingActivityStatus, setIsUpdatingActivityStatus] =
    useState(false);
  const textColor = isDark ? Colors.white : Colors.black;
  const notSelected = isDark
    ? Colors.transparentLightGray
    : Colors.transparentDarkGray;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader title="Preferences" onBack={goBack} />,
    });
  }, [navigation, isDark]);

  useEffect(() => {
    let isMounted = true;

    getActivityStatusPreference()
      .then((value) => {
        if (isMounted) {
          setShowActivityStatus(value);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleActivityStatus = useCallback(async () => {
    if (isUpdatingActivityStatus) return;

    const previous = showActivityStatus;
    const next = !previous;

    setShowActivityStatus(next);
    setIsUpdatingActivityStatus(true);

    try {
      const saved = await updateActivityStatusPreference(next);
      setShowActivityStatus(saved);
    } catch {
      setShowActivityStatus(previous);
    } finally {
      setIsUpdatingActivityStatus(false);
    }
  }, [isUpdatingActivityStatus, showActivityStatus]);

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

        <View style={styles.seperator} />

        <HeadingTwo isDark={isDark}>Activity Status</HeadingTwo>
        <View style={styles.optionButtonContainer}>
          <TouchableOpacity
            onPress={handleToggleActivityStatus}
            style={styles.optionButton}
            disabled={isUpdatingActivityStatus}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: showActivityStatus ? textColor : notSelected,
                },
              ]}
            >
              Show Activity Status
            </Text>

            <Ionicons
              name={showActivityStatus ? "toggle" : "toggle-outline"}
              size={28}
              color={showActivityStatus ? textColor : notSelected}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferencesScreen;
