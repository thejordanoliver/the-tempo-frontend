// login.tsx
import ConfirmModal from "components/ConfirmModal";
import CropEditorModal from "components/CropEditorModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import SignInForm from "components/Forms/SignInForm";
import SignUpForm from "components/Forms/SignUpForm";
import TabBar from "components/TabBars/TabBar";
import { usePreferences } from "contexts/PreferencesContext";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { formStyles } from "styles/FormStyles";
import { AlertConfig } from "types/alert";
import { LeagueType } from "types/types";

const SIGNUP_HEADER_TITLES: Record<number, string> = {
  0: "Create Account",
  1: "Email & Password",
  2: "Select Favorite Teams",
  3: "Upload Images",
  4: "Review Details",
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = formStyles(isDark);

  const { login, signup } = useAuth();

  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const closeAlert = () => setAlertConfig(null);

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

  const getLoginErrorMessage = (err: any) => {
    if (err?.code === "USERNAME_NOT_FOUND") {
      return "Username does not exist.";
    }

    if (err?.code === "WRONG_PASSWORD") {
      return "Wrong password.";
    }

    const message = String(err?.message || "").toLowerCase();

    if (message.includes("username") || message.includes("does not exist")) {
      return "Username does not exist.";
    }

    if (message.includes("password")) {
      return "Wrong password.";
    }

    if (message.includes("invalid credentials")) {
      return "Username or password is incorrect.";
    }

    return err?.message || "Something went wrong. Please try again.";
  };

  const handleLogin = async () => {
    const trimmedUsername = username?.trim().toLowerCase();

    if (!trimmedUsername) {
      showAlert({
        title: "Username required",
        message: "Please enter your username.",
      });
      return;
    }

    if (!password) {
      showAlert({
        title: "Password required",
        message: "Please enter your password.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmedUsername, password);
    } catch (err: any) {
      showAlert({
        title: "Login failed",
        message: getLoginErrorMessage(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
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
      return;
    }

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

      formData.append(name, {
        uri,
        name: filename,
        type: mimeType,
      } as any);
    };

    appendImage(profileImage, "profileImage");
    appendImage(bannerImage, "bannerImage");

    try {
      setIsSubmitting(true);
      await signup(formData);
    } catch (err: any) {
      showAlert({
        title: "Signup failed",
        message: err.message ?? "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const toggleLayout = useCallback(() => {
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
  }, [fadeAnim]);

  useLayoutEffect(() => {
    const showBackButton = !(
      selectedTab === "sign in" ||
      (selectedTab === "sign up" && signupStep === 0)
    );

    const headerTitle =
      selectedTab === "sign in"
        ? "Sign In"
        : SIGNUP_HEADER_TITLES[signupStep] || "Sign Up";

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title={headerTitle}
          tabName="Login"
          onBack={() => {
            if (selectedTab === "sign up" && signupStep > 0) {
              setSignupStep((prev) => prev - 1);
            } else {
              router.back();
            }
          }}
          isGrid={isGridView}
          onToggleLayout={signupStep === 2 ? toggleLayout : undefined}
          showBackButton={showBackButton}
        />
      ),
    });
  }, [navigation, router, selectedTab, signupStep, isGridView, toggleLayout]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        {!(selectedTab === "sign up" && signupStep > 0) && (
          <View style={styles.tabBarWrapper}>
            <TabBar
              tabs={tabs}
              selected={selectedTab}
              onTabPress={(tab) => {
                setSelectedTab(tab);
                setSignupStep(0);
              }}
              isDark={isDark}
            />
          </View>
        )}

        <View style={styles.sectionContainer}>
          {selectedTab === "sign in" ? (
            <SignInForm
              username={username}
              password={password}
              showPassword={showPassword}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onToggleShowPassword={() => setShowPassword((p) => !p)}
              onSubmit={handleLogin}
              onForgotPassword={() => router.push("/forgot-password")}
            />
          ) : (
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
              isSubmitting={isSubmitting}
              onSubmit={handleSignup}
              selectedTab={selectedTab}
            />
          )}
        </View>

        {imageToCrop && cropTarget && (
          <CropEditorModal
            visible={isCropModalVisible}
            imageUri={imageToCrop}
            onCancel={() => setCropModalVisible(false)}
            onCrop={onImageCropped}
            mode={cropTarget}
          />
        )}
      </View>

      <ConfirmModal
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        showCancel={alertConfig?.showCancel ?? !!alertConfig?.cancelText}
        confirmDisabled={alertConfig?.confirmDisabled}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          if (!alertConfig?.onConfirm) closeAlert();
        }}
      />
    </View>
  );
}
