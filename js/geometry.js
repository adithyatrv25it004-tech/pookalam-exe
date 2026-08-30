/*
=========================================================
 POOKALAM.EXE — Geometry & Motif Engine
 Mathematical primitives and procedural floral builders
=========================================================
*/

export const SVG_NS = "http://www.w3.org/2000/svg";

export const STAGE_SIZE = 1000;
export const CENTER = {
    x: STAGE_SIZE / 2,
    y: STAGE_SIZE / 2
};

export function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

export function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

export function normalizeAngle(angle) {
    let norm = angle % 360;
    if (norm < 0) norm += 360;
    return norm;
}

/**
 * Calculates (x, y) coordinates from polar coordinates (radius, angle in degrees).
 */
export function polarPoint(radius, angleInDegrees, cx = CENTER.x, cy = CENTER.y) {
    const rad = toRadians(angleInDegrees);
    return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad)
    };
}

/**
 * Calculates chord length for n equidistant points on a circle of radius r:
 * c = 2 * r * sin(pi / n)
 */
export function calculateChordLength(radius, count) {
    if (count <= 0) return 0;
    return 2 * radius * Math.sin(Math.PI / count);
}

export function createSVGElement(type, attributes = {}) {
    const el = document.createElementNS(SVG_NS, type);
    for (const [key, val] of Object.entries(attributes)) {
        if (val !== undefined && val !== null) {
            el.setAttribute(key, String(val));
        }
    }
    return el;
}

export function createGroup(className = "", attributes = {}) {
    const g = createSVGElement("g", attributes);
    if (className) {
        g.setAttribute("class", className);
    }
    return g;
}

/**
 * Creates a standard transform hierarchy node:
 * Placement Group (translate to x,y & rotate)
 *   └─ Animation Group (scales & opacity during bloom)
 *       └─ Motif Geometry
 */
export function createMotifNode({ x, y, rotation = 0, className = "motif-node" }) {
    const placementGroup = createGroup(`placement-node ${className}`);
    placementGroup.setAttribute("transform", `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rotation.toFixed(2)})`);

    const animGroup = createGroup("anim-node");
    placementGroup.appendChild(animGroup);

    return {
        root: placementGroup,
        container: animGroup
    };
}

/* =========================================================
   FLORAL MOTIF GENERATORS (Centered at 0, 0)
========================================================= */

/**
 * Single pointed petal centered at (0,0), pointing upwards (0, -height/2)
 */
export function createPointedPetalPath(width, height) {
    const hw = width / 2;
    const hh = height / 2;
    const curveW = width * 0.95;
    return `M 0 ${-hh} C ${curveW} ${-hh * 0.35}, ${hw * 1.1} ${hh * 0.4}, 0 ${hh} C ${-hw * 1.1} ${hh * 0.4}, ${-curveW} ${-hh * 0.35}, 0 ${-hh} Z`;
}

/**
 * Smooth rounded lotus petal
 */
export function createLotusPetalPath(width, height) {
    const hw = width / 2;
    const hh = height / 2;
    return `M 0 ${-hh} C ${hw * 1.25} ${-hh * 0.25}, ${hw * 1.1} ${hh * 0.5}, 0 ${hh} C ${-hw * 1.1} ${hh * 0.5}, ${-hw * 1.25} ${-hh * 0.25}, 0 ${-hh} Z`;
}

/**
 * Broad rounded petal (marigold / rose style)
 */
export function createBroadPetalPath(width, height) {
    const hw = width / 2;
    const hh = height / 2;
    return `M 0 ${-hh} C ${hw * 1.45} ${-hh * 0.45}, ${hw * 1.3} ${hh * 0.3}, 0 ${hh} C ${-hw * 1.3} ${hh * 0.3}, ${-hw * 1.45} ${-hh * 0.45}, 0 ${-hh} Z`;
}

/**
 * Natural leaf with spine
 */
export function createLeafPath(width, height) {
    const hw = width / 2;
    const hh = height / 2;
    return `M 0 ${-hh} C ${hw * 1.3} ${-hh * 0.3}, ${hw * 0.8} ${hh * 0.6}, 0 ${hh} C ${-hw * 0.8} ${hh * 0.6}, ${-hw * 1.3} ${-hh * 0.3}, 0 ${-hh} Z`;
}

