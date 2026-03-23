"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

type CleanShape =
  | { type: "rect"; x: number; y: number; w: number; h: number; rx: number; label: string }
  | { type: "diamond"; x: number; y: number; w: number; h: number; label: string }
  | { type: "arrow"; x1: number; y1: number; x2: number; y2: number };

const cleanShapes: CleanShape[] = [
  { type: "rect", x: 55, y: 58, w: 70, h: 44, rx: 6, label: "Idea" },
  { type: "rect", x: 155, y: 42, w: 77, h: 44, rx: 6, label: "Research" },
  { type: "rect", x: 55, y: 130, w: 70, h: 44, rx: 6, label: "Sketch" },
  { type: "diamond", x: 153, y: 124, w: 82, h: 52, label: "Review?" },
  { type: "arrow", x1: 125, y1: 80, x2: 155, y2: 64 },
  { type: "arrow", x1: 90, y1: 102, x2: 90, y2: 130 },
  { type: "arrow", x1: 194, y1: 86, x2: 194, y2: 124 },
  { type: "arrow", x1: 125, y1: 152, x2: 153, y2: 150 },
];

function useAnimationLoop(inView: boolean) {
  const [stage, setStage] = useState<"prompt" | "thinking" | "generated" | "reset">("prompt");
  const [glowX, setGlowX] = useState(-60);
  const [typedChars, setTypedChars] = useState(0);
  const prompt = "Create a user onboarding flowchart with signup, email verification, profile setup, and dashboard.";

  useEffect(() => {
    if (!inView) return;

    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let typeInterval: ReturnType<typeof setInterval> | undefined;

    const runLoop = () => {
      setStage("prompt");
      setGlowX(-60);
      setTypedChars(0);

      typeInterval = setInterval(() => {
        setTypedChars((prev) => {
          if (prev >= prompt.length) {
            if (typeInterval) clearInterval(typeInterval);

            timeout = setTimeout(() => {
              setStage("thinking");
              const start = performance.now();
              const duration = 1000;

              const sweep = () => {
                const t = Math.min((performance.now() - start) / duration, 1);
                setGlowX(-60 + t * 400);

                if (t < 1) {
                  raf = requestAnimationFrame(sweep);
                } else {
                  setStage("generated");
                  timeout = setTimeout(() => {
                    setStage("reset");
                    timeout = setTimeout(runLoop, 700);
                  }, 1600);
                }
              };

              raf = requestAnimationFrame(sweep);
            }, 500);

            return prev;
          }

          return prev + 1;
        });
      }, 18);
    };

    runLoop();

    return () => {
      cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
      if (typeInterval) clearInterval(typeInterval);
    };
  }, [inView, prompt]);

  return { stage, glowX, typedChars, prompt };
}

export default function DemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { stage, glowX, typedChars, prompt } = useAnimationLoop(inView);

  return (
    <section ref={ref} id="demo" className="relative py-24 px-6 overflow-hidden" style={{ background: "hsl(216, 89%, 86%)" }}>

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-3">See it work</p>
          <h2
            className="font-semibold text-[#0b1f4a] tracking-tight"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.025em" }}
          >
            Prompt to flowchart in seconds.
          </h2>
          <p className="mt-3 text-blue-900/70 max-w-md mx-auto text-sm leading-relaxed">
            Describe the process you want. SyncSpace generates the full diagram so your team can iterate live.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto"
          style={{ maxWidth: 520 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(96,165,250,0.42)",
              boxShadow: "0 8px 36px rgba(37,99,235,0.12), 0 2px 8px rgba(15,23,42,0.06)",
            }}
          >
            <div
              className="flex items-center px-4 h-9 gap-1.5"
              style={{ borderBottom: "1px solid rgba(191,219,254,0.8)", background: "rgba(239,246,255,0.9)" }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-100" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-100" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-100" />
              <div className="flex-1 text-center text-xs text-blue-900/50 font-medium -ml-8">Demo - AI Generator</div>
              <AnimatePresence>
                {(stage === "thinking" || stage === "generated") && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-xs font-semibold text-blue-700"
                    style={{ fontSize: "10px" }}
                  >
                    AI Processing...
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" style={{ height: 240 }}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.5 }}>
                <defs>
                  <pattern id="dot-demo" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="12" cy="12" r="1" fill="rgba(148,163,184,0.4)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dot-demo)" />
              </svg>

              <motion.div
                className="absolute left-6 right-6 top-6 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-950"
                animate={{ opacity: stage === "reset" ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-semibold text-blue-700">Prompt:</span> {prompt.slice(0, typedChars)}
                {typedChars < prompt.length && <span className="inline-block ml-0.5 h-3 w-[1px] bg-blue-700 align-middle" />}
              </motion.div>

              <AnimatePresence>
                {stage === "thinking" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ top: "0px", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${glowX}px`,
                        width: "84px",
                        background: "rgba(96,165,250,0.22)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 300 220"
                preserveAspectRatio="xMidYMid meet"
                animate={{ opacity: stage === "generated" ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {cleanShapes.map((s, i) => {
                  if (s.type === "rect") {
                    return (
                      <g key={i}>
                        <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill="rgba(37,99,235,0.06)" stroke="#2563eb" strokeWidth="1.5" />
                        <text
                          x={s.x + s.w / 2}
                          y={s.y + s.h / 2 + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#1d4ed8"
                          fontWeight="600"
                          fontFamily="system-ui, sans-serif"
                        >
                          {s.label}
                        </text>
                      </g>
                    );
                  }

                  if (s.type === "diamond") {
                    const mx = s.x + s.w / 2;
                    const my = s.y + s.h / 2;
                    const pts = `${mx},${s.y} ${s.x + s.w},${my} ${mx},${s.y + s.h} ${s.x},${my}`;
                    return (
                      <g key={i}>
                        <polygon points={pts} fill="rgba(37,99,235,0.06)" stroke="#2563eb" strokeWidth="1.5" />
                        <text x={mx} y={my + 4} textAnchor="middle" fontSize="10" fill="#1d4ed8" fontWeight="600" fontFamily="system-ui, sans-serif">
                          {s.label}
                        </text>
                      </g>
                    );
                  }

                  if (s.type === "arrow") {
                    const dx = s.x2 - s.x1;
                    const dy = s.y2 - s.y1;
                    const angle = Math.atan2(dy, dx);
                    const aLen = 7;
                    return (
                      <g key={i} stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round">
                        <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
                        <line x1={s.x2} y1={s.y2} x2={s.x2 - aLen * Math.cos(angle - 0.5)} y2={s.y2 - aLen * Math.sin(angle - 0.5)} />
                        <line x1={s.x2} y1={s.y2} x2={s.x2 - aLen * Math.cos(angle + 0.5)} y2={s.y2 - aLen * Math.sin(angle + 0.5)} />
                      </g>
                    );
                  }

                  return null;
                })}
              </motion.svg>
            </div>

            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(191,219,254,0.8)" }}>
              <motion.span animate={{ opacity: stage === "prompt" || stage === "thinking" ? 1 : 0.35 }} className="text-xs font-medium text-blue-900/70">
                User prompt
              </motion.span>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-0.5 rounded-full bg-blue-700" />
                <svg width="10" height="10" viewBox="0 0 10 10" fill="#2563eb">
                  <polygon points="2,2 8,5 2,8" />
                </svg>
              </div>
              <motion.span animate={{ opacity: stage === "generated" ? 1 : 0.35 }} className="text-xs font-medium text-blue-700">
                Generated flowchart
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
