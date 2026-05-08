'use client';

import { useEffect, useRef } from 'react';
import { useNexusStore } from '@/lib/store';

type Particle = {
  x: number;
  y: number;
  ox: number; // origin x
  oy: number; // origin y
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
};

// Field-graph parameters: Ferromagnetic Grid logic
const FIELD_RADIUS_BASE = 280;   
const MAX_PARTICLES = 1200;      
const SPRING = 0.045;            
const DAMPING = 0.82;            
const ATTRACT_BASE = 0.08;            
const JITTER = 0.15;             

export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { 
    graphVisible, 
    graphMagnetism, 
    graphRadius,
    dotSize,
    dotDensity,
    hueRotationSpeed, 
    twinkleIntensity 
  } = useNexusStore();

  useEffect(() => {
    if (!graphVisible) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let hue = 12; 
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let initialPulse = 0; // 0 to 1
    let pulseComplete = false;

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Capture initial mouse position if available
      if (!pulseComplete) {
        // We can't get real mouse pos without an event, but we can default to center
        // or wait for the first move. However, the requirement is to enforce the graph
        // upon initialization. Let's use the screen center as a fallback or if mouse is outside.
        mouse.x = W / 2;
        mouse.y = H / 2;
        mouse.active = true;
      }

      // Use a constant pixel count for density to avoid massive jumps
      const count = Math.min(MAX_PARTICLES, Math.max(100, Math.floor((W * H) / dotDensity)));

      // If dimensions haven't changed significantly, skip re-init to prevent transition lag
      if (canvas.width === Math.floor(W * dpr) && canvas.height === Math.floor(H * dpr) && particles.length === count) {
        return;
      }

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(Math.sqrt(count * (W / H)));
      const rows = Math.ceil(count / cols);
      const cellW = W / cols;
      const cellH = H / rows;

      particles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (particles.length >= count) break;
          
          const ox = (c + 0.5) * cellW + (Math.random() - 0.5) * cellW * JITTER;
          const oy = (r + 0.5) * cellH + (Math.random() - 0.5) * cellH * JITTER;
          
          particles.push({
            x: ox,
            y: oy,
            ox,
            oy,
            vx: 0,
            vy: 0,
            size: (1.0 + Math.random() * 1.8) * dotSize,
            opacity: 0.2 + Math.random() * 0.4,
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const frame = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      // Handle initialization pulse: gentle depress/relax
      if (!pulseComplete) {
        initialPulse += 0.005; 
        if (initialPulse >= 1) {
          initialPulse = 1;
          pulseComplete = true;
        }
      }

      hue = (hue + (0.1 * hueRotationSpeed)) % 360;
      // Do not update CSS variables in the animation frame to avoid layout thrashing
      // document.documentElement.style.setProperty('--dynamic-hue', `${hue}deg`);

      if (!document.hasFocus() || document.visibilityState !== 'visible') {
        if (pulseComplete) mouse.active = false;
      }

      const isMouseInBounds = mouse.active && 
                             mouse.x >= 0 && mouse.x <= W && 
                             mouse.y >= 0 && mouse.y <= H;

      const currentRadius = FIELD_RADIUS_BASE * graphRadius;
      
      // Initialization pulse logic: Start strong (depress), then relax to the target magnetism
      // initialPulse goes 0 -> 1. 
      // Pulse multiplier: starts high (e.g. 2.5x), dips low (relax), ends at 1.0.
      // We want to be agnostic of the user strength modifier for the *peak* to avoid "crazy" values.
      // We'll calculate a pulse factor that ensures we don't exceed a reasonable absolute maximum.
      let pulseFactor = 1.0;
      if (!pulseComplete) {
        // Simple bell curve/bounce for the pulse: 
        // We'll use sin for a smooth swell and settle
        const phase = initialPulse * Math.PI;
        // This gives a 0 -> 1 -> 0 curve. 
        // We want: 1.0 (start) -> 2.0 (peak) -> 0.5 (relax) -> 1.0 (finish)
        pulseFactor = 1.0 + Math.sin(phase) * 1.5 * (1 - initialPulse) - Math.sin(phase * 0.5) * 0.2;
      }

      const currentAttract = ATTRACT_BASE * graphMagnetism * pulseFactor;

      for (const p of particles) {
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        if (isMouseInBounds) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < currentRadius && dist > 0.1) {
            const norm = 1 - (dist / currentRadius);
            const force = norm * norm * currentAttract;       
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const twinkle = Math.sin(Date.now() * p.twinkleSpeed * twinkleIntensity + p.twinkleOffset) * 0.15;
        const currentOpacity = Math.max(0.1, Math.min(1, p.opacity + twinkle));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        const displacement = Math.hypot(p.x - p.ox, p.y - p.oy);
        const stress = Math.min(1, displacement / (40 * graphMagnetism));
        const alpha = currentOpacity + (stress * 0.4);
        
        const pColor = `hsla(${hue}, 75%, 65%, ${alpha})`;
        const idleColor = `rgba(228, 231, 240, ${alpha})`;
        
        ctx.fillStyle = stress > (0.3 / graphMagnetism) ? pColor : idleColor;
        ctx.shadowBlur = stress > 0.3 ? 6 + (stress * 12) : 0;
        ctx.shadowColor = pColor;
          
        ctx.fill();
        ctx.shadowBlur = 0; 
      }

      raf = window.requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const isOverInteractive = target.closest('button, input, textarea, [role="button"], a');
      
      // Once the user moves the mouse, the initialization pulse is naturally superseded
      if (!pulseComplete && initialPulse > 0.5) pulseComplete = true;

      if (isOverInteractive) {
        mouse.active = false;
      } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      }
    };

    const onPointerLeave = () => { mouse.active = false; };
    const handleVisibilityChange = () => { if (document.visibilityState !== 'visible') mouse.active = false; };

    init();
    
    // Separate interval for CSS variable updates to reduce frequency and avoid paint storms
    const hueInterval = setInterval(() => {
      hue = (hue + (0.5 * hueRotationSpeed)) % 360;
      document.documentElement.style.setProperty('--dynamic-hue', `${hue}deg`);
    }, 100);

    frame();
    window.addEventListener('resize', init);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', onPointerLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      clearInterval(hueInterval);
      window.removeEventListener('resize', init);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, [graphVisible, graphMagnetism, graphRadius, dotSize, dotDensity, hueRotationSpeed, twinkleIntensity]);

  if (!graphVisible) return null;

  return <canvas id="bg" ref={ref} aria-hidden />;
}
