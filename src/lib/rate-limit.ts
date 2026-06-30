import { getDb } from "@/lib/mongodb";

interface RateLimitConfig {
  limit: number;      // Maximum number of requests allowed within the window
  windowMs: number;   // Window size in milliseconds
}

/**
 * MongoDB-backed distributed rate limiter for production (serverless safe).
 * Tracks requests by identifier (e.g. IP address or User ID).
 * 
 * @param identifier Unique key to rate limit (IP or User ID)
 * @param config RateLimitConfig
 * @returns Object indicating if the request is allowed and remaining requests
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 60, windowMs: 60000 } // Default: 60 requests per minute
) {
  try {
    const db = await getDb();
    const collection = db.collection("rateLimits");
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove expired entries for this identifier
    await collection.deleteMany({
      identifier,
      timestamp: { $lt: windowStart },
    });

    // Count recent requests
    const requestCount = await collection.countDocuments({
      identifier,
      timestamp: { $gte: windowStart },
    });

    if (requestCount >= config.limit) {
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        resetTime: new Date(now + config.windowMs),
      };
    }

    // Log the current request
    await collection.insertOne({
      identifier,
      timestamp: now,
      createdAt: new Date(), // For TTL index cleanup
    });

    // Ensure TTL index exists so old rate limit logs are automatically pruned by MongoDB
    try {
      await collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: Math.ceil(config.windowMs / 1000) }
      );
    } catch {
      // Index already exists, ignore
    }

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - requestCount - 1,
      resetTime: new Date(now + config.windowMs),
    };
  } catch (error) {
    console.error("Rate limiting error, bypassing for reliability:", error);
    // In case of DB failure, fail-open in production so the site remains accessible
    return {
      success: true,
      limit: config.limit,
      remaining: 1,
      resetTime: new Date(),
    };
  }
}
