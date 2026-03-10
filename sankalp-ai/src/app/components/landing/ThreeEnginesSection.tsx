"use client";

import { motion } from "framer-motion";

const engines = [
  {
    emoji: "🧠",
    name: "AI Intelligence Core",
    desc: "Gemini-powered NLP for Hindi + English. Auto-classifies into 15 categories with 94% accuracy. Smart deduplication collapses 400 tickets into 1.",
    color: "rgba(93, 122, 111, 0.06)",
    border: "rgba(93, 122, 111, 0.12)",
  },
  {
    emoji: "📡",
    name: "Omnichannel Citizen Access",
    desc: "WhatsApp, Voice IVR, Web portal, QR kiosks — every channel feeds one AI backend. Works on ₹1,500 smartphones with no internet required.",
    color: "rgba(255, 107, 43, 0.06)",
    border: "rgba(255, 107, 43, 0.12)",
  },
  {
    emoji: "⚙️",
    name: "Workflow Orchestration",
    desc: "GPS-based auto-assignment, real-time SLA tracking with auto-escalation, QR-verified proof of resolution, and blockchain audit trail.",
    color: "rgba(22, 163, 74, 0.06)",
    border: "rgba(22, 163, 74, 0.12)",
  },
];

export default function ThreeEnginesSection() {
  return (
    <section
      id="engines"
      style={{ background: "#F3F4F0", padding: "96px 0", borderTop: "1px solid rgba(93, 122, 111, 0.08)" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <p style={{
            fontFamily: "'DM Sans'",
            fontSize: "11px",
            letterSpacing: "0.1em",
            fontWeight: 600,
            color: "rgba(26, 46, 42, 0.4)",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            The Solution
          </p>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#1A2E2A",
          }}>
            Three engines. One unified platform.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {engines.map((eng, i) => (
            <motion.div
              key={eng.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "32px",
                border: `1px solid rgba(93, 122, 111, 0.08)`,
                cursor: "default",
              }}
              whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(26, 46, 42, 0.07)", borderColor: eng.border }}
            >
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: eng.color, border: `1px solid ${eng.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", marginBottom: "20px",
              }}>
                {eng.emoji}
              </div>
              <h3 style={{
                fontFamily: "'Sora'",
                fontSize: "17px",
                fontWeight: 700,
                color: "#1A2E2A",
                marginBottom: "10px",
                letterSpacing: "-0.01em",
              }}>
                {eng.name}
              </h3>
              <p style={{
                fontFamily: "'DM Sans'",
                fontSize: "14px",
                color: "rgba(26, 46, 42, 0.55)",
                lineHeight: 1.65,
              }}>
                {eng.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
