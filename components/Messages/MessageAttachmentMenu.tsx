import { AttachmentMenuStyles } from "@/styles/MessageStyles/AttachmentMenuStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity } from "constants/styles";
import { useReducedMotion } from "hooks/useReducedMotion";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  isDark: boolean;
  onPickImage: () => void;
  onOpenGifPicker: () => void;
};

function MessageAttachmentMenu({
  visible,
  isDark,
  onPickImage,
  onOpenGifPicker,
}: Props) {
  const reduceMotion = useReducedMotion();
  const styles = useMemo(() => AttachmentMenuStyles(isDark), [isDark]);

  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.94));
  const [translateY] = useState(() => new Animated.Value(8));

  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (reduceMotion) {
        opacity.stopAnimation();
        scale.stopAnimation();
        translateY.stopAnimation();
        opacity.setValue(visible ? 1 : 0);
        scale.setValue(1);
        translateY.setValue(0);
        setShouldRender(visible);
        return;
      }

      if (visible) {
        setShouldRender(true);

        opacity.setValue(0);
        scale.setValue(0.94);
        translateY.setValue(8);

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            damping: 16,
            stiffness: 220,
            mass: 0.75,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            damping: 16,
            stiffness: 220,
            mass: 0.75,
            useNativeDriver: true,
          }),
        ]).start();

        return;
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 8,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [opacity, scale, translateY, visible, reduceMotion]);

  const handlePickImage = useCallback(() => {
    onPickImage();
  }, [onPickImage]);

  const handleOpenGifPicker = useCallback(() => {
    onOpenGifPicker();
  }, [onOpenGifPicker]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      aria-hidden={!visible}
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.menu,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Add a photo from your library"
        onPress={handlePickImage}
        style={styles.menuItem}
        activeOpacity={activeOpacity}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name="image-outline"
            size={21}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.itemTitle}>Photo Library</Text>
          <Text style={styles.itemSubtitle}>Add image from phone</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Search for a GIF"
        onPress={handleOpenGifPicker}
        style={styles.menuItem}
        activeOpacity={activeOpacity}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name="images-outline"
            size={21}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.itemTitle}>GIF</Text>
          <Text style={styles.itemSubtitle}>Search Giphy</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(MessageAttachmentMenu);
