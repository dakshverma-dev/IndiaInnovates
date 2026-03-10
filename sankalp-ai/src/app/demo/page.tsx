"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type AiStage = "IDLE" | "STAGE1_PROCESSING" | "STAGE1_DONE" | "STAGE2_PROCESSING" | "STAGE2_DONE" | "STAGE3_PROCESSING" | "STAGE3_DONE";
type OfficerStatus = "AVAILABLE" | "EN_ROUTE" | "ON_SITE" | "RESOLVED" | "QR_SCANNED";

interface BlockEntry {
  block: string;
  action: "INTAKE" | "CLASS" | "DEDUPE" | "ASSIGN" | "RESOLVE" | "SMS";
  text: string;
  hash: string;
}

// ============================================================
// MAIN DEMO PAGE REBUILD
// ============================================================
export default function DemoDashboard() {
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [whatsappVisible, setWhatsappVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [aiStage, setAiStage] = useState<AiStage>("IDLE");
  const [officerStatus, setOfficerStatus] = useState<OfficerStatus>("AVAILABLE");
  const [logs, setLogs] = useState<BlockEntry[]>([]);
  const [showResolvedCard, setShowResolvedCard] = useState(false);
  const [civicScore, setCivicScore] = useState(73.2);
  const [clock, setClock] = useState("");
  const [scenarioIdx, setScenarioIdx] = useState(0);

  const scenarios = [
    "Meri gali mein nali band hai aur kachra jam gaya hai",
    "Bijli ka pole gir gaya hai, wire latka hua hai",
    "Sadak par itna bada gaddha hai, accident ho sakta hai",
    "Teen din se kachra nahi utha, bahut bdboo aa rahi hai",
    "Paani bilkul nahi aa raha subah se, koi sun nahi raha"
  ];

  // Clock effect
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Helpers
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const addBlockchainEntry = (entry: Omit<BlockEntry, "hash">) => {
    const hash = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);
    setLogs(prev => [{ ...entry, hash }, ...prev].slice(0, 10));
  };

  const resetDemo = () => {
    setWhatsappVisible(false);
    setAiStage("IDLE");
    setOfficerStatus("AVAILABLE");
    setLogs([]);
    setShowResolvedCard(false);
    setScenarioIdx(prev => (prev + 1) % scenarios.length);
  };

  const runFullDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    resetDemo();
    await delay(800);

    // STEP 1: Intake
    setCurrentMessage(scenarios[scenarioIdx]);
    setWhatsappVisible(true);
    addBlockchainEntry({ block: `#${8847 + logs.length}`, action: "INTAKE", text: `Received from WhatsApp: ${scenarios[scenarioIdx].slice(0, 15)}...` });
    await delay(2000);

    // STEP 2: AI Processing - Stage 1
    setAiStage("STAGE1_PROCESSING");
    await delay(1200);
    setAiStage("STAGE1_DONE");
    addBlockchainEntry({ block: `#${8848 + logs.length}`, action: "CLASS", text: "Classified as Sanitation (94% confidence)" });
    await delay(1500);

    // STEP 3: Deduplication - Stage 2
    setAiStage("STAGE2_PROCESSING");
    await delay(1000);
    setAiStage("STAGE2_DONE");
    addBlockchainEntry({ block: `#${8849 + logs.length}`, action: "DEDUPE", text: "No duplicates found in 200m radius" });
    await delay(1500);

    // STEP 4: Assignment - Stage 3
    setAiStage("STAGE3_PROCESSING");
    await delay(800);
    setAiStage("STAGE3_DONE");
    setOfficerStatus("EN_ROUTE");
    addBlockchainEntry({ block: `#${8850 + logs.length}`, action: "ASSIGN", text: "Assigned to Rajesh Kumar (Sector 42)" });
    await delay(3000);

    // STEP 5: Resolving
    setOfficerStatus("QR_SCANNED");
    await delay(1000);
    setOfficerStatus("RESOLVED");
    addBlockchainEntry({ block: `#${8851 + logs.length}`, action: "RESOLVE", text: "QR Scanned at site. Photo verified." });
    setShowResolvedCard(true);
    
    // Update score
    setCivicScore(prev => parseFloat((prev + 0.1).toFixed(1)));
    
    await delay(1000);
    addBlockchainEntry({ block: `#${8852 + logs.length}`, action: "SMS", text: "Resolution SMS sent to citizen." });
    
    setIsRunning(false);
  };

  return (
    <div 
      className="demo-container"
      style={{
        width: "100%", minHeight: "100vh",
        background: "#E7E8E2",
        color: "#111",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style jsx global>{`
        @keyframes pulse-green {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes checkPulse {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes grow-bar {
          from { width: 0; }
          to { width: var(--bar-width); }
        }
      `}</style>

      {/* TOPBAR */}
      <header 
        className="demo-header"
        style={{
          height: "auto", minHeight: "56px", background: "#1A2E2A",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", flexWrap: "wrap", gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <p style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: "18px", color: "#FFF", margin: 0 }}>SANKALP AI</p>
            <p style={{ fontFamily: "'Noto Sans Devanagari'", fontSize: "11px", color: "#FF6B2B", margin: 0, marginTop: "-2px" }}>सङ्कल्प</p>
          </a>
          <div className="header-divider" style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 0 rgba(34,197,94,0.4)', animation: 'pulse-green 2s infinite' }} />
             <span style={{ fontFamily: "'DM Sans'", fontWeight: 500, fontSize: "13px", color: "#FFF" }}>LIVE — Ward 42</span>
          </div>
        </div>

        <div className="demo-clock" style={{ fontFamily: "'JetBrains Mono'", fontSize: "20px", fontWeight: 600, color: "#FFF", letterSpacing: "0.05em" }}>
          {clock}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="demo-subtitle" style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Command Center</span>
          <button 
            onClick={resetDemo}
            style={{ 
              background: "transparent", border: "1px solid #FFF", borderRadius: "100px", padding: "4px 12px", 
              fontSize: "12px", color: "#FFF", cursor: "pointer", opacity: 0.6 
            }}
          >
            Reset
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div 
        className="dashboard-grid"
        style={{ 
          flex: 1, display: "grid", gridTemplateColumns: "30% 40% 30%", padding: "24px", gap: "24px" 
        }}
      >
        
        {/* COLUMN 1: CITIZEN INTAKE */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <DashboardCard title="Citizen Intake" subtitle="Live incoming complaints" icon="📱" status="Active">
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, paddingBottom: "16px", overflowY: "auto" }}>
                <AnimatePresence>
                  {whatsappVisible && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 15 }}>
                      <div style={{ background:'#DCF8C6', borderRadius:'0px 12px 12px 12px', padding:'12px 14px', maxWidth:'85%', marginBottom:4, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <p style={{ fontFamily:'Noto Sans Devanagari', fontSize:14, color:'#0A0F1E', margin:0, lineHeight:1.5 }}>
                          {currentMessage}
                        </p>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:4, paddingLeft:4, marginBottom: 16}}>
                        <span style={{fontFamily:'DM Sans', fontSize:11, color:'#9CA3AF'}}>Just now</span>
                        <span style={{color:'#34B7F1', fontSize:12}}>✓✓</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button 
                  onClick={runFullDemo}
                  disabled={isRunning}
                  style={{
                    width:'100%', padding:'10px', background:'#FF6B2B', color:'white', border:'none', borderRadius:10, 
                    fontFamily:'Sora', fontWeight:600, fontSize:13, cursor: isRunning ? 'not-allowed' : 'pointer', transition:'all 0.2s ease',
                    opacity: isRunning ? 0.6 : 1
                  }}
                >
                  + Send New Complaint
                </button>
              </div>

              <div style={{ height: "1px", background: "#E5E7EB", margin: "16px 0" }} />
              
              <div style={{ opacity: 0.6 }}>
                <SectionLabel title="Voice IVR — Hindi" icon="📞" />
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F3F4F6", padding: "12px", borderRadius: "10px", marginTop: "8px" }}>
                   <div style={{ fontSize: "20px" }}>🎙️</div>
                   <div>
                      <p style={{ fontFamily: "Noto Sans Devanagari", fontSize: "13px", margin: 0 }}>"नाली बंद है गली नंबर 4 में"</p>
                      <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Whisper AI — Transcribed in 1.2s</p>
                   </div>
                </div>
                <div style={{ marginTop: "8px", background: "#FFF0E8", color: "#FF6B2B", fontSize: "11px", fontWeight: 700, padding: "4px 8px", borderRadius: "100px", width: "fit-content" }}>
                  Ticket DL-4822 Created ✓
                </div>
              </div>
            </div>
          </DashboardCard>
        </section>

        {/* COLUMN 2: AI BRAIN */}
        <section style={{ display: "flex", flexDirection: "column", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(26,46,42,0.08)" }}>
          {/* TOP PANEL: AI BRAIN */}
          <div style={{ flex: 1.8, background: "#FFF", padding: "24px", display: "flex", flexDirection: "column", borderBottom: "1px solid #E5E7EB" }}>
            <DashboardCardHeader title="Gemini AI Engine" subtitle="Real-time processing" icon="🧠" badge="Processing" badgeColor="#FF6B2B" noPadding />
            
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* STAGE 1 */}
              <AiStageRow stageNum={1} title="Intent Analysis" status={aiStage === "IDLE" ? "PENDING" : (aiStage === "STAGE1_PROCESSING" ? "ACTIVE" : "DONE")}>
                {(aiStage !== "IDLE" && aiStage !== "STAGE1_PROCESSING") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ background:'#F8F9FC', border:'1px solid #E5E7EB', borderLeft:'3px solid #FF6B2B', borderRadius:'0 8px 8px 0', padding:'10px 14px', marginBottom:16, fontFamily:'DM Sans', fontSize:13, color:'#0A0F1E', fontStyle:'italic' }}>
                      "{currentMessage}"
                    </div>
                    <ClassificationRow label="CATEGORY" value="Sanitation" bar={94} color="#FF6B2B" />
                    <ClassificationRow label="PRIORITY" value="P2 — High Priority" bar={80} color="#F59E0B" />
                    <ClassificationRow label="DEPARTMENT" value="MCD South Zone" />
                    <ClassificationRow label="GEO-WARD" value="Ward 42 — Lajpat Nagar" />
                  </motion.div>
                )}
              </AiStageRow>

              {/* STAGE 2 */}
              <AiStageRow stageNum={2} title="Deduplication Check" status={aiStage === "IDLE" || aiStage === "STAGE1_PROCESSING" || aiStage === "STAGE1_DONE" ? "PENDING" : (aiStage === "STAGE2_PROCESSING" ? "ACTIVE" : "DONE")}>
                {aiStage === "STAGE2_DONE" || aiStage === "STAGE3_PROCESSING" || aiStage === "STAGE3_DONE" ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{color:'#16A34A', fontSize:16}}>✓</span>
                    <div>
                      <p style={{fontFamily:'Sora', fontWeight:600, fontSize:12, color:'#16A34A', margin:0}}>No duplicates found in last 6 hours</p>
                      <p style={{fontFamily:'DM Sans', fontSize:11, color:'#6B7280', margin:0}}>Radius: 200m · Ward: 42 · Policy: MCD-CIVIC-V2</p>
                    </div>
                  </motion.div>
                ) : null}
              </AiStageRow>

              {/* STAGE 3 */}
              <AiStageRow stageNum={3} title="Field Assignment" status={aiStage === "STAGE3_PROCESSING" ? "ACTIVE" : (aiStage === "STAGE3_DONE" ? "DONE" : "PENDING")}>
                 {aiStage === "STAGE3_DONE" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#F8F9FC', border:'1px solid #E5E7EB', borderRadius:10 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, #1A2E2A, #2D4A44)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Sora', fontWeight:700, fontSize:14, color:'white' }}>RK</div>
                      <div style={{flex:1}}>
                        <p style={{fontFamily:'Sora', fontWeight:600, fontSize:13, color:'#0A0F1E', margin:0}}>Rajesh Kumar</p>
                        <p style={{fontFamily:'DM Sans', fontSize:11, color:'#6B7280', margin:0}}>En-route · ETA 12 mins · 1.4km away</p>
                      </div>
                      <div style={{ padding:'4px 10px', background:'#FFF0E8', border:'1px solid #FFCBA4', borderRadius:20, fontFamily:'DM Sans', fontWeight:500, fontSize:11, color:'#FF6B2B' }}>Notified ✓</div>
                    </motion.div>
                 )}
              </AiStageRow>
            </div>
          </div>

          {/* BOTTOM PANEL: BLOCKCHAIN */}
          <div style={{ flex: 1, background: "#1A2E2A", padding: "16px 24px", color: "white", borderTop: "2px solid #5D7A6F" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "Sora", fontSize: "12px", fontWeight: 600, margin: 0, color: "rgba(255,255,255,0.9)" }}>⛓ Immutable Audit Trail</h3>
                <span style={{ padding: "2px 8px", background: "#FF6B2B", color: "#FFF", fontSize: "9px", borderRadius: "100px", fontWeight: 700 }}>RTI-READY ✓</span>
             </div>

             <div style={{ display: "flex", flexDirection: "column" }}>
               <AnimatePresence>
                 {logs.map((log) => (
                    <motion.div key={log.block} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'grid', gridTemplateColumns:'60px 1fr auto', gap:12, alignItems:'start' }}>
                       <span style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#5D7A6F', fontWeight:500 }}>{log.block}</span>
                       <div>
                          <p style={{fontFamily:'DM Sans', fontSize:11, color:'rgba(255,255,255,0.85)', margin:0}}>{log.text}</p>
                          <p style={{fontFamily:'JetBrains Mono', fontSize:10, color:'rgba(255,255,255,0.35)', margin:0}}>{log.hash}</p>
                       </div>
                       <span style={{ 
                         padding:'2px 6px', borderRadius:4, fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.05em', color: "#FFF",
                         background: log.action === "RESOLVE" ? "rgba(22,163,74,0.4)" : log.action === "ASSIGN" ? "rgba(255,107,43,0.4)" : "rgba(255,255,255,0.1)"
                       }}>
                         {log.action}
                       </span>
                    </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>
        </section>

        {/* COLUMN 3: FIELD OFFICERS */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
           <DashboardCard title="Field Officers" subtitle="Live location & engagement" icon="📍">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 <OfficerCard name="Rajesh Kumar" initials="RK" status={officerStatus === "QR_SCANNED" ? "ON_SITE" : officerStatus === "RESOLVED" ? "RESOLVED" : officerStatus === "EN_ROUTE" ? "EN_ROUTE" : "AVAILABLE"} details={officerStatus === "AVAILABLE" ? "Ward 42 · Available" : "1.4km away · ETA 12 min"} task={officerStatus === "AVAILABLE" ? null : "#DL-4821"} active={officerStatus !== "AVAILABLE"} />
                 <OfficerCard name="Amit Sharma" initials="AS" status="ON_SITE" details="QR scan pending" task="#DL-4792" />
                 <OfficerCard name="Suresh Gupta" initials="SG" status="AVAILABLE" details="Ward 42 · Available" />
                 <OfficerCard name="Priya Singh" initials="PS" status="AVAILABLE" details="Ward 41 · Available" />

                 <AnimatePresence>
                    {showResolvedCard && (
                       <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }}>
                          <div style={{ padding:'20px', background:'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border:'2px solid #16A34A', borderRadius:12, textAlign:'center', marginTop:12 }}>
                             <div style={{ width:48, height:48, borderRadius:'50%', background:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', animation:'checkPulse 0.5s ease', boxShadow:'0 0 0 8px rgba(22,163,74,0)' }}>
                                <span style={{color:'white', fontSize:24}}>✓</span>
                             </div>
                             <p style={{fontFamily:'Sora', fontWeight:700, fontSize:16, color:'#15803D', margin:'0 0 4px'}}>RESOLVED</p>
                             <p style={{fontFamily:'DM Sans', fontSize:12, color:'#16A34A', margin:'0 0 8px'}}>QR Scanned · Photo Verified · Ticket Closed</p>
                             <div style={{ padding:'6px 12px', background:'white', borderRadius:8, fontFamily:'DM Sans', fontSize:11, color:'#6B7280', border:'1px solid #BBF7D0' }}>
                               📲 SMS Sent to +91-98XXX-6542
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </DashboardCard>
        </section>

      </div>

      {/* BOTTOM BAR */}
      <footer 
        className="demo-footer"
        style={{
          minHeight: "72px", background: "#FFF", borderTop: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", boxShadow: "0 -2px 8px rgba(15,45,94,0.04)",
          flexWrap: "wrap", gap: "20px"
        }}
      >
        <div style={{display:'flex', alignItems:'center', gap:24}} className="footer-score-zone">
          <div>
            <p style={{fontFamily:'JetBrains Mono', fontSize:10, color:'#9CA3AF', margin:0, letterSpacing:'0.05em'}}>WARD SCORE</p>
            <div style={{display:'flex', alignItems:'baseline', gap:4}}>
              <span style={{fontFamily:'Sora', fontWeight:700, fontSize:24, color:'#0A0F1E'}}>{civicScore}</span>
              <span style={{fontFamily:'Sora', fontSize:14, color:'#6B7280'}}>/100</span>
              <motion.span key={civicScore} initial={{ color: "#16A34A", scale: 1.2 }} animate={{ color: "#16A34A", scale: 1 }} style={{fontFamily:'DM Sans', fontSize:11, color:'#16A34A', marginLeft:4}}>{"\u2191"} +0.3</motion.span>
            </div>
          </div>
          <div className="footer-divider" style={{width:1, height:32, background:'#E5E7EB'}} />
          <span style={{fontFamily:'DM Sans', fontSize:12, color:'#6B7280'}} className="footer-ward-text">Ward 42 · Lajpat Nagar South</span>
        </div>

        <div className="footer-metrics" style={{ display: "flex", gap: "32px" }}>
            <Metric label="ACTIVE" val="847" delta="+2" color="#F59E0B" />
            <Metric label="RESOLVED" val="1,247" delta="↑ 23" color="#16A34A" />
            <Metric label="SLA" val="89.3%" delta="↑ 1.2%" color="#1A2E2A" />
        </div>

        <button
          onClick={runFullDemo}
          disabled={isRunning}
          style={{
            padding:'12px 28px', background:'#FF6B2B', color:'white', border:'none', borderRadius:10,
            fontFamily:'Sora', fontWeight:700, fontSize:15, cursor: isRunning ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 16px rgba(255,107,43,0.35)',
            transition:'all 0.2s ease', opacity: isRunning ? 0.8 : 1,
            flex: "var(--btn-flex, none)"
          }}
        >
          {isRunning ? "● RUNNING..." : "▶ RUN FULL DEMO"}
        </button>
      </footer>

      <style jsx>{`
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .demo-container {
            overflow-y: auto !important;
          }
        }
        @media (max-width: 640px) {
          .demo-header {
            justify-content: center !important;
            text-align: center !important;
          }
          .header-divider, .demo-subtitle {
            display: none !important;
          }
          .demo-clock {
            width: 100%;
          }
          .demo-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 24px !important;
          }
          .footer-score-zone {
            justify-content: space-between !important;
          }
          .footer-metrics {
            justify-content: space-between !important;
            gap: 12px !important;
          }
          .footer-ward-text {
            font-size: 11px !important;
          }
          .demo-footer button {
            width: 100% !important;
            --btn-flex: 1;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// UI COMPONENTS
// ============================================================

function DashboardCard({ title, subtitle, icon, status, children }: { title: string; subtitle: string; icon: string; status?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 4px 16px rgba(15,45,94,0.08)", flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardCardHeader title={title} subtitle={subtitle} icon={icon} badge={status} />
      {children}
    </div>
  );
}

function DashboardCardHeader({ title, subtitle, icon, badge, badgeColor, noPadding }: { title: string; subtitle: string; icon: string; badge?: string; badgeColor?: string; noPadding?: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: noPadding ? 0 : 20 }}>
      <div style={{ width:32, height:32, borderRadius:8, background:'#FFF0E8', display:'flex', alignItems:'center', justifyContent:'center', fontSize: "16px" }}>{icon}</div>
      <div>
        <p style={{fontFamily:'Sora', fontWeight:600, fontSize:14, color:'#0A0F1E', margin:0}}>{title}</p>
        <p style={{fontFamily:'DM Sans', fontSize:11, color:'#6B7280', margin:0}}>{subtitle}</p>
      </div>
      {badge && (
        <div style={{ marginLeft:'auto', padding:'2px 8px', background: badgeColor ? `${badgeColor}15` : '#F0FDF4', border: `1px solid ${badgeColor || '#BBF7D0'}`, borderRadius:20, fontFamily:'DM Sans', fontSize:11, color: badgeColor || '#16A34A', fontWeight:500 }}>
          ● {badge}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <span style={{ fontSize: "14px" }}>{icon}</span>
      <span style={{ fontFamily: "Sora", fontSize: "12px", fontWeight: 700, color: "#0A0F1E", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
    </div>
  );
}

function AiStageRow({ stageNum, title, status, children }: { stageNum: number; title: string; status: "PENDING" | "ACTIVE" | "DONE"; children: React.ReactNode }) {
  const color = status === "DONE" ? "#16A34A" : status === "ACTIVE" ? "#FF6B2B" : "#E5E7EB";
  return (
    <div style={{ display: "flex", gap: "16px", opacity: status === "PENDING" ? 0.3 : 1 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800 }}>{stageNum}</div>
        <div style={{ flex: 1, width: "2px", background: "#E5E7EB", margin: "4px 0" }} />
      </div>
      <div style={{ flex: 1, paddingBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h4 style={{ fontFamily: "Sora", fontSize: "13px", fontWeight: 700, margin: 0, color: "#1A2E2A" }}>{title}</h4>
          {status === "DONE" && <span style={{ fontSize: "10px", fontWeight: 700, color: "#16A34A", background: "#F0FDF4", padding: "2px 8px", borderRadius: "100px", border: "1px solid #BBF7D0" }}>DONE</span>}
          {status === "ACTIVE" && <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }} style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B2B" }}>PROCESSING...</motion.span>}
        </div>
        {children}
      </div>
    </div>
  );
}

function ClassificationRow({ label, value, bar, color }: { label: string; value: string; bar?: number; color?: string }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'100px 1fr', gap:8, alignItems:'center', marginBottom:8}}>
      <span style={{fontFamily:'JetBrains Mono', fontSize:10, color:'#9CA3AF', letterSpacing:'0.05em'}}>{label}</span>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontFamily:'Sora', fontWeight:600, fontSize:13, color: color || '#222'}}>{value}</span>
        {bar && (
          <div style={{flex:1, height:4, background:'#E5E7EB', borderRadius:2, overflow:'hidden'}}>
             <motion.div initial={{ width: 0 }} animate={{ width: `${bar}%` }} style={{ height:'100%', background: color || '#FF6B2B', borderRadius:2 }} />
          </div>
        )}
        {bar && <span style={{fontFamily:'JetBrains Mono', fontSize:11, color:'#6B7280'}}>{bar}%</span>}
      </div>
    </div>
  );
}

function OfficerCard({ name, initials, status, details, task, active }: { name: string; initials: string; status: string; details: string; task?: string | null; active?: boolean }) {
  const S: any = {
    EN_ROUTE:  { bg:'#FFF7ED', border:'#FED7AA', text:'#F59E0B', label:<>{"\u2192"} En Route</> },
    ON_SITE:   { bg:'#FFF0E8', border:'#FFCBA4', text:'#FF6B2B', label:<>{"\u25CF"} On Site</> },
    AVAILABLE: { bg:'#F0FDF4', border:'#BBF7D0', text:'#16A34A', label:<>{"\u2713"} Available</> },
    RESOLVED:  { bg:'#F0FDF4', border:'#BBF7D0', text:'#16A34A', label:<>{"\u2713"} Resolved</> },
    QR_SCANNED:{ bg:'#F0FDF4', border:'#16A34A', text:'#16A34A', label:<>{"\u25CF"} Scanning...</> }
  };
  const cfg = S[status] || S.AVAILABLE;

  return (
    <div style={{ padding:'12px', borderRadius:10, border: active ? `1.5px solid #FF6B2B` : '1px solid #E5E7EB', background: active ? '#FFFBF8' : '#FFF', marginBottom:2, transition:'all 0.2s ease' }}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, #1A2E2A, #2D4A44)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Sora', fontWeight:700, fontSize:12, color:'white' }}>{initials}</div>
        <div style={{flex:1}}>
          <p style={{fontFamily:'Sora', fontWeight:600, fontSize:13, color:'#0A0F1E', margin:0}}>{name}</p>
          <p style={{fontFamily:'DM Sans', fontSize:11, color:'#6B7280', margin:0}}>{details}</p>
        </div>
        <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, padding: "4px 8px", borderRadius: "100px", fontSize: "10px", fontWeight: 700 }}>{cfg.label}</div>
      </div>
      {task && (
        <div style={{ marginTop:8, padding:'4px 10px', background:'#F8F9FC', borderRadius:6, fontFamily:'JetBrains Mono', fontSize:11, color:'#FF6B2B', fontWeight: 600 }}>
          TASK: {task}
        </div>
      )}
    </div>
  );
}

function Metric({ label, val, delta, color }: { label: string; val: string; delta: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#9CA3AF', margin:0, letterSpacing:'0.06em' }}>{label}</p>
      <p style={{ fontFamily:'Sora', fontWeight:700, fontSize:20, color: color, margin:0, lineHeight: 1.2 }}>{val}</p>
      <p style={{ fontFamily:'DM Sans', fontSize:10, color:'#9CA3AF', margin:0 }}>{delta}</p>
    </div>
  );
}
