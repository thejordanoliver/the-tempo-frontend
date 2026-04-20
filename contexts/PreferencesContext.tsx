import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type ViewMode = "list" | "grid" | "stacked";
type ColorSchemePreference = "light" | "dark" | "system";

type PreferencesContextType = {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;

  colorScheme: ColorSchemePreference;
  resolvedColorScheme: "light" | "dark";
  setColorScheme: (scheme: ColorSchemePreference) => void;
  toggleColorScheme: () => void;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

const VIEW_MODE_KEY = "@view_mode_preference";
const COLOR_SCHEME_KEY = "@color_scheme_preference";

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewMode, setViewModeState] = useState<ViewMode>("list");
  const [colorScheme, setColorSchemeState] =
    useState<ColorSchemePreference>("system");

  // ✅ Reactive — stored in state so changes trigger re-renders
  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(
    Appearance.getColorScheme() ?? "light",
  );

  // ✅ Stays in sync with OS theme changes
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => listener.remove();
  }, []);

  // ✅ Always correct — recomputed whenever colorScheme or systemScheme changes
  const resolvedColorScheme =
    colorScheme === "system" ? systemScheme : colorScheme;

  /* ---------------- Load persisted settings ---------------- */

  useEffect(() => {
    const load = async () => {
      try {
        const [storedView, storedTheme] = await Promise.all([
          AsyncStorage.getItem(VIEW_MODE_KEY),
          AsyncStorage.getItem(COLOR_SCHEME_KEY),
        ]);

        if (
          storedView === "list" ||
          storedView === "grid" ||
          storedView === "stacked"
        ) {
          setViewModeState(storedView);
        }

        if (
          storedTheme === "light" ||
          storedTheme === "dark" ||
          storedTheme === "system"
        ) {
          setColorSchemeState(storedTheme);
        }
      } catch (e) {
        console.warn("Failed to load preferences:", e);
      }
    };

    load();
  }, []);

  /* ---------------- Persist helpers ---------------- */

  const persistViewMode = async (mode: ViewMode) => {
    try {
      await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
    } catch (e) {
      console.warn("Failed to save view mode:", e);
    }
  };

  const persistColorScheme = async (scheme: ColorSchemePreference) => {
    try {
      await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
    } catch (e) {
      console.warn("Failed to save color scheme:", e);
    }
  };

  /* ---------------- Setters ---------------- */

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    persistViewMode(mode);
  };

  const setColorScheme = (scheme: ColorSchemePreference) => {
    setColorSchemeState(scheme);
    persistColorScheme(scheme);
  };

  /* ---------------- Toggles ---------------- */

  const toggleViewMode = () => {
    const next =
      viewMode === "list" ? "grid" : viewMode === "grid" ? "stacked" : "list";

    setViewMode(next);
  };

  const toggleColorScheme = () => {
    const next =
      colorScheme === "light"
        ? "dark"
        : colorScheme === "dark"
          ? "system"
          : "light";

    setColorScheme(next);
  };

  return (
    <PreferencesContext.Provider
      value={{
        viewMode,
        toggleViewMode,
        setViewMode,

        colorScheme,
        resolvedColorScheme,
        setColorScheme,
        toggleColorScheme,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
