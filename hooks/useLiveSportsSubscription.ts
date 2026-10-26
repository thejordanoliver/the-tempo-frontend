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
};

export function useLiveSportsSubscription<TPayload = unknown>({
  enabled = true,
  kind,
  payload,
  onUpdate,
}: UseLiveSportsSubscriptionOptions<TPayload>) {
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

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

      let active = true;
      const unsubscribe = subscribeSportsLive<TPayload>({
        kind,
        payload: payloadRef.current.payload,
        listener: (envelope) => {
          if (active && payloadRef.current.key === stableSubscriptionKey)
            onUpdateRef.current(envelope.payload, envelope);
        },
      });

      return () => {
        active = false;
        unsubscribe();
      };
    }, [enabled, kind, stableSubscriptionKey]),
  );
}
