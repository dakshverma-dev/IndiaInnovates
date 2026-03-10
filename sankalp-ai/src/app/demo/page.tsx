"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type Stage = "IDLE" | "RAW" | "NLP" | "CLASSIFIED" | "DEDUPE" | "ASSIGNED" | "RESOLVING" | "DONE";

interface Complaint {
  id: string;
  text: string;
  category: string;
  priority: string;
  ward: string;
  dept: string;
  sla: string;
  confidence: number;
}

// --- Data ---
const DEMO_SCENARIOS: Complaint[] = [
  {
    id: "DL-4821",
    text: "Meri gali mein nali band hai aur kachra jam gaya hai",
    category: "Sanitation",
    priority: "P2 — High Priority",
    ward: "Ward 42 — Lajpat Nagar",
    dept: "MCD South Zone",
    sla: "48 hours",
    confidence: 0.94,
  },
  {
    id: "DL-4822",
    text: "Bijli pole ka wire toota hua hai, khatra ho sakta hai",
    category: "Electricity",
    priority: "P1 — Critical",
    ward: "Ward 42 — Lajpat Nagar",
    dept: "BSES Rajdhani",
    sla: "12 hours",
    confidence: 0.98,
  },
  {
    id: "DL-4823",
    text: "Sadak par bahut bada gaddha hai, accident ho jayega",
    category: "Roads",
    priority: "P2 — High Priority",
    ward: "Ward 42 — Lajpat Nagar",
    dept: "PWD Delhi",
    sla: "72 hours",
    confidence: 0.91,
  }
];

// --- Helpers ---
const formatHash = () => "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);

