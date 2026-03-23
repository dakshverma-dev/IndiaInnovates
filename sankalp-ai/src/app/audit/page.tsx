"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";
import RoleGuard from "../components/RoleGuard";

const ACTIONS = ["FILED", "AI_CLASSIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "ESCALATED"];

function getActionColor(action: string) {
  switch (action) {
    case "FILED": return "#818CF8";
    case "AI_CLASSIFIED": return "#C084FC";
    case "ASSIGNED": return "#FF6B2B";
    case "IN_PROGRESS": return "#F59E0B";
    case "RESOLVED": return "#16A34A";
    case "ESCALATED": return "#DC2626";
    default: return "#94A3B8";
  }
}

const INITIAL_LOGS = [
  { id: 8847, time: "2026-03-20 10:34:22", action: "FILED", ticket: "DL-4821", ward: "42", cat: "Sanitation", priority: "P2", hash: "0x4f7a2c9b1e3d...", officer: "CITIZEN" },
  { id: 8848, time: "2026-03-20 10:34:25", action: "AI_CLASSIFIED", ticket: "DL-4821", confidence: "94.3%", model: "Gemini Pro V2", hash: "0x7b3f9c21a4e8..." },
  { id: 8849, time: "2026-03-20 10:35:10", action: "ASSIGNED", ticket: "DL-4821", officer: "Rajesh Kumar", ward: "42", hash: "0x9c2b1a8d..." },
  { id: 8850, time: "2026-03-20 11:20:00", action: "IN_PROGRESS", ticket: "DL-4821", officer: "Rajesh Kumar", site: "Verified ✓", hash: "0x3e4f..." },
  { id: 8851, time: "2026-03-20 14:15:33", action: "RESOLVED", ticket: "DL-4821", officer: "Rajesh Kumar", proof: "Verified ✓", hash: "0x2d1a..." },
];

const STATS = [
  { label: "Total Actions Logged", val: "8,847", delta: "+34 today" },
  { label: "Officers Tracked", val: "247", delta: "Active" },
  { label: "Avg Actions / Hour", val: "34.2", delta: "Stable" },
  { label: "Fakes Prevented", val: "142", delta: "CAG Verified" },
];

export default function AuditPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);

  useEffect(() => {
    const id = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newLog: any = {
        id: logs[0].id + logs.length + 1,
        time: new Date().toISOString().replace("T", " ").split(".")[0] + " IST",
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
        ticket: `DL-${Math.floor(Math.random() * 9000) + 1000}`,
        hash: "0x" + Math.random().toString(16).slice(2, 12) + "...",
        officer: ["Rajesh Kumar", "Amit Sharma", "Suresh Gupta", "Priya Singh", "AI_ENGINE"][Math.floor(Math.random() * 5)],
        ward: (Math.floor(Math.random() * 200) + 1).toString(),
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 15));
    }, 5000);
    return () => clearInterval(id);
  }, [logs]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
    <PageLayout showFooter>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px", width: "100%" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "40px", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", marginBottom: "8px" }}>
              IMMUTABLE AUDIT TRAIL
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "38px", color: "#1A2E2A", lineHeight: 1.1, margin: "0 0 10px" }}>
              Blockchain Audit Trail
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(26,46,42,0.5)", maxWidth: "500px" }}>
              Immutable. Officer-attributed. RTI-ready. CAG-compliant.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <Badge text="RTI Act 2005 Compliant ✓" color="#16A34A" />
              <Badge text="CAG Audit Ready ✓" color="#16A34A" />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", margin: "0 0 4px" }}>TOTAL BLOCKS</p>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", fontWeight: 700, color: "#FF6B2B", margin: 0 }}>8,847</p>
          </div>
        </div>

        {/* STATS ROW */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "36px" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: "white", borderRadius: "16px",
              border: "1.5px solid rgba(26,46,42,0.07)", padding: "20px",
            }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", margin: "0 0 8px" }}>{s.label}</p>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#1A2E2A", margin: 0 }}>{s.val}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#16A34A", fontWeight: 600, margin: "4px 0 0" }}>{s.delta}</p>
            </div>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
          {/* MAIN LOG */}
          <section style={{
            background: "white", borderRadius: "20px",
            border: "1.5px solid rgba(26,46,42,0.07)", padding: "28px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", gap: "12px" }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(26,46,42,0.03)", borderRadius: "100px", padding: "10px 18px",
              }}>
                <span style={{ opacity: 0.3 }}>🔍</span>
                <input
                  placeholder="Block ID, Ticket, Officer..."
                  style={{ background: "transparent", border: "none", outline: "none", color: "#1A2E2A", width: "100%", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <button style={{
                background: "#FF6B2B", border: "none", borderRadius: "100px",
                padding: "10px 20px", color: "#FFF", fontSize: "12px", fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}>Export for RTI</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <AnimatePresence>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {logs.map((log: any) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: "18px 0", borderBottom: "1px solid rgba(26,46,42,0.05)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(26,46,42,0.35)" }}>Block #{log.id} | {log.time}</span>
                      <span style={{
                        padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700,
                        background: getActionColor(log.action) + "15", color: getActionColor(log.action),
                        border: `1px solid ${getActionColor(log.action)}33`,
                      }}>{log.action}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 180px", gap: "20px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
                      <div>
                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.3)", margin: "0 0 3px" }}>TICKET</p>
                        <p style={{ fontWeight: 700, color: "#FF6B2B", margin: 0 }}>{log.ticket}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.3)", margin: "0 0 3px" }}>DETAILS</p>
                        <p style={{ color: "#1A2E2A", margin: 0 }}>
                          {log.action === "FILED" && `Citizen Auth: Verified · Ward ${log.ward} · ${log.cat}`}
                          {log.action === "AI_CLASSIFIED" && `Gemini Engine · Conf: ${log.confidence} · Model: ${log.model}`}
                          {log.action === "ASSIGNED" && `Assigned to ${log.officer} · Ward ${log.ward}`}
                          {log.action === "IN_PROGRESS" && `Officer ${log.officer} at site · GPS Verified`}
                          {log.action === "RESOLVED" && `Resolved by ${log.officer} · Proof Hash Check OK`}
                          {!["FILED", "AI_CLASSIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"].includes(log.action) && `Action by ${log.officer || "System"}`}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.3)", margin: "0 0 3px" }}>HASH</p>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(26,46,42,0.4)", margin: 0 }}>{log.hash}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              background: "white", borderRadius: "20px",
              border: "1.5px solid rgba(26,46,42,0.07)", padding: "24px",
            }}>
              <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#1A2E2A", marginBottom: "16px" }}>Chain Integrity</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#16A34A" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#16A34A" }}>Verified Secure</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.45)", lineHeight: 1.6 }}>
                The audit trail is synchronized across 3 MCD nodes and 1 public transparency node. Tampering detected: 0
              </p>
              <button style={{
                marginTop: "18px", width: "100%",
                background: "rgba(26,46,42,0.04)", border: "1.5px solid rgba(26,46,42,0.08)",
                borderRadius: "12px", padding: "11px", fontSize: "12px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", color: "#1A2E2A", cursor: "pointer",
              }}>Run Full Node Audit</button>
            </div>

            <div style={{
              background: "#FF6B2B", borderRadius: "20px", padding: "24px", color: "#FFF",
            }}>
              <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", marginBottom: "8px" }}>CAG Report Builder</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.85)", marginBottom: "18px", lineHeight: 1.5 }}>
                Generate institutional-grade reports for Bihar/Delhi State Audit.
              </p>
              <button style={{
                width: "100%", background: "#FFF", border: "none",
                borderRadius: "12px", padding: "11px", fontSize: "12px", fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", color: "#FF6B2B", cursor: "pointer",
              }}>Build Report</button>
            </div>
          </aside>
        </div>

      </div>
    </PageLayout>
    </RoleGuard>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      padding: "4px 14px", borderRadius: "100px", fontSize: "10px", fontWeight: 800,
      fontFamily: "'DM Sans', sans-serif",
      color, background: color + "12", border: `1px solid ${color}33`,
    }}>{text}</span>
  );
}
