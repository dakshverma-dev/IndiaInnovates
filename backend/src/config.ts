import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001"),
  jwtSecret: process.env.JWT_SECRET || "sankalp-dev-secret-not-for-prod",
  databaseUrl: process.env.DATABASE_URL || null,
  redisUrl: process.env.REDIS_URL || null,
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  corsOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8081",
    "http://localhost:19006",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],
};

export const useInMemory = !config.databaseUrl;
