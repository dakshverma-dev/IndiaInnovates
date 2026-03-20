import React, { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`bg-white border rounded-[16px] p-6 shadow-sm ${className}`}
        style={{ borderColor: "rgba(26,46,42,0.08)" }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
