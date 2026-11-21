import { Colors } from "@/constants/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { getAuthorizedMessageAttachment } from "services/messageAttachmentUrls";
import type { MessageAttachment } from "types/messages";
import CustomActivityIndicator from "../CustomActivityIndicator";

type Props = {
  attachment: MessageAttachment;
  resizeMode?: ImageResizeMode;
  style: StyleProp<ImageStyle>;
};

export default function AuthorizedMessageImage({
  attachment,
  resizeMode = "cover",
  style,
}: Props) {
  const styles = AuthorizedMessageImageStyles;
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(attachment.id));
  const didRetryExpiredUrlRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const loadSignedUrl = useCallback(
    async (forceRefresh = false) => {
      const requestId = ++loadRequestIdRef.current;

      if (!attachment.id) {
        setUrl(null);
        setFailed(true);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const signed = await getAuthorizedMessageAttachment(attachment.id, {
          forceRefresh,
        });
        if (loadRequestIdRef.current !== requestId) return;
        setUrl(signed.url);
        setFailed(false);
      } catch {
        if (loadRequestIdRef.current !== requestId) return;
        setFailed(true);
      } finally {
        if (loadRequestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [attachment.id],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      didRetryExpiredUrlRef.current = false;
      setUrl(null);
      setFailed(false);
      void loadSignedUrl(false);
    });

    return () => {
      cancelled = true;
      loadRequestIdRef.current += 1;
    };
  }, [attachment.id, loadSignedUrl]);

  const handleImageError = useCallback(() => {
    if (attachment.id && !didRetryExpiredUrlRef.current) {
      didRetryExpiredUrlRef.current = true;
      void loadSignedUrl(true);
      return;
    }

    setFailed(true);
  }, [attachment.id, loadSignedUrl]);

  const handleManualRetry = useCallback(() => {
    didRetryExpiredUrlRef.current = false;
    setFailed(false);
    void loadSignedUrl(Boolean(attachment.id));
  }, [attachment.id, loadSignedUrl]);

  if (loading && !url) {
    return (
      <View style={[style, styles.state]}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (failed || !url) {
    return (
      <View style={[style, styles.state]}>
        <Text style={styles.stateText}>Image unavailable</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleManualRetry}
          hitSlop={8}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[style, styles.imageContainer]}>
      <Image
        source={{ uri: url }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onError={handleImageError}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <CustomActivityIndicator />
        </View>
      )}
    </View>
  );
}

export const AuthorizedMessageImageStyles = StyleSheet.create({
  imageContainer: {
    overflow: "hidden",
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000033",
  },
  retryText: {
    marginTop: 4,
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#555555",
  },
  stateText: {
    color: Colors.white,
    fontSize: 12,
  },
});
