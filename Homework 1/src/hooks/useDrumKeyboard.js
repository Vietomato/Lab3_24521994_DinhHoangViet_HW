import { useEffect, useEffectEvent, useRef } from 'react';

/** @param {import('../types.js').DrumKeyboardOptions} options */
export function useDrumKeyboard({ padMap, isEnabled, onActivate, onRelease }) {
  const held = useRef(new Map());

  const clearHeld = useEffectEvent(() => {
    for (const [code, padId] of held.current) {
      onRelease(padId, 'keyboard', `keyboard:${code}`);
    }
    held.current.clear();
  });

  const keydown = useEffectEvent((event) => {
    if (!isEnabled || event.defaultPrevented || event.repeat || held.current.has(event.code)
      || event.ctrlKey || event.altKey || event.metaKey || isEditable(event)) return;
    const pad = padMap.get(event.code);
    if (!pad) return;
    event.preventDefault();
    held.current.set(event.code, pad.id);
    onActivate(pad, 'keyboard', `keyboard:${event.code}`);
  });

  const keyup = useEffectEvent((event) => {
    // Always release an input we own, even if focus moved into an editor.
    const padId = held.current.get(event.code);
    if (padId === undefined) return;
    event.preventDefault();
    held.current.delete(event.code);
    onRelease(padId, 'keyboard', `keyboard:${event.code}`);
  });

  useEffect(() => {
    if (!isEnabled) clearHeld();
  }, [isEnabled]);

  useEffect(() => {
    const down = (event) => keydown(event);
    const up = (event) => keyup(event);
    const blur = () => clearHeld();
    const visibility = () => { if (document.hidden) clearHeld(); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
      clearHeld();
    };
  }, []);
}

function isEditable(event) {
  return event.composedPath().some((node) => node instanceof Element && (
    node.matches('input, textarea, select') || node.isContentEditable
    || (node.hasAttribute('contenteditable') && node.getAttribute('contenteditable') !== 'false')
  ));
}
