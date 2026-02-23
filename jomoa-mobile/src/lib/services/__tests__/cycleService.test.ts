/**
 * Cycle Service – getLatestPeriodStart, savePeriodStart, getAllPeriodStarts
 * Mocks Supabase
 */

function createChain(
  endPromise: Promise<unknown>,
  opts?: { orderReturnsPromise?: boolean }
) {
  const chain: Record<string, unknown> = {};
  ["select", "eq", "limit", "gte", "lte"].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  chain["order"] = jest
    .fn()
    .mockReturnValue(opts?.orderReturnsPromise ? endPromise : chain);
  chain["maybeSingle"] = jest.fn().mockReturnValue(endPromise);
  chain["insert"] = jest.fn().mockReturnValue(endPromise);
  return chain;
}

let mockChain: ReturnType<typeof createChain>;

jest.mock("../../../config/supabase", () => ({
  supabase: {
    from: jest.fn(() => mockChain),
  },
}));

import {
  getLatestPeriodStart,
  savePeriodStart,
  getAllPeriodStarts,
} from "../cycleService";

describe("cycleService", () => {
  beforeEach(() => {
    mockChain = createChain(Promise.resolve({ data: null, error: null }));
  });

  describe("getLatestPeriodStart", () => {
    it("returns latest period start date", async () => {
      mockChain = createChain(
        Promise.resolve({ data: { date: "2025-02-01" }, error: null })
      );

      const result = await getLatestPeriodStart("client-1");

      expect(result.data).toBe("2025-02-01");
      expect(result.error).toBeNull();
    });

    it("returns null when no period found", async () => {
      mockChain = createChain(Promise.resolve({ data: null, error: null }));

      const result = await getLatestPeriodStart("client-1");

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("returns error on supabase failure", async () => {
      mockChain = createChain(
        Promise.resolve({
          data: null,
          error: { code: "SOME_ERROR", message: "DB error" },
        })
      );

      const result = await getLatestPeriodStart("client-1");

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe("savePeriodStart", () => {
    it("returns success when insert succeeds", async () => {
      mockChain = createChain(Promise.resolve({ error: null }));

      const result = await savePeriodStart("client-1", "2025-02-15");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("returns error when insert fails", async () => {
      mockChain = createChain(
        Promise.resolve({ error: { message: "Unique violation" } })
      );

      const result = await savePeriodStart("client-1", "2025-02-15");

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("getAllPeriodStarts", () => {
    it("returns array of date strings", async () => {
      mockChain = createChain(
        Promise.resolve({
          data: [{ date: "2025-02-01" }, { date: "2025-01-05" }],
          error: null,
        }),
        { orderReturnsPromise: true }
      );

      const result = await getAllPeriodStarts("client-1");

      expect(result).toEqual(["2025-02-01", "2025-01-05"]);
    });

    it("returns empty array on error", async () => {
      mockChain = createChain(
        Promise.resolve({ data: null, error: { message: "Connection failed" } }),
        { orderReturnsPromise: true }
      );

      const result = await getAllPeriodStarts("client-1");

      expect(result).toEqual([]);
    });
  });
});
