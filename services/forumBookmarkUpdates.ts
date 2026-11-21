let version = 0;
const listeners = new Set<() => void>();

export const getForumBookmarksVersion = () => version;

export function notifyForumBookmarksChanged() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeForumBookmarksChanged(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
