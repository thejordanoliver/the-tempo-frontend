import {
  Oswald_200ExtraLight,
  Oswald_300Light,
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
  useFonts,
} from "@expo-google-fonts/oswald";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { Colors } from "constants/styles";
import { FavoriteTeamsProvider } from "contexts/FavoriteTeamsContext";
import { NotificationProvider } from "contexts/NotificationContext";
import {
  PreferencesProvider,
  usePreferences,
} from "contexts/PreferencesContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { clearAuthSession } from "utils/apiClient";
import CustomTabBar from "../components/CustomTabBar";

const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: Colors.black,
    text: Colors.white,
  },
};

const CustomLightTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    background: Colors.white,
    text: Colors.black,
  },
};

const hiddenRoutes = [
  "/news/article",
  "/highlights/video",
  "/edit-profile",
  "/edit-favorites",
  "/signup/success",
  "/settings/deleteaccountsplash",
  "/player/",
  "/settings",
  "/settings/index",
  "/login",
  "/forgot-password",
  "/comment-thread/",
];

const publicRoutes = ["/login", "/forgot-password"];

function AppLayout() {
  const pathname = usePathname();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const router = useRouter();
  const { user, loadingUser } = useAuth();
  const opacity = useRef(new Animated.Value(1)).current;
  const [visibleTabBar, setVisibleTabBar] = useState(true);
  const shouldHideTabBar = hiddenRoutes.some((r) => pathname?.startsWith(r));

  useEffect(() => {
    let isMounted = true;

    const redirectIfUnauthenticated = async () => {
      const isPublicRoute = publicRoutes.some((r) => pathname?.startsWith(r));

      if (loadingUser || user || isPublicRoute) return;

      const values = await AsyncStorage.multiGet([
        "accessToken",
        "userId",
        "username",
      ]);
      const stored: Record<string, string | null> = Object.fromEntries(values);
      const parsedUserId = stored.userId
        ? Number.parseInt(stored.userId, 10)
        : NaN;

      if (!isMounted) return;

      if (
        stored.accessToken &&
        stored.userId &&
        stored.username &&
        !Number.isNaN(parsedUserId)
      ) {
        return;
      }

      await clearAuthSession(stored.userId);

      if (isMounted) {
        router.replace("/login");
      }
    };

    redirectIfUnauthenticated();

    return () => {
      isMounted = false;
    };
  }, [user, loadingUser, pathname, router]);

  useEffect(() => {
    if (!pathname) return;
    setVisibleTabBar(!shouldHideTabBar);
  }, [pathname, shouldHideTabBar]);

  if (loadingUser) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? Colors.black : Colors.white,
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? Colors.white : Colors.black}
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Stack
        screenOptions={({ route, navigation }) => {
          const isTabScreen = route.name === "(tabs)";
          const isSplashScreen = route.name === "signup/success";
          const isProfileScreen = route.name === "profile";

          return {
            headerShown: !isSplashScreen && !isTabScreen,
            header: !isSplashScreen
              ? () => (
                  <CustomHeaderTitle
                    title={route.name}
                    onBack={
                      navigation.canGoBack() ? navigation.goBack : undefined
                    }
                  />
                )
              : undefined,
            gestureEnabled: !isTabScreen,
            animation: isProfileScreen
              ? "fade"
              : isSplashScreen
                ? "fade"
                : isTabScreen
                  ? "none"
                  : "default",
            gestureDirection: "horizontal",
          };
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Page Not Found" }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="signup/success" />
      </Stack>

      <StatusBar style={isDark ? "light" : "dark"} />

      {!shouldHideTabBar && visibleTabBar && (
        <Animated.View
          style={{
            opacity,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <CustomTabBar isDark={isDark} />
        </Animated.View>
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oswald_200ExtraLight,
    Oswald_300Light,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PreferencesProvider>
        <FavoriteTeamsProvider>
          <NotificationProvider>
            <BottomSheetModalProvider>
              <AppLayout />
            </BottomSheetModalProvider>
          </NotificationProvider>
        </FavoriteTeamsProvider>
      </PreferencesProvider>
    </GestureHandlerRootView>
  );
}
