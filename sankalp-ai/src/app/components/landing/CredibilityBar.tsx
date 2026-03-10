"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "20M+", label: "Citizens Served" },
  { value: "272", label: "Wards Covered" },
  { value: "94%", label: "AI Accuracy" },
  { value: "4 sec", label: "Classification Time", mono: true },
  { value: "400:1", label: "Deduplication Ratio", mono: true },
  { value: "0", label: "Fake Resolutions Possible" },
];

export default function CredibilityBar() {
  return (
    <section
      style={{
        background: "#E7E8E2",
        borderTop: "1px solid rgba(93, 122, 111, 0.08)",
        borderBottom: "1px solid rgba(93, 122, 111, 0.08)",
        padding: "28px 0",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Label */}
        <p
          style={{
            fontFamily: "'DM Sans'",
            fontSize: "11px",
            letterSpacing: "0.1em",
            fontWeight: 500,
            color: "rgba(26, 46, 42, 0.35)",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          India Builds with SANKALP AI
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0",
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0 32px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(93, 122, 111, 0.1)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: stat.mono ? "'JetBrains Mono', monospace" : "'Sora', sans-serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0A0A0A",
                  letterSpacing: stat.mono ? "-0.01em" : "-0.02em",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans'",
                  fontSize: "12px",
                  color: "rgba(10,10,10,0.45)",
                  textAlign: "center",
                  marginTop: "2px",
                }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
