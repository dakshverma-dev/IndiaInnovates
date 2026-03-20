import React from "react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, className = "" }) => {
  return (
    <Card className={`flex flex-col justify-center ${className}`}>
      <p className="text-[13px] font-sans text-gray-500 mb-1">{label}</p>
      <div className="font-serif text-[28px] text-[#1A2E2A] leading-tight flex items-baseline gap-2">
        {value}
        {subtitle && <span className="text-sm font-sans text-gray-400 font-normal">{subtitle}</span>}
      </div>
    </Card>
  );
};
