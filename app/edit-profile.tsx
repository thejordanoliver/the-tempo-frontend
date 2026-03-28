// screens/EditProfileScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "components/Button";
import CropEditorModal from "components/CropEditorModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import AlertModal, { AlertConfig } from "components/Forum/AlertModal";
import LabeledInput from "components/LabeledInput";
import ProfileBanner from "components/Profile/ProfileBanner";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { useEditProfile } from "hooks/UserHooks/useEditProfile";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const MAX_BIO_LENGTH = 150;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const { saving, saveProfile } = useEditProfile();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"profile" | "banner" | null>(null);
  const [isCropModalVisible, setCropModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const closeAlert = () => setAlertConfig(null);

  // ====================== LOAD USER DATA ======================
  useEffect(() => {
    const loadData = async () => {
      const pairs = await AsyncStorage.multiGet([
        "userId",
        "username",
        "fullName",
        "bio",
        "profileImage",
        "bannerImage",
      ]);

      const data = Object.fromEntries(pairs);

      if (data.userId) setUserId(data.userId);
      if (data.username) setUsername(data.username);
      if (data.fullName) setFullName(data.fullName);
      if (data.bio) setBio(data.bio);
      if (data.profileImage) setProfileImage(data.profileImage);
      if (data.bannerImage) setBannerImage(data.bannerImage);
    };

    loadData();
  }, []);

  // ====================== HEADER ======================
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Edit Profile" onBack={() => router.back()} />
      ),
    });
  }, [navigation, isDark]);

  // ====================== IMAGE PICKER ======================
  const openImagePickerFor = async (target: "profile" | "banner") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
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
    if (!userId) {
      return showAlert({ title: "Error", message: "User ID missing" });
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("bio", bio);

    const appendImage = (uri: string | null, fieldName: string) => {
      if (!uri?.startsWith("file://")) return;
      const filename = uri.split("/").pop()!;
      const ext = filename.split(".").pop()?.toLowerCase();
      const mimeType =
        ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
        ext === "png" ? "image/png" :
        ext === "gif" ? "image/gif" :
        "image/*";
      formData.append(fieldName, { uri, name: filename, type: mimeType } as any);
    };

    appendImage(profileImage, "profileImage");
    appendImage(bannerImage, "bannerImage");

    try {
      const updatedUser = await saveProfile(userId, formData);

      if (updatedUser.profile_image) setProfileImage(updatedUser.profile_image);
      if (updatedUser.banner_image) setBannerImage(updatedUser.banner_image);

      showAlert({
        title: "Saved",
        message: "Profile updated successfully.",
        onConfirm: () => {
          closeAlert();
          router.back();
        },
      });
    } catch (err: any) {
      showAlert({ title: "Error", message: err.message });
    }
  };

  const bioHint =
    bio.length > MAX_BIO_LENGTH ? "Must be less than 150 characters" : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.contentContainerStyle}>
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
            <LabeledInput
              label="Bio"
              value={bio}
              hint={bioHint}
              onChangeText={setBio}
              multiline
            />

            <Button onPress={handleSave} disabled={saving} isDark={isDark} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainerStyle: { paddingBottom: 40 },
  formContainer: { paddingTop: 60, paddingHorizontal: 12 },
});