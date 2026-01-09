import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';

// In-memory store for rate limiting (in production, use Redis)
class MemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  increment(key: string): { count: number; resetTime: number } {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset or new entry
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    } else {
      // Increment existing
      existing.count++;
      this.store.set(key, existing);
      return { count: existing.count, resetTime: existing.resetTime };
    }
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const memoryStore = new MemoryStore();

// Clean up expired entries every 5 minutes
setInterval(() => memoryStore.cleanup(), 5 * 60 * 1000);

// Rate limiting configurations
export const createRateLimit = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100, // limit each IP to 100 requests per windowMs
  message: string = 'Too many requests from this IP, please try again later.'
) => {
  return (request: NextRequest): NextResponse | null => {
    // Get IP address from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = request.headers.get('x-client-ip');
    const ip = forwarded?.split(',')[0]?.trim() ||
               realIp ||
               clientIp ||
               'unknown';

    const key = `${ip}`;

    const { count, resetTime } = memoryStore.increment(key);

    if (count > max) {
      const resetIn = Math.ceil((resetTime - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: message,
          retryAfter: resetIn
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          }
        }
      );
    }

    return null; // No rate limit hit
  };
};

// Specific rate limiters for different endpoints
export const generalLimiter = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const authLimiter = createRateLimit(15 * 60 * 1000, 10); // 10 auth requests per 15 minutes
export const contentCreationLimiter = createRateLimit(60 * 60 * 1000, 50); // 50 posts/comments per hour
export const searchLimiter = createRateLimit(60 * 1000, 30); // 30 searches per minute

// Middleware function for API routes
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  limiter: (request: NextRequest) => NextResponse | null = generalLimiter
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const rateLimitResponse = limiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const response = await handler(request, ...args);

    // Add rate limit headers to successful responses
    if (response.status < 400) {
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const clientIp = request.headers.get('x-client-ip');
      const ip = forwarded?.split(',')[0]?.trim() ||
                 realIp ||
                 clientIp ||
                 'unknown';

      const key = `${ip}`;
      const { count, resetTime } = memoryStore.increment(key);

      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', (100 - count).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
    }

    return response;
  };
}