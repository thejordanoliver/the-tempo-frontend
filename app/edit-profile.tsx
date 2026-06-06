// screens/EditProfileScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import CropEditorModal from "../components/CropEditorModal";
import { CustomHeaderTitle } from "../components/CustomHeaderTitle";
import LabeledInput from "../components/LabeledInput";
import ProfileBanner from "../components/Profile/ProfileBanner";
import { usePreferences } from "../contexts/PreferencesContext";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { useEditProfile } from "../hooks/UserHooks/useEditProfile";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AlertConfig } from "../types/alert";

const MAX_BIO_LENGTH = 150;
const BIO_INPUT_BUFFER = 25;

type CropTarget = "profile" | "banner";
type ImageFieldName = "profileImage" | "bannerImage";

type StoredProfileData = {
  userId?: string | null;
  username?: string | null;
  fullName?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  bannerImage?: string | null;
};

type EditableImageAsset = {
  uri?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
};

type SavedProfileData = {
  full_name?: string | null;
  fullName?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  profileImage?: string | null;
  banner_image?: string | null;
  bannerImage?: string | null;
};

type ReactNativeFormDataFile = {
  uri: string;
  name: string;
  type: string;
};

const normalizeStoredValue = (value?: string | null) => {
  if (!value || value === "null" || value === "undefined") return "";
  return value;
};

const normalizeStoredImage = (value?: string | null) => {
  const normalized = normalizeStoredValue(value);
  return normalized || null;
};

