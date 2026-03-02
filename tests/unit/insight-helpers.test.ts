import { describe, expect, it } from "vitest";
import { toMessages } from "@/lib/insight-helpers";
import type { LLMInteraction } from "@/types/api";

function makeInteraction(
  overrides: Partial<LLMInteraction> & { id: string },
): LLMInteraction {
  return {
    insightType: "general",
    prompt: "Test question",
    response: "Test answer",
    modelUsed: "gpt-4o",
    tokensUsed: 100,
    success: true,
    errorMessage: null,
    createdAt: "2026-03-01T00:00:00Z",
    ...overrides,
  };
}

describe("toMessages", () => {
  it("converts a successful interaction into user + assistant messages", () => {
    const interactions = [
      makeInteraction({ id: "i1", prompt: "What is my balance?", response: "Your balance is 1L." }),
    ];
    const msgs = toMessages(interactions);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toEqual({
      id: "i1-q",
      role: "user",
      text: "What is my balance?",
    });
    expect(msgs[1]).toEqual({
      id: "i1-a",
      role: "assistant",
      text: "Your balance is 1L.",
      isError: false,
    });
  });

  it("marks failed interactions as errors with error message", () => {
    const interactions = [
      makeInteraction({
        id: "i2",
        success: false,
        response: "",
        errorMessage: "Token limit exceeded",
      }),
    ];
    const msgs = toMessages(interactions);
    expect(msgs[1].isError).toBe(true);
    expect(msgs[1].text).toBe("Error: Token limit exceeded");
  });

  it("shows 'Unknown error' when errorMessage is null on failure", () => {
    const interactions = [
      makeInteraction({
        id: "i3",
        success: false,
        response: "",
        errorMessage: null,
      }),
    ];
    const msgs = toMessages(interactions);
    expect(msgs[1].text).toBe("Error: Unknown error");
  });

  it("handles multiple interactions preserving order", () => {
    const interactions = [
      makeInteraction({ id: "a", prompt: "Q1", response: "A1" }),
      makeInteraction({ id: "b", prompt: "Q2", response: "A2" }),
    ];
    const msgs = toMessages(interactions);
    expect(msgs).toHaveLength(4);
    expect(msgs[0].text).toBe("Q1");
    expect(msgs[1].text).toBe("A1");
    expect(msgs[2].text).toBe("Q2");
    expect(msgs[3].text).toBe("A2");
  });

  it("returns empty array for empty input", () => {
    expect(toMessages([])).toEqual([]);
  });
});
