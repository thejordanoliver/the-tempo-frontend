import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const styles = useMemo(() => attachmentMenuStyles(isDark), [isDark]);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
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
  }, [opacity, scale, translateY, visible]);

  const handlePickImage = useCallback(() => {
    onPickImage();
  }, [onPickImage]);

  const handleOpenGifPicker = useCallback(() => {
    onOpenGifPicker();
  }, [onOpenGifPicker]);

  if (!shouldRender) return null;

  return (
    <Animated.View
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

const attachmentMenuStyles = (isDark: boolean) =>
  StyleSheet.create({
    menu: {
      position: "absolute",
      left: -4,
      bottom: 50,
      width: 250,
      minHeight: 142,
      zIndex: 100,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
      overflow: "visible",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      shadowColor: Colors.black,
      shadowOpacity: 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 20,
    },

    pointerDiamond: {
      position: "absolute",
      left: 21,
      bottom: -7,
      width: 14,
      height: 14,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      transform: [{ rotate: "45deg" }],
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    textWrap: {
      flex: 1,
    },

    itemTitle: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    itemSubtitle: {
      marginTop: 2,
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    separator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 61,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
