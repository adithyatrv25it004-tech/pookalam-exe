/*
=========================================================
 POOKALAM.EXE — Procedural Generative Engine
 Constructs authentic Kerala Pookalams using polar math & floral grammar
=========================================================
*/

import {
    STAGE_SIZE,
    CENTER,
    polarPoint,
    calculateChordLength,
    createSVGElement,
    createGroup,
    createMultiLayerLotus,
    createMarigoldCluster,
    createOrnateLeaf,
    createCrownBorderMotif,
    createTeardropGem,
    createMiniFlowerUnit,
    createGeometricStar,
    createSeededRandom,
    hashSeed,
    normalizeSeed,
    radialRepeat
} from "./geometry.js";

export const POOKALAM_VIEWBOX = {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    centerX: CENTER.x,
    centerY: CENTER.y
};

export const PALETTES = [
    {
        name: "Kasavu Royale",
        colors: {
            gold: "#f5c542",
            deepGold: "#d49e35",
            amber: "#eb8626",
            saffron: "#eb5a28",
            crimson: "#9e1e24",
            deepCrimson: "#751318",
            magenta: "#b81d68",
            royalPurple: "#5c1b69",
            ivory: "#fffdf5",
            leafGreen: "#2e7d32",
            deepForest: "#114224",
            accentYellow: "#fed330"
        }
    },
    {
        name: "Temple Saffron",
        colors: {
            gold: "#f1c40f",
            deepGold: "#e67e22",
            amber: "#d35400",
            saffron: "#e74c3c",
            crimson: "#c0392b",
            deepCrimson: "#922b21",
            magenta: "#c2185b",
            royalPurple: "#6a1b9a",
            ivory: "#fef9e7",
            leafGreen: "#27ae60",
            deepForest: "#196f3d",
            accentYellow: "#f9e79f"
        }
    },
    {
        name: "Malabar Sunset",
        colors: {
            gold: "#fbc531",
            deepGold: "#e1b12c",
            amber: "#e67e22",
            saffron: "#d35400",
            crimson: "#b71540",
            deepCrimson: "#780829",
            magenta: "#9c27b0",
            royalPurple: "#4a148c",
            ivory: "#f8efba",
            leafGreen: "#44bd32",
            deepForest: "#1e6f1a",
            accentYellow: "#ffeaa7"
        }
    },
    {
        name: "Nilavilakku Glow",
        colors: {
            gold: "#f39c12",
            deepGold: "#d68910",
            amber: "#ca6f1e",
            saffron: "#ba4a00",
            crimson: "#a93226",
            deepCrimson: "#641e16",
            magenta: "#880e4f",
            royalPurple: "#4a148c",
            ivory: "#fcf3cf",
            leafGreen: "#229954",
            deepForest: "#145a32",
            accentYellow: "#f9e79f"
        }
    }
];

export function createPookalamSeed(seed) {
    const normalized = normalizeSeed(seed);
    const hashed = hashSeed(normalized);
    return {
        seed: normalized,
        hash: hashed,
        generation: (hashed % 9000) + 1
    };
}

