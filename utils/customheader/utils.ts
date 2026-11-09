import type { ImageSourcePropType } from "react-native";

export const FALLBACK_MESSAGE_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

export function resolveImage(source: unknown): ImageSourcePropType | undefined {
  if (!source) {
    return undefined;
  }

  if (typeof source === "number") {
    return source;
  }

  if (typeof source === "string") {
    return {
      uri: source,
    };
  }

  if (Array.isArray(source)) {
    return resolveImage(source[0]);
  }

  if (typeof source === "object") {
    const imageSource = source as {
      uri?: unknown;
      href?: unknown;
      url?: unknown;
      src?: unknown;
    };

    if (imageSource.uri) {
      return source as ImageSourcePropType;
    }

    if (typeof imageSource.href === "string") {
      return {
        uri: imageSource.href,
      };
    }

    if (typeof imageSource.url === "string") {
      return {
        uri: imageSource.url,
      };
    }

    if (typeof imageSource.src === "string") {
      return {
        uri: imageSource.src,
      };
    }
  }

  return undefined;
}
