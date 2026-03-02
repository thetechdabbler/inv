/**
 * Integration test for bolt 009: POST /api/v1/auth/logout.
 */
import { describe, expect, it } from "vitest";
import { POST as POST_LOGOUT } from "@/app/api/v1/auth/logout/route";

describe("POST /api/v1/auth/logout", () => {
  it("should return 200 and ok true", async () => {
    const res = await POST_LOGOUT(
      new Request("http://localhost/api/v1/auth/logout", { method: "POST" }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean };
    expect(data.ok).toBe(true);
  });
});
