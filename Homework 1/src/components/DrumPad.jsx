import { useCallback, useEffect, useRef } from 'react';

/**
 * A native pad button; the parent owns its momentary active state.
 * @param {import('../types.js').DrumPadProps} props
 */
export default function DrumPad({ pad, isActive, onActivate, onRelease }) {
  const nativeHeld = useRef(new Set());
  const suppressClick = useRef(false);
  const clearNative = useCallback(() => {
    for (const key of nativeHeld.current) onRelease(pad.id, 'native', `native:${pad.id}:${key}`);
    nativeHeld.current.clear();
    suppressClick.current = false;
  }, [pad.id, onRelease]);
  useEffect(() => {
    const visibility = () => { if (document.hidden) clearNative(); };
    window.addEventListener('blur', clearNative);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', clearNative);
      document.removeEventListener('visibilitychange', visibility);
      clearNative();
    };
  }, [clearNative]);
  const releasePointer = (event) => onRelease(pad.id, 'pointer', `pointer:${event.pointerId}`);
  return (
    <button
      type="button"
      className="drum-pad"
      aria-pressed={isActive}
      aria-describedby="pad-instructions"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        onActivate(pad, 'pointer', `pointer:${event.pointerId}`);
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onKeyDown={(event) => {
        if (!['Enter', ' '].includes(event.key) || event.repeat || event.defaultPrevented
          || nativeHeld.current.has(event.key)) return;
        nativeHeld.current.add(event.key);
        suppressClick.current = false;
        onActivate(pad, 'native', `native:${pad.id}:${event.key}`);
      }}
      onKeyUp={(event) => {
        if (!nativeHeld.current.delete(event.key)) return;
        // Space's native click follows keyup; Enter's click already happened.
        suppressClick.current = event.key === ' ';
        onRelease(pad.id, 'native', `native:${pad.id}:${event.key}`);
      }}
      onBlur={clearNative}
      onClick={(event) => {
        // Pointer and native-key paths already activated. Keep assistive clicks.
        if (event.detail !== 0) return;
        if (nativeHeld.current.size) return;
        if (suppressClick.current) { suppressClick.current = false; return; }
        onActivate(pad, 'native', `native:${pad.id}`);
        onRelease(pad.id, 'native', `native:${pad.id}`);
      }}
    >
      <kbd className="drum-pad__shortcut">{pad.code.slice(3)}</kbd>
      <span className="drum-pad__name">{pad.label}</span>
      <span className="drum-pad__status" aria-hidden="true">
        {isActive ? '● Active' : '○ Ready'}
      </span>
    </button>
  );
}
