import { LRUCache } from "lru-cache";
import { NextRequest } from "next/server";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }
        
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        if (isRateLimited) {
          reject();
        } else {
          resolve();
        }
      }),
  };
}

// Default exported limiters for common actions
export const loginLimiter = rateLimit({ interval: 15 * 60 * 1000 }); // 15 mins
export const signupLimiter = rateLimit({ interval: 60 * 60 * 1000 }); // 1 hour
export const apiLimiter = rateLimit({ interval: 60 * 1000 }); // 1 minute

export function getIP(request: NextRequest): string {
  // Try to get IP from headers in serverless environment
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback
  return "127.0.0.1";
}
