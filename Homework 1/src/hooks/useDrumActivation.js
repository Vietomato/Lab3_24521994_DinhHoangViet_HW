import { useCallback, useEffect, useState } from 'react';

/** Shared audio/visual entry point. Input ownership keeps mixed sources separate. */
export function useDrumActivation(trigger) {
  const [heldInputs, setHeldInputs] = useState({});
  useEffect(() => {
    const clear = () => setHeldInputs({});
    const visibility = () => { if (document.hidden) clear(); };
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const onActivate = useCallback((pad, source, inputId) => {
    setHeldInputs((previous) => ({ ...previous, [`${source}:${inputId}`]: pad.id }));
    void trigger(pad.sound);
  }, [trigger]);
  const onRelease = useCallback((padId, source, inputId) => {
    setHeldInputs((previous) => {
      const key = `${source}:${inputId}`;
      if (previous[key] !== padId) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);
  return { activePadIds: new Set(Object.values(heldInputs)), onActivate, onRelease };
}
