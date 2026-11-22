import { useEffect, useRef, useState } from "react";
import {
  getActivityStatusPreference,
  updateActivityStatusPreference,
} from "services/usersApi";

export function useActivityStatusPreference() {
  const [value, setValue] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savePending = useRef(false);

  useEffect(() => {
    let active = true;

    void getActivityStatusPreference()
      .then((saved) => {
        if (active) setValue(saved);
      })
      .catch(() => {
        if (active) setError("Couldn’t load activity status.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const update = async (next: boolean) => {
    if (loading || savePending.current) return;
    savePending.current = true;
    setSaving(true);
    setError(null);
    setValue(next);

    try {
      setValue(await updateActivityStatusPreference(next));
    } catch {
      setValue(value);
      setError("Couldn’t save activity status. Try again.");
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  };

  return { value, busy: loading || saving, error, update };
}
