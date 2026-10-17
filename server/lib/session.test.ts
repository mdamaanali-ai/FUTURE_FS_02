import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "./session.js";

const secret = "a-test-secret-that-is-at-least-32-characters-long";

describe("session tokens", () => {
  it("round-trips the unionId", async () => {
    const token = await signSessionToken({ unionId: "admin:a@b.com" }, secret);
    expect(await verifySessionToken(token, secret)).toEqual({
      unionId: "admin:a@b.com",
    });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken({ unionId: "admin:a@b.com" }, secret);
    const other = "another-test-secret-that-is-also-32-chars-or-more";
    expect(await verifySessionToken(token, other)).toBeNull();
  });

  it("rejects garbage and empty tokens", async () => {
    expect(await verifySessionToken("not-a-jwt", secret)).toBeNull();
    expect(await verifySessionToken("", secret)).toBeNull();
  });

  it("refuses to sign with a short secret", async () => {
    await expect(signSessionToken({ unionId: "x" }, "short")).rejects.toThrow();
  });
});
