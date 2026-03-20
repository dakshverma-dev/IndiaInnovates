import React, { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning";
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", className = "", children, ...props }) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variants = {
    default: "text-[#1A2E2A] bg-[rgba(26,46,42,0.06)]",
    success: "text-white bg-[#16A34A]",
    warning: "text-white bg-[#FF6B2B]"
  };
  
  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
