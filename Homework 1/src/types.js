/** @typedef {'KeyW'|'KeyA'|'KeyS'|'KeyD'|'KeyJ'|'KeyK'|'KeyL'} PadCode */
/** @typedef {'kick'|'snare'|'closedHat'|'openHat'|'tom'|'clap'|'rim'} SoundKind */

/**
 * Parameters for a local Web Audio synthesis voice; no sample URLs.
 * All numeric values must be finite. Duration and frequency must be positive.
 * @typedef {Object} SoundConfig
 * @property {SoundKind} kind
 * @property {number} durationSeconds Duration in (0, 5] seconds.
 * @property {number} frequencyHz Base oscillator or filter frequency.
 * @property {number} gain Voice gain in the range [0, 1].
 */

/**
 * @typedef {Object} DrumPad
 * @property {string} id Unique, stable configuration ID and React key.
 * @property {string} label Human-readable, accessible pad name.
 * @property {PadCode} code Physical keyboard code.
 * @property {SoundConfig} sound
 */
/** @typedef {DrumPad} DrumPadConfig */

/**
 * @typedef {Object} DrumPadProps
 * @property {DrumPad} pad
 * @property {boolean} isActive Parent-controlled momentary state, not a toggle.
 * @property {ActivatePad} onActivate
 * @property {ReleasePad} onRelease
 */

/** @typedef {'pointer'|'keyboard'|'native'} InputSource */
/**
 * @callback ActivatePad
 * @param {DrumPad} pad
 * @param {InputSource} source
 * @param {string} inputId
 * @returns {void}
 */
/**
 * @callback ReleasePad
 * @param {string} padId
 * @param {InputSource} source
 * @param {string} inputId
 * @returns {void}
 */
/**
 * @typedef {Object} DrumKeyboardOptions
 * @property {ReadonlyMap<PadCode, DrumPad>} padMap
 * @property {boolean} isEnabled
 * @property {ActivatePad} onActivate
 * @property {ReleasePad} onRelease
 */

export {};
