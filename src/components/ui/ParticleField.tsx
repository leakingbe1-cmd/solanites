"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  density?: number;
  colors?: string[];
  className?: string;
  /** Particles drift upward like embers when true. */
  rising?: boolean;
}

/** Lightweight canvas starfield / ember field. Pauses when off-screen. */
export function ParticleField({ density = 0.00012, colors = ["#9945ff", "#14f195", "#00c2ff", "#ffffff"], className = "", rising = true }: ParticleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type P = { x: number; y: number; r: number; vx: number; vy: number; c: string; a: number; tw: number };
    let ps: P[] = [];

    const spawn = (initial: boolean): P => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.08,
      vy: rising ? -(Math.random() * 0.25 + 0.05) : (Math.random() - 0.5) * 0.05,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.7 + 0.2,
      tw: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(260, Math.floor(w * h * density));
      ps = Array.from({ length: n }, () => spawn(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;
        if (p.y < -10 || p.x < -10 || p.x > w + 10) Object.assign(p, spawn(false));
        const a = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.r > 1.3) {
          ctx.globalAlpha = a * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) draw();
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density, colors, rising]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
