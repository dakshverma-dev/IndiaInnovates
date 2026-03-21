import React, { ReactNode } from "react";
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function PageLayout({ children, showFooter = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#E7E8E2] text-[#1A2E2A] flex flex-col font-sans selection:bg-[#5D7A6F]/30">
      <Navbar />
      <main className="flex-1" style={{ paddingTop: '100px' }}>
        {children}
      </main>
      {showFooter && (
        <footer className="py-8 text-center text-sm text-[#1A2E2A]/50 border-t border-[#1A2E2A]/5">
          © {new Date().getFullYear()} SANKALP AI. India Innovates.
        </footer>
      )}
    </div>
  );
}
