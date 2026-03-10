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
  BarChart,
  Bar,
  Cell
} from "recharts";

// --- Mock Data ---
const CHART_DATA = [
  { name: "00:00", filed: 40, resolved: 35 },
  { name: "04:00", filed: 20, resolved: 18 },
  { name: "08:00", filed: 85, resolved: 40 },
  { name: "12:00", filed: 120, resolved: 90 },
  { name: "16:00", filed: 150, resolved: 110 },
  { name: "20:00", filed: 95, resolved: 105 },
  { name: "23:59", filed: 50, resolved: 70 },
];

const OFFICER_DATA = [
  { name: "Rajesh Kumar", resolved: 42, score: 98 },
  { name: "Amit Sharma", resolved: 38, score: 92 },
  { name: "Suresh Gupta", resolved: 35, score: 88 },
  { name: "Priya Singh", resolved: 31, score: 85 },
  { name: "Vikram Rathore", resolved: 28, score: 82 },
];

const RECENT_TICKETS = [
  { id: "DL-4821", ward: "42", cat: "Sanitation", priority: "P2", time: "2m ago", status: "ASSIGNED", officer: "Rajesh Kumar" },
  { id: "DL-4820", ward: "17", cat: "Roads", priority: "P2", time: "5m ago", status: "IN_PROGRESS", officer: "Amit Sharma" },
  { id: "DL-4819", ward: "31", cat: "Water", priority: "P1", time: "12m ago", status: "RESOLVED", officer: "Suresh Gupta" },
  { id: "DL-4818", cat: "Light", priority: "P3", ward: "09", time: "18m ago", status: "NEW", officer: "—" },
];

const AI_LOGS = [
  { text: "Nali band hai street 4 mein", cat: "Sanitation", conf: 94, time: "2.3s" },
  { text: "Street light not working", cat: "Electricity", conf: 98, time: "1.1s" },
  { text: "Road pothole near gate 2", cat: "Roads", conf: 91, time: "2.8s" },
];

