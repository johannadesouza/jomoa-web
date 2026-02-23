/**
 * Workout log service – finish-lock and completion logic
 * Mocks Supabase to test createWorkoutLogWithSets / createWorkoutLog behavior
 */

jest.mock("../../../config/supabase", () => {
  const ms = jest.fn();
  const ins = jest.fn();
  const insSet = jest.fn();
  (global as { __workoutLogMocks?: { maybeSingle: typeof ms; insertSession: typeof ins; insertSetLogs: typeof insSet } }).__workoutLogMocks = {
    maybeSingle: ms,
    insertSession: ins,
    insertSetLogs: insSet,
  };
  const mockFrom = (table: string) => {
    if (table === "set_logs") {
      return { insert: insSet };
    }
    const chain: Record<string, unknown> = {};
    ["select", "eq", "gte", "lte", "order", "limit"].forEach((m) => {
      chain[m] = jest.fn().mockReturnValue(chain);
    });
    chain["maybeSingle"] = ms;
    chain["insert"] = jest.fn().mockImplementation((data: unknown) => {
      if (Array.isArray(data)) return insSet(data);
      return ins(data);
    });
    return chain;
  };
  return { supabase: { from: mockFrom } };
});

import {
  createWorkoutLogWithSets,
  createWorkoutLog,
  type SetLogInput,
  type CompletedSet,
} from "../workoutLogService";

const mocks = (global as { __workoutLogMocks?: { maybeSingle: jest.Mock; insertSession: jest.Mock; insertSetLogs: jest.Mock } }).__workoutLogMocks!;

describe("workout log service – finish-lock and completion", () => {
  const clientId = "client-1";
  const sessionId = "session-1";
  const setLogs: SetLogInput[] = [
    { exerciseId: "ex-1", setNumber: 1, reps: 10, weight: 60, rpe: 7 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.insertSetLogs.mockResolvedValue({ error: null });
    mocks.insertSession.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: "log-1" },
          error: null,
        }),
      }),
    });
  });

  describe("createWorkoutLogWithSets – finish-lock", () => {
    it("returns error when session already completed today (finish-lock)", async () => {
      mocks.maybeSingle.mockResolvedValueOnce({
        data: { id: "existing-log" },
        error: null,
      });

      const result = await createWorkoutLogWithSets(
        clientId,
        sessionId,
        setLogs,
        null
      );

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain("redan genomfört idag");
      expect(mocks.insertSession).not.toHaveBeenCalled();
    });

    it("succeeds when no existing completion today", async () => {
      mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await createWorkoutLogWithSets(
        clientId,
        sessionId,
        setLogs,
        7
      );

      expect(result.error).toBeNull();
      expect(result.workoutLogId).toBe("log-1");
      expect(mocks.insertSession).toHaveBeenCalled();
    });
  });

  describe("createWorkoutLog – finish-lock", () => {
    it("returns error when session already completed today", async () => {
      mocks.maybeSingle.mockResolvedValueOnce({
        data: { id: "existing" },
        error: null,
      });

      const completedSets: CompletedSet[] = [{ exerciseId: "ex-1", count: 3 }];

      const result = await createWorkoutLog(clientId, sessionId, completedSets);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain("redan genomfört idag");
    });
  });
});
