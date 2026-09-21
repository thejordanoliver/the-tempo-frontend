import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

export type ViewMode = "list" | "grid" | "stacked";
export type ColorSchemePreference = "light" | "dark" | "system";
export type ResolvedColorScheme = "light" | "dark";

type PreferencesContextType = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  colorScheme: ColorSchemePreference;
  resolvedColorScheme: ResolvedColorScheme;
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

  const [systemScheme, setSystemScheme] = useState<ResolvedColorScheme>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => listener.remove();
  }, []);

  const resolvedColorScheme: ResolvedColorScheme =
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

    void load();
  }, []);

  /* ---------------- Persist helpers ---------------- */

  const persistViewMode = useCallback(async (mode: ViewMode) => {
    try {
      await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
    } catch (e) {
      console.warn("Failed to save view mode:", e);
    }
  }, []);

  const persistColorScheme = useCallback(
    async (scheme: ColorSchemePreference) => {
      try {
        await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
      } catch (e) {
        console.warn("Failed to save color scheme:", e);
      }
    },
    [],
  );

  /* ---------------- Setters ---------------- */

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);
      void persistViewMode(mode);
    },
    [persistViewMode],
  );

  const setColorScheme = useCallback(
    (scheme: ColorSchemePreference) => {
      setColorSchemeState(scheme);
      void persistColorScheme(scheme);
    },
    [persistColorScheme],
  );

  /* ---------------- Toggles ---------------- */

  const toggleViewMode = useCallback(() => {
    setViewModeState((currentMode) => {
      const nextMode =
        currentMode === "list"
          ? "grid"
          : currentMode === "grid"
            ? "stacked"
            : "list";

      void persistViewMode(nextMode);
      return nextMode;
    });
  }, [persistViewMode]);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((currentScheme) => {
      const nextScheme: ColorSchemePreference =
        currentScheme === "light"
          ? "dark"
          : currentScheme === "dark"
            ? "system"
            : "light";

      void persistColorScheme(nextScheme);
      return nextScheme;
    });
  }, [persistColorScheme]);

  const value = useMemo<PreferencesContextType>(
    () => ({
      viewMode,
      setViewMode,
      toggleViewMode,
      colorScheme,
      resolvedColorScheme,
      setColorScheme,
      toggleColorScheme,
    }),
    [
      colorScheme,
      resolvedColorScheme,
      setColorScheme,
      setViewMode,
      toggleColorScheme,
      toggleViewMode,
      viewMode,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
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
