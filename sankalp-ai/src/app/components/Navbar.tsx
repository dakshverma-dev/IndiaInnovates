"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthProvider";

const links = [
  { label: "Home", href: "/" },
  { label: "Complaint", href: "/complaint" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Officer", href: "/officer" },
  { label: "Demo", href: "/demo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

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
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(231, 232, 226, 0.88)" : "rgba(231, 232, 226, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(93, 122, 111, 0.1)" : "1px solid transparent",
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
          gap: "24px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "17px",
            fontWeight: 700,
            color: "#1A2E2A",
            letterSpacing: "-0.02em",
          }}>
            SANKALP AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="desk-nav" style={{ display: "flex", alignItems: "center", gap: "32px", flex: 1, justifyContent: "center" }}>
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 500,
                  color: active ? "#FF6B2B" : "rgba(26, 46, 42, 0.55)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#1A2E2A"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(26, 46, 42, 0.55)"; }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="desk-cta" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "rgba(26, 46, 42, 0.6)",
                fontWeight: 500,
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user?.name}
              </span>
              <button
                onClick={logout}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1A2E2A",
                  background: "transparent",
                  border: "1.5px solid rgba(26, 46, 42, 0.2)",
                  padding: "7px 16px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <button style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#E7E8E2",
                background: "#1A2E2A",
                border: "none",
                padding: "9px 20px",
                borderRadius: "100px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}>
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="mob-burger"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "none", flexShrink: 0 }}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A2E2A" strokeWidth="2" strokeLinecap="round">
            {mobileOpen
              ? <><path d="M6 18L18 6" /><path d="M6 6l12 12" /></>
              : <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h12" /></>
            }
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
            transition={{ duration: 0.22 }}
            style={{
              overflow: "hidden",
              background: "rgba(231, 232, 226, 0.97)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(93, 122, 111, 0.1)",
            }}
          >
            <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "16px",
                      fontWeight: active ? 600 : 400,
                      color: active ? "#FF6B2B" : "#1A2E2A",
                      textDecoration: "none",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(26,46,42,0.05)",
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <div style={{ paddingTop: "16px" }}>
                {isAuthenticated ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(26,46,42,0.5)" }}>
                      Signed in as {user?.name}
                    </span>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A2E2A", background: "transparent", border: "1.5px solid rgba(26,46,42,0.2)", padding: "11px 24px", borderRadius: "100px", cursor: "pointer", width: "fit-content" }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none" }}>
                    <button style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#E7E8E2", background: "#1A2E2A", border: "none", padding: "11px 28px", borderRadius: "100px", cursor: "pointer" }}>
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .desk-nav { display: flex !important; gap: 32px; align-items: center; }
        .desk-cta { display: flex !important; gap: 10px; align-items: center; }
        .mob-burger { display: none; }
        @media (max-width: 768px) {
          .desk-nav { display: none !important; }
          .desk-cta { display: none !important; }
          .mob-burger { display: block !important; }
        }
      `}</style>
    </motion.header>
  );
}
