/*
=========================================================
 POOKALAM.EXE — Main Application Orchestrator
 Connects UI, procedural engine, animation, audio & interactions
=========================================================
*/

import {
    generatePookalamConfiguration,
    renderPookalam,
    renderPookalamToString,
    getPookalamStats
} from "./pookalam.js";
import { initAmbientParticles } from "./particles.js";
import { triggerBloom, transitionNewArtwork } from "./animation.js";
import { playGenerateChime, playBloomTone, toggleAudio, isAudioEnabled } from "./audio.js";
import { initVisualizer, resetVisualizer } from "./visualizer.js";

const state = {
    seed: "ONAM-2026",
    generation: 1,
    config: null,
    lockedLayerId: null,
    theme: "night" // 'night' | 'kasavu'
};

// DOM Elements
const svg = document.getElementById("pookalam");
const pollenCanvas = document.getElementById("pollenLayer");

// Left Controls
const seedInput = document.getElementById("seedInput");
const seedRandomBtn = document.getElementById("seedRandomBtn");
const generateBtn = document.getElementById("generateBtn");
const replayBtn = document.getElementById("replayBtn");
const geometryVisBtn = document.getElementById("geometryVisBtn");

// Header Controls
const infoBtn = document.getElementById("infoBtn");
const soundBtn = document.getElementById("soundBtn");
const themeBtn = document.getElementById("themeBtn");

// Modals
const infoModal = document.getElementById("infoModal");
const closeInfoBtn = document.getElementById("closeInfoBtn");
const visualizerModal = document.getElementById("visualizerModal");
const closeVisBtn = document.getElementById("closeVisBtn");

// Right Pattern Structure Panel
const layersList = document.getElementById("layersList");

// Bottom Status Bar
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const statusSeed = document.getElementById("statusSeed");
const statusLayers = document.getElementById("statusLayers");
const statusMotifs = document.getElementById("statusMotifs");
const statusSymmetry = document.getElementById("statusSymmetry");
const exportSvgBtn = document.getElementById("exportSvgBtn");

function normalizeSeed(val) {
    const cleaned = String(val ?? "ONAM-2026").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (!cleaned) return "ONAM-2026";
    if (cleaned.includes("-")) return cleaned;
    const digits = cleaned.replace(/\D+/g, "") || "2026";
    return `ONAM-${digits}`;
}

function getRandomSeed() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ONAM-${randomNum}`;
}

function updateStatus(message, isWorking = false) {
    if (statusText) statusText.textContent = message;
    if (statusIndicator) {
        if (isWorking) {
            statusIndicator.className = "status-dot is-working";
        } else {
            statusIndicator.className = "status-dot is-ready";
        }
    }
}

function syncMetadata(config) {
    const stats = getPookalamStats(config);
    state.seed = config.seed;

    if (seedInput) seedInput.value = config.seed;
    if (statusSeed) statusSeed.textContent = config.seed;
    if (statusLayers) statusLayers.textContent = String(stats.layerCount);
    if (statusMotifs) statusMotifs.textContent = String(stats.totalElements);
    if (statusSymmetry) statusSymmetry.textContent = `${stats.symmetry}×`;

    renderLayerLegend(config);
}

/**
 * Dynamically builds the Layer Legend on the right side
 */
function renderLayerLegend(config) {
    if (!layersList) return;
    layersList.innerHTML = "";

    config.layers.forEach((layer, idx) => {
        const item = document.createElement("div");
        item.className = "layer-item";
        item.setAttribute("data-layer-id", String(layer.id));
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Layer ${idx + 1}: ${layer.name}, ${layer.count} elements`);

        item.innerHTML = `
            <div class="layer-bullet" style="background-color: ${layer.primaryColor}; box-shadow: 0 0 8px ${layer.primaryColor}88;"></div>
            <div class="layer-info">
                <div class="layer-header">
                    <span class="layer-num">${String(idx + 1).padStart(2, "0")}</span>
                    <span class="layer-name">${layer.name}</span>
                </div>
                <div class="layer-count">${layer.count} ${layer.type.includes("lotus") ? "lotuses" : layer.type.includes("leaf") ? "leaves" : "motifs"}</div>
            </div>
        `;

        // Interactive Hover: Dim other layers, highlight target layer
        item.addEventListener("mouseenter", () => highlightLayer(layer.id));
        item.addEventListener("mouseleave", () => unhighlightLayer());
        item.addEventListener("focus", () => highlightLayer(layer.id));
        item.addEventListener("blur", () => unhighlightLayer());

        // Click to lock/unlock layer highlight
        item.addEventListener("click", () => toggleLockLayer(layer.id, item));
        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleLockLayer(layer.id, item);
            }
        });

        layersList.appendChild(item);
    });
}