export function generatePookalamConfiguration(seed, { generation = 1 } = {}) {
    const stable = createPookalamSeed(seed);
    const rng = createSeededRandom(stable.hash);
    const palette = PALETTES[stable.hash % PALETTES.length];
    const c = palette.colors;

    // Symmetry base multiplier: 12, 16, or 20
    const symmetryOptions = [12, 16, 18, 24];
    const symmetry = symmetryOptions[stable.hash % symmetryOptions.length];

    const layers = [];

    // ZONE 0: Sacred Center Jewel (Layer 0)
    layers.push({
        id: 0,
        name: "Center Jewel",
        zone: 0,
        type: "center_jewel",
        radius: 0,
        count: 12,
        rotationOffset: 0,
        primaryColor: c.gold,
        description: "12 sacred core petals with star disc"
    });

    // ZONE 1: Inner Petal Ring (Layer 1)
    const innerTeardropCount = symmetry;
    layers.push({
        id: 1,
        name: "Inner Bloom",
        zone: 1,
        type: "inner_teardrop",
        radius: 65 + (rng() * 6),
        count: innerTeardropCount,
        rotationOffset: rng() * (360 / innerTeardropCount),
        width: 14 + rng() * 4,
        height: 28 + rng() * 6,
        primaryFill: (stable.hash % 2 === 0) ? c.magenta : c.crimson,
        accentFill: c.gold,
        primaryColor: (stable.hash % 2 === 0) ? c.magenta : c.crimson,
        description: `${innerTeardropCount} pointed lotus teardrops`
    });

    // ZONE 2: Hero Lotus Petals (Layer 2)
    const heroCount = symmetry;
    layers.push({
        id: 2,
        name: "Hero Lotus Petals",
        zone: 2,
        type: "hero_lotus",
        radius: 120 + (rng() * 10),
        count: heroCount,
        rotationOffset: (360 / heroCount) * 0.5,
        width: 32 + rng() * 6,
        height: 64 + rng() * 10,
        outerFill: (stable.hash % 3 === 0) ? c.royalPurple : (stable.hash % 3 === 1) ? c.magenta : c.saffron,
        innerFill: (stable.hash % 2 === 0) ? c.gold : c.ivory,
        accentFill: c.deepCrimson,
        coreFill: c.accentYellow,
        primaryColor: (stable.hash % 3 === 0) ? c.royalPurple : c.magenta,
        description: `${heroCount} compound double lotuses`
    });

    // ZONE 3: Intermediate Accent Ring (Layer 3)
    const midAccentCount = symmetry * 2;
    layers.push({
        id: 3,
        name: "Kasavu Star Accents",
        zone: 3,
        type: "star_accent",
        radius: 175 + (rng() * 8),
        count: midAccentCount,
        rotationOffset: rng() * (360 / midAccentCount),
        width: 18 + rng() * 4,
        height: 26 + rng() * 4,
        fill: c.gold,
        primaryColor: c.gold,
        description: `${midAccentCount} golden diamond stars`
    });

    // ZONE 4: Lush Foliage & Leaf Ring (Layer 4)
    const leafCount = symmetry * 2;
    layers.push({
        id: 4,
        name: "Emerald Foliage",
        zone: 4,
        type: "leaf_ring",
        radius: 228 + (rng() * 10),
        count: leafCount,
        rotationOffset: (360 / leafCount) * 0.5,
        width: 22 + rng() * 4,
        height: 48 + rng() * 8,
        fill: (stable.hash % 2 === 0) ? c.leafGreen : c.deepForest,
        veinFill: "rgba(255,255,255,0.35)",
        accentDot: c.gold,
        primaryColor: c.leafGreen,
        description: `${leafCount} directional leaves with veins`
    });

    // ZONE 5: Dense Marigold Blossom Field (Layer 5)
    const marigoldCount = symmetry * 2;
    layers.push({
        id: 5,
        name: "Marigold Field",
        zone: 5,
        type: "marigold_field",
        radius: 285 + (rng() * 10),
        count: marigoldCount,
        rotationOffset: rng() * (360 / marigoldCount),
        blossomRadius: 18 + rng() * 4,
        primaryFill: c.amber,
        secondaryFill: c.gold,
        centerFill: c.deepCrimson,
        accentFill: c.accentYellow,
        primaryColor: c.amber,
        description: `${marigoldCount} rosette flower blossoms`
    });

    // ZONE 6: Outer Floral Garland (Layer 6)
    const garlandCount = symmetry * 3;
    layers.push({
        id: 6,
        name: "Floral Garland",
        zone: 6,
        type: "outer_garland",
        radius: 350 + (rng() * 12),
        count: garlandCount,
        rotationOffset: (360 / garlandCount) * 0.5,
        width: 24 + rng() * 6,
        height: 46 + rng() * 8,
        outerFill: (stable.hash % 2 === 0) ? c.crimson : c.saffron,
        innerFill: c.gold,
        accentFill: c.ivory,
        coreFill: c.deepGold,
        primaryColor: (stable.hash % 2 === 0) ? c.crimson : c.saffron,
        description: `${garlandCount} outer garland blossoms`
    });

    // ZONE 7: Ceremonial Border Crown (Layer 7)
    const crownCount = symmetry * 3;
    layers.push({
        id: 7,
        name: "Border Crown",
        zone: 7,
        type: "border_crown",
        radius: 415 + (rng() * 10),
        count: crownCount,
        rotationOffset: 0,
        size: 24 + rng() * 4,
        fill: (stable.hash % 2 === 0) ? c.leafGreen : c.deepCrimson,
        accent: c.gold,
        secondaryAccent: c.ivory,
        primaryColor: (stable.hash % 2 === 0) ? c.leafGreen : c.deepCrimson,
        description: `${crownCount} ceremonial crown ornaments`
    });

    // Calculate total rendered elements
    const totalElements = layers.reduce((sum, layer) => sum + layer.count, 0) + 16;

    return {
        seed: stable.seed,
        hash: stable.hash,
        generation,
        paletteName: palette.name,
        palette,
        symmetry,
        layers,
        layerCount: layers.length,
        totalElements,
        viewBox: POOKALAM_VIEWBOX,
        center: {
            x: CENTER.x,
            y: CENTER.y
        }
    };
}

