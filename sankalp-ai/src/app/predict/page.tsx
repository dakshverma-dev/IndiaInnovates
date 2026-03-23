"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageLayout from "../components/PageLayout";
import RoleGuard from "../components/RoleGuard";

// --- Data ---
const PREDICTION_DATA = [
  { month: "Jan 23", predicted: 400, actual: 380 },
  { month: "Feb 23", predicted: 350, actual: 360 },
  { month: "Mar 23", predicted: 500, actual: 480 },
  { month: "Apr 23", predicted: 600, actual: 610 },
  { month: "May 23", predicted: 850, actual: 830 },
  { month: "Jun 23", predicted: 1100, actual: 1050 },
  { month: "Jul 23", predicted: 1450, actual: 1470 },
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
const PIE_COLORS = ["#FF6B2B", "#1A2E2A"];

const WORKORDERS = [
  { id: "PW-8847", ward: "Lajpat Nagar", category: "Drainage", risk: 87, officer: "Rajesh Kumar", status: "Prevented" },
  { id: "PW-8848", ward: "Rohini Sec 7", category: "Water Supply", risk: 74, officer: "Amit Sharma", status: "In Progress" },
  { id: "PW-8849", ward: "Mayur Vihar", category: "Roads", risk: 61, officer: "Suresh Gupta", status: "Completed" },
  { id: "PW-8850", ward: "Saket", category: "Drainage", risk: 82, officer: "Priya Singh", status: "Pending" },
  { id: "PW-8851", ward: "Dwarka", category: "Streetlights", risk: 45, officer: "Vikas Raj", status: "Prevented" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PredictionCard({ title, subtitle, risk, trigger, history, action, status, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        minWidth: "300px", background: "white", borderRadius: "20px",
        border: `1.5px solid ${color}22`, padding: "24px",
        display: "flex", flexDirection: "column", gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700, color, margin: 0 }}>{title}</p>
        <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFF", background: color, padding: "3px 10px", borderRadius: "100px", fontFamily: "'DM Sans', sans-serif" }}>{risk}/100</span>
      </div>
      <div>
        <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "16px", color: "#1A2E2A", margin: 0 }}>{subtitle}</h4>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.45)", marginTop: "4px" }}>Trigger: {trigger}</p>
      </div>
      <div style={{ background: "rgba(26,46,42,0.03)", borderRadius: "12px", padding: "14px", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", color: "rgba(26,46,42,0.6)", lineHeight: 1.5 }}>
        <p style={{ margin: 0 }}><strong style={{ color: "#1A2E2A" }}>Historical:</strong> {history}</p>
        <p style={{ margin: "4px 0 0" }}><strong style={{ color: "#1A2E2A" }}>Action:</strong> {action}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#16A34A", fontWeight: 700 }}>Status: {status}</span>
        <button style={{
          background: "transparent", border: "1.5px solid rgba(26,46,42,0.12)",
          borderRadius: "100px", padding: "5px 14px", fontSize: "10px", fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif", color: "#1A2E2A", cursor: "pointer",
        }}>Details</button>
      </div>
    </motion.div>
  );
}

