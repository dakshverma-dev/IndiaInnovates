"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#engines" },
  { label: "Features", href: "#pillars" },
  { label: "Demo", href: "/demo" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Complaint", href: "/complaint" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setVisible(y < lastY || y < 80);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  return (
    <motion.header
      animate={{ y: visible ? 0 : -80 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: scrolled ? "1px solid rgba(93, 122, 111, 0.08)" : "1px solid transparent",
        background: scrolled ? "rgba(231, 232, 226, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "17px",
              fontWeight: 700,
              color: "#1A2E2A",
              letterSpacing: "-0.02em",
            }}
          >
            SANKALP AI
          </span>
        </a>

        {/* Desktop links — centered */}
        <nav
          className="desktop-nav"
          style={{ gap: "32px", alignItems: "center" }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(26, 46, 42, 0.55)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#1A2E2A")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "rgba(26, 46, 42, 0.55)")
              }
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="desktop-ctas" style={{ gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => document.getElementById("dataflow")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#1A2E2A",
              background: "transparent",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            Talk to us
          </button>
          <button
            onClick={() => window.location.href = "/demo"}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              background: "#1A2E2A",
              border: "none",
              padding: "9px 20px",
              cursor: "pointer",
              borderRadius: "100px",
            }}
          >
            Request Pilot
          </button>
        </div>

        {/* Mobile burger */}
        <button
          className="mobile-burger"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2E2A" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h12" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: "hidden",
              background: "rgba(231, 232, 226, 0.95)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(93, 122, 111, 0.08)",
            }}
          >
            <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontFamily: "'DM Sans'", fontSize: "15px", color: "#1A2E2A", textDecoration: "none" }}
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={() => { setMobileOpen(false); window.location.href = "/demo"; }}
                style={{
                  marginTop: "4px",
                  fontFamily: "'DM Sans'",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFF",
                  background: "#1A2E2A",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                Request Pilot
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .mobile-burger { display: none; }
        @media (max-width: 768px) {
          .mobile-burger { display: block; }
          .desktop-nav, .desktop-ctas { display: none !important; }
        }
      `}</style>
    </motion.header>
  );
}
