"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? "rgba(7, 21, 56, 0.96)" : "rgba(7, 21, 56, 0.86)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(96, 165, 250, 0.28)",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
        boxShadow: scrolled ? "0 1px 16px rgba(2, 6, 23, 0.34)" : "none",
      }}
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-4 pl-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#2563eb" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.9" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <path d="M11.5 9.5 L11.5 13.5 M9.5 11.5 L13.5 11.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[17px] font-semibold text-blue-50 tracking-tight">SyncSpace</span>
            <span className="text-[12px] text-blue-200/75 font-medium tracking-wide hidden sm:block">AI-powered collaborative whiteboard</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-blue-100/80 font-medium hover:text-white transition-colors duration-200">
            Features
          </a>
          <a href="#demo" className="text-sm text-blue-100/80 font-medium hover:text-white transition-colors duration-200">
            AI Demo
          </a>
          <a href="/handler/sign-in" className="text-sm text-blue-100/80 font-medium hover:text-white transition-colors duration-200">
            Login
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/handler/sign-in" className="hidden sm:block text-sm font-medium text-blue-100/80 hover:text-white transition-colors duration-200">
            Login
          </a>
          <a
            href="/handler/sign-in"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
            style={{
              background: "#2563eb",
              boxShadow: "0 1px 10px rgba(37,99,235,0.32), 0 1px 2px rgba(15,23,42,0.28)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 5px 18px rgba(37,99,235,0.42), 0 1px 4px rgba(15,23,42,0.34)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#2563eb";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 10px rgba(37,99,235,0.32), 0 1px 2px rgba(15,23,42,0.28)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Get Started
          </a>
        </div>
      </div>
    </motion.header>
  );
}
