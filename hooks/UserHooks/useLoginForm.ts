import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { Animated } from "react-native";
import type { FavoriteSportId } from "constants/leagues";
import { useAuth } from "hooks/UserHooks/useAuth";
import {
  SIGNUP_ACCOUNT_FIELDS,
  SIGNUP_CREDENTIAL_FIELDS,
  signupSchema,
  type SignupFormValues,
} from "schemas/auth/signupSchema";
import type { AlertConfig } from "types/alert";
import { buildFavoriteTeamKey } from "types/favorites";
import {
  checkSignupAvailability,
  type SignupIdentityField,
} from "utils/apiClient";
import { getErrorMessage } from "utils/getErrorMessage";

type CropTarget = "profile" | "banner";

const SIGNUP_MAX_STEP = 4;

const INITIAL_SIGNUP_DATA: SignupFormValues = {
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

export function useLoginForm() {
  const { login, signup } = useAuth();
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [signupStep, setSignupStep] = useState(0);

  const {
    control: signupControl,
    formState: {
      isSubmitting: isSigningUp,
      isValidating: isSignupValidating,
    },
    getValues: getSignupValues,
    handleSubmit: handleSignupSubmit,
    setError: setSignupError,
    setValue: setSignupValue,
    trigger: triggerSignup,
  } = useForm<SignupFormValues>({
    defaultValues: INITIAL_SIGNUP_DATA,
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(signupSchema),
    shouldUnregister: false,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCheckingSignupAvailability, setIsCheckingSignupAvailability] =
    useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [pendingCrop, setPendingCrop] = useState<{
    uri: string;
    target: CropTarget;
  } | null>(null);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  const closeCropEditor = useCallback(() => {
    setPendingCrop(null);
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

        setPendingCrop({ uri: asset.uri, target });
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
      if (!pendingCrop) {
        closeCropEditor();
        return;
      }

      const fieldName =
        pendingCrop.target === "profile" ? "profileImage" : "bannerImage";

      setSignupValue(fieldName, croppedUri, {
        shouldDirty: true,
      });

      closeCropEditor();
    },
    [closeCropEditor, pendingCrop, setSignupValue],
  );

  const handleLogin = useCallback(async () => {
    if (isSigningIn) {
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
      setIsSigningIn(true);

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
      setIsSigningIn(false);
    }
  }, [isSigningIn, login, password, showAlert, username]);

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

  const handleSignup = useCallback(async (signupData: SignupFormValues) => {
    const formData = new FormData();
    formData.append("fullName", signupData.fullName);
    formData.append("username", signupData.username);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    formData.append("favoriteTeams", JSON.stringify(signupData.favoriteTeams));
    formData.append(
      "favoriteSports",
      JSON.stringify(signupData.favoriteSports),
    );
    appendImage(formData, signupData.profileImage, "profile");
    appendImage(formData, signupData.bannerImage, "banner");

    try {
      await signup(formData);
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Your account could not be created. Please try again.",
      );

      if (message.startsWith("Full name")) {
        setSignupError("fullName", { type: "server", message });
        setSignupStep(0);
        return;
      }

      if (message.startsWith("Username")) {
        setSignupError("username", { type: "server", message });
        setSignupStep(0);
        return;
      }

      if (
        message.startsWith("A valid email") ||
        message.startsWith("Email")
      ) {
        setSignupError("email", { type: "server", message });
        setSignupStep(1);
        return;
      }

      if (message.startsWith("Password")) {
        setSignupError("password", { type: "server", message });
        setSignupStep(1);
        return;
      }

      showAlert({
        title: "Signup failed",
        message,
      });
    }
  }, [appendImage, setSignupError, showAlert, signup]);

  const handleInvalidSignup = useCallback(
    (errors: FieldErrors<SignupFormValues>) => {
      if (errors.fullName || errors.username) {
        setSignupStep(0);
        return;
      }

      if (errors.email || errors.password || errors.confirmPassword) {
        setSignupStep(1);
      }
    },
    [],
  );

  const handleToggleFavorite = useCallback(
    (league: string, id: string) => {
      const key = buildFavoriteTeamKey(league, id);

      if (!key) {
        return;
      }

      const favorites = getSignupValues("favoriteTeams");
      const isFavorite = favorites.includes(key);

      setSignupValue(
        "favoriteTeams",
        isFavorite
          ? favorites.filter((favorite) => favorite !== key)
          : [...favorites, key],
        { shouldDirty: true },
      );
    },
    [getSignupValues, setSignupValue],
  );

  const handleToggleFavoriteSport = useCallback(
    (sport: FavoriteSportId) => {
      const favorites = getSignupValues("favoriteSports");
      const isFavorite = favorites.includes(sport);

      setSignupValue(
        "favoriteSports",
        isFavorite
          ? favorites.filter((favorite) => favorite !== sport)
          : [...favorites, sport],
        { shouldDirty: true },
      );
    },
    [getSignupValues, setSignupValue],
  );

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

  const handleNextSignupStep = useCallback(async () => {
    if (isCheckingSignupAvailability) return;

    const fields = signupStep === 0
      ? SIGNUP_ACCOUNT_FIELDS
      : signupStep === 1 ? SIGNUP_CREDENTIAL_FIELDS : null;

    if (fields && !await triggerSignup(fields, { shouldFocus: true })) return;

    const identityField: SignupIdentityField | null = signupStep === 0
      ? "username"
      : signupStep === 1 ? "email" : null;

    if (identityField) {
      try {
        setIsCheckingSignupAvailability(true);
        await checkSignupAvailability(
          identityField,
          getSignupValues(identityField),
        );
      } catch (error: unknown) {
        const message = getErrorMessage(
          error,
          "Account availability could not be checked. Please try again.",
        );

        if (
          message === "Username already exists" ||
          message === "Email already in use"
        ) {
          setSignupError(identityField, { type: "server", message });
          return;
        }

        showAlert({ title: "Couldn’t continue", message });
        return;
      } finally {
        setIsCheckingSignupAvailability(false);
      }
    }

    setSignupStep((current) => Math.min(current + 1, SIGNUP_MAX_STEP));
  }, [
    getSignupValues,
    isCheckingSignupAvailability,
    setSignupError,
    showAlert,
    signupStep,
    triggerSignup,
  ]);

  const handlePreviousSignupStep = useCallback(() => {
    setSignupStep((current) => Math.max(current - 1, 0));
  }, []);

  return {
    signIn: {
      username,
      password,
      showPassword,
      isSubmitting: isSigningIn,
      onUsernameChange: setUsername,
      onPasswordChange: setPassword,
      onToggleShowPassword: () => setShowPassword((previous) => !previous),
      onSubmit: handleLogin,
    },
    signUp: {
      control: signupControl,
      signupStep,
      onNextStep: handleNextSignupStep,
      onToggleFavorite: handleToggleFavorite,
      onToggleFavoriteSport: handleToggleFavoriteSport,
      onOpenImagePickerFor: openImagePickerFor,
      isGridView,
      fadeAnim,
      isSubmitting: isSigningUp,
      isValidating: isSignupValidating || isCheckingSignupAvailability,
      onSubmit: handleSignupSubmit(handleSignup, handleInvalidSignup),
    },
    cropEditor: pendingCrop ? {
      visible: true,
      imageUri: pendingCrop.uri,
      onCancel: closeCropEditor,
      onCrop: onImageCropped,
      mode: pendingCrop.target,
    } : null,
    alertConfig,
    closeAlert,
    previousSignupStep: handlePreviousSignupStep,
    toggleLayout,
  };
}
