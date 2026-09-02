import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";

import ConfirmModal from "../components/ConfirmModal";
import CropEditorModal from "../components/CropEditorModal";
import { CustomHeader } from "../components/CustomHeader";
import SignInForm from "../components/Forms/SignInForm";
import SignUpForm, { type SignupData } from "../components/Forms/SignUpForm";
import TabBar from "../components/TabBars/TabBar";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAuth } from "../hooks/UserHooks/useAuth";
import { formStyles } from "../styles/FormStyles";
import type { AlertConfig } from "../types/alert";
import { buildFavoriteTeamKey } from "../types/favorites";

const LOGIN_TABS = ["sign in", "sign up"] as const;

type LoginTab = (typeof LOGIN_TABS)[number];

type CropTarget = "profile" | "banner";

const SIGNUP_MAX_STEP = 4;

const SIGNUP_HEADER_TITLES: Record<number, string> = {
  0: "Create Account",
  1: "Email & Password",
  2: "Select Favorites",
  3: "Upload Images",
  4: "Review Details",
};

const INITIAL_SIGNUP_DATA: SignupData = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  favoriteTeams: [],
  favoriteSports: [],
  profileImage: null,
  bannerImage: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

function getFileName(uri: string, target: CropTarget): string {
  const filename = uri.split("/").pop()?.split("?")[0];

  if (filename && filename.includes(".")) {
    return filename;
  }

  return `${target}-${Date.now()}.jpg`;
}

