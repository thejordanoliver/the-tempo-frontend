import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  getSportsLiveSubscriptionLocalKey,
  subscribeSportsLive,
} from "services/liveSportsSocket";
import type {
  LiveGameSubscriptionInput,
  LiveScoreboardSubscriptionInput,
  LiveSubscriptionKind,
  LiveUpdateEnvelope,
} from "types/liveSports";

type UseLiveSportsSubscriptionOptions<TPayload> = {
  enabled?: boolean;
  kind: LiveSubscriptionKind;
  payload: LiveGameSubscriptionInput | LiveScoreboardSubscriptionInput;
  onUpdate: (payload: TPayload, envelope: LiveUpdateEnvelope<TPayload>) => void;
  /** Silently reload retained data when a screen rejoins this feed. */
  onResume?: () => void;
};

export function useLiveSportsSubscription<TPayload = unknown>({
  enabled = true,
  kind,
  payload,
  onUpdate,
  onResume,
}: UseLiveSportsSubscriptionOptions<TPayload>) {
  const onUpdateRef = useRef(onUpdate);
  const onResumeRef = useRef(onResume);
  const previousSubscriptionKey = useRef<string | null>(null);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onResumeRef.current = onResume;
  }, [onUpdate, onResume]);

  const stableSubscriptionKey = getSportsLiveSubscriptionLocalKey(
    kind,
    payload,
  );
  const payloadRef = useRef({ key: stableSubscriptionKey, payload });

  useEffect(() => {
    payloadRef.current = { key: stableSubscriptionKey, payload };
  }, [stableSubscriptionKey, payload]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;

      // The owning hook loads on mount/selection changes. A retained screen
      // needs another snapshot after missing updates while it was blurred.
      const resuming =
        previousSubscriptionKey.current === stableSubscriptionKey;
      previousSubscriptionKey.current = stableSubscriptionKey;

      let active = true;
      const unsubscribe = subscribeSportsLive<TPayload>({
        kind,
        payload: payloadRef.current.payload,
        listener: (envelope) => {
          if (active && payloadRef.current.key === stableSubscriptionKey)
            onUpdateRef.current(envelope.payload, envelope);
        },
      });
      if (resuming) onResumeRef.current?.();

      return () => {
        active = false;
        unsubscribe();
      };
    }, [enabled, kind, stableSubscriptionKey]),
  );
}
