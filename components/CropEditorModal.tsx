import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import * as ImageManipulator from "expo-image-manipulator";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { cropEditorModalStyles } from "styles/ModalsStyles/CropEditorModalStyles";

// ============================================================================
// Types
// ============================================================================

type CropEditorModalProps = {
  visible: boolean;
  imageUri: string;
  onCancel: () => void;
  onCrop: (uri: string) => void;
  aspectRatio: number;
  mode: "profile" | "banner" | "post";
};

type Coordinate = { x: number; y: number };

// ============================================================================
// Constants
// ============================================================================

const BANNER_HEIGHT = 100;
const PROFILE_PIC_SIZE = 300;
const MAX_SCALE = 4;
const MIN_SCALE = 1;

const POST_WIDTH = 1080;
const POST_HEIGHT = 1350;

// ============================================================================
// Component
// ============================================================================

export default function CropEditorModal({
  visible,
  imageUri,
  onCancel,
  onCrop,
  aspectRatio,
  mode,
}: CropEditorModalProps) {
  const windowWidth = Dimensions.get("window").width;
  const isDark = useColorScheme() === "dark";

  const isProfile = mode === "profile";
  const isBanner = mode === "banner";
  const isPost = mode === "post";

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displayedImageSize, setDisplayedImageSize] = useState({
    width: 0,
    height: 0,
  });

  // --------------------------------------------------------------------------
  // Refs
  // --------------------------------------------------------------------------
  const lastScale = useRef(MIN_SCALE);
  const currentScale = useRef(MIN_SCALE);

  const lastOffset = useRef<Coordinate>({ x: 0, y: 0 });
  const currentOffset = useRef<Coordinate>({ x: 0, y: 0 });
  const gestureStartOffset = useRef<Coordinate>({ x: 0, y: 0 });

  const initialDistance = useRef(0);
  const rotation = useRef(0);

  // --------------------------------------------------------------------------
  // Animated values
  // --------------------------------------------------------------------------
  const animatedOffset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animatedScale = useRef(new Animated.Value(MIN_SCALE)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  // --------------------------------------------------------------------------
  // Crop box size
  // --------------------------------------------------------------------------
  let cropWidth = windowWidth * 0.9;
  let cropHeight = cropWidth / aspectRatio;

  if (isProfile) {
    cropWidth = PROFILE_PIC_SIZE;
    cropHeight = PROFILE_PIC_SIZE;
  } else if (isBanner) {
    cropHeight = BANNER_HEIGHT;
  } else if (isPost) {
    cropWidth = Math.min(windowWidth * 0.9, POST_WIDTH);
    cropHeight = (cropWidth * POST_HEIGHT) / POST_WIDTH;
  }

  const styles = cropEditorModalStyles(
    isDark,
    isProfile,
    cropWidth,
    cropHeight,
  );

  // --------------------------------------------------------------------------
  // Load image size
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!imageUri) return;
    Image.getSize(
      imageUri,
      (width, height) => setImageSize({ width, height }),
      () => Alert.alert("Error", "Could not load image"),
    );
  }, [imageUri]);

  // --------------------------------------------------------------------------
  // Displayed image size (cover)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!imageSize) return;

    const imageRatio = imageSize.width / imageSize.height;
    const cropRatio = cropWidth / cropHeight;

    let width: number;
    let height: number;

    if (imageRatio > cropRatio) {
      height = cropHeight;
      width = height * imageRatio;
    } else {
      width = cropWidth;
      height = width / imageRatio;
    }

    setDisplayedImageSize({ width, height });
  }, [imageSize, cropWidth, cropHeight]);

  // --------------------------------------------------------------------------
  // Min scale (rotation-aware)
  // --------------------------------------------------------------------------
  const minScale = useMemo(() => {
    if (!displayedImageSize.width) return MIN_SCALE;

    const rot = rotation.current;
    const baseWidth =
      rot % 180 === 0 ? displayedImageSize.width : displayedImageSize.height;
    const baseHeight =
      rot % 180 === 0 ? displayedImageSize.height : displayedImageSize.width;

    return Math.max(cropWidth / baseWidth, cropHeight / baseHeight);
  }, [displayedImageSize, cropWidth, cropHeight]);

  // --------------------------------------------------------------------------
  // Init transforms
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!displayedImageSize.width) return;

    rotation.current = 0;

    lastScale.current = minScale;
    currentScale.current = minScale;

    lastOffset.current = { x: 0, y: 0 };
    currentOffset.current = { x: 0, y: 0 };

    animatedScale.setValue(minScale);
    animatedOffset.setValue({ x: 0, y: 0 });
    animatedRotation.setValue(0);
  }, [displayedImageSize, minScale]);

  // --------------------------------------------------------------------------
  // Clamp offset (rotation-aware)
  // --------------------------------------------------------------------------
  const clampOffset = useCallback(
    (x: number, y: number, scale: number): Coordinate => {
      const rot = rotation.current;

      const baseWidth =
        rot % 180 === 0 ? displayedImageSize.width : displayedImageSize.height;
      const baseHeight =
        rot % 180 === 0 ? displayedImageSize.height : displayedImageSize.width;

      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      const maxX = Math.max(0, (scaledWidth - cropWidth) / 2);
      const maxY = Math.max(0, (scaledHeight - cropHeight) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      };
    },
    [displayedImageSize, cropWidth, cropHeight],
  );

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const getDistance = ([a, b]: any[]) =>
    Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY);

  // --------------------------------------------------------------------------
  // PanResponder
  // --------------------------------------------------------------------------
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (evt) => {
          gestureStartOffset.current = { ...currentOffset.current };

          if (evt.nativeEvent.touches.length === 2) {
            initialDistance.current = getDistance(evt.nativeEvent.touches);
          }
        },

        onPanResponderMove: (evt, gesture) => {
          const touches = evt.nativeEvent.touches;

          // ---- PAN
          if (touches.length === 1) {
            const x = gestureStartOffset.current.x + gesture.dx;
            const y = gestureStartOffset.current.y + gesture.dy;

            const clamped = clampOffset(x, y, currentScale.current);

            currentOffset.current = clamped;
            animatedOffset.setValue(clamped);
          }

          // ---- PINCH
          if (touches.length === 2) {
            const distance = getDistance(touches);
            const scaleRatio = distance / initialDistance.current;

            const nextScale = Math.min(
              MAX_SCALE,
              Math.max(minScale, lastScale.current * scaleRatio),
            );

            const clamped = clampOffset(
              currentOffset.current.x,
              currentOffset.current.y,
              nextScale,
            );

            currentScale.current = nextScale;
            currentOffset.current = clamped;

            animatedScale.setValue(nextScale);
            animatedOffset.setValue(clamped);
          }
        },

        onPanResponderRelease: () => {
          lastOffset.current = currentOffset.current;
          lastScale.current = currentScale.current;
        },
      }),
    [clampOffset, minScale],
  );

  // --------------------------------------------------------------------------
  // Rotate 90°
  // --------------------------------------------------------------------------
  const rotate90 = useCallback(() => {
    rotation.current = (rotation.current + 90) % 360;

    const clamped = clampOffset(
      currentOffset.current.x,
      currentOffset.current.y,
      currentScale.current,
    );

    currentOffset.current = clamped;
    lastOffset.current = clamped;

    Animated.parallel([
      Animated.timing(animatedRotation, {
        toValue: rotation.current,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOffset, {
        toValue: clamped,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [clampOffset]);

  // --------------------------------------------------------------------------
  // Crop
  // --------------------------------------------------------------------------
  const handleCrop = useCallback(async () => {
    if (!imageSize) return;

    const { width: imgW, height: imgH } = imageSize;
    const scale = currentScale.current;
    const rot = rotation.current;

    const rotatedW = rot % 180 === 0 ? imgW : imgH;
    const rotatedH = rot % 180 === 0 ? imgH : imgW;

    const displayToOriginalScale =
      rotatedW / (displayedImageSize.width * scale);

    const originX =
      rotatedW / 2 -
      (cropWidth / 2) * displayToOriginalScale -
      currentOffset.current.x * displayToOriginalScale;

    const originY =
      rotatedH / 2 -
      (cropHeight / 2) * displayToOriginalScale -
      currentOffset.current.y * displayToOriginalScale;

    const actions: ImageManipulator.Action[] = [];

    if (rot !== 0) actions.push({ rotate: rot });

    actions.push({
      crop: {
        originX: Math.max(0, Math.round(originX)),
        originY: Math.max(0, Math.round(originY)),
        width: Math.round(cropWidth * displayToOriginalScale),
        height: Math.round(cropHeight * displayToOriginalScale),
      },
    });

    if (isPost) {
      actions.push({ resize: { width: POST_WIDTH, height: POST_HEIGHT } });
    }

    const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
    });

    onCrop(result.uri);
  }, [
    imageSize,
    displayedImageSize,
    cropWidth,
    cropHeight,
    isPost,
    imageUri,
    onCrop,
  ]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Pressable onPress={onCancel}>
              <Ionicons
                name="close"
                size={28}
                color={isDark ? Colors.white : Colors.black}
              />
            </Pressable>

            <Text style={styles.headerTitle}>Crop</Text>

            <Pressable onPress={rotate90}>
              <Ionicons
                name="refresh"
                size={24}
                color={isDark ? Colors.white : Colors.black}
              />
            </Pressable>

            <TouchableOpacity onPress={handleCrop}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cropContainer}>
            <View style={styles.imageContainer} {...panResponder.panHandlers}>
              <Animated.View
                style={{
                  width: displayedImageSize.width,
                  height: displayedImageSize.height,
                  transform: [
                    { translateX: animatedOffset.x },
                    { translateY: animatedOffset.y },
                    { scale: animatedScale },
                    {
                      rotate: animatedRotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: displayedImageSize.width,
                    height: displayedImageSize.height,
                  }}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
