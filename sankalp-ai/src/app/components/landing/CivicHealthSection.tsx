"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const wards = [
  { name: "Lajpat Nagar", ward: 42, score: 82 },
  { name: "Govindpuri", ward: 67, score: 45 },
  { name: "Rohini", ward: 23, score: 78 },
  { name: "Dwarka", ward: 51, score: 91 },
  { name: "Saket", ward: 38, score: 63 },
  { name: "Karol Bagh", ward: 14, score: 55 },
];

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const ref = useRef<SVGSVGElement>(null);
  const R = 36;
  const C = 2 * Math.PI * R;
  const offset = C - (animated / 100) * C;
  const color = score > 75 ? "#16A34A" : score >= 50 ? "#F59E0B" : "#DC2626";

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let v = 0;
        const step = Math.max(1, Math.round(score / 40));
        const id = setInterval(() => {
          v = Math.min(v + step, score);
          setAnimated(v);
          if (v >= score) clearInterval(id);
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [score]);

  return (
    <svg ref={ref} width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={R} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
      />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "16px", fill: "#1A2E2A" }}>
        {animated}
      </text>
    </svg>
  );
}

export default function CivicHealthSection() {
  return (
    <section
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
            Civic Health Scores
          </p>
          <h2 style={{
            fontFamily: "'Sora'",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "#0A0A0A",
          }}>
            Every ward. Publicly accountable.
          </h2>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "12px",
        }}>
          {wards.map((w, i) => (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(26,46,42,0.06)", borderColor: "rgba(93, 122, 111, 0.12)" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(93, 122, 111, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                cursor: "default",
              }}
            >
              <ScoreRing score={w.score} />
              <div>
                <p style={{
                  fontFamily: "'Sora'",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginBottom: "2px",
                }}>
                  {w.name}
                </p>
                <p style={{
                  fontFamily: "'JetBrains Mono'",
                  fontSize: "11px",
                  color: "rgba(26, 46, 42, 0.4)",
                }}>
                  Ward {w.ward}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontFamily: "'DM Sans'",
            fontSize: "13px",
            fontStyle: "italic",
            color: "rgba(26, 46, 42, 0.35)",
          }}
        >
          Visible to courts, journalists, councillors, and voters.
        </motion.p>
      </div>
    </section>
  );
}
