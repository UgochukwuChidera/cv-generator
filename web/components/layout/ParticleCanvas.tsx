'use client';

import { useEffect, useRef } from 'react';

type Particle = { x: number; y: number; w: number; h: number; vx: number; vy: number; r: number; vr: number; c: string };

const COLORS = [
  'rgba(255,170,181,0.26)',
  'rgba(255,77,106,0.28)',
  'rgba(107,159,255,0.24)',
  'rgba(77,217,148,0.24)',
  'rgba(255,204,85,0.22)',
];

const DENSITY_DIVISOR = 9000;

export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(24, Math.floor((width * height) / DENSITY_DIVISOR));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        w: 2 + Math.random() * 5,
        h: 1 + Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.56,
        vy: (Math.random() - 0.5) * 0.56,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.018,
        c: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
      }));
    };

    const frame = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 170) {
            const pull = (170 - dist) / 1700;
            p.vx += dx * pull * 0.02;
            p.vy += dy * pull * 0.02;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.vx *= 0.992;
        p.vy *= 0.992;

        if (p.x < -20) p.x = width + 20;
        if (p.y < -20) p.y = height + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      raf = window.requestAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
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
