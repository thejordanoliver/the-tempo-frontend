import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/Styles";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import PostImagesModal from "./PostImagesModal";

const screenWidth = Dimensions.get("window").width;
const PARENT_PADDING = 12;
const IMAGE_MARGIN = 6;
const NUM_COLUMNS = 2;

const IMAGE_SIZE =
  (screenWidth - PARENT_PADDING * 2 - IMAGE_MARGIN * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export type MediaItem = {
  id: string; // ✅ ADD
  uri: string;
  type: "image" | "video";
  thumbnailUri?: string; // ✅ for video preview + upload
  trimStartMs?: number; // ✅ for future trimming
  trimEndMs?: number; // ✅ for future trimming
};

type Props = {
  media: MediaItem[];
  item: {
    id: string;
    text?: string;
    likes: number;
    comments_count?: number;
    username?: string;
    profile_image: string | null;
  };
};

export default function PostImages({ media, item }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const [modalVisible, setModalVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const limitedMedia = media.slice(0, 4);
  const remainingCount = media.length - 4;

  const imageStyle =
    media.length === 1 ? styles.singlePostImage : styles.postImage;

  const containerStyle =
    media.length === 1 ? styles.singleImageWrapper : styles.imageGrid;

  return (
    <View>
      <View style={containerStyle}>
        {limitedMedia.map((m, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.9}
            onPress={() => {
              setInitialIndex(idx);
              setModalVisible(true);
            }}
            style={{
              marginLeft: idx % NUM_COLUMNS === 0 ? 0 : IMAGE_MARGIN,
              marginBottom: IMAGE_MARGIN,
            }}
          >
            <View>
              {m.type === "image" ? (
                <Image source={{ uri: m.uri }} style={imageStyle} />
              ) : (
                <>
                  <Image
                    source={{ uri: m.thumbnailUri || m.uri }}
                    style={imageStyle}
                  />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={48} color="white" />
                  </View>
                </>
              )}

              {idx === 3 && remainingCount > 0 && (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>+{remainingCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <PostImagesModal
        postId={item.id}
        visible={modalVisible}
        media={media}
        initialIndex={initialIndex}
        onClose={() => setModalVisible(false)}
        postText={item.text}
        likesCount={item.likes}
        commentsCount={item.comments_count}
        profileImage={item.profile_image}
        username={item.username}
      />
    </View>
  );
}

function getStyles(isDark: boolean) {
  return StyleSheet.create({
    singleImageWrapper: {
      width: "100%",
      marginTop: 6,
      borderRadius: 8,
      overflow: "hidden",
    },
    singlePostImage: {
      width: "100%",
      height: 250,
      borderRadius: 8,
    },
    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
    },
    postImage: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: 8,
    },
    videoPlaceholder: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: 8,
      backgroundColor: Colors.black,
      justifyContent: "center",
      alignItems: "center",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
    },
    overlayText: {
      color: Colors.white,
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
    },
    playOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.25)",
      borderRadius: 8,
    },
  });
}
