/*
=========================================================
 POOKALAM.EXE — Interactive Geometry Visualizer
 Step-by-step mathematical demonstration of radial construction
=========================================================
*/

import { polarPoint, calculateChordLength, createLotusPetalPath } from "./geometry.js";

const STEPS = [
    {
        title: "1. Center Coordinate (cx, cy)",
        desc: "All radial geometry originates from a central anchor point (cx, cy) in Cartesian space.",
        formula: "c = (cx, cy) = (200, 200)"
    },
    {
        title: "2. Guide Radius (r)",
        desc: "A target ring radius determines how far each floral motif is positioned from the center.",
        formula: "r = 110 px"
    },
    {
        title: "3. Polar Angular Division (θᵢ)",
        desc: "Equidistant angles are computed by dividing the 360° circle into n symmetrical sectors.",
        formula: "θᵢ = φ + i × (360° / n)   [n = 12, φ = 0°]"
    },
    {
        title: "4. Chord Spacing Calibration (c)",
        desc: "The chord length between adjacent points determines safe petal width to prevent overlapping.",
        formula: "c = 2r × sin(π / n) = 2(110) × sin(15°) ≈ 56.9 px"
    },
    {
        title: "5. Polar Coordinates (xᵢ, yᵢ)",
        desc: "Trigonometric functions map the polar radius and angle back to Cartesian canvas coordinates.",
        formula: "xᵢ = cx + r × cos(θᵢ),   yᵢ = cy + r × sin(θᵢ)"
    },
    {
        title: "6. Complete Symmetrical Floral Ring",
        desc: "Compound petals are positioned at each (xᵢ, yᵢ) and rotated by θᵢ + 90° for perfect radial alignment.",
        formula: "transform = translate(xᵢ, yᵢ) rotate(θᵢ + 90°)"
    }
];

let currentStep = 0;
let isPlaying = false;
let playInterval = null;

export function initVisualizer(containerElement) {
    if (!containerElement) return;

    renderStep(currentStep, containerElement);

    const prevBtn = document.getElementById("visPrevBtn");
    const nextBtn = document.getElementById("visNextBtn");
    const playBtn = document.getElementById("visPlayBtn");
    const resetBtn = document.getElementById("visResetBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            stopAutoPlay();
            currentStep = (currentStep - 1 + STEPS.length) % STEPS.length;
            renderStep(currentStep, containerElement);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            stopAutoPlay();
            currentStep = (currentStep + 1) % STEPS.length;
            renderStep(currentStep, containerElement);
        });
    }

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (isPlaying) {
                stopAutoPlay();
            } else {
                startAutoPlay(containerElement);
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            stopAutoPlay();
            currentStep = 0;
            renderStep(currentStep, containerElement);
        });
    }
}

function startAutoPlay(container) {
    isPlaying = true;
    const playBtn = document.getElementById("visPlayBtn");
    if (playBtn) playBtn.textContent = "PAUSE";

    playInterval = setInterval(() => {
        currentStep = (currentStep + 1) % STEPS.length;
        renderStep(currentStep, container);
    }, 2200);
}

function stopAutoPlay() {
    isPlaying = false;
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
    const playBtn = document.getElementById("visPlayBtn");
    if (playBtn) playBtn.textContent = "AUTO PLAY";
}

export function resetVisualizer(containerElement) {
    stopAutoPlay();
    currentStep = 0;
    if (containerElement) {
        renderStep(currentStep, containerElement);
    }
}

