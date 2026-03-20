"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// --- Mock Data ---
const PREDICTION_DATA = [
  { month: "Jan 23", predicted: 400, actual: 380 },
  { month: "Feb 23", predicted: 350, actual: 360 },
  { month: "Mar 23", predicted: 500, actual: 480 },
  { month: "Apr 23", predicted: 600, actual: 610 },
  { month: "May 23", predicted: 850, actual: 830 },
  { month: "Jun 23", predicted: 1100, actual: 1050 },
  { month: "Jul 23", predicted: 1450, actual: 1470 }, // Monsoon Peak
  { month: "Aug 23", predicted: 1300, actual: 1280 },
  { month: "Sep 23", predicted: 1100, actual: 1120 },
  { month: "Oct 23", predicted: 700, actual: 680 },
  { month: "Nov 23", predicted: 500, actual: 520 },
  { month: "Dec 23", predicted: 450, actual: 440 },
  { month: "Jan 24", predicted: 420, actual: 400 },
  { month: "Feb 24", predicted: 380, actual: 390 },
  { month: "Mar 24", predicted: 550, actual: 530 },
  { month: "Apr 24", predicted: 650, actual: 670 },
  { month: "May 24", predicted: 900, actual: 880 },
  { month: "Jun 24", predicted: 1200, actual: 1150 },
  { month: "Jul 24", predicted: 1550, actual: 1580 },
  { month: "Aug 24", predicted: 1400, actual: 1380 },
  { month: "Sep 24", predicted: 1200, actual: 1220 },
  { month: "Oct 24", predicted: 800, actual: 780 },
  { month: "Nov 24", predicted: 600, actual: 620 },
  { month: "Dec 24", predicted: 550, actual: 540 },
];

const PREVENTION_STATS = [
  { name: "Prevented", value: 40 },
  { name: "Filed", value: 60 },
];
const COLORS = ["#FF6B2B", "#0F2D5E"];

const WARD_RISKS = [
  { id: "DL-W42", name: "Lajpat Nagar", risk: 87, status: "High", category: "Drainage" },
  { id: "DL-W17", name: "Rohini Sec 7", risk: 74, status: "High", category: "Water Supply" },
  { id: "DL-W61", name: "Mayur Vihar", risk: 61, status: "Medium", category: "Roads" },
  { id: "DL-W09", name: "Dwarka", risk: 45, status: "Low", category: "Streetlights" },
  { id: "DL-W23", name: "Saket", risk: 82, status: "High", category: "Drainage" },
  { id: "DL-W14", name: "Karol Bagh", risk: 55, status: "Medium", category: "Sanitation" },
];

const WORKORDERS = [
  { id: "PW-8847", ward: "Lajpat Nagar", category: "Drainage", risk: 87, date: "2026-03-20", officer: "Rajesh Kumar", status: "Prevented" },
  { id: "PW-8848", ward: "Rohini Sec 7", category: "Water Supply", risk: 74, date: "2026-03-21", officer: "Amit Sharma", status: "In Progress" },
  { id: "PW-8849", ward: "Mayur Vihar", category: "Roads", risk: 61, date: "2026-03-22", officer: "Suresh Gupta", status: "Completed" },
  { id: "PW-8850", ward: "Saket", category: "Drainage", risk: 82, date: "2026-03-23", officer: "Priya Singh", status: "Pending" },
  { id: "PW-8851", ward: "Dwarka", category: "Streetlights", risk: 45, date: "2026-03-24", officer: "Vikas Raj", status: "Prevented" },
];

// --- Components ---

function PredictionCard({ title, subtitle, risk, trigger, history, action, status, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      style={{
        minWidth: "320px", background: "#161B22", border: `1px solid ${color}44`,
        borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <p style={{ fontFamily: "Sora", fontSize: "12px", fontWeight: 700, color: color }}>{title}</p>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#FFF", background: color, padding: "2px 8px", borderRadius: "100px" }}>{risk}/100</span>
      </div>
      <div>
        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", margin: 0 }}>{subtitle}</h4>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Trigger: {trigger}</p>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "12px", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
        <p style={{ margin: 0 }}><strong>Historical:</strong> {history}</p>
        <p style={{ margin: "4px 0 0" }}><strong>Action:</strong> {action}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <span style={{ fontSize: "11px", color: "#4ADE80", fontWeight: 600 }}>Status: {status}</span>
        <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "4px 12px", fontSize: "10px", color: "#FFF", cursor: "pointer" }}>Details</button>
      </div>
    </motion.div>
  );
}

