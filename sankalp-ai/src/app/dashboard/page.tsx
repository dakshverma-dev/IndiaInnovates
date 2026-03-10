"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

// --- Mock Data ---
const TREND_DATA = [
  { name: "Mon", value: 30 },
  { name: "Tue", value: 45 },
  { name: "Wed", value: 25 },
  { name: "Thu", value: 60 },
  { name: "Fri", value: 35 },
  { name: "Sat", value: 50 },
  { name: "Sun", value: 40 },
];

const WAVY_CHART_DATA = [
  { x: 0, y: 10 }, { x: 1, y: 25 }, { x: 2, y: 15 }, 
  { x: 3, y: 35 }, { x: 4, y: 20 }, { x: 5, y: 30 }, 
  { x: 6, y: 18 }
];

const RECENT_TRANSFERS = [
  { name: "Anna Jones", time: "Today, 14:34", delta: "+2.45%", color: "#4ADE80" },
  { name: "Carlos Brown III", time: "Today, 15:23", delta: "-4.75%", color: "#EF4444" },
  { name: "Joel Cannan", time: "Today, 17:54", delta: "+2.45%", color: "#4ADE80" }
];

// ============================================================
// REDESIGNED ADMIN DASHBOARD (SAGE & BEIGE)
// ============================================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div 
      className="dashboard-container"
      style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "#E7E8E2", 
        fontFamily: "'DM Sans', sans-serif",
        padding: "24px",
        gap: "24px",
      }}
    >
      
      {/* 1. PILL SIDEBAR */}
      <aside 
        className="dashboard-sidebar"
        style={{ 
          width: "80px", 
          background: "#1A2E2A", 
          borderRadius: "40px", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          padding: "32px 0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0
        }}
      >
        {/* Logo Icon */}
        <a href="/" style={{ textDecoration: "none", marginBottom: "40px" }}>
          <div style={{ 
            width: "48px", height: "48px", 
            background: "#1A2E2A", // Dark Sage
            borderRadius: "50%", 
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#FFF", fontSize: "20px"
          }}>
            ❄️
          </div>
        </a>

        <nav style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
          <SidebarIcon icon="📁" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarIcon icon="📊" active={activeTab === "Stats"} onClick={() => setActiveTab("Stats")} />
          <SidebarIcon icon="🏛️" active={activeTab === "Ward"} onClick={() => setActiveTab("Ward")} />
          <SidebarIcon icon="👥" active={activeTab === "Officers"} onClick={() => setActiveTab("Officers")} />
          <SidebarIcon icon="📋" active={activeTab === "Logs"} onClick={() => setActiveTab("Logs")} />
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "auto" }}>
          <SidebarIcon icon="⚙️" />
          <SidebarIcon icon="📤" />
          <div style={{ 
            width: "40px", height: "40px", 
            borderRadius: "50%", overflow: "hidden", 
            border: "2px solid #E7E8E2" 
          }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="Avatar" />
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px", overflowY: "auto", paddingRight: "8px" }}>
        
        {/* HEADER */}
        <header 
          className="dashboard-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}
        >
          <div className="header-greeting">
            <h1 style={{ fontFamily: "'Sora'", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: "#1A2E2A", margin: 0 }}>Hello, Rajesh!</h1>
            <p style={{ fontSize: "14px", color: "rgba(26, 46, 42, 0.5)", marginTop: "4px" }}>Manage Delhi’s civic health.</p>
          </div>
          
          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div 
              className="search-bar"
              style={{
                background: "#FFF", borderRadius: "100px", padding: "8px 20px",
                display: "flex", alignItems: "center", gap: "10px",
                width: "var(--search-width, 320px)", boxShadow: "0 2px 10px rgba(26,46,42,0.02)",
                border: "1px solid rgba(26,46,42,0.05)"
              }}
            >
              <span style={{ opacity: 0.4 }}>🔍</span>
              <input 
                placeholder="Search..." 
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", width: "100%", color: "#1A2E2A" }} 
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <HeaderIcon icon="💬" />
              <HeaderIcon icon="🔔" badge />
            </div>
          </div>
        </header>

        {/* TOP KPI ROW */}
        <div 
          className="kpi-row"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}
        >
          <KpiCard label="Total Complaints" val="847" icon="📊" trendType="bar" />
          <KpiCard label="Active Officers" val="321" icon="👥" trendType="line" />
          <KpiCard label="Avg Resolution" val="31.4h" icon="⌛" />
          <div style={{ 
            background: "#5D7A6F", // Sage Green
            borderRadius: "24px", padding: "24px", color: "#FFF",
            display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <span style={{ fontWeight: 600, fontSize: "14px", opacity: 0.8 }}>Pending Budget</span>
                <span style={{ fontSize: "20px" }}>📈</span>
             </div>
             <div style={{ marginTop: "12px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>₹42L Saved</h2>
                <div style={{ height: "40px", marginTop: "8px" }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={WAVY_CHART_DATA}>
                         <Line type="monotone" dataKey="y" stroke="#FFFFFF" strokeWidth={2} dot={false} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>

        {/* MAIN COMPONENT ROW */}
        <div 
          className="main-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 340px 380px", gap: "24px", flex: 1 }}
        >
          
          {/* LEFT COLUMN: ACTIVITY CHART */}
          <section style={{ background: "#FFF", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h3 style={{ fontFamily: "'Sora'", fontSize: "18px", fontWeight: 700, color: "#1A1A1A", display: "flex", alignItems: "center", gap: "8px" }}>
                Complaint Flow <span style={{ fontSize: "12px", fontWeight: 600, color: "#16A34A", background: "#F0FDF4", padding: "4px 12px", borderRadius: "100px" }}>● On track</span>
              </h3>
              <select style={{ border: "none", background: "#F8F9FA", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "48px", marginBottom: "24px" }}>
               <div>
                  <p style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>Resolution Rate</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                     <span style={{ fontSize: "24px", fontWeight: 700 }}>89.30%</span>
                     <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600 }}>+2.45%</span>
                  </div>
               </div>
               <div>
                  <p style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>SLA Compliance</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                     <span style={{ fontSize: "24px", fontWeight: 700 }}>91.2%</span>
                     <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>-1.15%</span>
                  </div>
               </div>
            </div>

            <div style={{ flex: 1 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorSage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5D7A6F" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#5D7A6F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#5D7A6F" strokeWidth={3} fillOpacity={1} fill="url(#colorSage)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </section>

          {/* CENTER COLUMN: GAUGE & STATS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             <section style={{ background: "#FFF", borderRadius: "24px", padding: "24px", flex: 1 }}>
                <h3 style={{ fontFamily: "Sora", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>System Efficiency</h3>
                <p style={{ fontSize: "12px", color: "#999", marginBottom: "24px" }}>Total civic engine performance</p>
                
                <div style={{ position: "relative", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {/* Custom Gauge Viz */}
                   <div style={{ 
                      width: "160px", height: "80px", border: "16px solid #F3F4F0", 
                      borderTopLeftRadius: "100px", borderTopRightRadius: "100px", borderBottom: 0,
                      position: "relative", overflow: "hidden" 
                   }}>
                      <div style={{ 
                         width: "160px", height: "80px", border: "16px solid #5D7A6F", 
                         borderTopLeftRadius: "100px", borderTopRightRadius: "100px", borderBottom: 0,
                         position: "absolute", top: -16, left: -16,
                         transformOrigin: "bottom center", transform: "rotate(40deg)"
                      }} />
                   </div>
                   <div style={{ position: "absolute", bottom: "10px", textAlign: "center" }}>
                      <span style={{ fontSize: "32px", fontWeight: 800 }}>80%</span>
                   </div>
                </div>

                <div style={{ marginTop: "24px", textAlign: "center" }}>
                   <p style={{ fontSize: "18px", fontWeight: 700, color: "#16A34A" }}>Excellent</p>
                   <p style={{ fontSize: "12px", color: "#999" }}>Profit is 34% More than last Month</p>
                </div>
             </section>

             <section style={{ background: "#FFF", borderRadius: "24px", padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ 
                  width: "64px", height: "64px", borderRadius: "50%", 
                  background: "#F3F4F0", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px"
                }}>
                  🛡️
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginTop: "16px", marginBottom: "4px" }}>Keep you safe!</h3>
                <p style={{ fontSize: "12px", color: "#999", textAlign: "center", marginBottom: "16px" }}>Updated your security protocols for Ward 42.</p>
                <button style={{ 
                  background: "#1A2E2A", color: "#FFF", border: "none", 
                  borderRadius: "100px", padding: "8px 24px", fontSize: "12px", fontWeight: 600 
                }}>
                  Update Protocols
                </button>
             </section>
          </div>

          {/* RIGHT COLUMN: PRIORITY STACK & TRANSFERS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Triage Card Stack */}
            <section style={{ 
              background: "#FFF", borderRadius: "24px", padding: "24px", position: "relative", 
              minHeight: "260px", overflow: "hidden" 
            }}>
               <h3 style={{ fontFamily: "Sora", fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Active Priority Triage</h3>
               
               {/* Visual Stack Effect */}
               <div style={{ position: "relative", marginTop: "20px" }}>
                  <div style={{ 
                    width: "100%", height: "180px", background: "linear-gradient(135deg, #1A2E2A, #2D4A44)", 
                    borderRadius: "20px", padding: "20px", position: "relative", zIndex: 3,
                    color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "space-between",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
                  }}>
                     <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", opacity: 0.6 }}>MAINTENANCE PASS</span>
                        <span style={{ fontSize: "18px" }}>📡</span>
                     </div>
                     <div>
                        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "20px", margin: 0 }}>4248 1234 5678 XXXX</p>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", opacity: 0.6 }}>
                           <span>LAJPAT NAGAR</span>
                           <span>06/28</span>
                        </div>
                     </div>
                  </div>
                  {/* Background cards */}
                  <div style={{ 
                    position: "absolute", top: 10, left: 10, right: 10, height: "180px", 
                    background: "#5D7A6F", borderRadius: "20px", zIndex: 2, opacity: 0.6, transform: "rotate(-2deg)" 
                  }} />
                  <div style={{ 
                    position: "absolute", top: 20, left: 20, right: 20, height: "180px", 
                    background: "#A3B2AC", borderRadius: "20px", zIndex: 1, opacity: 0.3, transform: "rotate(-4deg)" 
                  }} />
               </div>
               
               <button style={{ 
                  marginTop: "32px", width: "100%", background: "#F3F4F0", border: "none", 
                  borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#1A2E2A" 
               }}>
                  Add New Protocol +
               </button>
            </section>

            <section style={{ background: "#FFF", borderRadius: "24px", padding: "24px", flex: 1 }}>
               <h3 style={{ fontFamily: "Sora", fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Recent Resolutions</h3>
               <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {RECENT_TRANSFERS.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                       <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#F3F4F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                          👤
                       </div>
                       <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{t.name}</p>
                          <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>{t.time}</p>
                       </div>
                       <span style={{ fontSize: "12px", fontWeight: 700, color: t.color }}>{t.delta}</span>
                    </div>
                  ))}
               </div>
            </section>
          </div>

        </div>
      </main>

      <style jsx global>{`
        body { margin: 0; background: #E7E8E2; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); borderRadius: 10px; }

        @media (max-width: 1400px) {
          .main-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 1024px) {
          .kpi-row, .main-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-container {
            flex-direction: column !important;
            padding: 16px !important;
          }
          .dashboard-sidebar {
            width: 100% !important;
            height: auto !important;
            flex-direction: row !important;
            padding: 12px 24px !important;
            border-radius: 20px !important;
            order: 2; /* Move to bottom */
            position: sticky;
            bottom: 16px;
            z-index: 10;
          }
          .dashboard-sidebar nav {
            flex-direction: row !important;
            justify-content: space-around;
            width: 100%;
          }
          .dashboard-sidebar a, .dashboard-sidebar > div:last-child {
            display: none !important;
          }
          main {
            padding-right: 0 !important;
            overflow-y: visible !important;
          }
        }

        @media (max-width: 640px) {
          .dashboard-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .search-bar {
            --search-width: 100%;
          }
          .header-actions {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function HeaderIcon({ icon, badge }: { icon: string; badge?: boolean }) {
  return (
    <div style={{ 
      width: "48px", height: "48px", background: "#FFF", borderRadius: "50%", 
      display: "flex", alignItems: "center", justifyContent: "center", 
      fontSize: "20px", boxShadow: "0 2px 10px rgba(26, 46, 42, 0.02)", border: "1px solid rgba(26, 46, 42, 0.05)",
      position: "relative"
    }}>
      {icon}
      {badge && (
        <div style={{ position: "absolute", top: "12px", right: "12px", width: "8px", height: "8px", background: "#FF6B2B", borderRadius: "50%", border: "2px solid #FFF" }} />
      )}
    </div>
  );
}

function SidebarIcon({ icon, active, onClick }: { icon: string; active?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        width: "48px", height: "48px", borderRadius: "16px", 
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        color: active ? "#FFF" : "rgba(255,255,255,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", 
        fontSize: "20px", cursor: "pointer", transition: "all 0.2s"
      }}
    >
      {icon}
    </div>
  );
}

function KpiCard({ label, val, icon, trendType }: { label: string; val: string; icon: string; trendType?: "bar" | "line" }) {
  return (
    <div style={{ background: "#FFF", borderRadius: "24px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "13px", color: "#999", fontWeight: 500, margin: 0 }}>{label}</p>
        <div style={{ 
          width: "32px", height: "32px", borderRadius: "10px", 
          background: "#F3F4F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" 
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "12px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>{val}</h2>
        {trendType === "bar" && (
          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
            <div style={{ width: "3px", height: "12px", background: "#111", borderRadius: "1px" }} />
            <div style={{ width: "3px", height: "18px", background: "#111", borderRadius: "1px" }} />
            <div style={{ width: "3px", height: "15px", background: "#111", borderRadius: "1px" }} />
            <div style={{ width: "3px", height: "24px", background: "#111", borderRadius: "1px" }} />
          </div>
        )}
        {trendType === "line" && (
           <div style={{ height: "24px", width: "60px" }}>
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={WAVY_CHART_DATA}>
                    <Line type="monotone" dataKey="y" stroke="#111" strokeWidth={2} dot={false} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        )}
      </div>
    </div>
  );
}