export function renderStep(stepIndex, container) {
    const step = STEPS[stepIndex];
    const titleEl = document.getElementById("visStepTitle");
    const descEl = document.getElementById("visStepDesc");
    const formulaEl = document.getElementById("visStepFormula");
    const counterEl = document.getElementById("visStepCounter");
    const svgEl = document.getElementById("visualizerSvg");

    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (formulaEl) formulaEl.textContent = step.formula;
    if (counterEl) counterEl.textContent = `Step ${stepIndex + 1} of ${STEPS.length}`;

    if (!svgEl) return;

    const cx = 200;
    const cy = 200;
    const r = 110;
    const n = 12;
    const chord = calculateChordLength(r, n);
    const petalW = chord * 0.72;
    const petalH = r * 0.62;

    let svgMarkup = `
        <defs>
            <radialGradient id="visCenterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f5c542" />
                <stop offset="100%" stop-color="#eb5a28" />
            </radialGradient>
        </defs>
        <!-- Background Grid -->
        <line x1="20" y1="${cy}" x2="380" y2="${cy}" stroke="rgba(245, 197, 66, 0.12)" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="${cx}" y1="20" x2="${cx}" y2="380" stroke="rgba(245, 197, 66, 0.12)" stroke-width="1" stroke-dasharray="3 3"/>
    `;

    // Step 1: Center point
    svgMarkup += `
        <circle cx="${cx}" cy="${cy}" r="6" fill="#f5c542" />
        <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="#f5c542" stroke-width="1.5" opacity="0.6"/>
        <text x="${cx + 14}" y="${cy - 10}" fill="#f5c542" font-size="12" font-family="monospace">c (${cx}, ${cy})</text>
    `;

    // Step 2+: Reference radius circle
    if (stepIndex >= 1) {
        svgMarkup += `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(245, 197, 66, 0.35)" stroke-width="1.5" stroke-dasharray="5 4"/>
            <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#f5c542" stroke-width="2"/>
            <text x="${cx + r / 2 - 8}" y="${cy - 8}" fill="#f5c542" font-size="12" font-family="monospace" font-weight="bold">r = ${r}</text>
        `;
    }

    // Step 3+: Radial angle rays and division points
    if (stepIndex >= 2) {
        for (let i = 0; i < n; i++) {
            const ang = (360 / n) * i;
            const pt = polarPoint(r, ang, cx, cy);
            svgMarkup += `
                <line x1="${cx}" y1="${cy}" x2="${pt.x.toFixed(1)}" y2="${pt.y.toFixed(1)}" stroke="rgba(245, 197, 66, 0.2)" stroke-width="1"/>
                <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4" fill="#fffdf5" />
            `;
            if (i === 1 && stepIndex === 2) {
                svgMarkup += `<text x="${pt.x + 8}" y="${pt.y + 4}" fill="#eb8626" font-size="11" font-family="monospace">θ₁ = 30°</text>`;
            }
        }
    }

    // Step 4+: Chord length indicator between pt 0 and pt 1
    if (stepIndex >= 3) {
        const pt0 = polarPoint(r, 0, cx, cy);
        const pt1 = polarPoint(r, 360 / n, cx, cy);
        svgMarkup += `
            <line x1="${pt0.x.toFixed(1)}" y1="${pt0.y.toFixed(1)}" x2="${pt1.x.toFixed(1)}" y2="${pt1.y.toFixed(1)}" stroke="#eb5a28" stroke-width="2.5"/>
            <text x="${(pt0.x + pt1.x) / 2 + 10}" y="${(pt0.y + pt1.y) / 2}" fill="#eb5a28" font-size="11" font-family="monospace" font-weight="bold">chord c ≈ ${chord.toFixed(1)}px</text>
        `;
    }

    // Step 5: Orientation vectors & single sample petal placement
    if (stepIndex === 4) {
        const ang = 30;
        const pt = polarPoint(r, ang, cx, cy);
        const petalPath = createLotusPetalPath(petalW, petalH);
        svgMarkup += `
            <g transform="translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${ang + 90})">
                <path d="${petalPath}" fill="rgba(245, 197, 66, 0.75)" stroke="#fff" stroke-width="1.5"/>
                <line x1="0" y1="0" x2="0" y2="${-petalH * 0.7}" stroke="#9e1e24" stroke-width="2"/>
            </g>
            <text x="${pt.x + 18}" y="${pt.y + 24}" fill="#f5c542" font-size="11" font-family="monospace">radial vector (θ + 90°)</text>
        `;
    }

    // Step 6: Complete Symmetrical Ring
    if (stepIndex >= 5) {
        for (let i = 0; i < n; i++) {
            const ang = (360 / n) * i;
            const pt = polarPoint(r, ang, cx, cy);
            const petalPath = createLotusPetalPath(petalW, petalH);
            const innerPath = createLotusPetalPath(petalW * 0.55, petalH * 0.65);
            svgMarkup += `
                <g transform="translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${ang + 90})">
                    <path d="${petalPath}" fill="#eb5a28" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
                    <path d="${innerPath}" fill="#f5c542"/>
                    <circle cx="0" cy="0" r="3" fill="#fff"/>
                </g>
            `;
        }
        svgMarkup += `
            <circle cx="${cx}" cy="${cy}" r="32" fill="url(#visCenterGrad)" />
            <circle cx="${cx}" cy="${cy}" r="12" fill="#fffdf5" />
        `;
    }

    svgEl.innerHTML = svgMarkup;
}