const getImageMimeType = (filenameOrUri: string, mimeType?: string | null) => {
  if (mimeType) return mimeType.toLowerCase();

  const extension = filenameOrUri
    .split("?")[0]
    .split("#")[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
};

const getImageExtensionFromMime = (mimeType: string) => {
  switch (mimeType.toLowerCase()) {
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
};

const isGifAsset = (asset: EditableImageAsset) =>
  getImageMimeType(asset.fileName ?? asset.uri ?? "", asset.mimeType) ===
  "image/gif";

const isLocalImageUri = (uri: string | null): uri is string => {
  if (!uri) return false;

  return (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://")
  );
};

const getSafeUploadFileName = (
  uri: string,
  fieldName: ImageFieldName,
  mimeType: string,
) => {
  const fallbackName = `${fieldName}.${getImageExtensionFromMime(mimeType)}`;
  const rawFilename = uri.split("/").pop()?.split("?")[0]?.split("#")[0];

  if (!rawFilename) return fallbackName;

  const hasExtension = /\.[a-zA-Z0-9]+$/.test(rawFilename);
  return hasExtension ? rawFilename : fallbackName;
};

const appendLocalImageToFormData = (
  formData: FormData,
  uri: string | null,
  fieldName: ImageFieldName,
) => {
  if (!isLocalImageUri(uri)) return;

  const localUri = uri;
  const mimeType = getImageMimeType(localUri);
  const filename = getSafeUploadFileName(localUri, fieldName, mimeType);

  const file: ReactNativeFormDataFile = {
    uri: localUri,
    name: filename,
    type: mimeType,
  };

  formData.append(fieldName, file as any);
};

const getSavedProfileImage = (
  savedProfile: SavedProfileData | null | undefined,
  fallback: string | null,
) => savedProfile?.profile_image ?? savedProfile?.profileImage ?? fallback;

const getSavedBannerImage = (
  savedProfile: SavedProfileData | null | undefined,
  fallback: string | null,
) => savedProfile?.banner_image ?? savedProfile?.bannerImage ?? fallback;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const { saving, saveProfile } = useEditProfile();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [isCropModalVisible, setCropModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const trimmedFullName = useMemo(() => fullName.trim(), [fullName]);
  const trimmedBio = useMemo(() => bio.trim(), [bio]);

  const isBioTooLong = bio.length > MAX_BIO_LENGTH;
  const bioHint = isBioTooLong
    ? `Must be ${MAX_BIO_LENGTH} characters or less`
    : null;

  const canSave = Boolean(userId) && !saving && !isBioTooLong;

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  const resetCropState = useCallback(() => {
    setImageToCrop(null);
    setCropTarget(null);
    setCropModalVisible(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const pairs = await AsyncStorage.multiGet([
          "userId",
          "username",
          "fullName",
          "bio",
          "profileImage",
          "bannerImage",
        ]);

        if (!mounted) return;

        const data = Object.fromEntries(pairs) as StoredProfileData;

        setUserId(normalizeStoredValue(data.userId) || null);
        setUsername(normalizeStoredValue(data.username));
        setFullName(normalizeStoredValue(data.fullName));
        setBio(normalizeStoredValue(data.bio));
        setProfileImage(normalizeStoredImage(data.profileImage));
        setBannerImage(normalizeStoredImage(data.bannerImage));
      } catch {
        if (!mounted) return;

        showAlert({
          title: "Error",
          message: "Failed to load your profile data.",
        });
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [showAlert]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Edit Profile" onBack={handleBack} />
      ),
    });
  }, [handleBack, navigation]);

  const requestImagePermission = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showAlert({
        title: "Permission Required",
        message: "Please allow photo access to update your profile images.",
      });

      return false;
    }

    return true;
  }, [showAlert]);

  const openImagePickerFor = useCallback(
    async (target: CropTarget) => {
      try {
        const hasPermission = await requestImagePermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });

        if (result.canceled) {
          resetCropState();
          return;
        }

        const asset = result.assets?.[0];
        const uri = asset?.uri;

        if (!uri) {
          resetCropState();
          showAlert({
            title: "Error",
            message: "Could not read the selected image.",
          });

          return;
        }

        if (isGifAsset(asset)) {
          if (target === "profile") {
            setProfileImage(uri);
          } else {
            setBannerImage(uri);
          }

          resetCropState();
          return;
        }

        setImageToCrop(uri);
        setCropTarget(target);
        setCropModalVisible(true);
      } catch {
        resetCropState();
        showAlert({
          title: "Error",
          message: "Failed to open your photo library.",
        });
      }
    },
    [requestImagePermission, resetCropState, showAlert],
  );

  const handleProfileImagePress = useCallback(() => {
    openImagePickerFor("profile");
  }, [openImagePickerFor]);

  const handleBannerImagePress = useCallback(() => {
    openImagePickerFor("banner");
  }, [openImagePickerFor]);

  const handleImageCropped = useCallback(
    (croppedUri: string) => {
      if (!croppedUri) {
        resetCropState();
        showAlert({
          title: "Error",
          message: "Could not crop the selected image.",
        });
        return;
      }

      if (cropTarget === "profile") {
        setProfileImage(croppedUri);
      } else if (cropTarget === "banner") {
        setBannerImage(croppedUri);
      }

      resetCropState();
    },
    [cropTarget, resetCropState, showAlert],
  );

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return;

    if (!userId) {
      showAlert({
        title: "Error",
        message: "User ID missing.",
      });
      return;
    }

    if (isBioTooLong) {
      showAlert({
        title: "Bio Too Long",
        message: `Your bio must be ${MAX_BIO_LENGTH} characters or less.`,
      });
      return;
    }

    const formData = new FormData();

    formData.append("fullName", trimmedFullName);
    formData.append("bio", trimmedBio);

    appendLocalImageToFormData(formData, profileImage, "profileImage");
    appendLocalImageToFormData(formData, bannerImage, "bannerImage");

    if (__DEV__) {
      console.log("Edit profile save payload:", {
        userId,
        hasProfileImage: isLocalImageUri(profileImage),
        hasBannerImage: isLocalImageUri(bannerImage),
        profileImage,
        bannerImage,
      });
    }

    try {
      const updatedUser = (await saveProfile(
        userId,
        formData,
      )) as SavedProfileData;

      const nextFullName =
        updatedUser.full_name ?? updatedUser.fullName ?? trimmedFullName;
      const nextBio = updatedUser.bio ?? trimmedBio;
      const nextProfileImage = getSavedProfileImage(updatedUser, profileImage);
      const nextBannerImage = getSavedBannerImage(updatedUser, bannerImage);

      setFullName(nextFullName);
      setBio(nextBio);
      setProfileImage(nextProfileImage);
      setBannerImage(nextBannerImage);

      const storageUpdates: [string, string][] = [
        ["fullName", nextFullName],
        ["bio", nextBio],
      ];

      if (nextProfileImage) {
        storageUpdates.push(["profileImage", nextProfileImage]);
      }

      if (nextBannerImage) {
        storageUpdates.push(["bannerImage", nextBannerImage]);
      }

      await AsyncStorage.multiSet(storageUpdates);

      showAlert({
        title: "Saved",
        message: "Profile updated successfully.",
        onConfirm: () => {
          closeAlert();
          router.back();
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update your profile.";

      showAlert({
        title: "Error",
        message,
      });
    }
  }, [
    bannerImage,
    canSave,
    closeAlert,
    isBioTooLong,
    profileImage,
    router,
    saveProfile,
    saving,
    showAlert,
    trimmedBio,
    trimmedFullName,
    userId,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileBanner
          bannerImage={bannerImage}
          profileImage={profileImage}
          isDark={isDark}
          editable
          onPressBanner={handleBannerImagePress}
          onPressProfile={handleProfileImagePress}
        />

        <View style={styles.formContainer}>
          <LabeledInput
            label="Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <LabeledInput
            label="Username"
            value={username}
            editable={false}
            onChangeText={() => {}}
            autoCapitalize="none"
          />

          <LabeledInput
            label="Bio"
            value={bio}
            hint={bioHint}
            onChangeText={setBio}
            multiline
            enforceMaxLength={false}
            maxLength={MAX_BIO_LENGTH + BIO_INPUT_BUFFER}
          />

          <Button onPress={handleSave} disabled={!canSave} isDark={isDark}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </View>
      </ScrollView>

      {imageToCrop && cropTarget && (
        <CropEditorModal
          visible={isCropModalVisible}
          imageUri={imageToCrop}
          onCancel={resetCropState}
          onCrop={handleImageCropped}
          mode={cropTarget}
        />
      )}

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
          if (alertConfig?.onConfirm) {
            alertConfig.onConfirm();
            return;
          }

          closeAlert();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  formContainer: {
    paddingTop: 64,
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 14,
  },
});