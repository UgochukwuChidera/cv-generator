'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  ox: number; // origin x
  oy: number; // origin y
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  clusterId: number; // which cluster this particle belongs to
};

// Force-graph parameters
const FIELD_RADIUS = 160;
const DENSITY_DIVISOR = 2500;   // lower = more particles
const MAX_PARTICLES = 280;       // cap for performance
const SPRING = 0.028;            // how strongly each point returns to origin
const DAMPING = 0.82;            // velocity decay
const REPULSE = 22;              // push force magnitude when mouse is near
const ATTRACT = 0.18;            // lateral "compression" pull toward mouse column/row
const CLUSTER_PULL = 0.0012;     // gentle attraction toward cluster centre
const EDGE_DIST = 110;           // max distance for drawing connection lines between particles
const EDGE_OPACITY_MAX = 0.18;   // max opacity of connection edges
const NUM_CLUSTERS = 6;          // number of loose cluster centres

export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let clusterCentres: { x: number; y: number }[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(MAX_PARTICLES, Math.max(80, Math.floor((W * H) / DENSITY_DIVISOR)));

      // Place cluster centres at scattered positions
      clusterCentres = Array.from({ length: NUM_CLUSTERS }, (_, i) => ({
        x: W * (0.15 + (i % 3) * 0.35 + (Math.random() - 0.5) * 0.18),
        y: H * (0.2 + Math.floor(i / 3) * 0.55 + (Math.random() - 0.5) * 0.2),
      }));

      // Build a loose grid so points have natural "home" positions
      const cols = Math.ceil(Math.sqrt(count * (W / H)));
      const rows = Math.ceil(count / cols);

      particles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (particles.length >= count) break;
          // Jitter each grid cell so it feels organic, not perfectly aligned
          const ox = (c / (cols - 1)) * W + (Math.random() - 0.5) * (W / cols) * 0.9;
          const oy = (r / (rows - 1)) * H + (Math.random() - 0.5) * (H / rows) * 0.9;
          // Assign to nearest cluster centre
          let clusterId = 0;
          let bestDist = Infinity;
          clusterCentres.forEach((cc, ci) => {
            const d = Math.hypot(ox - cc.x, oy - cc.y);
            if (d < bestDist) { bestDist = d; clusterId = ci; }
          });
          particles.push({
            x: ox,
            y: oy,
            ox,
            oy,
            vx: 0,
            vy: 0,
            size: 0.9 + Math.random() * 1.5,
            opacity: 0.22 + Math.random() * 0.35,
            clusterId,
          });
        }
      }
    };

    const frame = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      // Draw connection lines between close particles (force-graph edges)
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST) {
            const edgeOpacity = EDGE_OPACITY_MAX * (1 - dist / EDGE_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(228, 231, 240, ${edgeOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        // Spring back toward origin
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        // Gentle pull toward this particle's cluster centre for denser grouping
        const cc = clusterCentres[p.clusterId];
        if (cc) {
          p.vx += (cc.x - p.x) * CLUSTER_PULL;
          p.vy += (cc.y - p.y) * CLUSTER_PULL;
        }

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < FIELD_RADIUS && dist > 0.5) {
            // Radial push — particles move away from the cursor
            const norm = dist / FIELD_RADIUS;          // 0 = center, 1 = edge
            const push = (1 - norm) * (1 - norm);      // quadratic falloff
            p.vx += (dx / dist) * push * REPULSE;
            p.vy += (dy / dist) * push * REPULSE;

            // Gentle lateral compression — particles on the edge of the field
            // get a tiny pull toward the cursor axis, creating a "lens" look
            const lat = (0.5 - norm) * ATTRACT;
            p.vx += (mouse.x - p.x) * lat * 0.012;
            p.vy += (mouse.y - p.y) * lat * 0.012;
          }
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        // Draw — pure white/grey dots, varying opacity
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(228, 231, 240, ${p.opacity})`;
        ctx.fill();
      }

      raf = window.requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onPointerLeave = () => {
      mouse.active = false;
    };

    init();
    frame();
    window.addEventListener('resize', init);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', init);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas id="bg" ref={ref} aria-hidden />;
}