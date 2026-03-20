"use client";

import React, { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta";
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-sans tracking-wide transition-all duration-300 rounded-full outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: "bg-[#1A2E2A] text-[#E7E8E2] hover:bg-[#25423c] focus:ring-[#1A2E2A]",
      secondary: "bg-transparent text-[#1A2E2A] border-2 border-[#5D7A6F] hover:bg-[#5D7A6F] hover:text-[#E7E8E2] focus:ring-[#5D7A6F]",
      cta: "bg-[#FF6B2B] text-white hover:bg-[#e55b20] focus:ring-[#FF6B2B]"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base font-medium"
    };

    const classes = [
      base,
      variants[variant],
      sizes[size],
      fullWidth ? "w-full" : "",
      props.disabled ? "opacity-50 cursor-not-allowed" : "",
      className
    ].filter(Boolean).join(" ");

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
