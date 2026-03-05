import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import AlertModal, { AlertConfig } from "components/Forum/AlertModal";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";
import PagerView from "react-native-pager-view";
import { formStyles } from "styles/FormStyles";
import CropEditorModal from "../components/CropEditorModal";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import TabBar from "../components/TabBar";
import { LeagueType, User } from "../types/types";

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = formStyles(isDark);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ====================== STATE ======================
  const tabs = ["sign in", "sign up"] as const;
  const [selectedTab, setSelectedTab] = useState<"sign in" | "sign up">(
    "sign in",
  );
  const [signupStep, setSignupStep] = useState(0);
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    favorites: [] as string[],
    profileImage: null as string | null,
    bannerImage: null as string | null,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCropModalVisible, setCropModalVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"profile" | "banner" | null>(
    null,
  );
  const [isGridView, setIsGridView] = useState(true);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const pagerRef = useRef<PagerView>(null);

  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const closeAlert = () => setAlertConfig(null);

  // ====================== IMAGE PICKER / CROP ======================
  const openImagePickerFor = async (target: "profile" | "banner") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setImageToCrop(result.assets[0].uri);
      setCropTarget(target);
      setCropModalVisible(true);
    }
  };

  const onImageCropped = (croppedUri: string) => {
    if (cropTarget === "profile") {
      setSignupData((prev) => ({ ...prev, profileImage: croppedUri }));
    } else if (cropTarget === "banner") {
      setSignupData((prev) => ({ ...prev, bannerImage: croppedUri }));
    }
    setCropModalVisible(false);
    setImageToCrop(null);
    setCropTarget(null);
  };

  // ====================== STORAGE ======================
  const safeSetItem = async (key: string, value: string | null | undefined) => {
    if (value === null || value === undefined) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  };

  const storeUserData = async (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => {
    await safeSetItem("accessToken", accessToken);
    await safeSetItem("refreshToken", refreshToken);
    await safeSetItem("userId", user.id?.toString() || null);
    await safeSetItem("username", user.username);
    await safeSetItem("fullName", user.full_name);
    await safeSetItem("email", user.email);
    await safeSetItem("profileImage", user.profile_image ?? null);
    await safeSetItem("bannerImage", user.banner_image ?? null);
    await safeSetItem("favorites", JSON.stringify(user.favorites || []));
    await safeSetItem("bio", user.bio ?? "");
    await AsyncStorage.setItem("loggedInUser", JSON.stringify(user));
  };

  // ====================== LOGIN ======================
  const handleLogin = async () => {
    const trimmedUsername = username?.trim().toLowerCase();
    if (!trimmedUsername || password.length < 4) {
      showAlert({
        title: "Invalid credentials",
        message: "Please enter a valid username and password.",
      });
      return;
    }

    try {
      const res = await axios.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(`${BASE_URL}/api/login`, { username: trimmedUsername, password });

      const { user, accessToken, refreshToken } = res.data;
      await storeUserData(user, accessToken, refreshToken);

      router.replace({
        pathname: "/(tabs)/profile",
        params: { id: user.id, token: accessToken },
      });
    } catch (err: any) {
      showAlert({
        title: "Login failed",
        message: err.response?.data?.error || err.message,
      });
    }
  };

  // ====================== SIGNUP ======================
  const handleSignupSubmit = async (): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  } | null> => {
    const {
      fullName,
      username,
      email,
      password,
      confirmPassword,
      favorites,
      profileImage,
      bannerImage,
    } = signupData;

    if (!fullName || !username || !email || password !== confirmPassword) {
      showAlert({
        title: "Invalid details",
        message: "Make sure all fields are filled and passwords match.",
      });
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("username", username.trim().toLowerCase());
      formData.append("email", email);
      formData.append("password", password);
      formData.append("favorites", JSON.stringify(favorites));

      const appendImage = (uri: string | null, name: string) => {
        if (!uri) return;
        const filename = uri.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match?.[1];
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        formData.append(name, { uri, name: filename, type: mimeType } as any);
      };

      appendImage(profileImage, "profileImage");
      appendImage(bannerImage, "bannerImage");

      const res = await axios.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(`${BASE_URL}/api/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err: any) {
      showAlert({
        title: "Signup failed",
        message: err.response?.data?.error || err.message,
      });
      return null;
    }
  };

  const handleSignup = async () => {
    const result = await handleSignupSubmit();
    if (!result) return;

    const { user, accessToken, refreshToken } = result;
    try {
      await storeUserData(user, accessToken, refreshToken);

      router.replace({
        pathname: "/(tabs)/profile",
        params: { id: user.id, token: accessToken },
      });
    } catch (err: any) {
      Alert.alert("Login failed", err.response?.data?.error || err.message);
    }
  };

  // ====================== FAVORITES ======================
  const handleToggleFavorite = (league: LeagueType, id: string) => {
    const key = `${league}:${id}`;
    setSignupData((prev) => {
      const isFavorite = prev.favorites.includes(key);
      return {
        ...prev,
        favorites: isFavorite
          ? prev.favorites.filter((f) => f !== key)
          : [...prev.favorites, key],
      };
    });
  };

  // ====================== LAYOUT TOGGLE ======================
  const toggleLayout = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsGridView((prev) => !prev);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // ====================== HEADER ======================
  const headerTitles: Record<number, string> = {
    0: "Create Account",
    1: "Email & Password",
    2: "Select Favorite Teams",
    3: "Upload Images",
    4: "Review Details",
  };

  useLayoutEffect(() => {
    const showBackButton = !(
      selectedTab === "sign in" ||
      (selectedTab === "sign up" && signupStep === 0)
    );

    const headerTitle =
      selectedTab === "sign in"
        ? "Sign In"
        : headerTitles[signupStep] || "Sign Up";

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title={headerTitle}
          tabName="Login"
          onBack={() => {
            if (selectedTab === "sign up" && signupStep > 0) {
              setSignupStep((prev) => prev - 1);
            } else {
              goBack();
            }
          }}
          isGrid={isGridView}
          onToggleLayout={signupStep === 2 ? toggleLayout : undefined}
          showBackButton={showBackButton}
        />
      ),
    });
  }, [navigation, selectedTab, signupStep, isGridView]);

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: signupStep / 4,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [signupStep]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  <View style={styles.progressBarBackground}>
    <Animated.View
      style={[styles.progressBarFill, { width: progressInterpolate }]}
    />
  </View>;

  // ====================== RENDER ======================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {!(selectedTab === "sign up" && signupStep > 0) && (
          <View style={styles.tabBarWrapper}>
            <TabBar
              tabs={tabs}
              selected={selectedTab}
              onTabPress={(tab) => {
                setSelectedTab(tab);
                setSignupStep(0);
                if (pagerRef.current) {
                  const pageIndex = tab === "sign in" ? 0 : 1;
                  pagerRef.current.setPage(pageIndex);
                }
              }}
            />
          </View>
        )}
        {/* PAGERVIEW FOR SIGN IN / SIGN UP */}
        <PagerView
          style={{ flex: 1 }}
          initialPage={selectedTab === "sign in" ? 0 : 1}
          ref={pagerRef}
          scrollEnabled={signupStep === 0 || selectedTab === "sign in"} // <-- disable swiping if signupStep > 0
          onPageSelected={(e) => {
            if (signupStep === 0) {
              setSelectedTab(
                e.nativeEvent.position === 0 ? "sign in" : "sign up",
              );
            }
          }}
        >
          {/* Sign In Page */}
          <View key="1" style={{ flex: 1 }}>
            <SignInForm
              username={username}
              password={password}
              showPassword={showPassword}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onToggleShowPassword={() => setShowPassword((p) => !p)}
              onSubmit={handleLogin}
            />
          </View>

          {/* Sign Up Page */}
          <View key="2" style={{ flex: 1 }}>
            <SignUpForm
              signupData={signupData}
              signupStep={signupStep}
              onChangeSignupData={(updates) =>
                setSignupData((prev) => ({ ...prev, ...updates }))
              }
              onNextStep={() => setSignupStep((s) => Math.min(s + 1, 4))}
              onPreviousStep={() => setSignupStep((s) => Math.max(s - 1, 0))}
              onToggleFavorite={handleToggleFavorite}
              onOpenImagePickerFor={openImagePickerFor}
              isGridView={isGridView}
              toggleLayout={toggleLayout}
              fadeAnim={fadeAnim}
              isSubmitting={isSubmitting} // ✅ ADD THIS
              onSubmit={handleSignup}
            />

     
          </View>
        </PagerView>

        {imageToCrop && cropTarget && (
          <CropEditorModal
            visible={isCropModalVisible}
            imageUri={imageToCrop}
            onCancel={() => setCropModalVisible(false)}
            onCrop={onImageCropped}
            mode={cropTarget}
            aspectRatio={cropTarget === "profile" ? 1 : 3}
          />
        )}
      </View>

      <AlertModal
        visible={!!alertConfig}
        isDark={isDark}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        onCancel={closeAlert}
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          if (!alertConfig?.onConfirm) closeAlert();
        }}
      />
    </KeyboardAvoidingView>
  );
}
