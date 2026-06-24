import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";

type Props = {
  visible: boolean;
  videoUri: string;
  initialThumbnailUri?: string;
  initialTrimStartMs?: number;
  initialTrimEndMs?: number;
  onClose: () => void;
  onSave: (payload: {
    thumbnailUri: string;
    trimStartMs: number;
    trimEndMs: number;
  }) => void;
};

export default function VideoEditorModal({
  visible,
  videoUri,
  initialThumbnailUri,
  initialTrimStartMs = 0,
  initialTrimEndMs,
  onClose,
  onSave,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  const videoRef = useRef<Video>(null);
  const [videoReady, setVideoReady] = useState(false);

  const [durationMs, setDurationMs] = useState(0);
  const [trimStartMs, setTrimStartMs] = useState(initialTrimStartMs);
  const [trimEndMs, setTrimEndMs] = useState(initialTrimEndMs ?? 0);
  const [thumbTimeMs, setThumbTimeMs] = useState(initialTrimStartMs);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(
    initialThumbnailUri ?? null,
  );
  const [thumbnailChanged, setThumbnailChanged] = useState(false);

  // --- Reset state when opening ---
  useEffect(() => {
    if (!visible) return;

    setTrimStartMs(initialTrimStartMs);
    setTrimEndMs(initialTrimEndMs ?? 0);
    setThumbTimeMs(initialTrimStartMs);
    setThumbnailUri(initialThumbnailUri ?? null);
    setThumbnailChanged(false); // ✅ reset
  }, [
    initialThumbnailUri,
    initialTrimEndMs,
    initialTrimStartMs,
    videoUri,
    visible,
  ]);

  const maxEnd = useMemo(() => (durationMs > 0 ? durationMs : 1), [durationMs]);

  // --- Thumbnail generation (explicit only) ---
  const captureThumbnail = async (timeMs: number) => {
    if (!durationMs || durationMs <= 1) return;

    const safeTime = Math.floor(
      Math.min(Math.max(timeMs, 0), Math.max(durationMs - 200, 0)),
    ); // ✅ FORCE INT

    try {
      await videoRef.current?.pauseAsync();
      await new Promise((r) => setTimeout(r, 150));

      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: safeTime, // ✅ always Int64
      });

      setThumbnailUri(uri);
      setThumbnailChanged(true); // ✅ mark as user-selected
    } catch (e) {
      console.warn("Thumbnail capture failed", e);
      Alert.alert(
        "Thumbnail Error",
        "Could not generate thumbnail from this video.",
      );
    }
  };

  // --- Video seek ---
  const scrubTo = async (ms: number) => {
    try {
      await videoRef.current?.setPositionAsync(ms, {
        toleranceMillisBefore: 0,
        toleranceMillisAfter: 0,
      });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit video</Text>

            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                if (!thumbnailUri) {
                  Alert.alert(
                    "Pick a thumbnail",
                    "Tap “Set thumbnail” before saving.",
                  );
                  return;
                }

                onSave({
                  thumbnailUri,
                  trimStartMs,
                  trimEndMs: trimEndMs || maxEnd,
                });

                onClose();
              }}
            >
              <Text style={styles.save}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* VIDEO */}
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            onLoad={(status) => {
              const s = status as AVPlaybackStatusSuccess;
              if (!s.isLoaded || !s.durationMillis) return;

              setDurationMs(s.durationMillis);
              setTrimEndMs((prev) => (prev > 0 ? prev : s.durationMillis!));
              setVideoReady(true);
            }}
          />

          {/* TRIM */}
          <Text style={styles.sectionTitle}>Trim</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Start</Text>
            <Text style={styles.value}>{Math.floor(trimStartMs / 1000)}s</Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={durationMs || 1}
            value={trimStartMs}
            onValueChange={(v) => {
              const ms = Math.floor(v);
              setThumbTimeMs(ms);
              scrubTo(ms);
            }}
          />

          <View style={styles.row}>
            <Text style={styles.label}>End</Text>
            <Text style={styles.value}>
              {Math.floor((trimEndMs || maxEnd) / 1000)}s
            </Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={durationMs || 1}
            value={trimEndMs || maxEnd}
            onValueChange={(v) => {
              const ms = Math.floor(v);
              setThumbTimeMs(ms);
              scrubTo(ms);
            }}
          />

          {/* THUMBNAIL */}
          <Text style={styles.sectionTitle}>Thumbnail</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Frame time</Text>
            <Text style={styles.value}>{Math.floor(thumbTimeMs / 1000)}s</Text>
          </View>

          <Slider
            minimumValue={0}
            maximumValue={durationMs || 1}
            value={thumbTimeMs}
            onValueChange={(v) => {
              const ms = Math.floor(v);
              setThumbTimeMs(ms);
              scrubTo(ms);
            }}
          />

          <TouchableOpacity
            style={[styles.thumbBtn, !videoReady && { opacity: 0.5 }]}
            disabled={!videoReady}
            onPress={async () => {
              await scrubTo(thumbTimeMs);
              await captureThumbnail(thumbTimeMs);
            }}
          >
            <Ionicons name="image-outline" size={18} color={Colors.white} />
            <Text style={styles.thumbBtnText}>Set thumbnail</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            {thumbnailChanged
              ? "Thumbnail selected ✅"
              : "Pick a frame for your thumbnail"}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function getStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      overflow: "hidden",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    wrapper: {
      padding: 12,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 20,
    },
    headerBtn: { padding: 8 },
    headerTitle: {
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    save: {
      color: Colors.white,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 18,
    },
    video: {
      width: "100%",
      height: 220,
      borderRadius: 12,
    },
    sectionTitle: {
      marginTop: 12,
      marginBottom: 6,
      color: Colors.white,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    label: {
      color: Colors.lightGray,
      fontFamily: Fonts.OSREGULAR,
    },
    value: {
      color: Colors.white,
      fontFamily: Fonts.OSREGULAR,
    },
    thumbBtn: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.25)",
    },
    thumbBtnText: {
      color: Colors.white,
      fontFamily: Fonts.OSREGULAR,
    },
    note: {
      marginTop: 8,
      color: Colors.lightGray,
      fontFamily: Fonts.OSREGULAR,
    },
  });
}
