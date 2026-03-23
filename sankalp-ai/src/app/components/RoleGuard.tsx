"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth, User } from "./AuthProvider";
import { motion } from "framer-motion";

interface RoleGuardProps {
  allowedRoles: User["role"][];
  children: React.ReactNode;
}

function getHomePath(role?: User["role"]) {
  switch (role) {
    case "admin": return "/dashboard";
    case "field_officer": return "/officer";
    case "citizen": return "/complaint";
    default: return "/";
  }
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F0", padding: "24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: "center", maxWidth: "400px",
            background: "white", borderRadius: "20px",
            border: "1.5px solid rgba(26,46,42,0.07)",
            padding: "48px 36px",
          }}
        >
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px" }}>
            🔒
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#1A2E2A", marginBottom: "8px", lineHeight: 1.1 }}>
            Sign in required
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)", marginBottom: "28px", lineHeight: 1.6 }}>
            You need to be logged in to access this page.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
              color: "#E7E8E2", background: "#1A2E2A", border: "none",
              padding: "12px 32px", borderRadius: "100px", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            Go to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F0", padding: "24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: "center", maxWidth: "420px",
            background: "white", borderRadius: "20px",
            border: "1.5px solid rgba(26,46,42,0.07)",
            padding: "48px 36px",
          }}
        >
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px" }}>
            🚫
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#1A2E2A", marginBottom: "8px", lineHeight: 1.1 }}>
            Access Denied
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(26,46,42,0.5)", marginBottom: "8px", lineHeight: 1.6 }}>
            You don&apos;t have permission to view this page.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(26,46,42,0.35)", marginBottom: "28px" }}>
            Signed in as <span style={{ fontWeight: 600, color: "#1A2E2A" }}>{user.name}</span>
            {" · "}
            <span style={{ fontWeight: 600, color: "#FF6B2B", textTransform: "capitalize" }}>{user.role.replace("_", " ")}</span>
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push(getHomePath(user.role))}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
                color: "#E7E8E2", background: "#1A2E2A", border: "none",
                padding: "12px 28px", borderRadius: "100px", cursor: "pointer",
              }}
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => router.back()}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
                color: "#1A2E2A", background: "transparent",
                border: "1.5px solid rgba(26,46,42,0.2)",
                padding: "12px 28px", borderRadius: "100px", cursor: "pointer",
              }}
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
