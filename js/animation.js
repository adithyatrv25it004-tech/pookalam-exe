/*
=========================================================
 POOKALAM.EXE — Motion & Bloom Choreography Engine
 Organic center-outward radial blooming with separated transform hierarchy
=========================================================
*/

let activeAnimationId = null;
let animationTimeoutId = null;

/**
 * Triggers organic center-outward bloom animation
 */
export function triggerBloom(svgElement, { onStart, onComplete, durationMs = 2200 } = {}) {
    if (!svgElement) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Clear any previous animation timers
    if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }

    if (onStart) {
        onStart();
    }

    if (prefersReducedMotion) {
        svgElement.classList.remove("is-blooming", "is-settled");
        void svgElement.offsetWidth;
        svgElement.classList.add("is-settled");
        if (onComplete) {
            onComplete(0);
        }
        return;
    }

    const startTime = performance.now();

    // Reset animation state
    svgElement.classList.remove("is-blooming", "is-settled");
    void svgElement.offsetWidth; // force reflow
    svgElement.classList.add("is-blooming");

    // Apply radial stagger and transform-origins to layers and motif nodes
    const root = svgElement.querySelector(".pookalam-root");
    if (root) {
        const layers = Array.from(root.querySelectorAll(".layer"));

        layers.forEach((layer) => {
            const layerIndex = parseInt(layer.getAttribute("data-layer") || "0", 10);
            const animNodes = Array.from(layer.querySelectorAll(".anim-node"));
            const count = animNodes.length || 1;

            // Base delay by layer distance from center (0 to 7)
            // Layer 0: 0ms, Layer 1: 150ms, Layer 2: 350ms, Layer 3: 650ms, Layer 4: 900ms, Layer 5: 1150ms, Layer 6: 1400ms, Layer 7: 1650ms
            const layerBaseDelay = layerIndex === 0 ? 0 : 120 + layerIndex * 220;

            animNodes.forEach((node, i) => {
                // Micro angular stagger around the circumference
                const angleStagger = (i / count) * 200;
                const totalDelay = (layerBaseDelay + angleStagger) / 1000;
                node.style.animationDelay = `${totalDelay.toFixed(3)}s`;
            });
        });
    }

    // Schedule settle & completion
    animationTimeoutId = setTimeout(() => {
        svgElement.classList.remove("is-blooming");
        svgElement.classList.add("is-settled");

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        if (onComplete) {
            onComplete(elapsed);
        }
    }, durationMs);
}

/**
 * Smooth transition for generating new artwork (fade out old, then bloom new)
 */
export function transitionNewArtwork(svgElement, renderFn, { onStart, onComplete } = {}) {
    if (!svgElement) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        renderFn();
        triggerBloom(svgElement, { onStart, onComplete });
        return;
    }

    svgElement.classList.add("is-contracting");

    setTimeout(() => {
        renderFn();
        svgElement.classList.remove("is-contracting");
        triggerBloom(svgElement, { onStart, onComplete });
    }, 240);
}
