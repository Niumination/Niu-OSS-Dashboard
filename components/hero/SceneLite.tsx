'use client';

import { useEffect, useRef } from 'react';

/*
 * SceneLite — fallback performa ringan (diaktifkan otomatis untuk perangkat
 * mobile berdaya rendah / prefers-reduced-motion / saat scene 3D <45 fps).
 *
 * Visual: gradasi glow beranimasi (CSS) + jaringan partikel 2D pada canvas
 * (≈44 partikel) yang tetap reaktif terhadap kursor — target 60 fps.
 */
export default function SceneLite() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let raf = 0;

    const N = 44;
    const P = Array.from({ length: N }, (_, i) => ({
      x: (i * 0.618) % 1,
      y: (i * 0.382 + 0.2) % 1,
      vx: (Math.random() - 0.5) * 0.00055,
      vy: (Math.random() - 0.5) * 0.00055,
      ember: i % 5 === 0,
    }));
    const mouse = { x: 0.5, y: 0.5, active: false };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.active ? mouse.x * w : -9999;
      const my = mouse.active ? mouse.y * h : -9999;

      for (const p of P) {
        p.x += p.vx + (mouse.active ? (mx / Math.max(1, w) - p.x) * 0.00045 : 0);
        p.y += p.vy + (mouse.active ? (my / Math.max(1, h) - p.y) * 0.00045 : 0);
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02) p.y = -0.02;
      }

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = P[i];
          const b = P[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - d / 110) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }

      for (const p of P) {
        ctx.fillStyle = p.ember ? 'rgba(224,90,30,0.9)' : 'rgba(0,229,255,0.75)';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.ember ? 2.2 : 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    raf = requestAnimationFrame(draw);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute -top-16 -right-10 size-72 rounded-full bg-ember/20 blur-3xl animate-float-orb" />
      <div
        className="absolute -bottom-20 -left-10 size-72 rounded-full bg-spotlight/10 blur-3xl animate-float-orb"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="absolute top-1/3 left-1/3 size-56 rounded-full bg-[#7c3aed]/10 blur-3xl animate-float-orb"
        style={{ animationDelay: '-9s' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