export default function PredictPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", color: "#FFF", fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <header style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px" }}>🔮</span>
              <h1 style={{ fontFamily: "Sora", fontSize: "32px", fontWeight: 700, margin: 0 }}>Predictive Prevention Engine</h1>
            </div>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", maxWidth: "600px" }}>
              3 years of ward-level complaint history × live weather forecasts = failures prevented before they're filed.
            </p>
          </div>
          <span style={{ background: "#FF6B2B", color: "#FFF", fontSize: "11px", fontWeight: 800, padding: "6px 16px", borderRadius: "100px", letterSpacing: "0.05em" }}>
            ★ INDUSTRY FIRST IN INDIAN CIVIC TECH
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: "48px" }}>
        
        {/* SECTION 1: ALERT CARDS */}
        <section>
          <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px", scrollbarWidth: "none" }}>
            <PredictionCard 
              title="⚠️ MONSOON DRAIN BLOCKAGE RISK" 
              subtitle="High probability alert — 34 wards" 
              risk={87}
              trigger="IMD forecast: 89mm rainfall in next 72 hours"
              history="Same wards reported 1,247 drainage complaints in July 2023"
              action="Auto-created 34 preventive inspection workorders"
              status="Workorders sent to field teams ✓"
              color="#DC2626"
            />
            <PredictionCard 
              title="⚠️ SUMMER WATER PRESSURE FAILURE" 
              subtitle="Risk score high — 18 wards affected" 
              risk={74}
              trigger="Temperature forecast: 44°C+ for 5 consecutive days"
              history="Pipeline pressure drops significantly above 42°C in this zone"
              action="Scheduled extra tankers & pipeline pressure checks"
              status="En-route ✓"
              color="#F59E0B"
            />
            <PredictionCard 
              title="📋 ROAD SURFACE DEGRADATION" 
              subtitle="Post-winter analysis — 22 wards flagged" 
              risk={61}
              trigger="Recent freeze-thaw cycles + heavy freight movement"
              history="80% accuracy in predicting potholes before they expand"
              action="Flagged for preventive resurfacing workorders"
              status="Pending review"
              color="#818CF8"
            />
            <PredictionCard 
              title="✅ STREETLIGHT OUTAGE CYCLE" 
              subtitle="Predictive maintenance — Low risk" 
              risk={45}
              trigger="End-of-life cycle for 847 LED bulbs this quarter"
              history="Average bulb life: 18 months in North Zone V2 grid"
              action="Bulk replacement workorder initiated"
              status="Completed ✓"
              color="#16A34A"
            />
          </div>
        </section>

        {/* SECTION 2: CHARTS */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
          {/* Accuracy Chart */}
          <div style={{ background: "#111827", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ fontFamily: "Sora", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Complaint Volume: Predicted vs Actual</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>Historical model alignment across 272 wards (2023–2025)</p>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PREDICTION_DATA}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B2B" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#FF6B2B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "#FFF" }} />
                  <Area type="monotone" dataKey="predicted" stroke="#FF6B2B" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" />
                  <Area type="monotone" dataKey="actual" stroke="#818CF8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAct)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "3px", background: "#FF6B2B" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>AI Prediction</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "3px", background: "#818CF8", borderStyle: "dashed", borderBottomWidth: "1px" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Actual Growth</span>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>Model Accuracy: 91.3%</span>
            </div>
          </div>

          {/* Donut Chart */}
          <div style={{ background: "#111827", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontFamily: "Sora", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Efforts (YTD)</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>Prevented vs Reactive filing</p>
            <div style={{ flex: 1, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PREVENTION_STATS} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                    {PREVENTION_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <p style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>40%</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", margin: 0 }}>PREVENTED</p>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#FF6B2B", fontWeight: 600, marginTop: "24px" }}>
              Saving MCD ₹2.3 crore in reactive repair costs
            </p>
          </div>
        </section>

        {/* SECTION 3: WARD RISK LOG */}
        <section style={{ background: "#111827", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <h3 style={{ fontFamily: "Sora", fontSize: "20px", fontWeight: 700 }}>Auto-Created Preventive Workorders</h3>
            <div style={{ display: "flex", gap: "8px" }}>
               {["All", "Drainage", "Water", "Roads"].map(label => (
                 <button key={label} style={{ background: label === "All" ? "#FF6B2B" : "rgba(255,255,255,0.05)", border: "none", borderRadius: "100px", padding: "6px 16px", fontSize: "11px", color: "#FFF", cursor: "pointer" }}>{label}</button>
               ))}
            </div>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <th style={{ padding: "16px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>WO ID</th>
                  <th style={{ padding: "16px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Ward</th>
                  <th style={{ padding: "16px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Category</th>
                  <th style={{ padding: "16px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Risk Score</th>
                  <th style={{ padding: "16px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Officer</th>
                  <th style={{ padding: "16px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {WORKORDERS.map((wo) => (
                  <tr key={wo.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "16px", fontFamily: "JetBrains Mono", color: "#FF6B2B" }}>{wo.id}</td>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{wo.ward}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", fontSize: "11px" }}>{wo.category}</span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", maxWidth: "60px" }}>
                          <div style={{ height: "100%", width: `${wo.risk}%`, background: wo.risk > 80 ? "#DC2626" : "#F59E0B", borderRadius: "2px" }} />
                        </div>
                        <span style={{ fontSize: "11px" }}>{wo.risk}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>{wo.officer}</td>
                    <td style={{ padding: "16px" }}>
                      {wo.status === "Prevented" ? (
                        <span style={{ color: "#4ADE80", fontWeight: 700 }}>Complaint Avoided ✓</span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>{wo.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); borderRadius: 10px; }
      `}</style>
    </div>
  );
}
