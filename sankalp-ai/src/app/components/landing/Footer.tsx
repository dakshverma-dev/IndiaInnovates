"use client";

import { motion } from "framer-motion";

const navLinks = [
  { name: "Problem", href: "#problem" },
  { name: "Solution", href: "#engines" },
  { name: "Features", href: "#pillars" },
  { name: "Live Demo", href: "/demo" },
  { name: "MCD Dashboard", href: "/dashboard" },
  { name: "File Complaint", href: "/complaint" },
];
const resources = ["GitHub ↗", "Demo Video ↗", "Proposal Doc ↗"];
const policies = ["Digital India Aligned", "Smart Cities Mission", "RTI Act 2005", "CAG Audit Ready"];

export default function Footer() {
  return (
    <footer style={{ background: "#1A2E2A", padding: "72px 0 32px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Top grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "48px",
            paddingBottom: "48px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
          className="grid-cols-1 md:grid-cols-3"
          >
            {/* Brand */}
            <div>
              <p style={{ fontFamily: "'Sora'", fontSize: "18px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: "4px" }}>
                SANKALP AI
              </p>
              <p style={{ fontFamily: "'Noto Sans Devanagari'", fontSize: "11px", color: "#5D7A6F", marginBottom: "16px" }}>
                सङ्कल्प
              </p>
              <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.65, maxWidth: "240px" }}>
                Delhi&apos;s Civic Nervous System. Making governance accountable for 20 million citizens.
              </p>
            </div>

            {/* Navigate */}
            <div>
              <p style={{ fontFamily: "'DM Sans'", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "16px" }}>
                Navigate
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {navLinks.map((l) => (
                  <a key={l.name} href={l.href} style={{ fontFamily: "'DM Sans'", fontSize: "14px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                    {l.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <p style={{ fontFamily: "'DM Sans'", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "16px" }}>
                Resources
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {resources.map((r) => (
                  <a key={r} href="#" style={{ fontFamily: "'DM Sans'", fontSize: "14px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                    {r}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Policy badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {policies.map((p) => (
              <span key={p} style={{
                fontFamily: "'DM Sans'",
                fontSize: "10px",
                color: "rgba(255,255,255,0.25)",
                padding: "4px 12px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "100px",
              }}>
                {p}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p style={{
            textAlign: "center",
            paddingTop: "24px",
            fontFamily: "'DM Sans'",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
          }}>
            © 2026 SANKALP AI — India Innovates 2026, Civic Tech Domain
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
