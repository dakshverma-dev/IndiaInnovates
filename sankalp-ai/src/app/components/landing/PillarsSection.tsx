"use client";

import { motion } from "framer-motion";

const pillars = [
  { n: "01", title: "Predictive Prevention", desc: "Using 3 years of ward-level complaint data × live weather forecasts to predict civic failures before citizens file complaints.", metric: "40% complaints prevented before filing", badge: "★ INDUSTRY FIRST" },
  { n: "02", title: "Gemini-Powered NLP Triage", desc: "Classifies complaints in Hindi, English, or mixed-code into 15 categories, 4 priority levels, correct ward, correct department. In under 4 seconds.", metric: "94.3% classification accuracy" },
  { n: "03", title: "Smart Deduplication", desc: "When 400 citizens report the same pothole, our spatial-semantic engine collapses them into 1 master ticket.", metric: "400:1 deduplication ratio" },
  { n: "04", title: "Blockchain Accountability", desc: "Every action — filing, assignment, site visit, resolution — is logged immutably. No officer can mark 'resolved' without QR-verified on-site proof.", metric: "142 fake resolutions prevented" },
  { n: "05", title: "Omnichannel Access", desc: "WhatsApp, voice call, web portal, QR kiosk — every intake channel feeds one unified AI backend. No citizen left behind.", metric: "Zero barriers for 20M citizens" },
  { n: "06", title: "Civic Health Score", desc: "Every ward gets a public, real-time governance score (0–100). Visible to courts, journalists, councillors, voters.", metric: "272 wards scored in real-time" },
  { n: "07", title: "Officer Karma System", desc: "Field officers earn reputation scores based on resolution speed, citizen feedback, and site verification.", metric: "31.4 hrs avg (was 47.2 hrs)" },
];

export default function PillarsSection() {
  return (
    <section
      id="pillars"
      style={{ background: "#FFFFFF", padding: "96px 0", borderTop: "1px solid rgba(93, 122, 111, 0.08)" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "72px" }}
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
            7 Pillars
          </p>
          <h2 style={{
            fontFamily: "'Sora'",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#1A2E2A",
          }}>
            Zero precedent in Indian civic tech.
          </h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {pillars.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(60px, 80px) 1fr auto",
                gap: "16px",
                alignItems: "center",
                padding: "24px 0",
                borderBottom: i < pillars.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                cursor: "default",
                overflow: "hidden"
              }}
              className="mobile-stack"
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "clamp(36px, 5vw, 52px)",
                  fontWeight: 700,
                  color: "rgba(93, 122, 111, 0.12)",
                  lineHeight: 1,
                  userSelect: "none",
                  transition: "color 0.2s",
                }}
              >
                {p.n}
              </span>

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h3 style={{
                    fontFamily: "'Sora'",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#1A2E2A",
                    letterSpacing: "-0.01em",
                  }}>
                    {p.title}
                  </h3>
                  {p.badge && (
                    <span style={{
                      fontFamily: "'DM Sans'",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "#FFFFFF",
                      background: "#FF6B2B",
                      padding: "3px 10px",
                      borderRadius: "100px",
                    }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p style={{
                  fontFamily: "'DM Sans'",
                  fontSize: "14px",
                  color: "rgba(10,10,10,0.5)",
                  lineHeight: 1.6,
                  maxWidth: "540px",
                }}>
                  {p.desc}
                </p>
              </div>

              {/* Metric */}
              <div style={{ textAlign: "right", flexShrink: 0 }} className="pillar-metric">
                <span style={{
                  fontFamily: "'Sora'",
                  fontSize: "clamp(11px, 2vw, 13px)",
                  fontWeight: 600,
                  color: "#5D7A6F",
                  whiteSpace: "normal",
                  display: "block",
                  maxWidth: "120px"
                }}>
                  {"\u2192"} {p.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-stack {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .pillar-metric {
            text-align: left !important;
            margin-top: 4px;
          }
        }
      `}</style>
    </section>
  );
}