/**
 * Builds the Center Jewel (Sacred Core)
 */
function buildCenterJewel(config, layer) {
    const group = createGroup(`layer layer-0 layer-center`);
    group.setAttribute("data-layer", "0");
    group.setAttribute("data-name", layer.name);
    group.setAttribute("data-zone", "0");

    const cx = config.center.x;
    const cy = config.center.y;
    const c = config.palette.colors;

    // Background sacred disc
    const bgDisc = createSVGElement("circle", {
        cx,
        cy,
        r: 46,
        fill: c.deepCrimson,
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))"
    });
    group.appendChild(bgDisc);

    // Multi-pointed golden star
    const star = createGeometricStar({
        x: cx,
        y: cy,
        points: 12,
        outerRadius: 42,
        innerRadius: 22,
        fill: c.gold,
        rotation: 0
    });
    group.appendChild(star);

    // Inner saffron disc
    group.appendChild(createSVGElement("circle", {
        cx,
        cy,
        r: 22,
        fill: c.saffron
    }));

    // Center ivory pearl
    group.appendChild(createSVGElement("circle", {
        cx,
        cy,
        r: 9,
        fill: c.ivory
    }));

    // 12 mini lotus petals radiating around core
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
        const ang = (360 / petalCount) * i;
        const pt = polarPoint(42, ang, cx, cy);
        const petal = createTeardropGem({
            x: pt.x,
            y: pt.y,
            width: 9,
            height: 16,
            fill: c.ivory,
            accentFill: c.gold,
            rotation: ang + 90
        });
        group.appendChild(petal);
    }

    return group;
}

/**
 * Renders the entire Pookalam SVG DOM
 */
