import { jwtVerify, SignJWT } from "jose";
import crypto from "node:crypto";

const key = crypto
  .createHash("sha256")
  .update(process.env.KEYKEY_MASTER_SECRET || "dev-secret")
  .digest();

// Cost guardrails configuration
const COST_LIMITS = {
  DAILY_OPENAI_REQUESTS: parseInt(process.env.KEYKEY_DAILY_OPENAI_LIMIT || "1000"),
  MONTHLY_COST_LIMIT_USD: parseFloat(process.env.KEYKEY_MONTHLY_COST_LIMIT || "500.00"),
  MAX_TOKENS_PER_REQUEST: parseInt(process.env.KEYKEY_MAX_TOKENS || "4000")
};

// In-memory usage tracking (in production, this would use Redis or database)
interface UsageTracker {
  dailyRequests: number;
  monthlyCostUSD: number;
  lastResetDate: string;
  lastMonthlyReset: string;
}

let usageTracker: UsageTracker = {
  dailyRequests: 0,
  monthlyCostUSD: 0,
  lastResetDate: new Date().toDateString(),
  lastMonthlyReset: new Date().toISOString().substring(0, 7) // YYYY-MM
};

export async function mintDalJwt() {
  // Check cost guardrails before minting JWT
  await checkCostLimits();
  
  return await new SignJWT({ 
    aud: "dal",
    cost_limits: COST_LIMITS,
    usage_remaining: {
      daily_requests: COST_LIMITS.DAILY_OPENAI_REQUESTS - usageTracker.dailyRequests,
      monthly_budget: COST_LIMITS.MONTHLY_COST_LIMIT_USD - usageTracker.monthlyCostUSD
    }
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("60m")
    .sign(key);
}

export async function verifyDalJwt(token: string) {
  await jwtVerify(token, key, { audience: "dal" });
}

async function checkCostLimits() {
  const today = new Date().toDateString();
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  // Reset daily counter if new day
  if (usageTracker.lastResetDate !== today) {
    usageTracker.dailyRequests = 0;
    usageTracker.lastResetDate = today;
  }
  
  // Reset monthly counter if new month
  if (usageTracker.lastMonthlyReset !== currentMonth) {
    usageTracker.monthlyCostUSD = 0;
    usageTracker.lastMonthlyReset = currentMonth;
  }
  
  // Check daily request limit
  if (usageTracker.dailyRequests >= COST_LIMITS.DAILY_OPENAI_REQUESTS) {
    throw new Error(`Daily OpenAI request limit exceeded (${COST_LIMITS.DAILY_OPENAI_REQUESTS} requests). Try again tomorrow.`);
  }
  
  // Check monthly cost limit
  if (usageTracker.monthlyCostUSD >= COST_LIMITS.MONTHLY_COST_LIMIT_USD) {
    throw new Error(`Monthly cost limit exceeded ($${COST_LIMITS.MONTHLY_COST_LIMIT_USD}). Contact admin to increase limit.`);
  }
}

export async function trackOpenAIUsage(requestCount: number = 1, estimatedCostUSD: number = 0.01) {
  usageTracker.dailyRequests += requestCount;
  usageTracker.monthlyCostUSD += estimatedCostUSD;
  
  console.log(`OpenAI usage tracked: +${requestCount} requests, +$${estimatedCostUSD.toFixed(4)} cost`);
  console.log(`Current usage: ${usageTracker.dailyRequests}/${COST_LIMITS.DAILY_OPENAI_REQUESTS} daily requests, $${usageTracker.monthlyCostUSD.toFixed(2)}/$${COST_LIMITS.MONTHLY_COST_LIMIT_USD} monthly cost`);
}

export function getUsageStats() {
  return {
    current: usageTracker,
    limits: COST_LIMITS,
    percentages: {
      dailyUsage: (usageTracker.dailyRequests / COST_LIMITS.DAILY_OPENAI_REQUESTS) * 100,
      monthlyBudget: (usageTracker.monthlyCostUSD / COST_LIMITS.MONTHLY_COST_LIMIT_USD) * 100
    }
  };
}