// ============================================================
// MAIN DEMO PAGE
// ============================================================
export default function DemoDashboard() {
  const [stage, setStage] = useState<Stage>("IDLE");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [chat, setChat] = useState<{ text: string; time: string }[]>([]);
  const [logs, setLogs] = useState<{ id: string; action: string; msg: string; hash: string }[]>([]);
  const currentComplaint = DEMO_SCENARIOS[scenarioIdx];
  const [clock, setClock] = useState("");

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const addLog = (action: string, msg: string) => {
    setLogs(prev => [{ id: `Block #${8847 + prev.length}`, action, msg, hash: formatHash() }, ...prev].slice(0, 10));
  };

  // Run Demo Logic
  const runDemo = async () => {
    if (stage !== "IDLE" && stage !== "DONE") return;
    
    // reset if needed
    if (stage === "DONE") {
      setChat([]);
      setLogs([]);
      setScenarioIdx((scenarioIdx + 1) % DEMO_SCENARIOS.length);
    }

    // Step 1: Intake
    setStage("RAW");
    setChat([{ text: DEMO_SCENARIOS[scenarioIdx].text, time: "Just now" }]);
    addLog("INTAKE", `Received from WhatsApp: ${DEMO_SCENARIOS[scenarioIdx].id}`);
    
    await new Promise(r => setTimeout(r, 1500));
    setStage("NLP");
    addLog("NLP", "Gemini 2.0 processing intent & named entities...");

    await new Promise(r => setTimeout(r, 2000));
    setStage("CLASSIFIED");
    addLog("CLASS", `Classified as ${DEMO_SCENARIOS[scenarioIdx].category} (Conf: ${(DEMO_SCENARIOS[scenarioIdx].confidence * 100).toFixed(1)}%)`);

    await new Promise(r => setTimeout(r, 1500));
    setStage("DEDUPE");
    addLog("DEDUPE", "Checking spatial-temporal clusters...");

    await new Promise(r => setTimeout(r, 1500));
    setStage("ASSIGNED");
    addLog("ASSIGN", "Assigned to nearest Field Officer: Rajesh Kumar");

    await new Promise(r => setTimeout(r, 3000));
    setStage("RESOLVING");
    addLog("ACTION", "Officer arrived on site. QR Code verified.");

    await new Promise(r => setTimeout(r, 2000));
    setStage("DONE");
    addLog("RESOLVE", `Ticket ${DEMO_SCENARIOS[scenarioIdx].id} marked RESOLVED.`);
  };

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "#0A0F1E",
      color: "#FFFFFF",
      fontFamily: "'Sora', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* TOP HEADER */}
      <div style={{
        height: "56px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", background: "rgba(10,15,30,0.8)", backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.02em" }}>SANKALP AI</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(34,197,94,0.1)", padding: "4px 10px", borderRadius: "100px", border: "1px solid rgba(34,197,94,0.2)" }}>
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "10px", fontWeight: 700, color: "#22C55E" }}>● LIVE NODE — 42A</span>
          </div>
        </div>
        
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "18px", fontWeight: 500, opacity: 0.8 }}>
          {clock}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: "'DM Sans'", fontSize: "12px", opacity: 0.5 }}>Lajpat Nagar Command Center</span>
          <button onClick={() => window.location.reload()} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 12px", fontSize: "11px", color: "#FFF", cursor: "pointer" }}>Reset Node</button>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr 340px", gap: "1px", background: "rgba(255,255,255,0.05)" }}>
        
        {/* COL 1: INTAKE */}
        <section style={{ background: "#0A0F1E", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <PanelHeader title="Citizen Intake Feed" icon="📱" />
          <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
            <AnimatePresence>
              {chat.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} style={{
                  background: "#075E54", borderRadius: "12px 12px 12px 2px", padding: "12px 14px", alignSelf: "flex-start", maxWidth: "85%",
                  border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", lineHeight: 1.5 }}>{msg.text}</p>
                  <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", opacity: 0.5, marginTop: "4px", textAlign: "right" }}>{msg.time} ✓✓</p>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* IVR / Voice simulation */}
            <div style={{ marginTop: "auto", background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF6B2B" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF6B2B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Voice IVR Transcribing...</span>
              </div>
              <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", fontStyle: "italic", opacity: 0.4 }}>
                {stage === "RAW" ? "Transcribing audio to Hinglish..." : "Waiting for voice trigger..."}
              </p>
            </div>
          </div>
        </section>

        {/* COL 2: AI BRAIN */}
        <section style={{ background: "#0A0F1E", display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Scanning lines effect */}
          <div className="scan-line" />
          <PanelHeader title="Gemini AI — Civic Nervous System" icon="🧠" />
          
          <div style={{ flex: 1, padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              {/* Left side: Main processing display */}
              <div style={{ flex: 1 }}>
                <AnimatePresence mode="wait">
                  {stage === "IDLE" ? (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", background: "rgba(255,255,255,0.01)" }}>
                      <p style={{ opacity: 0.3, fontSize: "13px", letterSpacing: "0.1em" }}>SYSTEM IDLE. AWAITING FEED.</p>
                    </motion.div>
                  ) : (
                    <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: "360px", background: "rgba(15,45,94,0.05)", border: "1px solid rgba(15,45,94,0.2)", borderRadius: "20px", padding: "28px", position: "relative", overflow: "hidden" }}>
                      
                      {/* Token-by-token classification */}
                      <StageIndicator active={stage !== "IDLE"} label="Stage 1: Intent Analysis" ok={stage !== "RAW"} />
                      <div style={{ marginLeft: "24px", marginBottom: "32px" }}>
                        <p style={{ fontFamily: "'DM Sans'", fontSize: "18px", color: "rgba(255,255,255,0.9)", marginBottom: "16px" }}>&ldquo;{currentComplaint.text}&rdquo;</p>
                        
                        {(stage === "CLASSIFIED" || stage === "DEDUPE" || stage === "ASSIGNED" || stage === "RESOLVING" || stage === "DONE") && (
                          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "12px 24px" }}>
                            <Label>Category</Label><Output value={currentComplaint.category} accent="#FF6B2B" conf={currentComplaint.confidence} />
                            <Label>Priority</Label><Output value={currentComplaint.priority} accent={currentComplaint.priority.includes("Critical") ? "#EF4444" : "#FF6B2B"} />
                            <Label>Department</Label><Output value={currentComplaint.dept} />
                            <Label>Geo-Ward</Label><Output value={currentComplaint.ward} />
                          </div>
                        )}
                      </div>

                      <StageIndicator active={stage === "DEDUPE" || stage === "ASSIGNED" || stage === "RESOLVING" || stage === "DONE"} label="Stage 2: Deduplication Check" ok={stage !== "DEDUPE" && stage !== "CLASSIFIED" && stage !== "RAW"} />
                      { (stage === "DEDUPE" || stage === "ASSIGNED" || stage === "RESOLVING" || stage === "DONE") && (
                         <div style={{ marginLeft: "24px", marginBottom: "32px" }}>
                            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "#6366F1", textTransform: "uppercase", marginBottom: "4px" }}>
                              {stage === "DEDUPE" ? "🔍 Analyzing spatial clusters..." : "✅ No duplicate tickets in last 6h"}
                            </p>
                            <p style={{ fontSize: "12px", opacity: 0.4 }}>Radius: 200m | Ward: 42 | Policy: MCD-CIVIC-V2</p>
                         </div>
                      )}

                      <StageIndicator active={stage === "ASSIGNED" || stage === "RESOLVING" || stage === "DONE"} label="Stage 3: Field Assignment" ok={stage === "RESOLVING" || stage === "DONE"} />
                      { (stage === "ASSIGNED" || stage === "RESOLVING" || stage === "DONE") && (
                         <div style={{ marginLeft: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                               <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FF6B2B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>RK</div>
                               <div>
                                  <p style={{ fontSize: "14px", fontWeight: 600 }}>Rajesh Kumar</p>
                                  <p style={{ fontSize: "11px", opacity: 0.5 }}>En-route · ETA 12 mins · 1.4km away</p>
                               </div>
                            </div>
                         </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right side: Blockchain Log */}
              <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "10px", letterSpacing: "0.1em", opacity: 0.3, textAlign: "right" }}>IMMUTABLE AUDIT TRAIL</p>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px", overflow: "hidden" }}>
                  <AnimatePresence>
                    {logs.map((log) => (
                      <motion.div key={log.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.03)", pb: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "#FF6B2B" }}>{log.id}</span>
                          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "8px", opacity: 0.4 }}>{log.action}</span>
                        </div>
                        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", opacity: 0.8, lineHeight: 1.4 }}>{log.msg}</p>
                        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "7px", opacity: 0.2, marginTop: "2px" }}>{log.hash}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COL 3: FIELD TRACKER */}
        <section style={{ background: "#0A0F1E", display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
          <PanelHeader title="Field Response Node" icon="📍" />
          <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            <OfficerCard name="Rajesh Kumar" status={stage === "RESOLVING" ? "ON_SITE" : stage === "DONE" ? "RESOLVED" : stage === "ASSIGNED" ? "EN_ROUTE" : "AVAILABLE"} ticket={stage === "IDLE" ? null : currentComplaint.id} />
            <OfficerCard name="Amit Sharma" status="ON_TASK" ticket="DL-4792" />
            <OfficerCard name="Suresh Gupta" status="AVAILABLE" />
            <OfficerCard name="Priya Singh" status="AVAILABLE" />

            {/* Resolution Proof visualization */}
            {stage === "RESOLVING" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: "auto", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#FFF", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "20px" }}>📷</div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#4ADE80", marginBottom: "4px" }}>Site Verification</p>
                <p style={{ fontSize: "11px", opacity: 0.6 }}>QR #42-12-X Scanned. Resolution photo uploaded to blockchain.</p>
              </motion.div>
            )}

            {stage === "DONE" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: "auto", background: "rgba(34,197,94,0.1)", border: "1px solid #22C55E", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                <p style={{ fontWeight: 800, fontSize: "16px", color: "#FFF" }}>RESOLVED</p>
                <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>SMS Sent to Citizen · Ticket Closed</p>
              </motion.div>
            )}
          </div>
        </section>

      </div>

      {/* BOTTOM ACTION BAR */}
      <div style={{ height: "72px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "rgba(10,15,30,0.9)" }}>
        <div style={{ display: "flex", gap: "32px" }}>
            <Metric label="WARD SCORE" val="73 / 100" trend="↑ +2.1" color="#4ADE80" />
            <Metric label="ACTIVE TICKETS" val="847" trend="+2 incoming" color="#FF6B2B" />
            <Metric label="SLA COMPLIANCE" val="89.3%" trend="↑ 1.2%" color="#4ADE80" />
        </div>

        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,107,43,0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={runDemo}
          style={{
            background: stage === "IDLE" || stage === "DONE" ? "#FF6B2B" : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: "12px", padding: "14px 28px",
            color: "#FFF", fontWeight: 800, fontSize: "15px", cursor: (stage === "IDLE" || stage === "DONE") ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: "12px",
          }}
        >
          {stage === "IDLE" || stage === "DONE" ? "▶ RUN FULL DEMO" : "● DEMO IN PROGRESS"}
        </motion.button>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #0A0F1E; }
        .scan-line {
            width: 100%; height: 2px; background: rgba(15,45,94,0.15);
            position: absolute; top: 0; left: 0; z-index: 5;
            animation: scan 4s linear infinite; pointer-events: none;
        }
        @keyframes scan { from { top: 0; } to { top: 100%; } }
      `}</style>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function PanelHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <h2 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5 }}>{title}</h2>
    </div>
  );
}

function StageIndicator({ active, label, ok }: { active: boolean; label: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", opacity: active ? 1 : 0.2 }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ok ? "#4ADE80" : "#FF6B2B" }} />
      <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      {ok && <span style={{ fontSize: "10px", color: "#4ADE80" }}>DONE</span>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", textTransform: "uppercase", opacity: 0.3, letterSpacing: "0.05em" }}>{children}</span>;
}

function Output({ value, accent, conf }: { value: string; accent?: string; conf?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "14px", fontWeight: 600, color: accent || "#FFF" }}>{value}</span>
      {conf && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
           <div style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${conf * 100}%` }} style={{ height: "100%", background: "#4ADE80" }} />
           </div>
           <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", opacity: 0.5 }}>{(conf * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

function OfficerCard({ name, status, ticket }: { name: string; status: "AVAILABLE" | "EN_ROUTE" | "ON_SITE" | "ON_TASK" | "RESOLVED"; ticket?: string | null }) {
  const S = {
    AVAILABLE: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", label: "AVAILABLE" },
    EN_ROUTE: { bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)", color: "#FB923C", label: "EN ROUTE" },
    ON_SITE: { bg: "rgba(251,146,60,0.15)", border: "#FB923C", color: "#FB923C", label: "ON SITE" },
    ON_TASK: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "#94A3B8", label: "ON TASK" },
    RESOLVED: { bg: "rgba(34,197,94,0.1)", border: "#22C55E", color: "#4ADE80", label: "RESOLVED" },
  };
  const cfg = S[status];

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "12px", padding: "14px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
           <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}>{name[0]}</div>
           <span style={{ fontSize: "13px", fontWeight: 600 }}>{name}</span>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "8px", fontWeight: 700, background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px", color: cfg.color }}>{cfg.label}</span>
      </div>
      {ticket && <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "10px", color: "#FF6B2B" }}>TASK: #{ticket}</p>}
    </div>
  );
}

function Metric({ label, val, trend, color }: { label: string; val: string; trend: string; color: string }) {
  return (
    <div>
       <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", opacity: 0.3, letterSpacing: "0.1em", marginBottom: "2px" }}>{label}</p>
       <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: 800 }}>{val}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color }}>{trend}</span>
       </div>
    </div>
  );
}
