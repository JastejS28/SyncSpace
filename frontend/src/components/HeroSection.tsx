"use client";

import { motion } from "framer-motion";
import InteractiveCanvas from "./InteractiveCanvas";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      delay,
    },
  }),
};

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-36 pb-20 px-6 overflow-hidden"
      style={{ background: "hsl(216, 89%, 86%)" }}
    >
      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.08}
          className="text-center font-semibold tracking-tight text-[#0b1f4a] leading-[1.12]"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", letterSpacing: "-0.03em" }}
        >
          Prompt it. Get a{" "}
          <span
            style={{
              color: "#1d4ed8",
            }}
          >
            flowchart.
          </span>
          <br />
          Collaborate live on canvas.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="text-center text-blue-900/70 max-w-[480px] leading-relaxed"
          style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}
        >
          Type what you want to build and SyncSpace generates a complete diagram instantly, ready for your team to edit together.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.28} className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/handler/sign-in"
            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: "#1d4ed8",
              boxShadow: "0 2px 14px rgba(37,99,235,0.34), 0 1px 4px rgba(2,6,23,0.18)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1e40af";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(37,99,235,0.42), 0 2px 8px rgba(2,6,23,0.22)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(37,99,235,0.34), 0 1px 4px rgba(2,6,23,0.18)";
            }}
          >
            Start Creating
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-blue-900 bg-white border border-blue-200 hover:border-blue-400 hover:text-blue-950 transition-all duration-200"
            style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polygon points="3,2 11,7 3,12" fill="currentColor" />
            </svg>
            See it in action
          </a>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.38} className="w-full">
          <InteractiveCanvas />
        </motion.div>
      </div>
    </section>
  );
}