export function renderPookalam(svg, config) {
    if (!svg) {
        throw new Error("SVG element is required to render the Pookalam.");
    }

    svg.setAttribute("viewBox", `0 0 ${config.viewBox.width} ${config.viewBox.height}`);
    svg.innerHTML = "";

    // Defs for filters and gradients if needed
    const defs = createSVGElement("defs");
    defs.innerHTML = `
        <filter id="pookalamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="rgba(0,0,0,0.5)" />
        </filter>
    `;
    svg.appendChild(defs);

    const root = createGroup("pookalam-root");
    root.setAttribute("data-seed", config.seed);
    root.setAttribute("data-palette", config.paletteName);

    // Background subtle dark grounding disc
    const groundingDisc = createSVGElement("circle", {
        cx: config.center.x,
        cy: config.center.y,
        r: 460,
        fill: "rgba(5, 16, 12, 0.4)",
        stroke: "rgba(245, 197, 66, 0.15)",
        "stroke-width": 1.5,
        "stroke-dasharray": "4 8"
    });
    root.appendChild(groundingDisc);

    // Render layers from outer to inner or inner to outer in correct visual stacking
    // Visual order: Layer 7 (outermost) -> Layer 6 -> Layer 5 -> Layer 4 -> Layer 3 -> Layer 2 -> Layer 1 -> Layer 0 (center)
    // Rendering in back-to-front order (outermost first so inner layers overlap cleanly on top)
    const renderOrder = [...config.layers].reverse();

    renderOrder.forEach((layer) => {
        if (layer.type === "center_jewel") {
            const centerGroup = buildCenterJewel(config, layer);
            root.appendChild(centerGroup);
            return;
        }

        const layerGroup = createGroup(`layer layer-${layer.id}`);
        layerGroup.setAttribute("data-layer", String(layer.id));
        layerGroup.setAttribute("data-name", layer.name);
        layerGroup.setAttribute("data-zone", String(layer.zone));

        radialRepeat({
            count: layer.count,
            radius: layer.radius,
            rotationOffset: layer.rotationOffset,
            callback: ({ angle, x, y }) => {
                let motif;
                const rotation = angle + 90;

                switch (layer.type) {
                    case "inner_teardrop":
                        motif = createTeardropGem({
                            x, y,
                            width: layer.width,
                            height: layer.height,
                            fill: layer.primaryFill,
                            accentFill: layer.accentFill,
                            rotation
                        });
                        break;

                    case "hero_lotus":
                        motif = createMultiLayerLotus({
                            x, y,
                            width: layer.width,
                            height: layer.height,
                            outerFill: layer.outerFill,
                            innerFill: layer.innerFill,
                            accentFill: layer.accentFill,
                            coreFill: layer.coreFill,
                            rotation
                        });
                        break;

                    case "star_accent":
                        motif = createGeometricStar({
                            x, y,
                            points: 6,
                            outerRadius: layer.width,
                            innerRadius: layer.width * 0.45,
                            fill: layer.fill,
                            rotation: angle
                        });
                        break;

                    case "leaf_ring":
                        motif = createOrnateLeaf({
                            x, y,
                            width: layer.width,
                            height: layer.height,
                            fill: layer.fill,
                            veinFill: layer.veinFill,
                            accentDot: layer.accentDot,
                            rotation
                        });
                        break;

                    case "marigold_field":
                        motif = createMarigoldCluster({
                            x, y,
                            radius: layer.blossomRadius,
                            primaryFill: layer.primaryFill,
                            secondaryFill: layer.secondaryFill,
                            centerFill: layer.centerFill,
                            accentFill: layer.accentFill,
                            petalCount: 10,
                            rotation: angle
                        });
                        break;

                    case "outer_garland":
                        motif = createMultiLayerLotus({
                            x, y,
                            width: layer.width,
                            height: layer.height,
                            outerFill: layer.outerFill,
                            innerFill: layer.innerFill,
                            accentFill: layer.accentFill,
                            coreFill: layer.coreFill,
                            rotation
                        });
                        break;

                    case "border_crown":
                        motif = createCrownBorderMotif({
                            x, y,
                            size: layer.size,
                            fill: layer.fill,
                            accent: layer.accent,
                            secondaryAccent: layer.secondaryAccent,
                            rotation
                        });
                        break;

                    default:
                        motif = createTeardropGem({ x, y, width: 14, height: 26, fill: config.palette.colors.gold, rotation });
                        break;
                }

                if (motif) {
                    layerGroup.appendChild(motif);
                }
            }
        });

        root.appendChild(layerGroup);
    });

    svg.appendChild(root);
    return root;
}

/**
 * Returns standalone clean SVG markup string with proper XML header and embedded styling for export
 */
export function renderPookalamToString(config) {
    const svg = createSVGElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: `0 0 ${config.viewBox.width} ${config.viewBox.height}`,
        width: "1000",
        height: "1000"
    });

    // Embed background rect for standalone viewing
    const bg = createSVGElement("rect", {
        width: "1000",
        height: "1000",
        fill: "#06120c"
    });
    svg.appendChild(bg);

    renderPookalam(svg, config);

    return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by POOKALAM.EXE - Seed: ${config.seed} -->\n${svg.outerHTML}`;
}

export function getPookalamStats(config) {
    return {
        seed: config.seed,
        paletteName: config.paletteName,
        layerCount: config.layerCount,
        totalElements: config.totalElements,
        symmetry: config.symmetry,
        generation: config.generation
    };
}
