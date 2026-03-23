"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type TimedPoint = { x: number; y: number; t: number };

const FADE_DURATION = 750;
const GLOW_WIDTH = 10;
const CORE_WIDTH = 2.5;

export default function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStrokeRef = useRef<TimedPoint[]>([]);
  const completedStrokesRef = useRef<TimedPoint[][]>([]);
  const isDrawingRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const [isEmpty, setIsEmpty] = useState(true);
  const [hovered, setHovered] = useState(false);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.055)";
    const step = 24;
    for (let x = step; x < w; x += step) {
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = canvasSizeRef.current;
    const now = performance.now();

    ctx.clearRect(0, 0, w, h);
    drawGrid(ctx, w, h);

    completedStrokesRef.current = completedStrokesRef.current.filter((pts) => {
      if (pts.length === 0) return false;
      return now - pts[pts.length - 1].t < FADE_DURATION;
    });

    const allStrokes: { pts: TimedPoint[]; live: boolean }[] = [
      ...completedStrokesRef.current.map((pts) => ({ pts, live: false })),
      ...(activeStrokeRef.current.length > 1 ? [{ pts: activeStrokeRef.current, live: true }] : []),
    ];

    for (const { pts } of allStrokes) {
      if (pts.length < 2) continue;
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const age = now - p1.t;
        const alpha = Math.max(0, 1 - age / FADE_DURATION);
        if (alpha < 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha * 0.45;
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = GLOW_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(147, 197, 253, 0.85)";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha * 0.65;
        ctx.strokeStyle = "#bfdbfe";
        ctx.lineWidth = GLOW_WIDTH * 0.45;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(191, 219, 254, 0.9)";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = CORE_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    canvasSizeRef.current = { w: rect.width, h: rect.height };
  }, []);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [resizeCanvas, renderFrame]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): TimedPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const now = performance.now();
    if ("touches" in e) {
      const touch = (e as React.TouchEvent).touches[0];
      if (!touch) return null;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top, t: now };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top, t: now };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    isDrawingRef.current = true;
    activeStrokeRef.current = [pos];
    setIsEmpty(false);
  };

  const onDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const pos = getPos(e);
    if (!pos) return;
    activeStrokeRef.current.push(pos);
  };

  const endDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (activeStrokeRef.current.length > 1) {
      const endTime = performance.now();
      const stamped = activeStrokeRef.current.map((p) => ({ ...p, t: endTime }));
      completedStrokesRef.current.push(stamped);
    }
    activeStrokeRef.current = [];
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full select-none"
      style={{ height: "420px" }}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{
          background: "#f8fafc",
          boxShadow: "0 8px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)",
          border: "1px solid rgba(226,232,240,0.9)",
          transform: "rotateX(2deg)",
          perspective: "1200px",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-9 flex items-center px-4 gap-1.5 pointer-events-none z-10"
          style={{
            borderBottom: "1px solid rgba(226,232,240,0.6)",
            background: "rgba(248,250,252,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <div className="flex-1" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">SyncSpace Canvas</span>
          <div className="flex-1" />
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={onDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={onDraw}
          onTouchEnd={endDraw}
          className="absolute inset-0 w-full h-full"
          style={{
            cursor: hovered ? "crosshair" : "default",
            touchAction: "none",
            top: "36px",
            height: "calc(100% - 36px)",
          }}
        />

        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: "36px" }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="opacity-20 mb-2">
              <path d="M6 26 Q10 14 16 16 Q22 18 26 6" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            <p className="text-sm text-slate-400 font-medium tracking-wide">Draw anything to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
