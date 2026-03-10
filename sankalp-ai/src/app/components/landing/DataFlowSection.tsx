"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const nodes = [
  { icon: "👤", label: "Citizen" },
  { icon: "📥", label: "Intake" },
  { icon: "🧠", label: "Gemini AI" },
  { icon: "🔮", label: "Prediction" },
  { icon: "⚙️", label: "Workflow" },
  { icon: "📱", label: "Field App" },
  { icon: "⛓️", label: "Blockchain" },
  { icon: "📊", label: "Dashboard" },
];

export default function DataFlowSection() {
  const [active, setActive] = useState(-1);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      setActive(i);
      i = (i + 1) % nodes.length;
      if (i === 0) setTimeout(() => setActive(-1), 400);
    }, 500);
    return () => clearInterval(id);
  }, [started]);

  return (
    <section
      id="dataflow"
      ref={ref}
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
            How It Works
          </p>
          <h2 style={{
            fontFamily: "'Sora'",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#0A0A0A",
          }}>
            From WhatsApp to resolution
          </h2>
        </motion.div>

        {/* Flow nodes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
          className="sm:grid-cols-4 grid-cols-2"
        >
          {nodes.map((node, i) => {
            const isActive = i <= active;
            const isCurrent = i === active;
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    background: isCurrent
                      ? "#5D7A6F"
                      : isActive
                      ? "rgba(93, 122, 111, 0.08)"
                      : "#FFFFFF",
                    border: isCurrent
                      ? "2px solid #5D7A6F"
                      : isActive
                      ? "2px solid rgba(93, 122, 111, 0.2)"
                      : "2px solid rgba(93, 122, 111, 0.06)",
                    boxShadow: isCurrent ? "0 0 24px rgba(93, 122, 111, 0.3)" : "none",
                    transition: "all 0.35s ease",
                  }}
                >
                  {node.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans'",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#1A2E2A" : "rgba(26, 46, 42, 0.4)",
                    transition: "color 0.3s",
                  }}
                >
                  {node.label}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono'",
                    fontSize: "10px",
                    color: isActive ? "#5D7A6F" : "rgba(26, 46, 42, 0.2)",
                    transition: "color 0.3s",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
