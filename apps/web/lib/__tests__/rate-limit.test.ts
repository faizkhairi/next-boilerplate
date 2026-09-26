import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { checkRateLimit, rateLimitResponse, RateLimitPresets } from "../rate-limit";

function requestFromIp(ip: string): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("checkRateLimit", () => {
  const config = { maxRequests: 3, windowMs: 1000 };

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request from a fresh IP", () => {
    const result = checkRateLimit(requestFromIp("10.0.0.1"), config);

    expect(result.success).toBe(true);
    expect(result.limit).toBe(3);
    expect(result.remaining).toBe(2);
  });

  it("allows requests up to the configured limit", () => {
    const ip = "10.0.0.2";

    expect(checkRateLimit(requestFromIp(ip), config).success).toBe(true);
    expect(checkRateLimit(requestFromIp(ip), config).success).toBe(true);
    expect(checkRateLimit(requestFromIp(ip), config).success).toBe(true);
  });

  it("blocks requests once the limit is exceeded", () => {
    const ip = "10.0.0.3";

    checkRateLimit(requestFromIp(ip), config);
    checkRateLimit(requestFromIp(ip), config);
    checkRateLimit(requestFromIp(ip), config);
    const blocked = checkRateLimit(requestFromIp(ip), config);

    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks separate IPs independently", () => {
    const ipA = "10.0.0.4";
    const ipB = "10.0.0.5";

    checkRateLimit(requestFromIp(ipA), config);
    checkRateLimit(requestFromIp(ipA), config);
    checkRateLimit(requestFromIp(ipA), config);
    const blockedA = checkRateLimit(requestFromIp(ipA), config);
    const firstB = checkRateLimit(requestFromIp(ipB), config);

    expect(blockedA.success).toBe(false);
    expect(firstB.success).toBe(true);
  });

  it("resets the window once it elapses", () => {
    vi.useFakeTimers();
    const ip = "10.0.0.6";

    checkRateLimit(requestFromIp(ip), config);
    checkRateLimit(requestFromIp(ip), config);
    checkRateLimit(requestFromIp(ip), config);
    expect(checkRateLimit(requestFromIp(ip), config).success).toBe(false);

    vi.advanceTimersByTime(config.windowMs + 1);

    expect(checkRateLimit(requestFromIp(ip), config).success).toBe(true);
  });

  it("falls back to 'unknown' when no IP header is present", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = checkRateLimit(request, config);

    expect(result.success).toBe(true);
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 with Retry-After and rate limit headers", async () => {
    const now = Date.now();
    const response = rateLimitResponse(
      {
        success: false,
        limit: RateLimitPresets.auth.maxRequests,
        remaining: 0,
        reset: now + 30_000,
      },
      "Too many attempts"
    );

    expect(response.status).toBe(429);

    const retryAfter = Number(response.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
    expect(response.headers.get("X-RateLimit-Limit")).toBe(
      RateLimitPresets.auth.maxRequests.toString()
    );
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

    const body = await response.json();
    expect(body).toEqual({ error: "Too many attempts" });
  });

  it("uses a default message when none is provided", async () => {
    const response = rateLimitResponse({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 1000,
    });

    const body = await response.json();
    expect(body.error).toMatch(/too many requests/i);
  });
});
