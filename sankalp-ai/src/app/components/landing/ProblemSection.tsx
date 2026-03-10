"use client";

import { motion } from "framer-motion";

const problems = [
  { icon: "🔍", title: "No Tracking", desc: "Complaints vanish into phone calls and file registers with zero digital trail." },
  { icon: "⏱️", title: "Zero SLA Enforcement", desc: "No automatic escalation. Officers resolve when convenient, not when required." },
  { icon: "🏛️", title: "Agency Confusion", desc: "Citizens don't know if MCD, DJB, or BSES is responsible. Neither do officers." },
  { icon: "📋", title: "Duplicate Overload", desc: "400 people report the same pothole. Each gets a separate ticket, wasting resources." },
  { icon: "🔥", title: "Purely Reactive", desc: "Every monsoon, same drains flood. No prediction. No prevention. Just reaction." },
  { icon: "🎭", title: "Fake Resolutions", desc: "Officers mark 'resolved' without visiting. No photo proof. No GPS verification." },
  { icon: "🗣️", title: "Language Barrier", desc: "Portals in English. 60% of Delhi's working population prefers Hindi." },
  { icon: "📱", title: "Delhi Mitra Gap", desc: "The existing app has 1.2★ rating. Smart city funds spent, citizens still suffering." },
];

const fn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5 },
  }),
};

export default function ProblemSection() {
  return (
    <section
      id="problem"
      style={{ background: "#E7E8E2", padding: "96px 0" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <p
            style={{
              fontFamily: "'DM Sans'",
              fontSize: "11px",
              letterSpacing: "0.1em",
              fontWeight: 600,
              color: "rgba(26, 46, 42, 0.4)",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            The Problem
          </p>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(30px, 4vw, 44px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "#1A2E2A",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            A system where complaints disappear into silence.
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fn}
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(93, 122, 111, 0.08)",
                cursor: "default",
              }}
              whileHover={{
                y: -2,
                boxShadow: "0 8px 32px rgba(26,46,42,0.06)",
                borderColor: "rgba(93, 122, 111, 0.25)",
              }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255,107,43,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  marginBottom: "14px",
                }}
              >
                {p.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1A2E2A",
                  marginBottom: "6px",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans'",
                  fontSize: "13px",
                  color: "rgba(26, 46, 42, 0.5)",
                  lineHeight: 1.55,
                }}
              >
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginTop: "64px" }}
        >
          <p
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(20px, 2.5vw, 28px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#1A2E2A",
              lineHeight: 1.35,
            }}
          >
            The problem isn&apos;t a missing portal.
            <br />
            <span
              style={{
                color: "rgba(26, 46, 42, 0.45)",
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              It&apos;s a missing intelligence layer.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
