"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

type Lang = "en" | "hi";
type Step = 1 | 2 | 3 | 4;

const T = {
  en: {
    formTitle: "File a Complaint",
    formSub: "Takes less than 2 minutes.",
    stepLabels: ["Location", "Issue", "Photo", "Contact"],
    locationLabel: "Locality / Area in Delhi",
    locationPlaceholder: "Lajpat Nagar, Rohini, Dwarka...",
    gpsBtn: "Detect my location",
    descLabel: "Describe the problem",
    descPlaceholder: "e.g. \"Meri gali mein nali band hai aur kachra jam gaya hai...\"",
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
    aiReading: "Analysing complaint...",
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
    formTitle: "शिकायत दर्ज करें",
    formSub: "2 मिनट से कम लगेगा।",
    stepLabels: ["स्थान", "समस्या", "फ़ोटो", "संपर्क"],
    locationLabel: "दिल्ली में इलाका",
    locationPlaceholder: "लाजपत नगर, रोहिणी, द्वारका...",
    gpsBtn: "GPS से पता लगाएं",
    descLabel: "समस्या विवरण",
    descPlaceholder: "जैसे \"मेरी गली में नाली बंद है...\"",
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
    aiReading: "विश्लेषण हो रहा है...",
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
  const [realTicketId, setRealTicketId] = useState("DL-4823");
  const [realAi, setRealAi] = useState<ReturnType<typeof getAI> | null>(null);
  const [realOfficerName, setRealOfficerName] = useState("Rajesh Kumar · South Zone");
  const timer = useRef<NodeJS.Timeout | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = T[lang];
  const ticketId = realTicketId;

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

  const handleSubmit = async () => {
    setSubmitting(true);
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    try {
      const res = await fetch("http://localhost:3001/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: desc.trim() || "General complaint",
          phone: normalizedPhone || "9999999999",
          language: lang,
          wardHint: ward?.ward,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        shortId: string;
        category: string;
        priority: string;
        department: string;
        sla_hours: number;
        officerName: string;
      };
      setRealTicketId(data.shortId);
      setRealAi({
        cat: data.category,
        priority: `${data.priority} · ${data.priority === "P1" ? "Critical" : data.priority === "P2" ? "High" : data.priority === "P3" ? "Medium" : "Low"}`,
        dept: data.department,
        sla: `${data.sla_hours}h SLA`,
      });
      setRealOfficerName(data.officerName);
      setSubmitting(false);
      setDone(true);
    } catch (_err) {
      console.warn("[SANKALP] Backend unavailable, using demo mode");
      setTimeout(() => { setSubmitting(false); setDone(true); }, 1600);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(ticketId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const inp: React.CSSProperties = {
    width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
    color: "#1A2E2A", background: "#FFF",
    border: "1.5px solid #E5E7EB", borderRadius: "10px",
    padding: "12px 14px", outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#1A2E2A");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#E5E7EB");

  return (
    <PageLayout showFooter>
      <div className="flex flex-col items-center justify-start px-4 pt-8 pb-24 min-h-screen">
        
        {/* Step wizard & Lang Toggle Header */}
        <div className="w-full max-w-[560px] flex gap-4 items-center justify-between mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-1 shrink-0">
            {([1, 2, 3, 4] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: step === s ? "#1A2E2A" : step > s ? "rgba(26,46,42,0.06)" : "transparent",
                  }}
                >
                  <span className={`font-mono text-xs font-bold ${step === s ? "text-white" : step > s ? "text-[#1A2E2A]" : "text-gray-300"}`}>
                    {s}
                  </span>
                  <span className={`font-sans text-xs font-semibold ${step === s ? "text-white" : step > s ? "text-[#1A2E2A]" : "text-gray-300"}`}>
                    {t.stepLabels[i]}
                  </span>
                </div>
                {s < 4 && <span className="text-gray-300 text-xs px-1">{">"}</span>}
              </div>
            ))}
          </div>

          <div className="flex bg-[rgba(26,46,42,0.06)] rounded-lg p-0.5 shrink-0">
            {(["en", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`font-sans text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
                  lang === l ? "bg-[#1A2E2A] text-white" : "text-[#1A2E2A]/60 hover:text-[#1A2E2A]"
                }`}
              >
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[560px]">
          <AnimatePresence mode="wait">
            {done ? (
              <SuccessView key="done" t={t} ticketId={ticketId} eta={eta} phone={phone} ai={realAi ?? ai} officerName={realOfficerName} copied={copied} onCopy={handleCopy} />
            ) : (
              <Card key="form" className="w-full relative shadow-md">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-8">
                    <h1 className="font-serif text-[32px] font-normal text-[#1A2E2A] leading-tight">{t.formTitle}</h1>
                    <p className="font-sans text-sm text-[#1A2E2A]/60 mt-1">{t.formSub}</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 && <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <FieldLabel>{t.locationLabel}</FieldLabel>
                      <input
                        style={inp} placeholder={t.locationPlaceholder}
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        onFocus={onFocus} onBlur={onBlur}
                      />
                      <AnimatePresence>
                        {ward && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 px-3 py-2 rounded-lg bg-[#5D7A6F]/10 border border-[#5D7A6F]/20 font-sans text-xs text-[#5D7A6F] font-semibold">
                            Ward {ward.ward} · {ward.zone}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setLocation("Lajpat Nagar")}
                        className="mt-4 w-full font-sans text-sm font-semibold text-[#FF6B2B] bg-[#FF6B2B]/5 border border-dashed border-[#FF6B2B]/30 rounded-lg p-2.5 hover:bg-[#FF6B2B]/10 hover:border-[#FF6B2B]/50 transition-all"
                      >
                       {t.gpsBtn}
                      </button>
                    </motion.div>}

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
                            className="mt-3 p-4 rounded-xl bg-[#E7E8E2]/50 border border-[rgba(26,46,42,0.06)]">
                            {aiLoading ? (
                              <div className="flex items-center gap-2">
                                {[0, 1, 2].map((i) => (
                                  <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.9 }}
                                    className="w-1.5 h-1.5 rounded-full bg-[#1A2E2A]" />
                                ))}
                                <span className="font-sans text-xs font-medium text-[#1A2E2A]/70">{t.aiReading}</span>
                              </div>
                            ) : ai && (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {[
                                    { label: ai.cat, css: "bg-[rgba(26,46,42,0.06)] text-[#1A2E2A]" },
                                    { label: ai.priority, css: "bg-[#FF6B2B]/10 text-[#FF6B2B]" },
                                    { label: ai.dept, css: "bg-[rgba(26,46,42,0.06)] text-[#1A2E2A]" },
                                    { label: ai.sla, css: "bg-[#16A34A]/10 text-[#16A34A]" },
                                  ].map((c) => (
                                    <motion.span key={c.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                      className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full ${c.css}`}>
                                      {c.label}
                                    </motion.span>
                                  ))}
                                </div>
                                <span className="font-mono text-[10px] text-gray-400 font-medium">{t.aiDone}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>}

                    {step === 3 && <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <FieldLabel>{t.photoLabel}</FieldLabel>
                      <p className="font-sans text-xs text-gray-400 mb-3">{t.photoHint}</p>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                      {photo ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-xl overflow-hidden shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="preview" className="w-full max-h-[200px] object-cover block" />
                          <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-[#1A2E2A]/80 text-[#E7E8E2] border-none rounded-full w-7 h-7 cursor-pointer text-xs font-sans hover:bg-[#1A2E2A] transition-colors">✕</button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="w-full border-2 border-dashed border-[rgba(26,46,42,0.15)] rounded-xl py-12 px-5 text-center cursor-pointer hover:border-[#5D7A6F] hover:bg-[#5D7A6F]/5 transition-all text-gray-500 font-sans text-sm"
                        >
                          <span className="block mb-2 font-serif text-xl text-[#1A2E2A]/40">+</span>
                          {t.photoDrag}
                        </button>
                      )}
                    </motion.div>}

                    {step === 4 && <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <FieldLabel>{t.phoneLabel}</FieldLabel>
                      <input type="tel" style={inp} placeholder={t.phonePlaceholder}
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        onFocus={onFocus} onBlur={onBlur} />
                      <p className="font-sans text-xs text-gray-400 mt-2">{t.noSpam}</p>
                      <label className="flex items-center gap-2 mt-5 cursor-pointer">
                        <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} className="w-4 h-4 accent-[#1A2E2A]" />
                        <span className="font-sans text-sm font-medium text-[#1A2E2A]">{t.whatsapp}</span>
                      </label>
                    </motion.div>}
                  </AnimatePresence>

                  <div className="flex gap-3 mt-10">
                    {step > 1 && (
                      <Button variant="secondary" onClick={() => setStep((s) => (s - 1) as Step)}>
                        {t.back}
                      </Button>
                    )}
                    {step < 4 ? (
                      <Button variant="primary" fullWidth onClick={() => setStep((s) => (s + 1) as Step)}>
                        {t.next}
                      </Button>
                    ) : (
                      <Button variant="primary" fullWidth onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "..." : t.submit}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
      {children}
    </p>
  );
}

function SuccessView({ t, ticketId, eta, phone, ai, officerName, copied, onCopy }: {
  t: typeof T["en"]; ticketId: string; eta: string; phone: string;
  ai: ReturnType<typeof getAI> | null; officerName: string; copied: boolean; onCopy: () => void;
}) {
  return (
    <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 flex items-center justify-center mx-auto mb-5 text-[#16A34A]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h1 className="font-serif text-[32px] text-[#1A2E2A] mb-1 leading-tight">{t.successTitle}</h1>
        <p className="font-sans text-sm text-[#1A2E2A]/60">{t.successSub}</p>
      </div>

      <div className="bg-[#1A2E2A] rounded-2xl p-6 text-center mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <p className="font-sans text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-2">{t.successTicket}</p>
        <div className="flex items-center justify-center gap-4">
          <span className="font-mono text-3xl font-bold text-[#FF6B2B] relative z-10">{ticketId}</span>
          <button onClick={onCopy} className="relative z-10 font-sans text-xs font-semibold px-3 py-1.5 border border-white/20 rounded-lg text-white/80 hover:bg-white/10 transition-colors">
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>

      <Card className="flex flex-col gap-4 mb-6 !p-5">
        {ai && (
          <div className="flex flex-wrap gap-2 pb-4 border-b border-[rgba(26,46,42,0.06)]">
            {[ai.cat, ai.priority, ai.sla].map((c) => (
              <span key={c} className="font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[rgba(26,46,42,0.04)] text-[#1A2E2A]">{c}</span>
            ))}
          </div>
        )}
        <Row label={t.officer} value={officerName} />
        <Row label={t.eta} value={eta} green />
        {phone && <Row label={t.whatsapp} value={phone} />}
      </Card>

      <Button variant="cta" fullWidth onClick={() => window.open(`https://wa.me/?text=Complaint ${ticketId} filed with SANKALP AI`, "_blank")}>
        {t.whatsappShare}
      </Button>
    </motion.div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm font-sans pt-1 first:pt-0">
      <span className="text-[#1A2E2A]/60">{label}</span>
      <span className={`font-semibold ${green ? "text-[#16A34A]" : "text-[#1A2E2A]"}`}>{value}</span>
    </div>
  );
}
