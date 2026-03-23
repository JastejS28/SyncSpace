"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="7" cy="11" r="2.5" stroke="#2563eb" strokeWidth="1.6" />
        <circle cx="15" cy="11" r="2.5" stroke="#2563eb" strokeWidth="1.6" />
        <path d="M9.5 11h3" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4.5 7.5 Q3 5 4 3.5" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M17.5 7.5 Q19 5 18 3.5" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M2 15 Q1 18 3 19" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M20 15 Q21 18 19 19" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </svg>
    ),
    title: "Real-Time Collaboration",
    description: "See cursors. Edit together. No lag.",
    detail: "Every keystroke and stroke is synced instantly across all collaborators. Built on low-latency WebSocket infrastructure.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#2563eb" strokeWidth="1.6" />
        <path d="M10 6.5 L13 6.5 Q16 6.5 16 10 L16 13" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <rect x="12.5" y="13" width="6.5" height="6" rx="1.5" stroke="#2563eb" strokeWidth="1.6" />
        <path d="M6.5 10 L6.5 13 Q6.5 16 9.5 16 L12.5 16" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M5 17 L8 17" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 19 L7 19" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "AI-Assisted Structuring",
    description: "Turn messy sketches into organized diagrams instantly.",
    detail: "Our AI engine reads your intent and produces clean flowcharts, mind maps, and wireframes no templates needed.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="12" rx="2" stroke="#2563eb" strokeWidth="1.6" />
        <path d="M11 15 L11 19" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 19 L14 19" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 9 L11 12 L14 9" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 12 L11 6" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: "Export Anywhere",
    description: "PNG, PDF, or shareable links.",
    detail: "One-click exports in multiple formats. Share a live link or drop a polished PDF into your next presentation.",
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="features" className="relative py-24 px-6" style={{ background: "hsl(216, 89%, 86%)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-3">Everything you need</p>
          <h2 className="font-semibold text-[#0b1f4a] tracking-tight" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.025em" }}>
            A canvas that thinks with you.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.08 * i }}
              className="group relative rounded-2xl p-7 transition-all duration-300"
              style={{ background: "#fdfefe", border: "1px solid rgba(147,197,253,0.55)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(37,99,235,0.14), 0 2px 8px rgba(15,23,42,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.7)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(15,23,42,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(147,197,253,0.55)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(219,234,254,0.75)", border: "1px solid rgba(96,165,250,0.38)" }}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-[#0b1f4a] mb-2">{f.title}</h3>
              <p className="text-sm font-medium text-blue-900/80 mb-3">{f.description}</p>
              <p className="text-sm text-blue-900/55 leading-relaxed">{f.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
