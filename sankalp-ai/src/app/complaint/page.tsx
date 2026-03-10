"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Lang = "en" | "hi";
type Step = 1 | 2 | 3 | 4;

const T = {
  en: {
    tagline: "Your complaint. Tracked. Verified. Resolved.",
    noApp: "No app? Call 1533",
    formTitle: "File a Complaint",
    formSub: "Takes less than 2 minutes.",
    stepLabels: ["Location", "Issue", "Photo", "Contact"],
    locationLabel: "Locality / Area in Delhi",
    locationPlaceholder: "Lajpat Nagar, Rohini, Dwarka…",
    gpsBtn: "Detect my location",
    descLabel: "Describe the problem",
    descPlaceholder: "e.g. \"Meri gali mein nali band hai aur kachra jam gaya hai…\"",
    photoLabel: "Attach a photo",
    photoDrag: "Click or drag to upload",
    photoHint: "Optional, but helps faster resolution",
    phoneLabel: "Mobile number",
    phonePlaceholder: "+91 98XXXXXXXX",
    whatsapp: "Send WhatsApp updates",
    noSpam: "Only civic updates. No spam.",
    submit: "Submit Complaint",
    next: "Continue",
    back: "Back",
    aiReading: "Analysing complaint…",
    aiDone: "Classified in 1.8s",
    successTitle: "Complaint Filed",
    successSub: "We've got it. Here's your reference.",
    successTicket: "Ticket ID",
    copy: "Copy",
    copied: "Copied",
    officer: "Assigned Officer",
    eta: "Expected by",
    whatsappShare: "Share on WhatsApp",
  },
  hi: {
    tagline: "आपकी शिकायत। ट्रैक। सत्यापित। हल।",
    noApp: "इंटरनेट नहीं? 1533 कॉल करें",
    formTitle: "शिकायत दर्ज करें",
    formSub: "2 मिनट से कम लगेगा।",
    stepLabels: ["स्थान", "समस्या", "फ़ोटो", "संपर्क"],
    locationLabel: "दिल्ली में इलाका",
    locationPlaceholder: "लाजपत नगर, रोहिणी, द्वारका…",
    gpsBtn: "GPS से पता लगाएं",
    descLabel: "समस्या विवरण",
    descPlaceholder: "जैसे \"मेरी गली में नाली बंद है…\"",
    photoLabel: "फ़ोटो लगाएं",
    photoDrag: "क्लिक करें या खींचें",
    photoHint: "वैकल्पिक, पर जल्दी समाधान में मदद करता है",
    phoneLabel: "मोबाइल नंबर",
    phonePlaceholder: "+91 98XXXXXXXX",
    whatsapp: "WhatsApp अपडेट भेजें",
    noSpam: "केवल नागरिक अपडेट।",
    submit: "शिकायत दर्ज करें",
    next: "जारी रखें",
    back: "वापस",
    aiReading: "विश्लेषण हो रहा है…",
    aiDone: "1.8 सेकंड में वर्गीकृत",
    successTitle: "शिकायत दर्ज हुई",
    successSub: "आपकी शिकायत मिल गई।",
    successTicket: "टिकट ID",
    copy: "कॉपी",
    copied: "कॉपी हुआ",
    officer: "नियुक्त अधिकारी",
    eta: "अपेक्षित समय",
    whatsappShare: "WhatsApp पर शेयर करें",
  },
};

const WARDS: Record<string, { ward: number; zone: string }> = {
  "lajpat nagar": { ward: 42, zone: "South Delhi Zone" },
  "govindpuri": { ward: 67, zone: "South Delhi Zone" },
  "rohini": { ward: 23, zone: "North West Zone" },
  "dwarka": { ward: 51, zone: "West Delhi Zone" },
  "saket": { ward: 38, zone: "South Delhi Zone" },
  "karol bagh": { ward: 14, zone: "Central Zone" },
  "janakpuri": { ward: 55, zone: "West Delhi Zone" },
  "mayur vihar": { ward: 61, zone: "East Delhi Zone" },
};

