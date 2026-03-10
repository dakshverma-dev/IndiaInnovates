"use client";

import { motion } from "framer-motion";

const team = [
  { name: "Daksh", role: "Full-Stack Developer & AI Lead", college: "Delhi Technological University", initials: "DV" },
  { name: "Kartik", role: "Backend & Infrastructure", college: "Delhi Technological University", initials: "KS" },
  { name: "Yash", role: "Frontend & Design", college: "Delhi Technological University", initials: "YG" },
  { name: "Aparna", role: "AI/ML & Data Science", college: "Delhi Technological University", initials: "AS" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function TeamSection() {
  return (
    <section id="team" className="py-24 lg:py-32 relative overflow-hidden" style={{ background: '#0F2D5E' }}>
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-[#FF6B2B] rounded-full blur-[120px] opacity-[0.05]" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-white rounded-full blur-[140px] opacity-[0.03]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="text-center mb-16"
        >
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 48px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}>
            The Team Behind{" "}
            <span style={{ color: '#FF6B2B' }}>SANKALP AI</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                padding: '32px 24px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ y: -4, borderColor: 'rgba(255,107,43,0.3)' }}
            >
              <div
                className="mx-auto mb-5 flex items-center justify-center"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8A50 100%)',
                }}
              >
                <span style={{ fontFamily: "'Sora'", fontSize: '22px', fontWeight: 700, color: 'white' }}>
                  {member.initials}
                </span>
              </div>

              <h3 style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: '18px', color: '#FFFFFF', marginBottom: '4px' }}>
                {member.name}
              </h3>
              <p style={{ fontFamily: "'DM Sans'", fontSize: '13px', fontWeight: 500, color: '#FF6B2B', marginBottom: '8px' }}>
                {member.role}
              </p>
              <p style={{ fontFamily: "'DM Sans'", fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                {member.college}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
