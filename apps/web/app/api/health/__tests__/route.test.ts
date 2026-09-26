import { describe, it, expect, vi, beforeEach } from "vitest";

const queryRawMock = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRawMock(...args),
  },
}));

import { GET } from "../route";

describe("GET /api/health", () => {
  beforeEach(() => {
    queryRawMock.mockReset();
  });

  it("returns 200 with { status: 'ok' } when the database check succeeds", async () => {
    queryRawMock.mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("returns 503 with { status: 'error' } when the database check fails", async () => {
    queryRawMock.mockRejectedValueOnce(new Error("connection refused"));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "error" });
  });
});