const FEED = [
  { id: "DL-4821", cat: "Sanitation", ward: 42, status: "Resolved", ok: true },
  { id: "DL-4820", cat: "Roads", ward: 17, status: "In Progress", ok: false },
  { id: "DL-4819", cat: "Water Supply", ward: 31, status: "Resolved", ok: true },
  { id: "DL-4818", cat: "Streetlight", ward: 9, status: "Assigned", ok: false },
  { id: "DL-4817", cat: "Drainage", ward: 42, status: "Resolved", ok: true },
  { id: "DL-4816", cat: "Parking", ward: 23, status: "In Progress", ok: false },
];

function getAI(text: string) {
  const t = text.toLowerCase();
  if (t.includes("nali") || t.includes("drain") || t.includes("kachra") || t.includes("garbage") || t.includes("sanitation"))
    return { cat: "Sanitation", dept: "MCD — South Zone", priority: "P2 · High", sla: "48 hr SLA" };
  if (t.includes("road") || t.includes("pothole") || t.includes("sadak"))
    return { cat: "Roads", dept: "PWD Delhi", priority: "P3 · Medium", sla: "72 hr SLA" };
  if (t.includes("light") || t.includes("bijli") || t.includes("street"))
    return { cat: "Streetlight", dept: "BSES / TPDDL", priority: "P3 · Medium", sla: "72 hr SLA" };
  if (t.includes("water") || t.includes("paani") || t.includes("pipe"))
    return { cat: "Water Supply", dept: "DJB — Zone 3", priority: "P1 · Critical", sla: "24 hr SLA" };
  return { cat: "General Grievance", dept: "MCD", priority: "P3 · Medium", sla: "72 hr SLA" };
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [count, setCount] = useState(1247);
  const [feed, setFeed] = useState(FEED.slice(0, 4));
  const idx = useRef(4);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 9000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFeed((prev) => [FEED[idx.current % FEED.length], ...prev.slice(0, 3)]);
      idx.current++;
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const STATS = [
    { val: count.toLocaleString(), label: "resolved today", color: "#4ADE80", mono: true },
    { val: "4.2s", label: "avg AI classify", color: "#FB923C", mono: true },
    { val: "94.3%", label: "within SLA", color: "#818CF8", mono: false },
  ];

  return (
    <aside style={{
      width: "100%", height: "100%",
      background: "#1A2E2A", // Dark Sage
      display: "flex", flexDirection: "column",
      padding: "28px 24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle glow */}
      <div style={{ position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(93,122,111,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Brand */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "15px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em" }}>SANKALP AI</p>
        <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: "11px", color: "#5D7A6F", marginTop: "1px" }}>सङ्कल्प</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "10px", lineHeight: 1.5 }}>
          {t.tagline}
        </p>
      </div>

      {/* Stats — compact 3-column row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "24px" }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "10px 8px",
            textAlign: "center",
          }}>
            <p style={{ fontFamily: s.mono ? "'JetBrains Mono',monospace" : "'Sora',sans-serif", fontSize: "16px", fontWeight: 700, color: s.color === "#FB923C" ? "#E7E8E2" : s.color, lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "4px", lineHeight: 1.3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live activity */}
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: "8px" }}>
        Live Activity
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px", overflow: "hidden" }}>
        <AnimatePresence initial={false}>
          {feed.map((item, i) => (
            <motion.div
              key={item.id + item.status + i}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", color: "#5D7A6F", lineHeight: 1 }}>{item.id}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.cat} · W{item.ward}</p>
              </div>
              <span style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "10px", fontWeight: 600,
                color: item.ok ? "#A3E635" : "#5D7A6F",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {item.ok ? "✓ Done" : <>\u2192 Live</>}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: "auto", paddingTop: "20px" }}>
        {t.noApp}
      </p>
    </aside>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ComplaintPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<Step>(1);
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState<{ ward: number; zone: string } | null>(null);
  const [desc, setDesc] = useState("");
  const [ai, setAi] = useState<ReturnType<typeof getAI> | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [wa, setWa] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = T[lang];
  const ticketId = "DL-4823";

  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + 2);
  const eta = etaDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }) + " · 5:00 PM";

  useEffect(() => {
    const key = Object.keys(WARDS).find((k) => location.toLowerCase().includes(k));
    setWard(key ? WARDS[key] : null);
  }, [location]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (desc.trim().length < 8) { setAi(null); setAiLoading(false); return; }
    setAiLoading(true); setAi(null);
    timer.current = setTimeout(() => { setAi(getAI(desc)); setAiLoading(false); }, 1500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [desc]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhoto(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1600);
  };

  const handleCopy = () => { navigator.clipboard.writeText(ticketId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // ── Input style ──
  const inp: React.CSSProperties = {
    width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
    color: "#111", background: "#FFF",
    border: "1.5px solid #E5E7EB", borderRadius: "10px",
    padding: "12px 14px", outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#0F2D5E");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#E5E7EB");

  return (
    <div 
      className="complaint-container"
      style={{ display: "flex", minHeight: "100vh", background: "#E7E8E2" }}
    >
      {/* SIDEBAR — 36% */}
      <div 
        className="complaint-sidebar"
        style={{ width: "36%", minWidth: "300px", maxWidth: "400px", flexShrink: 0 }}
      >
        <Sidebar lang={lang} />
      </div>

      {/* RIGHT PANEL */}
      <div 
        className="complaint-main"
        style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "0 0 48px" }}
      >

        {/* Top bar */}
        <div 
          className="complaint-topbar"
          style={{
            width: "100%", padding: "14px 32px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(231, 232, 226, 0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(26, 46, 42, 0.05)",
            position: "sticky", top: 0, zIndex: 10,
            flexWrap: "wrap", gap: "12px"
          }}
        >
          {/* Step wizaard */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {([1, 2, 3, 4] as Step[]).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "4px 10px", borderRadius: "100px",
                  background: step === s ? "#1A2E2A" : step > s ? "rgba(26, 46, 42, 0.05)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", fontWeight: 700, color: step === s ? "#FFF" : step > s ? "#1A2E2A" : "rgba(0,0,0,0.25)" }}>{s}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 600, color: step === s ? "#FFF" : step > s ? "#1A2E2A" : "rgba(0,0,0,0.25)" }}>{t.stepLabels[i]}</span>
                </div>
                {s < 4 && <span style={{ color: "#D1D5DB", fontSize: "10px" }}>{"\u203A"}</span>}
              </div>
            ))}
          </div>

          {/* Lang toggle */}
          <div style={{ display: "flex", background: "rgba(26, 46, 42, 0.05)", borderRadius: "8px", padding: "2px", gap: "2px" }}>
            {(["en", "hi"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: 600,
                padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                background: lang === l ? "#1A2E2A" : "transparent",
                color: lang === l ? "#FFF" : "rgba(26, 46, 42, 0.45)",
                transition: "all 0.15s",
              }}>{l === "en" ? "EN" : "हिं"}</button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div style={{ width: "100%", maxWidth: "500px", padding: "32px 24px 0" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <SuccessView key="done" t={t} ticketId={ticketId} eta={eta} phone={phone} ai={ai} copied={copied} onCopy={handleCopy} />
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: "24px" }}>
                  <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "32px", fontWeight: 400, color: "#1A2E2A", lineHeight: 1.15 }}>{t.formTitle}</h1>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "rgba(26, 46, 42, 0.5)", marginTop: "4px" }}>{t.formSub}</p>
                </div>

                <AnimatePresence mode="wait">
                  {/* ── STEP 1 ── */}
                  {step === 1 && <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <FieldLabel>{t.locationLabel}</FieldLabel>
                    <input
                      style={inp} placeholder={t.locationPlaceholder}
                      value={location} onChange={(e) => setLocation(e.target.value)}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <AnimatePresence>
                      {ward && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{
                          marginTop: "8px", padding: "8px 12px", borderRadius: "8px",
                          background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.18)",
                          fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#15803D",
                        }}>
                          → Ward {ward.ward} · {ward.zone}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button whileHover={{ background: "rgba(251,146,60,0.1)" }} whileTap={{ scale: 0.97 }}
                      onClick={() => setLocation("Lajpat Nagar")}
                      style={{
                        marginTop: "10px", width: "100%",
                        fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: 500,
                        color: "#EA580C", background: "rgba(251,146,60,0.07)",
                        border: "1.5px dashed rgba(251,146,60,0.3)", borderRadius: "10px",
                        padding: "10px", cursor: "pointer", transition: "background 0.15s",
                      }}>
                      📍 {t.gpsBtn}
                    </motion.button>
                  </motion.div>}

                  {/* ── STEP 2 ── */}
                  {step === 2 && <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <FieldLabel>{t.descLabel}</FieldLabel>
                    <textarea
                      rows={5} style={{ ...inp, resize: "none" } as React.CSSProperties}
                      placeholder={t.descPlaceholder}
                      value={desc} onChange={(e) => setDesc(e.target.value)}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <AnimatePresence>
                      {(aiLoading || ai) && (
                        <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          style={{ marginTop: "10px", padding: "12px 14px", borderRadius: "10px", background: "#F8F8FF", border: "1px solid rgba(99,102,241,0.15)" }}>
                          {aiLoading ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {[0, 1, 2].map((i) => (
                                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.9 }}
                                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6366F1" }} />
                              ))}
                              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "rgba(99,102,241,0.7)" }}>{t.aiReading}</span>
                            </div>
                          ) : ai && (
                            <div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "6px" }}>
                                {[
                                  { label: ai.cat, bg: "rgba(15,45,94,0.07)", fg: "#0F2D5E" },
                                  { label: ai.priority, bg: "rgba(234,88,12,0.08)", fg: "#C2410C" },
                                  { label: ai.dept, bg: "rgba(15,45,94,0.07)", fg: "#0F2D5E" },
                                  { label: ai.sla, bg: "rgba(22,163,74,0.07)", fg: "#15803D" },
                                ].map((c, i) => (
                                  <motion.span key={c.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                                    style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: c.bg, color: c.fg }}>
                                    {c.label}
                                  </motion.span>
                                ))}
                              </div>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", color: "rgba(0,0,0,0.3)" }}>{t.aiDone}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>}

                  {/* ── STEP 3 ── */}
                  {step === 3 && <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <FieldLabel>{t.photoLabel}</FieldLabel>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.35)", marginBottom: "10px" }}>{t.photoHint}</p>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                    {photo ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                        <button onClick={() => setPhoto(null)} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.55)", color: "#FFF", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", fontSize: "12px" }}>✕</button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ borderColor: "#6366F1", background: "rgba(99,102,241,0.02)" }}
                        onClick={() => fileRef.current?.click()}
                        style={{ border: "1.5px dashed #D1D5DB", borderRadius: "12px", padding: "40px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>🖼</div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>{t.photoDrag}</p>
                      </motion.div>
                    )}
                  </motion.div>}

                  {/* ── STEP 4 ── */}
                  {step === 4 && <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <FieldLabel>{t.phoneLabel}</FieldLabel>
                    <input type="tel" style={inp} placeholder={t.phonePlaceholder}
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      onFocus={onFocus} onBlur={onBlur} />
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.3)", marginTop: "5px" }}>{t.noSpam}</p>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", cursor: "pointer" }}>
                      <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#0F2D5E" }} />
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#111" }}>{t.whatsapp}</span>
                    </label>
                  </motion.div>}
                </AnimatePresence>

                {/* Nav buttons */}
                <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
                  {step > 1 && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep((s) => (s - 1) as Step)}
                      style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 500, padding: "12px 24px", borderRadius: "100px", border: "1px solid rgba(26, 46, 42, 0.1)", background: "rgba(26, 46, 42, 0.05)", color: "#1A2E2A", cursor: "pointer" }}>
                      {t.back}
                    </motion.button>
                  )}
                  {step < 4 ? (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep((s) => (s + 1) as Step)}
                      style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", fontSize: "15px", fontWeight: 600, padding: "14px", borderRadius: "100px", border: "none", background: "#1A2E2A", color: "#FFF", cursor: "pointer" }}>
                      {t.next} {"\u2192"}
                    </motion.button>
                  ) : (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit} disabled={submitting}
                      style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", fontSize: "15px", fontWeight: 600, padding: "14px", borderRadius: "100px", border: "none", background: "#1A2E2A", color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      {submitting ? (
                        <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#FFF", borderRadius: "50%" }} /></>
                      ) : t.submit}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 900px) {
          .complaint-container {
            flex-direction: column !important;
          }
          .complaint-sidebar {
            width: 100% !important;
            max-width: none !important;
            order: 2; /* Sidebar after form on mobile */
          }
          .complaint-main {
            order: 1;
            padding-bottom: 24px !important;
          }
          .complaint-topbar {
            padding: 12px 16px !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 480px) {
          .complaint-topbar div:first-child {
            gap: 2px !important;
          }
          .complaint-topbar div:first-child span:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── FIELD LABEL ───────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", marginBottom: "7px" }}>
      {children}
    </p>
  );
}