// ============================================================
// ADMIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8F9FB", fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: "240px", background: "#0B1F42", color: "#FFF", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 24px", marginBottom: "40px" }}>
          <p style={{ fontFamily: "'Sora'", fontSize: "18px", fontWeight: 800 }}>SANKALP AI</p>
          <p style={{ fontFamily: "'Noto Sans Devanagari'", fontSize: "11px", color: "#FB923C", marginTop: "2px" }}>सङ्कल्प</p>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { n: "Dashboard", i: "📊" },
            { n: "All Complaints", i: "🎫" },
            { n: "Ward Map", i: "🗺️" },
            { n: "Field Officers", i: "👥" },
            { n: "Predictions", i: "🔮" },
            { n: "Audit Trail", i: "⛓️" },
            { n: "Settings", i: "⚙️" },
          ].map((item) => (
            <div
              key={item.n}
              onClick={() => setActiveTab(item.n)}
              style={{
                padding: "10px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                background: activeTab === item.n ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: activeTab === item.n ? "3px solid #FB923C" : "3px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.i}</span>
              <span style={{ fontSize: "13px", fontWeight: activeTab === item.n ? 600 : 400, opacity: activeTab === item.n ? 1 : 0.6 }}>{item.n}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: "0 24px", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>RK</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#FFF" }}>Rajesh Kumar</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Sector Officer, South</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        
        {/* TOP BAR */}
        <header style={{ height: "64px", background: "#FFF", borderBottom: "1px solid #E9EAEC", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Good morning, Rajesh</h1>
            <p style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>March 28, 2026 · 10:42 AM IST</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
             <div style={{ position: "relative" }}>
               <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>
               <div style={{ position: "absolute", top: "0", right: "0", width: "8px", height: "8px", background: "#EF4444", borderRadius: "50%", border: "2px solid #FFF" }} />
             </div>
             <div style={{ width: "1px", height: "24px", background: "#E9EAEC" }} />
             <input placeholder="Search complaints..." style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E9EAEC", fontSize: "13px", width: "220px", background: "#F8F9FB", outline: "none" }} />
          </div>
        </header>

        <div style={{ padding: "32px" }}>
          
          {/* ROW 1: KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <KpiCard label="Active Complaints" val="847" delta="+23 today" color="#FB923C" />
            <KpiCard label="Avg Resolution" val="31.4 hrs" delta="-14% v/s LW" color="#4ADE80" />
            <KpiCard label="SLA Compliance" val="89.3%" delta="↑ 2.1%" color="#4ADE80" />
            <KpiCard label="Fake Prevents" val="142" delta="Protected" color="#6366F1" />
          </div>

          {/* ROW 2: MAP & CHART */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px", marginBottom: "32px" }}>
             <Card title="Live Complaint Map — South Zone">
                <div style={{ height: "400px", background: "#F4F5F7", borderRadius: "12px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {/* Simplified SVG map viz */}
                   <svg width="600" height="400" viewBox="0 0 400 300">
                      <path d="M50 150 L150 50 L250 100 L350 50 L300 250 L100 200 Z" fill="rgba(251,146,60,0.15)" stroke="#FB923C" strokeWidth="2" />
                      <circle cx="150" cy="120" r="12" fill="rgba(239,68,68,0.3)">
                        <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="280" cy="180" r="8" fill="#F59E0B" />
                      <circle cx="100" cy="180" r="6" fill="#16A34A" />
                   </svg>
                   <div style={{ position: "absolute", bottom: "16px", right: "16px", background: "rgba(255,255,255,0.9)", padding: "10px", borderRadius: "8px", fontSize: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                      <p style={{ fontWeight: 700, marginBottom: "4px" }}>Density Heatmap</p>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                         <div style={{ width: "30px", height: "6px", background: "linear-gradient(to right, #4ADE80, #F59E0B, #EF4444)", borderRadius: "100px" }} />
                         <span>Low → High</span>
                      </div>
                   </div>
                </div>
             </Card>

             <Card title="Complaint Flow — 24h">
                <div style={{ height: "400px" }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                         <defs>
                            <linearGradient id="colF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FB923C" stopOpacity={0.3}/><stop offset="95%" stopColor="#FB923C" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/><stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/></linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
                         <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis fontSize={10} axisLine={false} tickLine={false} />
                         <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                         <Area type="monotone" dataKey="filed" stroke="#FB923C" fillOpacity={1} fill="url(#colF)" strokeWidth={2} />
                         <Area type="monotone" dataKey="resolved" stroke="#4ADE80" fillOpacity={1} fill="url(#colR)" strokeWidth={2} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </Card>
          </div>

          {/* ROW 3: TICKETS & AI */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
             <Card title="Incoming Tickets — Live">
                <div style={{ display: "flex", flexDirection: "column" }}>
                   {RECENT_TICKETS.map((t, i) => (
                      <div key={t.id} style={{ padding: "14px 0", borderBottom: i === RECENT_TICKETS.length - 1 ? "none" : "1px solid #F0F1F3", display: "grid", gridTemplateColumns: "100px 60px 100px 80px 1fr", alignItems: "center" }}>
                         <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "12px", fontWeight: 700, color: "#0F2D5E" }}>{t.id}</span>
                         <span style={{ fontSize: "12px", color: "#666" }}>W{t.ward}</span>
                         <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "100px", background: "rgba(15,45,94,0.06)", color: "#0F2D5E", width: "fit-content" }}>{t.cat}</span>
                         <span style={{ fontSize: "10px", fontWeight: 800, color: t.priority === "P1" ? "#EF4444" : "#F59E0B" }}>{t.priority} PRIORITY</span>
                         <span style={{ fontSize: "11px", color: "#999", textAlign: "right" }}>{t.time} · {t.status}</span>
                      </div>
                   ))}
                </div>
             </Card>

             <Card title="Officer Leaderboard">
                <div style={{ height: "240px" }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={OFFICER_DATA} layout="vertical" margin={{ left: 40 }}>
                         <XAxis type="number" hide />
                         <YAxis type="category" dataKey="name" fontSize={10} width={80} axisLine={false} tickLine={false} />
                         <Tooltip cursor={{ fill: "transparent" }} />
                         <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                            {OFFICER_DATA.map((entry, index) => (
                               <Cell key={index} fill={entry.score > 90 ? "#4ADE80" : "#FB923C"} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                   <div style={{ marginTop: "12px", borderTop: "1px solid #F0F1F3", paddingTop: "12px" }}>
                      <p style={{ fontSize: "11px", color: "#666", display: "flex", justifyContent: "space-between" }}>
                         <span>Top performer: Rajesh Kumar</span>
                         <span style={{ fontWeight: 700, color: "#16A34A" }}>98 Karma</span>
                      </p>
                   </div>
                </div>
             </Card>
          </div>

        </div>
      </main>

      <style jsx global>{`
        body { margin: 0; background: #F8F9FB; }
      `}</style>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function KpiCard({ label, val, delta, color }: { label: string; val: string; delta: string; color: string }) {
  return (
    <div style={{ background: "#FFF", padding: "24px", borderRadius: "16px", border: "1px solid #E9EAEC", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
      <p style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
         <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#111", lineHeight: 1 }}>{val}</h2>
         <span style={{ fontSize: "11px", fontWeight: 700, color }}>{delta}</span>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFF", borderRadius: "16px", border: "1px solid #E9EAEC", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
         <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>{title}</h3>
         <button style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: "12px", cursor: "pointer" }}>···</button>
      </div>
      {children}
    </div>
  );
}
