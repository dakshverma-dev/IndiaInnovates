import { config } from "../config";
import { SlaJobData, processEscalation } from "./slaWorker";

export const SLA_MS: Record<string, number> = {
  P1: 4 * 3600 * 1000,
  P2: 24 * 3600 * 1000,
  P3: 72 * 3600 * 1000,
  P4: 7 * 24 * 3600 * 1000,
};

// Use short delays in dev/demo mode so you can see escalation trigger quickly
// Set DEMO_SLA=true to use 30-second SLA for testing
const DEMO_DELAYS: Record<string, number> = {
  P1: 30 * 1000,
  P2: 60 * 1000,
  P3: 120 * 1000,
  P4: 180 * 1000,
};

const useDemoDelays = process.env.DEMO_SLA === "true";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let slaQueue: any = null;

export async function initSlaQueue(): Promise<void> {
  if (!config.redisUrl) {
    console.log("[SLA] Redis not configured — using in-memory setTimeout fallback");
    return;
  }
  try {
    const Bull = (await import("bull")).default;
    slaQueue = new Bull("sla-escalation", config.redisUrl);
    slaQueue.process(async (job: { data: SlaJobData }) => {
      await processEscalation(job.data);
    });
    console.log("[SLA] Bull queue initialized with Redis");
  } catch (err) {
    console.warn("[SLA] Bull init failed, falling back to setTimeout:", (err as Error).message);
    slaQueue = null;
  }
}

export async function scheduleEscalation(data: SlaJobData): Promise<void> {
  const delay = useDemoDelays
    ? (DEMO_DELAYS[data.priority] ?? DEMO_DELAYS.P3)
    : (SLA_MS[data.priority] ?? SLA_MS.P3);

  if (slaQueue) {
    await slaQueue.add(data, {
      delay,
      jobId: data.ticketId,
      removeOnComplete: true,
      removeOnFail: true,
    });
  } else {
    // In-memory fallback
    setTimeout(() => processEscalation(data), delay);
  }
}
