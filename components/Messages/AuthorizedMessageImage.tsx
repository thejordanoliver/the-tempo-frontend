import { Image, type ImageContentFit } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { getAuthorizedMessageAttachment } from "services/messageAttachmentUrls";
import type { MessageAttachment } from "types/messages";

type Props = {
  attachment: MessageAttachment;
  contentFit?: ImageContentFit;
  style: StyleProp<ImageStyle>;
};

export default function AuthorizedMessageImage({
  attachment,
  contentFit = "cover",
  style,
}: Props) {
  const [url, setUrl] = useState<string | null>(attachment.uri ?? null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(attachment.id));
  const didRetryExpiredUrlRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const loadSignedUrl = useCallback(
    async (forceRefresh = false) => {
      const requestId = ++loadRequestIdRef.current;

      if (!attachment.id) {
        setUrl(attachment.uri ?? null);
        setFailed(!attachment.uri);
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
    [attachment.id, attachment.uri],
  );

  useEffect(() => {
    didRetryExpiredUrlRef.current = false;
    setUrl(attachment.uri ?? null);
    setFailed(false);
    void loadSignedUrl(false);

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [attachment.id, attachment.uri, loadSignedUrl]);

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
      <View style={[style, localStyles.state]}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (failed || !url) {
    return (
      <View style={[style, localStyles.state]}>
        <Text style={localStyles.stateText}>Image unavailable</Text>
        <TouchableOpacity onPress={handleManualRetry} hitSlop={8}>
          <Text style={localStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri: url }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        onError={handleImageError}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, localStyles.loading]}>
          <ActivityIndicator color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000033",
  },
  retryText: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#555555",
  },
  stateText: {
    color: "#ffffff",
    fontSize: 12,
  },
});
