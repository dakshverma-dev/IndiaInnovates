import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import path from "path";
import { config, useInMemory } from "./config";
import { setIo } from "./sockets/events";
import { initSlaQueue } from "./queues/slaQueue";

// Routes
import authRouter from "./routes/auth";
import complaintsRouter from "./routes/complaints";
import ticketsRouter from "./routes/tickets";
import wardsRouter from "./routes/wards";
import predictionsRouter from "./routes/predictions";
import auditRouter from "./routes/audit";
import adminRouter from "./routes/admin";

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────

const io = new SocketServer(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
setIo(io);

io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use(authRouter);
app.use(complaintsRouter);
app.use(ticketsRouter);
app.use(wardsRouter);
app.use(predictionsRouter);
app.use(auditRouter);
app.use(adminRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    database: useInMemory ? "in-memory" : "postgresql",
    gemini: config.geminiApiKey ? "live" : "local-classifier",
    queue: config.redisUrl ? "bull/redis" : "in-memory-timeout",
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction
  ) => {
    console.error("[Error]", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
);

// ─── Boot ─────────────────────────────────────────────────────────────────────

(async () => {
  await initSlaQueue();

  httpServer.listen(config.port, () => {
    console.log("");
    console.log("╔═══════════════════════════════════════════╗");
    console.log("║        SANKALP AI Backend  v1.0           ║");
    console.log(`║  Port     : ${config.port}                           ║`);
    console.log(`║  Database : ${useInMemory ? "IN-MEMORY (no PostgreSQL)  " : "PostgreSQL                 "}║`);
    console.log(`║  Gemini   : ${config.geminiApiKey ? "LIVE API KEY               " : "LOCAL CLASSIFIER FALLBACK  "}║`);
    console.log(`║  Queue    : ${config.redisUrl ? "Bull / Redis               " : "setTimeout fallback        "}║`);
    console.log("╚═══════════════════════════════════════════╝");
    console.log("");
    console.log(`  API     → http://localhost:${config.port}/api/complaints`);
    console.log(`  Health  → http://localhost:${config.port}/health`);
    console.log(`  WebSocket ready for dashboard on port ${config.port}`);
    console.log("");
  });
})();