export default function PredictPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
    <PageLayout showFooter>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px", width: "100%" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)", marginBottom: "8px" }}>
              AI-POWERED ANALYTICS
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "38px", color: "#1A2E2A", lineHeight: 1.1, margin: "0 0 10px" }}>
              Predictive Prevention Engine
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(26,46,42,0.5)", maxWidth: "550px" }}>
              3 years of ward-level complaint history × live weather forecasts = failures prevented before they&apos;re filed.
            </p>
          </div>
          <span style={{
            background: "#FF6B2B", color: "#FFF", fontSize: "10px", fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif", padding: "8px 18px", borderRadius: "100px", letterSpacing: "0.05em",
          }}>
            ★ INDUSTRY FIRST IN INDIAN CIVIC TECH
          </span>
        </div>

        {/* ALERT CARDS */}
        <section style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px" }}>
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

        {/* CHARTS */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "40px" }}>
          {/* Accuracy Chart */}
          <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid rgba(26,46,42,0.07)", padding: "28px" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#1A2E2A", marginBottom: "6px" }}>Complaint Volume: Predicted vs Actual</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)", marginBottom: "28px" }}>Historical model alignment across 272 wards (2023–2025)</p>
            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PREDICTION_DATA}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B2B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FF6B2B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A2E2A" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1A2E2A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(26,46,42,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(26,46,42,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(26,46,42,0.1)", borderRadius: "12px", color: "#1A2E2A", fontFamily: "'DM Sans', sans-serif", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="predicted" stroke="#FF6B2B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPred)" />
                  <Area type="monotone" dataKey="actual" stroke="#1A2E2A" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAct)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: "20px", display: "flex", gap: "24px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "14px", height: "3px", background: "#FF6B2B", borderRadius: "2px" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.5)" }}>AI Prediction</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "14px", height: "3px", background: "#1A2E2A", borderRadius: "2px", borderTop: "1px dashed #1A2E2A" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(26,46,42,0.5)" }}>Actual Growth</span>
              </div>
              <span style={{ marginLeft: "auto", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>Model Accuracy: 91.3%</span>
            </div>
          </div>

          {/* Donut */}
          <div style={{ background: "white", borderRadius: "20px", border: "1.5px solid rgba(26,46,42,0.07)", padding: "28px", textAlign: "center", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#1A2E2A", marginBottom: "6px" }}>Prevention Efforts (YTD)</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.4)", marginBottom: "24px" }}>Prevented vs Reactive filing</p>
            <div style={{ flex: 1, position: "relative", minHeight: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PREVENTION_STATS} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                    {PREVENTION_STATS.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", fontWeight: 700, color: "#1A2E2A", margin: 0 }}>40%</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(26,46,42,0.35)", margin: 0 }}>PREVENTED</p>
              </div>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#FF6B2B", fontWeight: 700, marginTop: "20px" }}>
              Saving MCD ₹2.3 crore in reactive repair costs
            </p>
          </div>
        </section>

        {/* WORKORDERS TABLE */}
        <section style={{ background: "white", borderRadius: "20px", border: "1.5px solid rgba(26,46,42,0.07)", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1A2E2A", margin: 0 }}>Auto-Created Preventive Workorders</h3>
            <div style={{ display: "flex", gap: "6px" }}>
              {["All", "Drainage", "Water", "Roads"].map((label) => (
                <button key={label} style={{
                  background: label === "All" ? "#FF6B2B" : "rgba(26,46,42,0.04)",
                  border: label === "All" ? "none" : "1.5px solid rgba(26,46,42,0.08)",
                  borderRadius: "100px", padding: "7px 16px", fontSize: "11px", fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  color: label === "All" ? "#FFF" : "#1A2E2A", cursor: "pointer",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid rgba(26,46,42,0.06)", textAlign: "left" }}>
                  {["WO ID", "Ward", "Category", "Risk Score", "Officer", "Outcome"].map((h) => (
                    <th key={h} style={{ padding: "14px 16px", fontWeight: 700, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,46,42,0.35)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WORKORDERS.map((wo) => (
                  <tr key={wo.id} style={{ borderBottom: "1px solid rgba(26,46,42,0.04)" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF6B2B", fontSize: "12px" }}>{wo.id}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1A2E2A" }}>{wo.ward}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "100px", background: "rgba(26,46,42,0.04)", border: "1px solid rgba(26,46,42,0.06)", fontSize: "11px", fontWeight: 600 }}>{wo.category}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "4px", background: "rgba(26,46,42,0.06)", borderRadius: "2px", maxWidth: "60px" }}>
                          <div style={{ height: "100%", width: `${wo.risk}%`, background: wo.risk > 80 ? "#DC2626" : "#FF6B2B", borderRadius: "2px" }} />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#1A2E2A" }}>{wo.risk}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "rgba(26,46,42,0.6)" }}>{wo.officer}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {wo.status === "Prevented" ? (
                        <span style={{ color: "#16A34A", fontWeight: 700 }}>Complaint Avoided ✓</span>
                      ) : (
                        <span style={{ color: "rgba(26,46,42,0.4)" }}>{wo.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </PageLayout>
    </RoleGuard>
  );
}