function highlightLayer(layerId) {
    if (state.lockedLayerId !== null) return;
    if (!svg) return;

    const layers = svg.querySelectorAll(".layer");
    layers.forEach((layerEl) => {
        const id = layerEl.getAttribute("data-layer");
        if (id === String(layerId)) {
            layerEl.style.opacity = "1.0";
            layerEl.style.filter = "brightness(1.15) drop-shadow(0 0 10px rgba(245,197,66,0.5))";
        } else {
            layerEl.style.opacity = "0.22";
            layerEl.style.filter = "none";
        }
    });
}

function unhighlightLayer() {
    if (state.lockedLayerId !== null) return;
    if (!svg) return;

    const layers = svg.querySelectorAll(".layer");
    layers.forEach((layerEl) => {
        layerEl.style.opacity = "";
        layerEl.style.filter = "";
    });
}

function toggleLockLayer(layerId, itemEl) {
    const allItems = layersList.querySelectorAll(".layer-item");

    if (state.lockedLayerId === layerId) {
        state.lockedLayerId = null;
        allItems.forEach((el) => el.classList.remove("is-locked"));
        unhighlightLayer();
    } else {
        state.lockedLayerId = layerId;
        allItems.forEach((el) => el.classList.remove("is-locked"));
        itemEl.classList.add("is-locked");
        highlightLayer(layerId);
    }
}

/**
 * Renders the Pookalam artwork and handles bloom animation
 */
function renderArtwork(seed, { isNew = false } = {}) {
    if (!svg) return;

    state.lockedLayerId = null;
    updateStatus("Blooming...", true);

    const doRender = () => {
        const config = generatePookalamConfiguration(seed, { generation: state.generation });
        state.config = config;
        renderPookalam(svg, config);
        syncMetadata(config);
    };

    if (isNew) {
        transitionNewArtwork(svg, doRender, {
            onStart: () => {
                playGenerateChime();
            },
            onComplete: (elapsed) => {
                updateStatus(`Bloom complete ${elapsed}s`, false);
            }
        });
    } else {
        doRender();
        playBloomTone();
        triggerBloom(svg, {
            onStart: () => {},
            onComplete: (elapsed) => {
                updateStatus(`Bloom complete ${elapsed}s`, false);
            }
        });
    }
}

function handleGenerateNew() {
    state.generation += 1;
    const newSeed = getRandomSeed();
    state.seed = newSeed;
    renderArtwork(newSeed, { isNew: true });
}

function handleReplayBloom() {
    if (!state.config) return;
    updateStatus("Blooming...", true);
    playBloomTone();
    triggerBloom(svg, {
        onComplete: (elapsed) => {
            updateStatus(`Bloom complete ${elapsed}s`, false);
        }
    });
}

function handleApplySeed(e) {
    if (e) e.preventDefault();
    const normalized = normalizeSeed(seedInput.value);
    state.seed = normalized;
    renderArtwork(normalized, { isNew: true });
}

function handleRandomizeSeed() {
    const newSeed = getRandomSeed();
    state.seed = newSeed;
    renderArtwork(newSeed, { isNew: true });
}

// Modals
function openModal(modal) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// Theme handling
function initTheme() {
    try {
        const saved = localStorage.getItem("pookalam_theme");
        if (saved === "kasavu") {
            setTheme("kasavu");
        } else {
            setTheme("night");
        }
    } catch (e) {
        setTheme("night");
    }
}

