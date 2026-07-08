'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface ParticleBackgroundProps {
  /** Number of particles. Default 70. Use 50 for inner pages. */
  count?: number;
  /** Max connection distance in px. Default 120. */
  connectionDist?: number;
}

export default function ParticleBackground({
  count = 70,
  connectionDist = 120,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouse     = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, frame = 0;
    let particles: Particle[] = [];

    /* ── Read CSS variable helpers ─────────────── */
    const getCSSVar = (name: string) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();

    const getParticleRGB = () =>
      getCSSVar('--particle-rgb') || '124,58,237';
    const getDotOpacity = () =>
      parseFloat(getCSSVar('--particle-dot-opacity') || '0.75');
    const getLineOpacity = () =>
      parseFloat(getCSSVar('--particle-line-opacity') || '0.3');

    /* ── Resize ────────────────────────────────── */
    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();

    /* ── Create particles ──────────────────────── */
    function makeParticle(): Particle {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.2,
        baseOpacity: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.018 + 0.006,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    }
    particles = Array.from({ length: count }, makeParticle);

    /* ── Animation loop ────────────────────────── */
    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, W, H);
      frame++;

      const rgb      = getParticleRGB();
      const dotMax   = getDotOpacity();
      const lineMax  = getLineOpacity();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        /* Mouse repel */
        const mdx = p.x - mouse.current.x;
        const mdy = p.y - mouse.current.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 130 && md > 0) {
          const f = ((130 - md) / 130) * 0.6;
          p.vx += (mdx / md) * f;
          p.vy += (mdy / md) * f;
        }

        /* Damping + speed clamp */
        p.vx *= 0.985;
        p.vy *= 0.985;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1.2) { p.vx = (p.vx / spd) * 1.2; p.vy = (p.vy / spd) * 1.2; }

        /* Move */
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap */
        if (p.x < -8) p.x = W + 8;
        if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8;
        if (p.y > H + 8) p.y = -8;

        /* Pulse */
        const pulse = Math.sin(frame * p.pulseSpeed + p.pulsePhase);
        const op = Math.min(dotMax, p.baseOpacity * dotMax + pulse * 0.1);

        /* Draw dot */
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${rgb},${op})`;
        ctx!.fill();

        /* Draw connections */
        for (let j = i + 1; j < particles.length; j++) {
          const q  = particles[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const d  = Math.sqrt(ex * ex + ey * ey);
          if (d < connectionDist) {
            const lop = (1 - d / connectionDist) * lineMax * (op / dotMax);
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(${rgb},${lop})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
          }
        }
      }
    }

    draw();

    /* ── Mouse tracking ─────────────────────────── */
    const onMove  = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, [count, connectionDist]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="print-hidden"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 1,
        animation: 'particleFadeIn 1.2s ease-out 0.3s forwards',
      }}
    />
  );
}
