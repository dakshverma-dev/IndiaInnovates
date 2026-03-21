"use client";

import React, { useState } from "react";
import PageLayout from "../components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const STEPS = [
  {
    num: "01",
    title: "Complaint Submitted",
    sub: "Citizen files via app or web portal",
    content: (
      <div>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "16px", color: "#1A2E2A", fontStyle: "italic", lineHeight: 1.6, borderLeft: "3px solid rgba(26,46,42,0.15)", paddingLeft: "14px", margin: "0 0 12px" }}>
          &ldquo;Meri gali mein road par bada pothole hai, pichle ek mahine se thik nahi hua.&rdquo;
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.45)", fontWeight: 500 }}>
          📍 Dwarka · Ward 51 · Submitted via citizen portal
        </p>
      </div>
    ),
  },
  {
    num: "02",
    title: "Gemini AI Classification",
    sub: "Category, priority, SLA assigned in 1.8s",
    content: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {[
          { label: "Roads", color: "#1A2E2A", bg: "rgba(26,46,42,0.07)" },
          { label: "P3 · Medium", color: "#e8a020", bg: "rgba(232,160,32,0.1)" },
          { label: "PWD Delhi", color: "#5D7A6F", bg: "rgba(93,122,111,0.1)" },
          { label: "72hr SLA", color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
        ].map((b) => (
          <motion.span
            key={b.label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "100px", background: b.bg, color: b.color }}
          >
            {b.label}
          </motion.span>
        ))}
      </div>
    ),
  },
  {
    num: "03",
    title: "Smart Officer Routing",
    sub: "Nearest available officer assigned",
    content: (
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#1A2E2A", marginBottom: "6px" }}>
          Assigned to <span style={{ fontWeight: 700, color: "#5D7A6F" }}>Amit Kumar</span>
          <span style={{ fontWeight: 400, color: "rgba(26,46,42,0.5)" }}> · PWD Field Officer</span>
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.45)" }}>
          0.8km away · Notification sent to field app
        </p>
      </div>
    ),
  },
  {
    num: "04",
    title: "Field Resolution",
    sub: "GPS-verified, photo documented",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {["GPS location verified", "Resolution photo uploaded", "QR code scanned on-site"].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#1A2E2A", fontWeight: 500 }}>{item}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "05",
    title: "Civic Score Updated",
    sub: "Health score ticks up live",
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#16A34A" }}>+2.4%</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)" }}>Ward 51 Health Score ↑</span>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.45)" }}>
          Citizen notified via WhatsApp · Audit trail sealed
        </p>
      </div>
    ),
  },
];

export default function DemoPage() {
  const [step, setStep] = useState<number>(0);
  const [running, setRunning] = useState(false);

  const runDemo = async () => {
    if (running) return;
    setRunning(true);
    for (let s = 1; s <= 5; s++) {
      setStep(s);
      await delay(s === 3 ? 2000 : 1600);
    }
    setRunning(false);
  };

  const isDone = (s: number) => step > s || (step === s && !running);
  const isActive = (s: number) => step === s && running;

  return (
    <PageLayout showFooter>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(36px, 5vw, 52px)", color: "#1A2E2A", lineHeight: 1.1, marginBottom: "16px" }}>
            See it work.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "rgba(26,46,42,0.55)", maxWidth: "440px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            The full civic complaint lifecycle — from a Hindi voice note to a resolved ward record — in under 4 minutes.
          </p>

          {step === 0 ? (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(10,10,10,0.12)" }}
              whileTap={{ scale: 0.98 }}
              onClick={runDemo}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, color: "#fff", background: "#1A2E2A", border: "none", padding: "14px 40px", borderRadius: "100px", cursor: "pointer" }}
            >
              Run Live Demo
            </motion.button>
          ) : step === 5 && !running ? (
            <button
              onClick={() => setStep(0)}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A2E2A", background: "transparent", border: "1.5px solid rgba(26,46,42,0.2)", padding: "12px 32px", borderRadius: "100px", cursor: "pointer" }}
            >
              Reset Demo
            </button>
          ) : (
            <button
              disabled
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500, color: "rgba(26,46,42,0.4)", background: "rgba(26,46,42,0.05)", border: "1.5px solid rgba(26,46,42,0.08)", padding: "12px 32px", borderRadius: "100px", cursor: "not-allowed" }}
            >
              Simulation running...
            </button>
          )}
        </div>

        {/* Steps */}
        <div style={{ position: "relative" }}>
          {/* Vertical progress line */}
          <div style={{ position: "absolute", left: "20px", top: "20px", bottom: "20px", width: "2px", background: "rgba(26,46,42,0.07)", zIndex: 0 }} />
          <motion.div
            style={{ position: "absolute", left: "20px", top: "20px", width: "2px", background: "#1A2E2A", zIndex: 0, transformOrigin: "top" }}
            animate={{ height: step > 0 ? (step / 5) * 100 + "%" : "0%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}>
            {STEPS.map((s, i) => {
              const sNum = i + 1;
              const done = isDone(sNum);
              const active = isActive(sNum);
              const pending = step < sNum;

              return (
                <motion.div
                  key={s.num}
                  animate={{ opacity: pending ? 0.35 : 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
                >
                  {/* Circle indicator */}
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    <motion.div
                      animate={{
                        background: done ? "#1A2E2A" : active ? "#FF6B2B" : "white",
                        borderColor: done ? "#1A2E2A" : active ? "#FF6B2B" : "rgba(26,46,42,0.2)",
                      }}
                      style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(26,46,42,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, color: active ? "white" : "rgba(26,46,42,0.4)" }}>
                          {s.num}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1, background: "white", border: "1.5px solid " + (active ? "#FF6B2B" : done ? "rgba(26,46,42,0.1)" : "rgba(26,46,42,0.06)"),
                    borderRadius: "16px", padding: "18px 20px",
                    boxShadow: active ? "0 4px 24px rgba(255,107,43,0.1)" : "none",
                    transition: "all 0.3s",
                    marginBottom: "4px",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: step >= sNum ? "12px" : "0" }}>
                      <div>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A2E2A", marginBottom: "2px" }}>
                          {s.title}
                        </h3>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.45)" }}>{s.sub}</p>
                      </div>
                      {active && (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", marginLeft: "12px", flexShrink: 0 }}>
                          {[0, 1, 2].map((d) => (
                            <motion.div
                              key={d}
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ repeat: Infinity, delay: d * 0.2, duration: 0.8 }}
                              style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FF6B2B" }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {step >= sNum && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: "hidden" }}
                        >
                          {s.content}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Success state */}
        <AnimatePresence>
          {step === 5 && !running && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: "32px", background: "#1A2E2A", borderRadius: "20px", padding: "28px", textAlign: "center" }}
            >
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#E7E8E2", marginBottom: "8px" }}>
                That&apos;s the full loop.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(231,232,226,0.5)", marginBottom: "20px" }}>
                From complaint to resolution, fully audited.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/complaint" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A2E2A", background: "#E7E8E2", padding: "11px 24px", borderRadius: "100px", textDecoration: "none" }}>
                  File a Complaint
                </a>
                <a href="/dashboard" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#E7E8E2", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", padding: "11px 24px", borderRadius: "100px", textDecoration: "none" }}>
                  Open Dashboard
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