function setTheme(theme) {
    state.theme = theme;
    if (theme === "kasavu") {
        document.body.classList.add("theme-kasavu");
        document.body.classList.remove("theme-night");
        if (themeBtn) {
            themeBtn.setAttribute("aria-label", "Switch to Night Emerald theme");
            themeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>`;
        }
    } else {
        document.body.classList.add("theme-night");
        document.body.classList.remove("theme-kasavu");
        if (themeBtn) {
            themeBtn.setAttribute("aria-label", "Switch to Kasavu Light theme");
            themeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 000-2H2a1 1 0 000 2zm18 0h2a1 1 0 000-2h-2a1 1 0 000 2zM11 2v2a1 1 0 002 0V2a1 1 0 00-2 0zm0 18v2a1 1 0 002 0v-2a1 1 0 00-2 0zM5.99 4.58a1 1 0 00-1.41 1.41l1.41 1.41a1 1 0 001.41-1.41L5.99 4.58zm12.02 12.02a1 1 0 00-1.41 1.41l1.41 1.41a1 1 0 001.41-1.41l-1.41-1.41zm1.41-12.02a1 1 0 00-1.41 0l-1.41 1.41a1 1 0 101.41 1.41l1.41-1.41a1 1 0 000-1.41zM6 16.59l-1.41 1.41a1 1 0 101.41 1.41l1.41-1.41A1 1 0 006 16.59z"/></svg>`;
        }
    }
    try {
        localStorage.setItem("pookalam_theme", theme);
    } catch (e) {}
}

function handleToggleTheme() {
    setTheme(state.theme === "night" ? "kasavu" : "night");
}

// Sound toggle UI
function updateSoundBtn() {
    const enabled = isAudioEnabled();
    if (soundBtn) {
        soundBtn.setAttribute("aria-label", enabled ? "Mute audio sound effects" : "Enable audio sound effects");
        soundBtn.innerHTML = enabled
            ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
            : `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
    }
}

function handleToggleAudio() {
    toggleAudio();
    updateSoundBtn();
}

/**
 * Real standalone SVG export with download trigger
 */
function handleExportSvg() {
    if (!state.config) return;

    try {
        const svgContent = renderPookalamToString(state.config);
        const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `pookalam-${state.config.seed}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        updateStatus("Exported SVG successfully!", false);
        setTimeout(() => updateStatus("Pattern ready", false), 3000);
    } catch (err) {
        console.error("Export SVG failed:", err);
        updateStatus("SVG export failed", false);
    }
}

// Initialize Application
function init() {
    initTheme();
    updateSoundBtn();

    // Event listeners
    if (generateBtn) generateBtn.addEventListener("click", handleGenerateNew);
    if (replayBtn) replayBtn.addEventListener("click", handleReplayBloom);
    if (seedRandomBtn) seedRandomBtn.addEventListener("click", handleRandomizeSeed);
    if (seedInput) {
        seedInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleApplySeed();
            }
        });
    }

    if (infoBtn) infoBtn.addEventListener("click", () => openModal(infoModal));
    if (closeInfoBtn) closeInfoBtn.addEventListener("click", () => closeModal(infoModal));

    if (geometryVisBtn) {
        geometryVisBtn.addEventListener("click", () => {
            openModal(visualizerModal);
            initVisualizer(visualizerModal);
        });
    }
    if (closeVisBtn) {
        closeVisBtn.addEventListener("click", () => {
            closeModal(visualizerModal);
            resetVisualizer(visualizerModal);
        });
    }

    if (soundBtn) soundBtn.addEventListener("click", handleToggleAudio);
    if (themeBtn) themeBtn.addEventListener("click", handleToggleTheme);
    if (exportSvgBtn) exportSvgBtn.addEventListener("click", handleExportSvg);

    // Modal backdrop click
    [infoModal, visualizerModal].forEach((modal) => {
        if (!modal) return;
        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.classList.contains("modal-backdrop")) {
                closeModal(modal);
                if (modal === visualizerModal) resetVisualizer(modal);
            }
        });
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal(infoModal);
            closeModal(visualizerModal);
            resetVisualizer(visualizerModal);
        }
        if (e.key === "g" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            handleGenerateNew();
        }
        if (e.key === "r" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            handleReplayBloom();
        }
    });

    // Start ambient canvas particles
    if (pollenCanvas) {
        initAmbientParticles(pollenCanvas);
    }

    // Initial render
    renderArtwork(state.seed, { isNew: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
