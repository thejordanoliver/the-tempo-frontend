import { useGameCardLayoutPreference } from "hooks/useGameCardLayoutPreference";
import type { GameCardLayout } from "types/preferences";
import { useLeagueLayoutPreference } from "hooks/useLeagueLayoutPreference";
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

export type ViewMode = GameCardLayout;
export type ColorSchemePreference = "light" | "dark" | "system";
export type ResolvedColorScheme = "light" | "dark";

type PreferencesContextType = ReturnType<typeof useLeagueLayoutPreference> & {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => Promise<void>;
  viewModeLoading: boolean;
  viewModeSaving: boolean;
  viewModeError: string | null;
  toggleViewMode: () => void;

  colorScheme: ColorSchemePreference;
  resolvedColorScheme: ResolvedColorScheme;
  setColorScheme: (scheme: ColorSchemePreference) => void;
  toggleColorScheme: () => void;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

const COLOR_SCHEME_KEY = "@color_scheme_preference";

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const leaguePreference = useLeagueLayoutPreference();
  const {
    gameCardLayout: viewMode,
    setGameCardLayout: setViewMode,
    gameCardLayoutLoading: viewModeLoading,
    gameCardLayoutSaving: viewModeSaving,
    gameCardLayoutError: viewModeError,
  } = useGameCardLayoutPreference();
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
        const storedTheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY);

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

  const setColorScheme = useCallback(
    (scheme: ColorSchemePreference) => {
      setColorSchemeState(scheme);
      void persistColorScheme(scheme);
    },
    [persistColorScheme],
  );

  /* ---------------- Toggles ---------------- */

  const toggleViewMode = useCallback(() => {
    const nextMode =
      viewMode === "list" ? "grid" : viewMode === "grid" ? "stacked" : "list";
    void setViewMode(nextMode);
  }, [setViewMode, viewMode]);

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
      ...leaguePreference,
      viewMode,
      viewModeLoading,
      viewModeSaving,
      viewModeError,
      setViewMode,
      toggleViewMode,
      colorScheme,
      resolvedColorScheme,
      setColorScheme,
      toggleColorScheme,
    }),
    [
      leaguePreference,
      colorScheme,
      resolvedColorScheme,
      setColorScheme,
      setViewMode,
      toggleColorScheme,
      toggleViewMode,
      viewMode,
      viewModeLoading,
      viewModeSaving,
      viewModeError,
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
