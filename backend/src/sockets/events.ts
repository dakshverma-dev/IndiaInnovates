import { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export function setIo(server: SocketServer): void {
  io = server;
}

export function emitNewTicket(ticket: object): void {
  io?.emit("new_ticket", ticket);
}

export function emitTicketUpdated(ticket: object): void {
  io?.emit("ticket_updated", ticket);
}

export function emitHealthScoreUpdated(wardId: number, score: number): void {
  io?.emit("health_score_updated", { wardId, score });
}

export function emitSlaAlert(ticketId: string, priority: string, reason: string): void {
  io?.emit("sla_alert", {
    ticketId,
    priority,
    reason,
    timestamp: new Date().toISOString(),
  });
}
