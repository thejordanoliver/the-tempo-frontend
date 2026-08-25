import { useEffect, useRef } from "react";
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

  onUpdateRef.current = onUpdate;

  const payloadRef = useRef(payload);
  const stableSubscriptionKey = getSportsLiveSubscriptionLocalKey(
    kind,
    payload,
  );

  useEffect(() => {
    payloadRef.current = payload;
  }, [stableSubscriptionKey, payload]);

  useEffect(() => {
    if (!enabled) return undefined;

    return subscribeSportsLive<TPayload>({
      kind,
      payload: payloadRef.current,
      listener: (envelope) => {
        onUpdateRef.current(envelope.payload, envelope);
      },
    });
  }, [enabled, kind, stableSubscriptionKey]);
}
