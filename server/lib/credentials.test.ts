import { describe, expect, it } from "vitest";
import { adminUnionId, credentialsMatch } from "./credentials.js";

const expected = { email: "Admin@Example.com", password: "correct-horse-battery" };

describe("credentialsMatch", () => {
  it("accepts the right email and password", () => {
    expect(
      credentialsMatch(
        { email: "admin@example.com", password: "correct-horse-battery" },
        expected,
      ),
    ).toBe(true);
  });

  it("ignores email case and surrounding spaces", () => {
    expect(
      credentialsMatch(
        { email: "  ADMIN@example.COM ", password: "correct-horse-battery" },
        expected,
      ),
    ).toBe(true);
  });

  it("rejects a wrong password or wrong email", () => {
    expect(
      credentialsMatch({ email: "admin@example.com", password: "nope" }, expected),
    ).toBe(false);
    expect(
      credentialsMatch(
        { email: "other@example.com", password: "correct-horse-battery" },
        expected,
      ),
    ).toBe(false);
  });

  it("never matches when the admin account is not configured", () => {
    expect(
      credentialsMatch({ email: "", password: "" }, { email: "", password: "" }),
    ).toBe(false);
    expect(
      credentialsMatch(
        { email: "admin@example.com", password: "" },
        { email: "admin@example.com", password: "" },
      ),
    ).toBe(false);
  });
});

describe("adminUnionId", () => {
  it("is stable across email casing", () => {
    expect(adminUnionId(" Admin@Example.com ")).toBe("admin:admin@example.com");
  });
});
