import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface TicketCardProps {
  ticket: {
    id: string;
    category: string;
    priority: "P1" | "P2" | "P3" | "P4";
    ward_name?: string;
    status: string;
    message: string;
  };
  onResolve?: (id: string) => void;
  onClick?: () => void;
  isExpanded?: boolean;
  children?: React.ReactNode;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onResolve, onClick, isExpanded, children }) => {
  const priorityColors = {
    P1: "#FF6B2B",
    P2: "#5D7A6F",
    P3: "#9CA3AF",
    P4: "#D1D5DB"
  };
  
  const pColor = priorityColors[ticket.priority] || priorityColors.P4;

  return (
    <Card 
      className={`relative cursor-pointer hover:border-[#5D7A6F]/30 transition-colors py-4 px-5 ${isExpanded ? 'border-[#5D7A6F]' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pColor }} />
          <Badge variant="default">{ticket.category}</Badge>
          <span className="text-xs font-mono text-gray-400">#{ticket.id.slice(0,8)}</span>
        </div>
        
        <div>
          {ticket.status === "resolved" ? (
            <div className="flex items-center gap-1 text-[#16A34A] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Resolved
            </div>
          ) : (
            onResolve && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onResolve(ticket.id); }}
              >
                Resolve
              </Button>
            )
          )}
        </div>
      </div>
      
      <p className="text-[#1A2E2A] font-sans text-[15px] leading-relaxed line-clamp-2 mb-3">
        {ticket.message}
      </p>
      
      <div className="flex items-center gap-1.5 text-sm text-gray-500 font-sans">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {ticket.ward_name || "Unknown Ward"}
      </div>
      
      {isExpanded && children && (
        <div className="mt-4 pt-4 border-t border-gray-100 cursor-default" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </Card>
  );
};
