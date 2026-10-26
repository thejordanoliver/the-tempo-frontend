import { useCallback, useEffect, useRef, useState } from "react";

export type SportsRequestOptions = {
  enabled?: boolean;
  /** Isolates retained results between Home accounts; omitted by existing screens. */
  scopeKey?: string;
};

type ScopedRequest = {
  controller: AbortController;
  hasData: boolean;
  identity: string;
};

/** Shared cancellation/identity guard for the scoreboards Home already consumes. */
export function useSportsRequestScope(
  resourceKey: string,
  { enabled = true, scopeKey = "" }: SportsRequestOptions = {},
) {
  const identity = JSON.stringify([scopeKey, resourceKey]);
  const pending = useRef<ScopedRequest | null>(null);
  const active = useRef<{ identity: string; enabled: boolean } | null>(null);
  const retainedIdentity = useRef<string | null>(null);
  const [dataIdentity, setDataIdentity] = useState<string | null>(null);
  const [settledIdentity, setSettledIdentity] = useState<string | null>(null);

  const cancel = useCallback(() => {
    pending.current?.controller.abort();
    pending.current = null;
  }, []);
  const begin = useCallback(() => {
    if (
      !enabled ||
      !active.current?.enabled ||
      active.current.identity !== identity
    )
      return null;
    cancel();
    const request = {
      controller: new AbortController(),
      hasData: retainedIdentity.current === identity,
      identity,
    };
    pending.current = request;
    return request;
  }, [cancel, enabled, identity]);
  const isCurrent = useCallback(
    (request: ScopedRequest) =>
      pending.current === request &&
      !request.controller.signal.aborted &&
      active.current?.enabled === true &&
      active.current.identity === request.identity,
    [],
  );
  const accept = useCallback(
    (request?: ScopedRequest) => {
      if (
        !enabled ||
        !active.current?.enabled ||
        active.current.identity !== identity ||
        (request && !isCurrent(request))
      )
        return false;
      // A newer live snapshot supersedes any older REST request.
      if (!request) cancel();
      retainedIdentity.current = identity;
      setDataIdentity(identity);
      setSettledIdentity(identity);
      return true;
    },
    [cancel, enabled, identity, isCurrent],
  );
  const finish = useCallback(
    (request: ScopedRequest) => {
      if (!isCurrent(request)) return false;
      setSettledIdentity(identity);
      pending.current = null;
      return true;
    },
    [identity, isCurrent],
  );
  useEffect(() => {
    const scope = { identity, enabled };
    active.current = scope;
    return () => {
      if (active.current === scope) {
        active.current = null;
        cancel();
      }
    };
  }, [cancel, enabled, identity]);

  return {
    enabled,
    begin,
    isCurrent,
    accept,
    finish,
    hasData: dataIdentity === identity,
    settled: settledIdentity === identity,
  };
}
