/*
=========================================================
 POOKALAM.EXE — Ambient Golden Dust Particle Layer
 Subtle festival atmosphere floating around the artwork
=========================================================
*/

export function initAmbientParticles(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    const count = prefersReducedMotion ? 12 : 24;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1.0 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.35,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -0.15 - Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.001;

        particles.forEach((p) => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around edges
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;

            const pulse = 0.65 + Math.sin(time * 1.5 + p.phase) * 0.35;

            ctx.beginPath();
            ctx.fillStyle = `rgba(245, 197, 66, ${p.alpha * pulse})`;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        if (!prefersReducedMotion) {
            requestAnimationFrame(draw);
        }
    }

    draw();
}