// ─── SUCCESS ───────────────────────────────────────────────────────────────────
function SuccessView({ t, ticketId, eta, phone, ai, copied, onCopy }: {
  t: typeof T["en"]; ticketId: string; eta: string; phone: string;
  ai: ReturnType<typeof getAI> | null; copied: boolean; onCopy: () => void;
}) {
  return (
    <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Check */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
          style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "2px solid #22C55E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "28px" }}>
          ✓
        </motion.div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "24px", fontWeight: 400, color: "#111" }}>{t.successTitle}</h1>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", marginTop: "4px" }}>{t.successSub}</p>
      </div>

      {/* Ticket */}
      <div style={{ background: "#0B1F42", borderRadius: "14px", padding: "20px", textAlign: "center", marginBottom: "12px" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>{t.successTicket}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "32px", fontWeight: 700, color: "#FB923C" }}>{ticketId}</span>
          <motion.button whileTap={{ scale: 0.92 }} onClick={onCopy} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 600, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "7px", background: "transparent", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
            {copied ? t.copied : t.copy}
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div style={{ background: "#FFF", border: "1px solid #E9EAEC", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
        {ai && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", paddingBottom: "10px", borderBottom: "1px solid #F0F1F3" }}>
            {[ai.cat, ai.priority, ai.sla].map((c) => (
              <span key={c} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: "rgba(15,45,94,0.06)", color: "#0F2D5E" }}>{c}</span>
            ))}
          </div>
        )}
        <Row label={t.officer} value="Rajesh Kumar · South Zone" />
        <Row label={t.eta} value={eta} green />
        {phone && <Row label={t.whatsapp} value={phone} />}
      </div>

      <motion.button whileHover={{ boxShadow: "0 4px 16px rgba(22,163,74,0.25)" }} whileTap={{ scale: 0.97 }}
        onClick={() => window.open(`https://wa.me/?text=Complaint ${ticketId} filed with SANKALP AI`, "_blank")}
        style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, padding: "12px", borderRadius: "10px", border: "none", background: "#16A34A", color: "#FFF", cursor: "pointer" }}>
        🟢 {t.whatsappShare}
      </motion.button>
    </motion.div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>{label}</span>
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: 600, color: green ? "#16A34A" : "#111" }}>{value}</span>
    </div>
  );
}
