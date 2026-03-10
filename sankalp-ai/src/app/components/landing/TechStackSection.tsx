"use client";

import { motion } from "framer-motion";

const categories = [
  {
    name: "AI & NLP",
    emoji: "🧠",
    techs: ["Google Gemini", "OpenAI Whisper", "LangChain"],
  },
  {
    name: "Backend",
    emoji: "⚡",
    techs: ["FastAPI", "PostgreSQL", "Redis"],
  },
  {
    name: "Frontend",
    emoji: "🎨",
    techs: ["Next.js", "Tailwind CSS", "Framer Motion"],
  },
  {
    name: "Channels",
    emoji: "📡",
    techs: ["WhatsApp API", "Twilio IVR", "Flutter"],
  },
  {
    name: "Infrastructure",
    emoji: "☁️",
    techs: ["Google Cloud", "Docker", "Socket.IO"],
  },
  {
    name: "Accountability",
    emoji: "🔗",
    techs: ["Blockchain Ledger", "QR Verification", "Audit Trail"],
  },
];

export default function TechStackSection() {
  return (
    <section
      style={{ background: "#E7E8E2", padding: "96px 0", borderTop: "1px solid rgba(93, 122, 111, 0.08)" }}
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
            Technology Stack
          </p>
          <h2 style={{
            fontFamily: "'Sora'",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#0A0A0A",
          }}>
            Enterprise-grade infrastructure
          </h2>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(93, 122, 111, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "18px" }}>{cat.emoji}</span>
                <span style={{
                  fontFamily: "'DM Sans'",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  color: "rgba(10,10,10,0.45)",
                  textTransform: "uppercase",
                }}>
                  {cat.name}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {cat.techs.map((t) => (
                  <motion.span
                    key={t}
                    whileHover={{ background: "#1A2E2A", color: "#FFFFFF" }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#0A0A0A",
                      background: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      cursor: "default",
                    }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