function getMimeType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "heic":
    case "heif":
      return "image/heic";

    default:
      return "image/jpeg";
  }
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();

  const { login, signup } = useAuth();

  const isDark = resolvedColorScheme === "dark";

  const styles = formStyles(isDark);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [selectedTab, setSelectedTab] = useState<LoginTab>("sign in");

  const [signupStep, setSignupStep] = useState(0);

  const [signupData, setSignupData] = useState<SignupData>(INITIAL_SIGNUP_DATA);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isGridView, setIsGridView] = useState(true);

  const [isCropModalVisible, setCropModalVisible] = useState(false);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  const closeCropEditor = useCallback(() => {
    setCropModalVisible(false);
    setImageToCrop(null);
    setCropTarget(null);
  }, []);

  const openImagePickerFor = useCallback(
    async (target: CropTarget) => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });

        if (result.canceled) {
          return;
        }

        const asset = result.assets?.[0];

        if (!asset?.uri) {
          showAlert({
            title: "Image unavailable",
            message: "The selected image could not be loaded.",
          });

          return;
        }

        setImageToCrop(asset.uri);
        setCropTarget(target);
        setCropModalVisible(true);
      } catch (error: unknown) {
        showAlert({
          title: "Couldn’t open photos",
          message: getErrorMessage(
            error,
            "Your photo library could not be opened. Please try again.",
          ),
        });
      }
    },
    [showAlert],
  );

  const onImageCropped = useCallback(
    (croppedUri: string) => {
      if (!cropTarget) {
        closeCropEditor();
        return;
      }

      setSignupData((previous) => {
        if (cropTarget === "profile") {
          return {
            ...previous,
            profileImage: croppedUri,
          };
        }

        return {
          ...previous,
          bannerImage: croppedUri,
        };
      });

      closeCropEditor();
    },
    [closeCropEditor, cropTarget],
  );

  const handleLogin = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
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

      await login(normalizedUsername, password);
    } catch (error: unknown) {
      showAlert({
        title: "Login failed",
        message: getErrorMessage(
          error,
          "Something went wrong. Please try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, login, password, showAlert, username]);

  const appendImage = useCallback(
    (formData: FormData, uri: string | null, target: CropTarget) => {
      if (!uri) {
        return;
      }

      const filename = getFileName(uri, target);

      const fieldName = target === "profile" ? "profileImage" : "bannerImage";

      const file = {
        uri,
        name: filename,
        type: getMimeType(filename),
      };

      formData.append(fieldName, file as unknown as Blob);
    },
    [],
  );

  const handleSignup = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const fullName = signupData.fullName.trim();

    const username = signupData.username.trim().toLowerCase();

    const email = signupData.email.trim().toLowerCase();

    if (!fullName) {
      showAlert({
        title: "Name required",
        message: "Please enter your name.",
      });

      return;
    }

    if (!username) {
      showAlert({
        title: "Username required",
        message: "Please enter a username.",
      });

      return;
    }

    if (!email) {
      showAlert({
        title: "Email required",
        message: "Please enter your email address.",
      });

      return;
    }

    if (!signupData.password) {
      showAlert({
        title: "Password required",
        message: "Please enter a password.",
      });

      return;
    }

    if (!signupData.confirmPassword) {
      showAlert({
        title: "Confirm password",
        message: "Please confirm your password.",
      });

      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      showAlert({
        title: "Passwords don’t match",
        message: "Make sure both password fields match.",
      });

      return;
    }

    const formData = new FormData();

    formData.append("fullName", fullName);

    formData.append("username", username);

    formData.append("email", email);

    formData.append("password", signupData.password);

    formData.append("favoriteTeams", JSON.stringify(signupData.favoriteTeams));

    formData.append(
      "favoriteSports",
      JSON.stringify(signupData.favoriteSports),
    );

    appendImage(formData, signupData.profileImage, "profile");

    appendImage(formData, signupData.bannerImage, "banner");

    try {
      setIsSubmitting(true);

      await signup(formData);
    } catch (error: unknown) {
      showAlert({
        title: "Signup failed",
        message: getErrorMessage(
          error,
          "Your account could not be created. Please try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [appendImage, isSubmitting, showAlert, signup, signupData]);

  const handleToggleFavorite = useCallback((league: string, id: string) => {
    const key = buildFavoriteTeamKey(league, id);

    if (!key) {
      return;
    }

    setSignupData((previous) => {
      const isFavorite = previous.favoriteTeams.includes(key);

      return {
        ...previous,

        favoriteTeams: isFavorite
          ? previous.favoriteTeams.filter((favorite) => favorite !== key)
          : [...previous.favoriteTeams, key],
      };
    });
  }, []);

  const toggleLayout = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setIsGridView((previous) => !previous);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const handleMainTabPress = useCallback((tab: LoginTab) => {
    setSelectedTab(tab);
    setSignupStep(0);
  }, []);

  const handleNextSignupStep = useCallback(() => {
    setSignupStep((current) => Math.min(current + 1, SIGNUP_MAX_STEP));
  }, []);

  const handlePreviousSignupStep = useCallback(() => {
    setSignupStep((current) => Math.max(current - 1, 0));
  }, []);

  const handleHeaderBack = useCallback(() => {
    if (selectedTab === "sign up" && signupStep > 0) {
      handlePreviousSignupStep();
      return;
    }

    router.back();
  }, [handlePreviousSignupStep, router, selectedTab, signupStep]);

  useLayoutEffect(() => {
    const isSignup = selectedTab === "sign up";

    const showBackButton = !(
      selectedTab === "sign in" ||
      (isSignup && signupStep === 0)
    );

    const showLayoutToggle = isSignup && signupStep === 2;

    const headerTitle =
      selectedTab === "sign in"
        ? "Sign In"
        : (SIGNUP_HEADER_TITLES[signupStep] ?? "Sign Up");

    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={headerTitle}
          tabName="Login"
          onBack={handleHeaderBack}
          isGrid={isGridView}
          onToggleLayout={showLayoutToggle ? toggleLayout : undefined}
          showBackButton={showBackButton}
        />
      ),
    });
  }, [
    handleHeaderBack,
    isGridView,
    navigation,
    selectedTab,
    signupStep,
    toggleLayout,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        {!(selectedTab === "sign up" && signupStep > 0) && (
          <View style={styles.tabBarWrapper}>
            <TabBar
              tabs={LOGIN_TABS}
              selected={selectedTab}
              onTabPress={handleMainTabPress}
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
              onToggleShowPassword={() =>
                setShowPassword((previous) => !previous)
              }
              onSubmit={handleLogin}
              onForgotPassword={() => router.push("/forgot-password")}
            />
          ) : (
            <SignUpForm
              signupData={signupData}
              signupStep={signupStep}
              onChangeSignupData={(updates) =>
                setSignupData((previous) => ({
                  ...previous,
                  ...updates,
                }))
              }
              onNextStep={handleNextSignupStep}
              onToggleFavorite={handleToggleFavorite}
              onOpenImagePickerFor={openImagePickerFor}
              isGridView={isGridView}
              fadeAnim={fadeAnim}
              isSubmitting={isSubmitting}
              onSubmit={handleSignup}
            />
          )}
        </View>

        {imageToCrop && cropTarget && (
          <CropEditorModal
            visible={isCropModalVisible}
            imageUri={imageToCrop}
            onCancel={closeCropEditor}
            onCrop={onImageCropped}
            mode={cropTarget}
          />
        )}
      </View>

      <ConfirmModal
        visible={Boolean(alertConfig)}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        showCancel={alertConfig?.showCancel ?? Boolean(alertConfig?.cancelText)}
        confirmDisabled={alertConfig?.confirmDisabled}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={() => {
          const onConfirm = alertConfig?.onConfirm;

          if (onConfirm) {
            onConfirm();
            return;
          }

          closeAlert();
        }}
      />
    </View>
  );
}
