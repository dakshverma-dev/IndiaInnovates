"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_STEPS = [
  { sender: "user", text: "Meri gali mein nali band hai" },
  { sender: "bot", text: "Namaskar! Aapki shikayat darj ho gayi hai ✅\n\nTicket ID: DL-4821\nCategory: Safai (Sanitation)\nPriority: High (P2)\nExpected resolution: Kal shaam 5 baje tak." },
];

const LANGUAGES = [
  { name: "Hindi", flag: "🇮🇳" }, { name: "English", flag: "🇬🇧" }, 
  { name: "Punjabi", flag: "🌾" }, { name: "Urdu", flag: "☪️" }, 
  { name: "Bengali", flag: "🕉️" }, { name: "Marathi", flag: "🏜️" }, 
  { name: "Tamil", flag: "🛕" }, { name: "Telugu", flag: "🌅" }
];

export default function ChannelsPage() {
  const [waInput, setWaInput] = useState("");
  const [waMessages, setWaMessages] = useState(WHATSAPP_STEPS);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!waInput.trim()) return;
    const newMsg = { sender: "user", text: waInput };
    setWaMessages(prev => [...prev, newMsg]);
    setWaInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setWaMessages(prev => [...prev, { 
        sender: "bot", 
        text: "Ji, humne aapki shikayat sun li hai. Gemini AI ise classify kar raha hai... ✓" 
      }]);
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FDFCFB", color: "#0A0F1E", fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <header style={{ padding: "80px 24px 40px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Sora", fontSize: "40px", fontWeight: 700, margin: 0 }}>🌐 Any Citizen. Any Language. Zero Barriers.</h1>
        <p style={{ fontSize: "18px", color: "rgba(10,15,30,0.5)", marginTop: "12px", maxWidth: "800px", margin: "12px auto 0" }}>
          60% of Delhi's working population prefers Hindi. SANKALP AI reaches all of them via WhatsApp, Voice, and Kiosks.
        </p>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: "64px" }}>
        
        {/* THREE CHANNEL SHOWCASES */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
          
          {/* CHANNEL 1: WHATSAPP */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "Sora", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>WhatsApp Bot</h3>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>No app download required. Works on ₹1,500 smartphones.</p>
            </div>
            
            {/* Phone Mockup */}
            <div style={{ 
              width: "100%", maxWidth: "300px", height: "540px", background: "#000", borderRadius: "40px", 
              margin: "0 auto", padding: "10px", border: "8px solid #333", position: "relative",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}>
               <div style={{ width: "100%", height: "100%", background: "#E5DDD5", borderRadius: "30px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {/* WA Header */}
                  <div style={{ background: "#075E54", padding: "12px 16px", color: "#FFF", display: "flex", alignItems: "center", gap: "10px" }}>
                     <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#FFF", color: "#075E54", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700 }}>S</div>
                     <div>
                        <p style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>SANKALP AI Bot</p>
                        <p style={{ fontSize: "10px", margin: 0, opacity: 0.8 }}>Online</p>
                     </div>
                  </div>
                  {/* Messages Area */}
                  <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
                     {waMessages.map((msg, i) => (
                       <div key={i} style={{ 
                         alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                         background: msg.sender === "user" ? "#DCF8C6" : "#FFF",
                         padding: "8px 12px", borderRadius: "10px", maxWidth: "85%",
                         fontSize: "12px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                         whiteSpace: "pre-wrap"
                       }}>
                         {msg.text}
                       </div>
                     ))}
                     {isTyping && <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.3)", paddingLeft: "4px" }}>Typing...</div>}
                  </div>
                  {/* Input Area */}
                  <div style={{ background: "#F0F0F0", padding: "10px", display: "flex", gap: "8px" }}>
                     <input 
                       value={waInput} onChange={e => setWaInput(e.target.value)}
                       onKeyPress={e => e.key === "Enter" && handleSend()}
                       placeholder="Type in Hindi/English..."
                       style={{ flex: 1, border: "none", borderRadius: "100px", padding: "8px 16px", fontSize: "12px", outline: "none" }}
                     />
                     <button onClick={handleSend} style={{ background: "#075E54", color: "#FFF", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer" }}>↑</button>
                  </div>
               </div>
            </div>
          </div>

          {/* CHANNEL 2: VOICE IVR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "Sora", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Voice IVR</h3>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>Works on any phone. No internet required.</p>
            </div>
            
            <div style={{ 
              background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "32px", padding: "40px", flex: 1,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
            }}>
               <div style={{ textAlign: "center" }}>
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} 
                    style={{ fontSize: "64px", marginBottom: "20px" }}>📞</motion.div>
                  <p style={{ fontSize: "14px", color: "#666", maxWidth: "200px" }}>Listening to citizen call...</p>
               </div>
               
               <div style={{ width: "100%", background: "#F8F9FC", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "20px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 800, color: "rgba(0,0,0,0.3)", letterSpacing: "0.1em", marginBottom: "12px" }}>REAL-TIME TRANSCRIPTION</p>
                  <p style={{ fontSize: "15px", fontFamily: "Noto Sans Devanagari", fontWeight: 500, margin: 0 }}>
                    "नमस्ते, मेरे क्षेत्र में जलभराव की समस्या है। कृपया इसे जल्द से जल्द देखें।"
                  </p>
                  <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, background: "#818CF8", color: "#FFF", padding: "4px 10px", borderRadius: "100px" }}>Whisper AI</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, background: "#16A34A", color: "#FFF", padding: "4px 10px", borderRadius: "100px" }}>Hindi Detected</span>
                  </div>
               </div>
            </div>
          </div>

          {/* CHANNEL 3: QR KIOSK */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "Sora", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>QR Kiosk</h3>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>Available at all 272 ward offices.</p>
            </div>
            
            <div style={{ 
              background: "#1A2E2A", borderRadius: "32px", padding: "40px", flex: 1, border: "6px solid #111",
              display: "flex", flexDirection: "column", gap: "24px", color: "#FFF",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontFamily: "Sora", fontSize: "14px", fontWeight: 700, margin: 0 }}>SANKALP Civic Hub</h4>
                  <p style={{ fontSize: "10px", opacity: 0.5 }}>Vasant Kunj Office</p>
               </div>
               
               <p style={{ fontSize: "18px", fontWeight: 700 }}>Choose Language / भाषा चुनें</p>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {["हिंदी", "English", "ਪੰਜਾਬੀ", "اردو"].map(l => (
                    <button key={l} style={{ 
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: "12px", padding: "24px 10px", color: "#FFF", fontSize: "15px", fontWeight: 700, cursor: "pointer" 
                    }}>{l}</button>
                  ))}
               </div>
               
               <div style={{ padding: "20px", background: "rgba(255,107,43,0.1)", border: "1px dashed #FF6B2B", borderRadius: "16px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "#FF6B2B", fontWeight: 700, margin: 0 }}>"Tap to speak your complaint"</p>
               </div>
            </div>
          </div>
        </section>

        {/* UNIFIED BACKEND SECTION */}
        <section style={{ textAlign: "center", position: "relative" }}>
           <h3 style={{ fontFamily: "Sora", fontSize: "24px", fontWeight: 700, marginBottom: "32px" }}>One Unified Backend. Total Equity.</h3>
           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "100px", position: "relative" }}>
              <div style={{ display: "flex", gap: "24px" }}>
                 <ChannelIcon icon="📱" label="WA" />
                 <ChannelIcon icon="📞" label="Voice" />
                 <ChannelIcon icon="🖥️" label="Kiosk" />
                 <ChannelIcon icon="🌐" label="Web" />
              </div>
              
              <div style={{ width: "120px", height: "1px", background: "linear-gradient(to right, transparent, #FF6B2B, transparent)" }} />
              
              <div style={{ width: "160px", padding: "24px", background: "#0F2D5E", borderRadius: "24px", color: "#FFF", boxShadow: "0 10px 30px rgba(15,45,94,0.3)" }}>
                 <p style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "14px", margin: 0 }}>SANKALP AI CORE</p>
                 <p style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>One Triage Engine</p>
              </div>
           </div>
           <p style={{ fontSize: "14px", color: "rgba(0,0,0,0.4)", marginTop: "40px", maxWidth: "600px", margin: "40px auto 0" }}>
             Every complaint, regardless of channel, gets the same AI triage, same SLA, and same blockchain verification. No citizen left silent.
           </p>
        </section>

        {/* LANGUAGES */}
        <section style={{ textAlign: "center" }}>
           <h4 style={{ fontFamily: "Sora", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.3)", marginBottom: "24px" }}>Native Language Support via Whisper V3</h4>
           <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
             {LANGUAGES.map(l => (
               <span key={l.name} style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "100px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                 <span>{l.flag}</span> {l.name}
               </span>
             ))}
           </div>
        </section>

      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); borderRadius: 10px; }
      `}</style>
    </div>
  );
}

function ChannelIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
       <div style={{ width: "48px", height: "48px", background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>{icon}</div>
       <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>{label}</p>
    </div>
  );
}
