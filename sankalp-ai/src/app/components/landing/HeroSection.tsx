"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const phrases = ["Finally resolved.", "Finally tracked.", "Finally verified.", "Finally prevented."];

export default function HeroSection() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = phrases[phraseIndex];
    if (!deleting) {
      if (text.length < current.length) {
        setText(current.slice(0, text.length + 1));
      } else {
        setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (text.length > 0) {
        setText(current.slice(0, text.length - 1));
      } else {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }
    }
  }, [text, deleting, phraseIndex]);

  useEffect(() => {
    const id = setTimeout(tick, deleting ? 35 : 70);
    return () => clearTimeout(id);
  }, [tick, deleting]);

  return (
    <section
      className="hero-gradient"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "80px",
        paddingBottom: "40px",
        position: "relative",
        overflow: "hidden",
      }}
    >


      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >


        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(48px, 6.5vw, 78px)",
            fontWeight: 400,
            lineHeight: 1.06,
            letterSpacing: "-0.01em",
            color: "#1A2E2A",
            marginBottom: "4px",
          }}
        >
          Delhi&apos;s complaints.
        </motion.h1>

        {/* Typewriter line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ marginBottom: "32px" }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(48px, 6.5vw, 78px)",
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: "-0.01em",
              color: "#5D7A6F",
            }}
          >
            {text}
          </span>
          <span
            className="cursor-blink"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(48px, 6.5vw, 78px)",
              fontWeight: 300,
              color: "#5D7A6F",
              marginLeft: "2px",
            }}
          >
            |
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(15px, 2.5vw, 18px)",
            fontWeight: 400,
            color: "rgba(26, 46, 42, 0.5)",
            lineHeight: 1.7,
            maxWidth: "500px",
            margin: "0 auto 40px",
          }}
        >
          The AI intelligence layer that makes MCD&apos;s existing systems
          actually work — for 20 million citizens, 272 wards.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
          className="hero-ctas"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(10,10,10,0.15)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = "/demo"}
            style={{
              fontFamily: "'DM Sans'",
              fontSize: "15px",
              fontWeight: 600,
              color: "#FFFFFF",
              background: "#1A2E2A",
              border: "none",
              padding: "14px 32px",
              borderRadius: "100px",
              cursor: "pointer",
              flex: "var(--cta-flex, none)",
              minWidth: "160px"
            }}
          >
            See Live Demo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, background: "rgba(0,0,0,0.04)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById("dataflow")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              fontFamily: "'DM Sans'",
              fontSize: "15px",
              fontWeight: 500,
              color: "#1A2E2A",
              background: "rgba(93, 122, 111, 0.05)",
              border: "1px solid rgba(93, 122, 111, 0.1)",
              padding: "14px 32px",
              borderRadius: "100px",
              cursor: "pointer",
              flex: "var(--cta-flex, none)",
              minWidth: "160px"
            }}
          >
            How It Works
          </motion.button>
        </motion.div>

        {/* Scroll label below */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          style={{
            marginTop: "72px",
            fontFamily: "'DM Sans'",
            fontSize: "11px",
            letterSpacing: "0.1em",
            fontWeight: 500,
            color: "rgba(26, 46, 42, 0.3)",
            textTransform: "uppercase",
          }}
        >
          Why civic AI matters
        </motion.p>
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .hero-ctas {
            flex-direction: column !important;
            --cta-flex: 1;
            width: 100%;
          }
          .hero-gradient {
            padding-top: 100px !important;
          }
        }
      `}</style>
    </section>
  );
}
