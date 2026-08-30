/*
=========================================================
 POOKALAM.EXE — Web Audio Synthesis Engine
 Pure Web Audio API procedural tones (no external audio files)
=========================================================
*/

let audioCtx = null;
let isMuted = false;

// Load persisted mute preference
try {
    const saved = localStorage.getItem("pookalam_sound_enabled");
    if (saved !== null) {
        isMuted = saved === "false";
    }
} catch (e) {
    // Local storage not accessible
}

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

/**
 * Plays a warm pentatonic chime sequence on generate
 */
export function playGenerateChime() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Frequencies: C5 (523.25), E5 (659.25), G5 (783.99), A5 (880), C6 (1046.5)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        // Soft bell-like envelope
        gain.gain.setValueAtTime(0.001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
    });
}

/**
 * Plays a subtle warm harmonic bloom chord on replay
 */
export function playBloomTone() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Frequencies: G4 (392.0), C5 (523.25), E5 (659.25)
    const notes = [392.0, 523.25, 659.25];
    const now = ctx.currentTime;

    notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.95);
    });
}

export function toggleAudio() {
    isMuted = !isMuted;
    try {
        localStorage.setItem("pookalam_sound_enabled", String(!isMuted));
    } catch (e) {}
    return !isMuted;
}

export function isAudioEnabled() {
    return !isMuted;
}
