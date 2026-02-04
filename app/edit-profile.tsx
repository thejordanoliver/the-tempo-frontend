import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "components/Button";
import CropEditorModal from "components/CropEditorModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import AlertModal, { AlertConfig } from "components/Forum/AlertModal";
import LabeledInput from "components/LabeledInput";
import ProfileBanner from "components/Profile/ProfileBanner";
import { Colors, Fonts } from "constants/Styles";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const MAX_BIO_LENGTH = 150;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const [userId, setUserId] = useState<string | null>(null); // new
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"profile" | "banner" | null>(
    null
  );
  const [isCropModalVisible, setCropModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
  };

  const closeAlert = () => {
    setAlertConfig(null);
  };

  // ====================== LOAD USER DATA ======================
  useEffect(() => {
    const loadData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      const storedUsername = await AsyncStorage.getItem("username");
      const storedFullName = await AsyncStorage.getItem("fullName");
      const storedEmail = await AsyncStorage.getItem("email");
      const storedBio = await AsyncStorage.getItem("bio");
      const storedProfileImage = await AsyncStorage.getItem("profileImage");
      const storedBannerImage = await AsyncStorage.getItem("bannerImage");

      if (storedId) setUserId(storedId);
      if (storedUsername) setUsername(storedUsername);
      if (storedFullName) setFullName(storedFullName);
      if (storedEmail) setEmail(storedEmail);
      if (storedBio) setBio(storedBio);
      if (storedProfileImage) setProfileImage(storedProfileImage);
      if (storedBannerImage) setBannerImage(storedBannerImage);
    };
    loadData();
  }, []);

  // ====================== HEADER ======================
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="Edit Profile" onBack={goBack} />,
    });
  }, [navigation, isDark]);

  // ====================== IMAGE PICKER ======================
  const openImagePickerFor = async (target: "profile" | "banner") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ includes GIF
      allowsEditing: false, // ❗ must be false for animated GIFs
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const isGif = uri.toLowerCase().endsWith(".gif");

      if (isGif) {
        if (target === "profile") setProfileImage(uri);
        else setBannerImage(uri);
      } else {
        setImageToCrop(uri);
        setCropTarget(target);
        setCropModalVisible(true);
      }
    }
  };

  const onImageCropped = (croppedUri: string) => {
    if (cropTarget === "profile") setProfileImage(croppedUri);
    else if (cropTarget === "banner") setBannerImage(croppedUri);

    setImageToCrop(null);
    setCropTarget(null);
    setCropModalVisible(false);
  };

  // ====================== SAVE PROFILE ======================
  const handleSave = async () => {
    if (!userId)
      return showAlert({
        title: "Error",
        message: "User ID missing",
      });

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("bio", bio);

      if (profileImage?.startsWith("file://")) {
        const filename = profileImage.split("/").pop()!;
        const ext = filename.split(".").pop()?.toLowerCase();
        const mimeType =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "png"
            ? "image/png"
            : ext === "gif"
            ? "image/gif"
            : "image/*";

        formData.append("profileImage", {
          uri: profileImage,
          name: filename,
          type: mimeType,
        } as any);
      }

      if (bannerImage?.startsWith("file://")) {
        const filename = bannerImage.split("/").pop()!;
        const ext = filename.split(".").pop()?.toLowerCase();
        const mimeType =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "png"
            ? "image/png"
            : ext === "gif"
            ? "image/gif"
            : "image/*";

        formData.append("bannerImage", {
          uri: bannerImage,
          name: filename,
          type: mimeType,
        } as any);
      }

      const res = await fetch(`${BASE_URL}/api/${userId}`, {
        method: "PATCH",
        body: formData, // no headers here!
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Profile update failed:", errText);
        throw new Error("Failed to update profile");
      }

      const data = await res.json();

      if (data.user.profile_image) setProfileImage(data.user.profile_image);
      if (data.user.banner_image) setBannerImage(data.user.banner_image);

      await AsyncStorage.setItem("fullName", data.user.full_name);
      await AsyncStorage.setItem("email", data.user.email);
      await AsyncStorage.setItem("bio", data.user.bio || "");
      await AsyncStorage.setItem("profileImage", data.user.profile_image);
      await AsyncStorage.setItem("bannerImage", data.user.banner_image);
      showAlert({
        title: "Saved",
        message: "Profile updated successfully.",
        onConfirm: () => {
          closeAlert();
          router.back();
        },
      });
    } catch (err) {
      showAlert({
        title: "Invalid details",
        message: "Failed to save profile info.",
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const styles = getStyles(isDark);

  const maxLength =
    bio.length > MAX_BIO_LENGTH ? "Must be less than 150 Words" : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          backgroundColor: isDark ? "#1d1d1d" : "#fff",
        }}
      >
        <View style={styles.container}>
          <ProfileBanner
            bannerImage={bannerImage}
            profileImage={profileImage}
            isDark={isDark}
            editable
            onPressBanner={() => openImagePickerFor("banner")}
            onPressProfile={() => openImagePickerFor("profile")}
          />

          <View style={styles.formContainer}>
            <LabeledInput
              label="Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <LabeledInput
              label="Username"
              value={username}
              editable={false}
              onChangeText={() => {}}
            />
            <LabeledInput label="Email" value={email} onChangeText={setEmail} />
            <LabeledInput
              label="Bio"
              value={bio}
              hint={maxLength}
              onChangeText={setBio}
              multiline
            />

            <Button onPress={handleSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>

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

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },
    formContainer: { paddingTop: 60, paddingHorizontal: 16 },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
    },
  });