/**
 * Multi-layer compound Lotus unit (Hero Petal)
 */
export function createMultiLayerLotus({ x, y, width, height, outerFill, innerFill, accentFill, coreFill, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-lotus" });

    // Outer backing petal
    const outerPath = createSVGElement("path", {
        d: createLotusPetalPath(width, height),
        fill: outerFill,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
    });
    container.appendChild(outerPath);

    // Inner highlight petal
    const innerPath = createSVGElement("path", {
        d: createPointedPetalPath(width * 0.62, height * 0.72),
        fill: innerFill
    });
    container.appendChild(innerPath);

    // Center decorative gem / spine
    if (accentFill) {
        const spine = createSVGElement("path", {
            d: createPointedPetalPath(width * 0.24, height * 0.42),
            fill: accentFill
        });
        container.appendChild(spine);
    }

    // Base disc
    if (coreFill) {
        const baseDot = createSVGElement("circle", {
            cx: 0,
            cy: height * 0.32,
            r: Math.max(2.5, width * 0.12),
            fill: coreFill
        });
        container.appendChild(baseDot);
    }

    return root;
}

/**
 * Dimensional Marigold Rosette (Compound Multi-Petal Blossom)
 */
export function createMarigoldCluster({ x, y, radius, primaryFill, secondaryFill, centerFill, accentFill, petalCount = 10, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-marigold" });

    const outerR = radius;
    const petalW = radius * 0.68;
    const petalH = radius * 1.1;

    // Outer petal ring
    for (let i = 0; i < petalCount; i++) {
        const ang = (360 / petalCount) * i;
        const pt = polarPoint(outerR * 0.48, ang, 0, 0);
        const petal = createSVGElement("path", {
            d: createBroadPetalPath(petalW, petalH),
            fill: primaryFill,
            transform: `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${ang})`
        });
        container.appendChild(petal);
    }

    // Inner petal ring (interleaved)
    const innerPetalW = petalW * 0.72;
    const innerPetalH = petalH * 0.75;
    for (let i = 0; i < petalCount; i++) {
        const ang = (360 / petalCount) * i + (180 / petalCount);
        const pt = polarPoint(outerR * 0.26, ang, 0, 0);
        const petal = createSVGElement("path", {
            d: createBroadPetalPath(innerPetalW, innerPetalH),
            fill: secondaryFill,
            transform: `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${ang})`
        });
        container.appendChild(petal);
    }

    // Center disc with accent
    container.appendChild(createSVGElement("circle", {
        cx: 0,
        cy: 0,
        r: radius * 0.32,
        fill: centerFill
    }));

    if (accentFill) {
        container.appendChild(createSVGElement("circle", {
            cx: 0,
            cy: 0,
            r: radius * 0.14,
            fill: accentFill
        }));
    }

    return root;
}

/**
 * Natural Leaf Motif with Spine and Veins
 */
export function createOrnateLeaf({ x, y, width, height, fill, veinFill = "rgba(255,255,255,0.25)", accentDot, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-leaf" });

    // Leaf blade
    const leaf = createSVGElement("path", {
        d: createLeafPath(width, height),
        fill: fill
    });
    container.appendChild(leaf);

    // Central spine vein
    const spine = createSVGElement("line", {
        x1: 0,
        y1: -height * 0.44,
        x2: 0,
        y2: height * 0.42,
        stroke: veinFill,
        "stroke-width": Math.max(1, width * 0.06),
        "stroke-linecap": "round"
    });
    container.appendChild(spine);

    if (accentDot) {
        const dot = createSVGElement("circle", {
            cx: 0,
            cy: -height * 0.15,
            r: Math.max(2, width * 0.1),
            fill: accentDot
        });
        container.appendChild(dot);
    }

    return root;
}

/**
 * Ceremonial Crown Border Unit
 */
export function createCrownBorderMotif({ x, y, size, fill, accent, secondaryAccent, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-crown" });

    const w = size * 0.9;
    const h = size * 1.3;

    // Main crown petal
    const crown = createSVGElement("path", {
        d: createPointedPetalPath(w, h),
        fill: fill
    });
    container.appendChild(crown);

    // Inner diamond jewel
    const diamondPts = [
        `0,${-h * 0.28}`,
        `${w * 0.32},0`,
        `0,${h * 0.28}`,
        `${-w * 0.32},0`
    ].join(" ");
    const diamond = createSVGElement("polygon", {
        points: diamondPts,
        fill: accent
    });
    container.appendChild(diamond);

    // Tip pearl / rice gem
    if (secondaryAccent) {
        const pearl = createSVGElement("circle", {
            cx: 0,
            cy: -h * 0.44,
            r: Math.max(2, size * 0.12),
            fill: secondaryAccent
        });
        container.appendChild(pearl);
    }

    return root;
}

/**
 * Delicate Teardrop Gem Unit
 */
export function createTeardropGem({ x, y, width, height, fill, accentFill, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-teardrop" });

    const hw = width / 2;
    const hh = height / 2;
    const path = `M 0 ${-hh} C ${hw * 1.2} ${-hh * 0.1}, ${hw * 0.8} ${hh * 0.7}, 0 ${hh} C ${-hw * 0.8} ${hh * 0.7}, ${-hw * 1.2} ${-hh * 0.1}, 0 ${-hh} Z`;

    container.appendChild(createSVGElement("path", {
        d: path,
        fill: fill
    }));

    if (accentFill) {
        container.appendChild(createSVGElement("circle", {
            cx: 0,
            cy: hh * 0.15,
            r: Math.max(2, width * 0.22),
            fill: accentFill
        }));
    }

    return root;
}

/**
 * Small 8-petal Accent Blossom
 */
export function createMiniFlowerUnit({ x, y, radius, fill, centerFill, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-mini-blossom" });

    const count = 8;
    const pW = radius * 0.55;
    const pH = radius * 0.95;

    for (let i = 0; i < count; i++) {
        const ang = (360 / count) * i;
        const pt = polarPoint(radius * 0.42, ang, 0, 0);
        container.appendChild(createSVGElement("path", {
            d: createLotusPetalPath(pW, pH),
            fill: fill,
            transform: `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) rotate(${ang})`
        }));
    }

    container.appendChild(createSVGElement("circle", {
        cx: 0,
        cy: 0,
        r: radius * 0.36,
        fill: centerFill
    }));

    return root;
}

/**
 * Star / Scallop ornament
 */
export function createGeometricStar({ x, y, points = 8, outerRadius, innerRadius, fill, rotation = 0 }) {
    const { root, container } = createMotifNode({ x, y, rotation, className: "motif-star" });

    const coords = [];
    const total = points * 2;
    for (let i = 0; i < total; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const ang = (360 / total) * i;
        const pt = polarPoint(r, ang, 0, 0);
        coords.push(`${pt.x.toFixed(2)},${pt.y.toFixed(2)}`);
    }

    container.appendChild(createSVGElement("polygon", {
        points: coords.join(" "),
        fill: fill
    }));

    return root;
}

/* =========================================================
   REPETITION & RANDOM MATH UTILITIES
========================================================= */

/**
 * Deterministic PRNG seeded with 32-bit integer
 */
export function createSeededRandom(seed) {
    let state = (seed >>> 0) || 1;
    return function random() {
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function hashSeed(seed) {
    const str = String(seed ?? "ONAM-2026").trim().toUpperCase();
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    // Avalanche mixing for uniform modulo distribution
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return hash >>> 0;
}

export function normalizeSeed(seed) {
    const clean = String(seed ?? "ONAM-2026").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (!clean) return "ONAM-2026";
    if (clean.includes("-")) return clean;
    const digits = clean.replace(/\D+/g, "") || "2026";
    return `ONAM-${digits}`;
}

export function radialRepeat({ count, radius, rotationOffset = 0, callback }) {
    const step = 360 / count;
    for (let index = 0; index < count; index++) {
        const angle = rotationOffset + step * index;
        const pos = polarPoint(radius, angle);
        callback({ index, angle, x: pos.x, y: pos.y });
    }
}
